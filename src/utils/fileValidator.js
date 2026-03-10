const path = require('path');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.xlsx', '.csv', '.txt'];
const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'application/vnd.ms-excel', // For older Excel files
    'application/msword' // For older Word files
];

const validateFile = (file) => {
    if (!file) {
        return { valid: false, error: 'No file uploaded' };
    }

    console.log('Validating file:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
    });

    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
        return { valid: false, error: `File extension ${extension} not allowed. Allowed: ${allowedExtensions.join(', ')}` };
    }

    // Check if mimetype is allowed or if it's a common variation
    const isMimeAllowed = allowedMimeTypes.some(type => 
        file.mimetype.includes(type) || type.includes(file.mimetype)
    );
    
    if (!isMimeAllowed && file.mimetype !== 'application/octet-stream') {
        console.log('Mime type not allowed:', file.mimetype);
        // Don't block based on mimetype alone, as it can be unreliable
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size too large. Maximum 10MB allowed' };
    }

    if (file.size === 0) {
        return { valid: false, error: 'File is empty' };
    }

    return { valid: true };
};

module.exports = { validateFile };