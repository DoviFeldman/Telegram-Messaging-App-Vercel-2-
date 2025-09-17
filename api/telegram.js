
// api/telegram.js - Telegram Bot API proxy endpoints
const express = require('express');
const https = require('https');
const router = express.Router();

// Helper function to make HTTPS requests to Telegram API
function telegramRequest(method, token, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${token}/${method}`,
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Invalid JSON response from Telegram API'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// GET /api/getUpdates - Get updates from Telegram
router.get('/getUpdates', async (req, res) => {
    try {
        const token = req.query.token || process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            return res.status(400).json({
                ok: false,
                description: 'Bot token is required'
            });
        }

        // Get updates with optional parameters
        const params = {
            offset: req.query.offset || undefined,
            limit: req.query.limit || 100,
            timeout: req.query.timeout || 0
        };

        // Remove undefined values
        Object.keys(params).forEach(key => 
            params[key] === undefined && delete params[key]
        );

        const result = await telegramRequest('getUpdates', token, params);
        res.json(result);

    } catch (error) {
        console.error('Error in getUpdates:', error);
        res.status(500).json({
            ok: false,
            description: 'Internal server error: ' + error.message
        });
    }
});

// POST /api/sendMessage - Send message via Telegram
router.post('/sendMessage', async (req, res) => {
    try {
        const token = req.body.token || process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            return res.status(400).json({
                ok: false,
                description: 'Bot token is required'
            });
        }

        if (!req.body.chat_id || !req.body.text) {
            return res.status(400).json({
                ok: false,
                description: 'chat_id and text are required'
            });
        }

        const messageData = {
            chat_id: req.body.chat_id,
            text: req.body.text,
            parse_mode: req.body.parse_mode || undefined,
            reply_to_message_id: req.body.reply_to_message_id || undefined,
            disable_notification: req.body.disable_notification || undefined
        };

        // Remove undefined values
        Object.keys(messageData).forEach(key => 
            messageData[key] === undefined && delete messageData[key]
        );

        const result = await telegramRequest('sendMessage', token, messageData);
        res.json(result);

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({
            ok: false,
            description: 'Internal server error: ' + error.message
        });
    }
});

// GET /api/getMe - Get bot info (useful for testing)
router.get('/getMe', async (req, res) => {
    try {
        const token = req.query.token || process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            return res.status(400).json({
                ok: false,
                description: 'Bot token is required'
            });
        }

        const result = await telegramRequest('getMe', token);
        res.json(result);

    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({
            ok: false,
            description: 'Internal server error: ' + error.message
        });
    }
});

// POST /api/setWebhook - Set webhook (optional)
router.post('/setWebhook', async (req, res) => {
    try {
        const token = req.body.token || process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            return res.status(400).json({
                ok: false,
                description: 'Bot token is required'
            });
        }

        const webhookData = {
            url: req.body.url || '',
            drop_pending_updates: req.body.drop_pending_updates || false
        };

        const result = await telegramRequest('setWebhook', token, webhookData);
        res.json(result);

    } catch (error) {
        console.error('Error in setWebhook:', error);
        res.status(500).json({
            ok: false,
            description: 'Internal server error: ' + error.message
        });
    }
});

module.exports = router;

