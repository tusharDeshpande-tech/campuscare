const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const db = req.app.get('db');
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });

    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
        res.json({ success: true, message: 'Registration successful. Please login.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'Email already exists' });
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    const db = req.app.get('db');
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        if (role === 'admin' && user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized as admin' });
        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;