const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { sendMessage } = require('../services/meta');

// Webhook Verification (GET)
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify Token should be in your .env
    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook Event Handling (POST)
router.post('/', async (req, res) => {
    const body = req.body;

    console.log('Received webhook:', JSON.stringify(body, null, 2));

    if (body.object === 'page' || body.object === 'instagram') {
        for (const entry of body.entry) {
            const pageId = entry.id;
            const webhookEvent = entry.messaging ? entry.messaging[0] : null;

            if (webhookEvent && webhookEvent.message && webhookEvent.message.text) {
                const senderId = webhookEvent.sender.id;
                const messageText = webhookEvent.message.text.toLowerCase();

                try {
                    // 1. Fetch Account and associated SaaS user_id
                    const { data: account, error: accountError } = await supabase
                        .from('accounts')
                        .select('*')
                        .eq('page_id', pageId)
                        .single();

                    if (accountError || !account) {
                        console.error(`Account not found for Page ID: ${pageId}`);
                        continue;
                    }

                    const userId = account.user_id;

                    // 2. Identify/Upsert Contact (Audience)
                    const { data: contact, error: contactError } = await supabase
                        .from('contacts')
                        .upsert(
                            {
                                user_id: userId,
                                fb_user_id: senderId,
                                last_interaction: new Date().toISOString()
                            },
                            { onConflict: 'user_id, fb_user_id' }
                        )
                        .select()
                        .single();

                    if (contactError) {
                        console.error('Error upserting contact:', contactError);
                    }

                    // 3. Log Incoming Message
                    if (contact) {
                        await supabase.from('messages').insert({
                            user_id: userId,
                            contact_id: contact.id,
                            text: webhookEvent.message.text,
                            sender: 'user'
                        });
                    }

                    // 4. Check for matching rules
                    const { data: rules } = await supabase
                        .from('rules')
                        .select('*')
                        .eq('account_id', account.id)
                        .eq('is_active', true);

                    let matchedRule = null;
                    if (rules) {
                        matchedRule = rules.find(rule => messageText.includes(rule.keyword.toLowerCase()));
                    }

                    if (matchedRule) {
                        // 5. Send Reply and Log Bot Message
                        await sendMessage(senderId, matchedRule.reply_content, account.access_token);

                        // Handle Actions (e.g., tagging)
                        if (matchedRule.actions && Array.isArray(matchedRule.actions)) {
                            for (const action of matchedRule.actions) {
                                if (action.type === 'add_tag' && contact) {
                                    const newTags = Array.from(new Set([...(contact.tags || []), action.value]));
                                    await supabase.from('contacts').update({ tags: newTags }).eq('id', contact.id);
                                }
                            }
                        }

                        if (contact) {
                            await supabase.from('messages').insert({
                                user_id: userId,
                                contact_id: contact.id,
                                text: matchedRule.reply_content,
                                sender: 'bot'
                            });
                        }
                        console.log(`Replied to ${senderId} with rule: ${matchedRule.keyword}`);
                    } else {
                        // 6. Log Unmatched Query
                        await supabase
                            .from('unmatched_queries')
                            .insert([
                                {
                                    account_id: account.id,
                                    message_content: webhookEvent.message.text
                                }
                            ]);
                        console.log(`Unmatched query logged: ${webhookEvent.message.text}`);
                    }

                } catch (err) {
                    console.error('Error processing webhook event:', err);
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
