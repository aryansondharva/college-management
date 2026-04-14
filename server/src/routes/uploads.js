
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/assignments';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and Word docs are allowed.'));
        }
    }
});

// POST /api/upload/assignment (Multiple Files)
router.post('/assignment', authenticate, upload.array('files', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded.' });
        }
        
        const filesInfo = req.files.map(file => ({
            url: `/uploads/assignments/${file.filename}`,
            name: file.originalname,
            type: file.mimetype
        }));

        res.json({ 
            message: `${req.files.length} file(s) uploaded successfully.`, 
            files: filesInfo
        });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed.', error: err.message });
    }
});

module.exports = router;
