const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// GET rules (optionally filter by account_id)
router.get('/', async (req, res) => {
    const { accountId } = req.query;
    let query = supabase.from('rules').select('*');

    if (accountId) {
        query = query.eq('account_id', accountId);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST create rule
router.post('/', async (req, res) => {
    const { account_id, keyword, reply_content } = req.body;
    const { data, error } = await supabase.from('rules').insert([
        { account_id, keyword, reply_content }
    ]).select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// PUT update rule
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from('rules').update(updates).eq('id', id).select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// DELETE rule
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('rules').delete().eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
});

module.exports = router;
