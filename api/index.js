// api/index.js - Main Express.js server for Vercel
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // For serving the HTML file

// Serve the HTML file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Import API routes
app.use('/api', require('./telegram'));

module.exports = app;
