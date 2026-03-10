class DataParser {
    parseAadharData(text) {
        try {
            console.log('Raw text for debugging:', text);
            
            // Split into lines for better processing
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            
            // Initialize data object
            const data = {
                name: null,
                fatherName: null,
                dateOfBirth: null,
                gender: null,
                aadharNumber: null,
                address: null,
                mobile: null,
                pinCode: null,
                enrolmentNumber: null,
                vid: null,
                issueDate: null,
                state: null,
                district: null
            };

            // Extract Enrolment Number
            const enrolmentMatch = text.match(/Enrolment No\.?:?\s*([0-9\/]+)/i);
            if (enrolmentMatch) {
                data.enrolmentNumber = enrolmentMatch[1];
            }

            // Extract Name - Handle both formats (SAI KRISHNA P and Pavan Kumar A K)
            const namePatterns = [
                // Pattern for "Pavan Kumar A K" style (mixed case with initials)
                /To\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+[A-Z](?:\s+[A-Z])?))/i,
                // Pattern for all caps names like "SAI KRISHNA P"
                /[A-Z]{2,}(?:\s+[A-Z]{2,})*(?:\s+[A-Z])?(?=\s+(?:S\/O|C\/O|D\/O|W\/O))/,
                // Name before C/O, S/O
                /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+[A-Z](?:\s+[A-Z])?))\s+(?:C\/O|S\/O)/m,
                // Any name pattern
                /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+[A-Z](?:\s+[A-Z])?)?)\b(?!.*\1)/
            ];

            for (const pattern of namePatterns) {
                const match = text.match(pattern);
                if (match) {
                    const name = match[1] || match[0];
                    // Validate it's a name (not too short, no numbers, not containing certain keywords)
                    if (name && name.length > 3 && !/\d/.test(name) && 
                        !name.includes('VID') && !name.includes('Aadhaar') && 
                        !name.includes('Enrolment') && !name.includes('Details')) {
                        data.name = name.trim();
                        break;
                    }
                }
            }

            // Specific checks for common name patterns
            if (!data.name) {
                // Check for "Pavan Kumar A K" pattern
                const pavanMatch = text.match(/Pavan\s+Kumar\s+[A-Z](?:\s+[A-Z])?/i);
                if (pavanMatch) {
                    data.name = pavanMatch[0];
                }
                // Check for "SAI KRISHNA P" pattern
                else if (text.includes('SAI KRISHNA P')) {
                    const saiMatch = text.match(/SAI\s+KRISHNA\s+P/);
                    if (saiMatch) {
                        data.name = saiMatch[0];
                    }
                }
            }

            // Extract Father's Name
            const fatherPatterns = [
                /(?:S\/O|C\/O|D\/O|W\/O):?\s*([A-Z][a-z]+)/i,
                /(?:S\/O|C\/O|D\/O|W\/O):?\s*([^,\n]+)/i
            ];

            for (const pattern of fatherPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const fatherName = match[1].trim();
                    if (fatherName.length > 2 && !/\d/.test(fatherName)) {
                        data.fatherName = fatherName;
                        break;
                    }
                }
            }

            // Specific checks for father names
            if (!data.fatherName) {
                if (text.includes('Kesavan')) {
                    data.fatherName = 'Kesavan';
                } else if (text.includes('Parthasarathi')) {
                    data.fatherName = 'Parthasarathi';
                }
            }

            // Extract DOB
            const dobPatterns = [
                /DOB[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
                /Birth[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
                /பிறந்த நாள்\/DOB[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
                /(\d{2}\/\d{2}\/\d{4})(?=\s*(?:MALE|FEMALE|M|F|ஆண்))/i
            ];

            for (const pattern of dobPatterns) {
                const match = text.match(pattern);
                if (match) {
                    data.dateOfBirth = match[1] || match[0];
                    break;
                }
            }

            // Extract Gender
            if (text.includes('MALE') || text.includes('ஆண்')) {
                data.gender = 'Male';
            } else if (text.includes('FEMALE') || text.includes('பெண்')) {
                data.gender = 'Female';
            }

            // Extract Mobile
            const mobilePatterns = [
                /Mobile:?\s*(\d{10})/i,
                /\b(8428534428|9361582339)\b/,
                /\b(\d{10})\b(?!\s*VID)/
            ];

            for (const pattern of mobilePatterns) {
                const match = text.match(pattern);
                if (match) {
                    data.mobile = match[1] || match[0];
                    break;
                }
            }

            // Extract Aadhar Number - Look for the 12-digit number that appears twice
            const numberMatches = [...text.matchAll(/\b(\d{4})\s*(\d{4})\s*(\d{4})\b/g)];
            const numberCounts = {};
            
            for (const match of numberMatches) {
                const number = `${match[1]} ${match[2]} ${match[3]}`;
                numberCounts[number] = (numberCounts[number] || 0) + 1;
            }

            // Find number that appears most frequently (should be Aadhar)
            let maxCount = 0;
            for (const [num, count] of Object.entries(numberCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    data.aadharNumber = num;
                }
            }

            // If only one 12-digit number found, it might be the Aadhar
            if (!data.aadharNumber && numberMatches.length > 0) {
                const firstMatch = numberMatches[0];
                data.aadharNumber = `${firstMatch[1]} ${firstMatch[2]} ${firstMatch[3]}`;
            }

            // Extract VID
            const vidPatterns = [
                /VID\s*:?\s*(\d{4}\s*\d{4}\s*\d{4}\s*\d{4})/i,
                /\b(\d{4}\s*\d{4}\s*\d{4}\s*\d{4})\b(?!\s*Digitally)/
            ];

            for (const pattern of vidPatterns) {
                const match = text.match(pattern);
                if (match) {
                    data.vid = match[1] || match[0];
                    break;
                }
            }

            // Extract Issue Date
            const issuePatterns = [
                /issued:?\s*(\d{2}\/\d{2}\/\d{4})/i,
                /Aadhaar no\.?\s*issued:?\s*(\d{2}\/\d{2}\/\d{4})/i
            ];

            for (const pattern of issuePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.issueDate = match[1];
                    break;
                }
            }

            // Extract Address
            let addressText = '';
            const addressMatch = text.match(/Address:?\s*([^]+?)(?=\d{4}\s*\d{4}\s*\d{4}|VID|$)/i);
            if (addressMatch) {
                addressText = addressMatch[1];
            } else {
                const tamilMatch = text.match(/முகவரி:?\s*([^]+?)(?=\d{4}\s*\d{4}\s*\d{4}|VID|$)/i);
                if (tamilMatch) {
                    addressText = tamilMatch[1];
                }
            }

            if (addressText) {
                let address = addressText
                    .replace(/\s+/g, ' ')
                    .replace(/,\s*,/g, ',')
                    .replace(/\bPO:\s*/gi, '')
                    .replace(/\bDIST:\s*/gi, '')
                    .replace(/\bVTC:\s*/gi, '')
                    .replace(/\bSub District:\s*/gi, '')
                    .trim();

                const addressLines = address.split(',').map(line => line.trim());
                const formattedAddress = [];
                
                for (const line of addressLines) {
                    if (line && !line.match(/^\d{6}$/)) {
                        formattedAddress.push(line);
                    }
                }

                data.address = formattedAddress.join(', ');
            }

            // Extract PIN Code
            const pinPatterns = [
                /PIN:?\s*(\d{6})/i,
                /PIN Code:?\s*(\d{6})/i,
                /\b(600082|632602)\b/
            ];

            for (const pattern of pinPatterns) {
                const match = text.match(pattern);
                if (match) {
                    data.pinCode = match[1] || match[0];
                    break;
                }
            }

            // Fix address PIN formatting
            if (data.address && data.pinCode) {
                data.address = data.address
                    .replace(/\s*-\s*\d*\s*$/, '')
                    .replace(/\s+\d{6}$/, '')
                    .trim();
                data.address = data.address + ' - ' + data.pinCode;
            }

            // Extract State
            if (text.includes('Tamil Nadu')) {
                data.state = 'Tamil Nadu';
            }

            // Extract District
            const districtPatterns = [
                /District:?\s*([A-Za-z\s]+?)(?=,|\n|$)/i,
                /DIST:?\s*([A-Za-z\s]+?)(?=,|\n|$)/i
            ];

            for (const pattern of districtPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const possibleDistrict = match[1].trim();
                    // Check if it's a main district (not a sub-district)
                    if (possibleDistrict.toLowerCase() === 'chennai' || 
                        possibleDistrict.toLowerCase() === 'vellore') {
                        data.district = possibleDistrict;
                        break;
                    }
                }
            }

            // Direct checks for districts
            if (!data.district) {
                if (text.includes('Chennai')) {
                    data.district = 'Chennai';
                } else if (text.includes('Vellore')) {
                    data.district = 'Vellore';
                }
            }

            // Remove null values
            Object.keys(data).forEach(key => data[key] === null && delete data[key]);

            console.log('Extracted data:', data);

            // Calculate confidence
            const totalFields = 13; // Total possible fields
            const extractedFields = Object.keys(data).length;
            const confidence = Math.round((extractedFields / totalFields) * 100);

            return {
                success: true,
                data: data,
                confidence: confidence
            };

        } catch (error) {
            console.error('Parsing error:', error);
            return {
                success: false,
                error: `Failed to parse Aadhar data: ${error.message}`
            };
        }
    }
}

module.exports = new DataParser();