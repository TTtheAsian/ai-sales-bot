const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel / reverse-proxy environments
app.set('trust proxy', 1);

// CORS — allow configured frontend URL or all origins in dev
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : true; // Allow all in dev

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

// Middleware
const apiLimiter = require('./middleware/rateLimiter');
const auth = require('./middleware/auth');
app.use('/api/', apiLimiter);

// Routes
app.use('/api/accounts', auth, require('./routes/accounts'));
app.use('/api/rules', auth, require('./routes/rules'));
app.use('/api/messages', auth, require('./routes/messages'));
app.use('/api/cron', require('./routes/cron'));
app.use('/webhook', require('./routes/webhook'));

app.get('/', (req, res) => {
    res.send('AI Sales Bot Server is running!');
});

// Export app for Vercel Serverless
module.exports = app;

// Only listen if not running in serverless environment (e.g. local dev)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
