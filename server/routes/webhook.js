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

    // Support both 'page' (Messenger) and 'instagram' objects
    if (body.object === 'page' || body.object === 'instagram') {

        for (const entry of body.entry) {
            const pageId = entry.id; // This is the Page ID or IG Business Account ID
            const webhookEvent = entry.messaging ? entry.messaging[0] : null;

            if (webhookEvent && webhookEvent.message && webhookEvent.message.text) {
                const senderId = webhookEvent.sender.id;
                const messageText = webhookEvent.message.text.toLowerCase();

                try {
                    // 1. Fetch Account (Page) credentials from DB
                    const { data: account, error: accountError } = await supabase
                        .from('accounts')
                        .select('*')
                        .eq('page_id', pageId)
                        .single();

                    if (accountError || !account) {
                        console.error(`Account not found for Page ID: ${pageId}`);
                        continue;
                    }

                    // 2. Check for matching rules
                    // Simple keyword match: check if message contains generic keyword
                    // Optimized: Fetch all rules for this account
                    const { data: rules, error: rulesError } = await supabase
                        .from('rules')
                        .select('*')
                        .eq('account_id', account.id)
                        .eq('is_active', true);

                    let matchedRule = null;
                    if (rules) {
                        matchedRule = rules.find(rule => messageText.includes(rule.keyword.toLowerCase()));
                    }

                    if (matchedRule) {
                        // 3. Send Reply
                        // Replace placeholder {username} if needed (requires fetching user profile, skipping for now)
                        await sendMessage(senderId, matchedRule.reply_content, account.access_token);
                        console.log(`Replied to ${senderId} with rule: ${matchedRule.keyword}`);
                    } else {
                        // 4. Log Unmatched Query
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
