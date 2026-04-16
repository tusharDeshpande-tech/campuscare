const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Report lost item
router.post('/lost', auth, async (req, res) => {
    const { item_name, location, lost_date, description } = req.body;
    const user_id = req.user.id;
    const db = req.app.get('db');
    if (!item_name || !location || !lost_date) return res.status(400).json({ success: false, message: 'Missing required fields' });
    try {
        await db.query('INSERT INTO lost_items (user_id, item_name, location, lost_date, description) VALUES (?,?,?,?,?)',
            [user_id, item_name, location, lost_date, description || '']);
        res.json({ success: true, message: 'Lost item reported successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Report found item (with optional image)
router.post('/found', auth, upload.single('image'), async (req, res) => {
    const { item_name, location, found_date, description } = req.body;
    const user_id = req.user.id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const db = req.app.get('db');
    if (!item_name || !location || !found_date) return res.status(400).json({ success: false, message: 'Missing required fields' });
    try {
        await db.query('INSERT INTO found_items (user_id, item_name, location, found_date, description, image_url) VALUES (?,?,?,?,?,?)',
            [user_id, item_name, location, found_date, description || '', image_url]);
        res.json({ success: true, message: 'Found item reported successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Search items (lost + found) with keyword and category
router.get('/search', async (req, res) => {
    const { keyword, category } = req.query;
    const db = req.app.get('db');
    if (!keyword) return res.json({ success: true, results: [] });
    try {
        let results = [];
        if (category !== 'found') {
            const [lost] = await db.query(
                `SELECT id, item_name, location, lost_date as date, description, 'lost' as type, status FROM lost_items 
                 WHERE item_name LIKE ? OR description LIKE ? OR location LIKE ?`,
                [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
            );
            results.push(...lost);
        }
        if (category !== 'lost') {
            const [found] = await db.query(
                `SELECT id, item_name, location, found_date as date, description, 'found' as type, status, image_url FROM found_items 
                 WHERE item_name LIKE ? OR description LIKE ? OR location LIKE ?`,
                [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
            );
            results.push(...found);
        }
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get user's own lost/found items
router.get('/my-items', auth, async (req, res) => {
    const user_id = req.user.id;
    const db = req.app.get('db');
    try {
        const [lost] = await db.query('SELECT * FROM lost_items WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        const [found] = await db.query('SELECT * FROM found_items WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        res.json({ success: true, lost, found });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;