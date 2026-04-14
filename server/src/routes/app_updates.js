const express = require('express');
const router = express.Router();
const db = require('../config/database');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * @route GET /api/app-updates/latest
 * @desc Get the latest version info
 */
router.get('/latest', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM app_versions WHERE is_latest = true ORDER BY created_at DESC LIMIT 1');
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No version information found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching latest version:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route GET /api/app-updates/download
 * @desc Download the latest APK
 */
router.get('/download', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM app_versions WHERE is_latest = true ORDER BY created_at DESC LIMIT 1');
        if (result.rows.length === 0) {
            return res.status(404).send('No app version available for download');
        }

        const version = result.rows[0];
        // In a real app, this would be a path to a file on the server
        // For now, we'll assume the files are in /uploads/apps/
        const fileName = `drop-v${version.version_name}.apk`;
        const filePath = path.join(__dirname, '../../uploads/apps', fileName);

        if (fs.existsSync(filePath)) {
            res.download(filePath, fileName);
        } else {
            // Fallback for development/demo: if file doesn't exist, just show a message or redirect
            res.status(404).send(`APK file not found on server: ${fileName}. Please upload it to /uploads/apps/`);
        }
    } catch (err) {
        console.error('Error in download:', err);
        res.status(500).send('Server error during download');
    }
});

/**
 * @route GET /api/app-updates/qr
 * @desc Generate a QR code for the download link
 */
router.get('/qr', async (req, res) => {
    try {
        // Construct the full download URL
        // We need the server's base URL. Usually this comes from config or req.protocol/host
        const protocol = req.protocol;
        const host = req.get('host');
        const downloadUrl = `${protocol}://${host}/api/app-updates/download`;

        // Generate QR code as a data URL (Base64)
        const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            width: 300,
            margin: 2
        });

        // Return as HTML page with the QR code
        res.send(`
            <html>
                <head>
                    <title>App Download QR</title>
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; }
                        .card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
                        h1 { color: #1a1a1a; margin-bottom: 20px; }
                        img { margin: 20px 0; border: 1px solid #eee; border-radius: 10px; }
                        p { color: #666; max-width: 300px; }
                        .url { font-size: 10px; color: #999; margin-top: 10px; word-break: break-all; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Scan to Update</h1>
                        <p>Scan this QR code with your phone to download the latest version of <strong>Drop</strong>.</p>
                        <img src="${qrDataUrl}" alt="Update QR Code" />
                        <div class="url">${downloadUrl}</div>
                    </div>
                </body>
            </html>
        `);
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).send('Error generating QR code');
    }
});

module.exports = router;
