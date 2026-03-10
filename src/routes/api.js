const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const extractController = require('../controllers/extractController');

const router = express.Router();

// Ensure uploads directory exists with proper permissions
const uploadDir = path.join(__dirname, '../../uploads');
console.log('Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Setting destination to:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File filter - originalname:', file.originalname);
        console.log('File filter - mimetype:', file.mimetype);
        
        // Allow all files, we'll validate later
        cb(null, true);
    }
});

// Error handling middleware for multer
const handleUpload = (req, res, next) => {
    console.log('Upload middleware - headers:', req.headers);
    console.log('Upload middleware - content-type:', req.headers['content-type']);
    
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer error details:', {
                message: err.message,
                code: err.code,
                field: err.field,
                storageErrors: err.storageErrors
            });
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 10MB.'
                });
            }
            
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    error: `Unexpected field. Expected field name 'file' but got '${err.field}'. Please make sure you're using 'file' as the field name in your form-data.`
                });
            }
            
            return res.status(400).json({
                success: false,
                error: `Upload error: ${err.message}`
            });
        }
        
        console.log('Upload successful - file:', req.file ? req.file.originalname : 'no file');
        next();
    });
};

// Routes
router.get('/health', extractController.healthCheck);
router.post('/extract', handleUpload, extractController.extractData);

// 404 handler - FIXED: removed the '*'
router.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

module.exports = router;