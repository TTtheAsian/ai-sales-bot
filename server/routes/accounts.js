const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// GET all accounts
router.get('/', async (req, res) => {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET account by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Account not found' });
    res.json(data);
});

// POST create account
router.post('/', async (req, res) => {
    const { page_id, access_token, webhook_secret } = req.body;
    const { data, error } = await supabase.from('accounts').insert([
        { page_id, access_token, webhook_secret }
    ]).select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// PUT update account
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// DELETE account
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('accounts').delete().eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
});

// GET unmatched queries (for dashboard display)
router.get('/unmatched', async (req, res) => {
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ error: 'accountId is required' });

    const { data, error } = await supabase
        .from('unmatched_queries')
        .select('*')
        .eq('account_id', accountId)
        .order('received_at', { ascending: false })
        .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

module.exports = router;
