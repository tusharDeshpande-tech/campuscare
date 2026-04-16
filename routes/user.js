const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
    const user_id = req.user.id;
    const db = req.app.get('db');
    try {
        const [lostCount] = await db.query('SELECT COUNT(*) as count FROM lost_items WHERE user_id = ?', [user_id]);
        const [foundCount] = await db.query('SELECT COUNT(*) as count FROM found_items WHERE user_id = ?', [user_id]);
        const [resolvedLost] = await db.query('SELECT COUNT(*) as count FROM lost_items WHERE user_id = ? AND status = "resolved"', [user_id]);
        const [resolvedFound] = await db.query('SELECT COUNT(*) as count FROM found_items WHERE user_id = ? AND status = "resolved"', [user_id]);
        const resolvedTotal = resolvedLost[0].count + resolvedFound[0].count;
        res.json({
            success: true,
            lostCount: lostCount[0].count,
            foundCount: foundCount[0].count,
            resolvedCount: resolvedTotal
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;