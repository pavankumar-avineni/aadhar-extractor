Aadhar Card Data Extractor Microservice
A powerful Node.js-based microservice for extracting structured data from Aadhar cards in multiple formats. This service uses OCR and text parsing techniques to extract personal information, document details, and demographic data from uploaded Aadhar card images and documents.

📋 Features
Supported File Formats
Images: JPG, JPEG, PNG

Documents: PDF, DOCX

Spreadsheets: XLSX, CSV

Text files: TXT

Extracted Data Fields
👤 Full Name (supports both English and regional languages)

👨 Father's Name

📅 Date of Birth

⚥ Gender

🔢 Aadhar Number (12-digit unique identifier)

🏠 Complete Address (with PIN code)

📱 Mobile Number

🔑 Enrolment Number

🆔 VID (Virtual ID - 16-digit)

📆 Issue Date

🌍 State

🏛️ District

Key Features
✅ Multi-format Support: Handles various file types seamlessly

✅ Bilingual Processing: Works with both English and regional language text (Tamil supported)

✅ Intelligent Number Detection: Automatically distinguishes between Aadhar number (12-digit) and VID (16-digit)

✅ Address Formatting: Cleans and structures address information

✅ Confidence Scoring: Provides extraction confidence percentage

✅ Error Handling: Robust error management with detailed logging

✅ RESTful API: Easy integration with other applications


💻 Technology Stack
Runtime: Node.js

Framework: Express.js

File Upload: Multer

OCR Engine: Tesseract.js

Image Processing: Sharp

PDF Processing: pdf-parse

Document Processing: mammoth

Spreadsheet Processing: xlsx, csv-parser

Security: CORS, Dotenv


🔧 Configuration
File Upload Limits
Maximum file size: 10MB

Supported formats: .jpg, .jpeg, .png, .pdf, .docx, .xlsx, .csv, .txt

OCR Configuration
Language: English (with support for Tamil characters)

Image preprocessing: Grayscale, normalization, sharpening

🧠 Intelligent Parsing Features
Number Detection
12-digit numbers → Aadhar number

16-digit numbers → VID (Virtual ID)

Numbers appearing multiple times → Aadhar number (primary identifier)

Name Extraction
Supports both all-caps names (e.g., "SAI KRISHNA P")

Supports mixed-case names with initials (e.g., "Pavan Kumar A K")

Handles Tamil script names

Address Formatting
Automatic cleaning of redundant text

Proper comma placement

PIN code standardization

Removal of labels (PO:, DIST:, VTC:)

Confidence Scoring
Based on number of fields successfully extracted

Weighted scoring for critical fields (name, Aadhar number, DOB)

Returns percentage confidence with each response

🔒 Security Considerations
File Validation: Checks file type, size, and content

Auto Cleanup: Uploaded files are automatically deleted after processing

No Data Persistence: Files are not stored permanently

Input Sanitization: All text inputs are cleaned and validated

Error Handling: Comprehensive error handling without exposing system details

⚡ Performance
Response Time: Average 2-5 seconds per file

Concurrent Processing: Handles multiple requests simultaneously

Memory Efficient: Streams large files instead of loading entirely in memory

Scalable: Stateless design allows horizontal scaling

🌟 Use Cases
KYC Verification: Automate customer onboarding

Data Entry: Reduce manual data entry errors

Document Management: Index and search Aadhar documents

Compliance: Extract and store required fields for regulatory compliance

Analytics: Aggregate demographic data for analysis

🎯 Roadmap
Add support for more Indian languages

Implement machine learning for improved accuracy

Add batch processing capability

Create web interface for easy upload

Add rate limiting and authentication

Support for other Indian ID cards (PAN, Voter ID, etc.)

Cloud storage integration (AWS S3, Google Cloud Storage)
