const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    const { name, email, type, message } = req.body;
    const user_id = req.user.id;
    const db = req.app.get('db');
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    try {
        await db.query('INSERT INTO feedback (user_id, name, email, type, message) VALUES (?,?,?,?,?)',
            [user_id, name || req.user.name, email || req.user.email, type || 'Other', message]);
        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;