const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// Secured Cron Endpoint
// Vercel Cron will send a comprehensive authorization header
router.get('/cleanup', async (req, res) => {
    // Check for authorization header from Vercel Cron
    // In production, you should verify this matches process.env.CRON_SECRET
    const authHeader = req.headers.authorization;
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Running cleanup job (triggered via API)...');

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { error } = await supabase
            .from('unmatched_queries')
            .delete()
            .lt('received_at', thirtyDaysAgo.toISOString());

        if (error) {
            console.error('Error cleaning up logs:', error.message);
            return res.status(500).json({ error: error.message });
        } else {
            console.log('Cleanup complete: Deleted old unmatched queries.');
            return res.json({ success: true, message: 'Cleanup complete' });
        }
    } catch (err) {
        console.error('Cron job failed:', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
