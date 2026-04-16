const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Admin only middleware
const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
};

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
    const db = req.app.get('db');
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    const db = req.app.get('db');
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all lost items (admin view)
router.get('/lost-items', auth, isAdmin, async (req, res) => {
    const db = req.app.get('db');
    try {
        const [items] = await db.query(`
            SELECT li.*, u.name as reporter_name 
            FROM lost_items li 
            JOIN users u ON li.user_id = u.id 
            ORDER BY li.created_at DESC
        `);
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update lost item status
router.put('/lost-items/:id/status', auth, isAdmin, async (req, res) => {
    const { status } = req.body;
    const db = req.app.get('db');
    try {
        await db.query('UPDATE lost_items SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Similar endpoints for found items, feedback, etc.
router.get('/found-items', auth, isAdmin, async (req, res) => {
    const db = req.app.get('db');
    try {
        const [items] = await db.query(`
            SELECT fi.*, u.name as reporter_name 
            FROM found_items fi 
            JOIN users u ON fi.user_id = u.id 
            ORDER BY fi.created_at DESC
        `);
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/found-items/:id/status', auth, isAdmin, async (req, res) => {
    const { status } = req.body;
    const db = req.app.get('db');
    try {
        await db.query('UPDATE found_items SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;