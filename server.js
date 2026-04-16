require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true if using https
}));

// Make db available in all routes
app.set('db', db);

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Serve frontend pages (all HTML files are in public folder)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
// ... add other routes similarly or let static serve handle them

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));