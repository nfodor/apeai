/**
 * Author: Nicolas Fodor
 * Copyright (c) 2023 Nicolas Fodor
 */

const fs = require('fs');

// Read the raw response file
fs.readFile('raw_response.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Split the file into lines
    const lines = data.split('\n');
    let concatenatedResponse = '';
    let isCodeBlock = false;

    // Process each line
    lines.forEach(line => {
        if (line.trim()) { // Check if the line is not empty
            try {
                const json = JSON.parse(line);
                if (json.response) {
                    const responseLine = json.response.trim();
                    if (responseLine === '```javascript') {
                        isCodeBlock = true; // Start of code block
                    } else if (responseLine === '```') {
                        isCodeBlock = false; // End of code block
                    } else if (isCodeBlock) {
                        // Replace \n with actual newlines
                        concatenatedResponse += responseLine.replace(/\\n/g, '\n');
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON line:', e);
            }
        }
    });

    // Output the concatenated response
    console.log(concatenatedResponse.trim());
}); 