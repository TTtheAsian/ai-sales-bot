const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { sendMessage } = require('../services/meta');

// POST send message
router.post('/send', async (req, res) => {
    const { contactId, text } = req.body;
    const userId = req.user.id; // From auth middleware

    try {
        // 1. Fetch contact and account info
        const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .select('*, user_id')
            .eq('id', contactId)
            .single();

        if (contactError || !contact) return res.status(404).json({ error: 'Contact not found' });

        // Ensure user owns this contact
        if (contact.user_id !== userId) return res.status(403).json({ error: 'Unauthorized' });

        // 2. Fetch account (we need the access token)
        // For simplicity, we assume there's one account per user for now, 
        // or we'd need to know which account this contact belongs to.
        // In the webhook, we matched by page_id.
        // Let's find the account associated with the user_id.
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();

        if (accountError || !account) return res.status(400).json({ error: 'No connected account found' });

        // 3. Send message via Meta
        await sendMessage(contact.fb_user_id, text, account.access_token);

        // 4. Log the message in DB
        const { data: loggedMsg, error: logError } = await supabase
            .from('messages')
            .insert({
                user_id: userId,
                contact_id: contactId,
                text: text,
                sender: 'bot'
            })
            .select()
            .single();

        if (logError) throw logError;

        res.status(200).json(loggedMsg);
    } catch (err) {
        console.error('Error in /api/messages/send:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
