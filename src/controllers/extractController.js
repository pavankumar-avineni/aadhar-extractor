// src/controllers/extractController.js
const fileProcessor = require('../services/fileProcessor');
const dataParser = require('../services/dataParser');
const { validateFile } = require('../utils/fileValidator');
const fs = require('fs').promises;
const path = require('path');

class ExtractController {
    async extractData(req, res) {
        try {
            console.log('Request received');
            console.log('File details:', req.file);
            
            if (!req.file) {
                console.log('No file in request');
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            // Check if file exists
            try {
                await fs.access(req.file.path);
                console.log('File exists at:', req.file.path);
            } catch (err) {
                console.error('File does not exist:', err);
                return res.status(400).json({
                    success: false,
                    error: 'Uploaded file not found'
                });
            }

            // Validate file
            const validation = validateFile(req.file);
            console.log('Validation result:', validation);
            
            if (!validation.valid) {
                await fs.unlink(req.file.path).catch(console.error);
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }

            console.log(`Processing file: ${req.file.originalname}`);
            console.log(`File type: ${req.file.mimetype}`);
            console.log(`File size: ${req.file.size} bytes`);

            // Process file based on type
            const extractedText = await fileProcessor.processFile(
                req.file.path,
                req.file.mimetype
            );

            console.log('Extracted text length:', extractedText.length);
            console.log('First 200 chars:', extractedText.substring(0, 200));

            // Parse the extracted text
            const parsedData = dataParser.parseAadharData(extractedText);

            // Clean up uploaded file
            await fs.unlink(req.file.path).catch(console.error);

            // Return the result
            return res.status(200).json({
                success: true,
                message: 'Data extracted successfully',
                filename: req.file.originalname,
                ...parsedData
            });

        } catch (error) {
            console.error('Extraction error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Clean up uploaded file in case of error
            if (req.file && req.file.path) {
                await fs.unlink(req.file.path).catch(console.error);
            }
            
            return res.status(500).json({
                success: false,
                error: `Extraction failed: ${error.message}`
            });
        }
    }

    async healthCheck(req, res) {
        res.status(200).json({
            success: true,
            message: 'Aadhar Extractor API is running',
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = new ExtractController();