const fs = require('fs').promises;
const path = require('path');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const pdf = require('pdf-parse'); // Change this line - import as pdf instead of pdfParse
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

class FileProcessor {
    async processImage(filePath) {
        try {
            // Preprocess image for better OCR
            const processedImagePath = await this.preprocessImage(filePath);
            
            // Perform OCR
            const { data: { text } } = await Tesseract.recognize(
                processedImagePath,
                'eng',
                {
                    logger: m => console.log(m)
                }
            );
            
            // Clean up processed image
            await fs.unlink(processedImagePath).catch(console.error);
            
            return text;
        } catch (error) {
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }

    async preprocessImage(filePath) {
        const outputPath = filePath.replace(/\.[^/.]+$/, '_processed.png');
        
        await sharp(filePath)
            .resize(2000, null, { withoutEnlargement: true })
            .grayscale()
            .normalize()
            .sharpen()
            .toFile(outputPath);
        
        return outputPath;
    }

async processPDF(filePath) {
    try {
        console.log('Processing PDF file:', filePath);
        const dataBuffer = await fs.readFile(filePath);
        console.log('PDF file read, size:', dataBuffer.length);
        
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(dataBuffer);
        
        // Log the entire extracted text
        console.log('========== EXTRACTED PDF TEXT ==========');
        console.log(data.text);
        console.log('========== END EXTRACTED TEXT ==========');
        
        return data.text;
    } catch (error) {
        console.error('PDF processing error:', error);
        throw new Error(`PDF processing failed: ${error.message}`);
    }
}

    async processDocx(filePath) {
        try {
            console.log('Processing DOCX file:', filePath);
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } catch (error) {
            console.error('DOCX processing error:', error);
            throw new Error(`DOCX processing failed: ${error.message}`);
        }
    }

    async processExcel(filePath) {
        try {
            console.log('Processing Excel file:', filePath);
            const workbook = XLSX.readFile(filePath);
            let text = '';
            
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const sheetText = XLSX.utils.sheet_to_txt(sheet);
                text += sheetText + '\n';
            });
            
            return text;
        } catch (error) {
            console.error('Excel processing error:', error);
            throw new Error(`Excel processing failed: ${error.message}`);
        }
    }

    async processCSV(filePath) {
        return new Promise((resolve, reject) => {
            console.log('Processing CSV file:', filePath);
            const results = [];
            createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const text = results.map(row => Object.values(row).join(' ')).join('\n');
                    resolve(text);
                })
                .on('error', (error) => {
                    console.error('CSV processing error:', error);
                    reject(error);
                });
        });
    }

    async processText(filePath) {
        try {
            console.log('Processing text file:', filePath);
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            console.error('Text file processing error:', error);
            throw new Error(`Text file processing failed: ${error.message}`);
        }
    }

    async processFile(filePath, mimetype) {
        console.log('Processing file:', filePath, 'with mimetype:', mimetype);
        const extension = path.extname(filePath).toLowerCase();
        console.log('File extension:', extension);
        
        try {
            let result;
            if (['.jpg', '.jpeg', '.png'].includes(extension)) {
                result = await this.processImage(filePath);
            } else if (extension === '.pdf') {
                result = await this.processPDF(filePath);
            } else if (extension === '.docx') {
                result = await this.processDocx(filePath);
            } else if (extension === '.xlsx' || extension === '.xls') {
                result = await this.processExcel(filePath);
            } else if (extension === '.csv') {
                result = await this.processCSV(filePath);
            } else if (extension === '.txt') {
                result = await this.processText(filePath);
            } else {
                throw new Error(`Unsupported file type: ${extension}`);
            }
            
            console.log('File processed successfully, result length:', result.length);
            return result;
        } catch (error) {
            console.error('File processing error:', error);
            throw error;
        }
    }
}

module.exports = new FileProcessor();