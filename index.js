/**
 * Author: Nicolas Fodor
 * Copyright (c) 2023 Nicolas Fodor
 */

require('dotenv').config();

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// Create an instance of the Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Store running processes with their UUIDs
const runningProcesses = [];

// Define the maximum number of concurrent servers
const MAX_CONCURRENT_SERVERS = 3;

// Store used ports
const usedPorts = new Set();

// Directory to store process information
const PROCESS_DIR = path.join(__dirname, 'processes');

// Ensure the process directory exists
if (!fs.existsSync(PROCESS_DIR)) {
    fs.mkdirSync(PROCESS_DIR);
}

// Get the model name from an environment variable or use a default
const MODEL_NAME = process.env.MODEL_NAME || "Qwen2.5-Coder:1.5B";
const SERVER_PORT = process.env.SERVER_PORT || 5656;

// Define the predefined prompt
const PREDEFINED_PROMPT = "Ensure the API is secure, but don't use authentication,follows RESTful principles, and includes error handling. Always add a /test endpoint that returns a 200 OK response and does not require authentication.";

// Function to check if Ollama is running by making an HTTP requests
async function isOllamaRunning() {
    try {
        const response = await axios.get('http://localhost:11434/');
        if (response.data.includes('Ollama is running')) {
            console.log('Ollama is running.');
            return true;
        }
    } catch (error) {
        console.log('Ollama is not running.');
        return false;
    }
}

// Function to check if Ollama and the model are running
async function checkOllamaAndModel() {
    const ollamaRunning = await isOllamaRunning();
    if (!ollamaRunning) {
        try {
            // Check if Ollama is installed
            execSync('ollama --version', { stdio: 'ignore' });
            console.log('Ollama is installed.');

            // Since `list-models` is not a valid command, we assume the model is installed if Ollama is running
            console.log(`Assuming model ${MODEL_NAME} is available.`);

            // Start Ollama
            console.log('Starting Ollama...');
            execSync('ollama start', { stdio: 'inherit' });
        } catch (error) {
            console.error('Error checking Ollama or model:', error);
            process.exit(1);
        }
    }
}

// Function to log and kill processes from the directory
function logAndKillProcessesFromDirectory() {
    const files = fs.readdirSync(PROCESS_DIR);
    files.forEach(file => {
        const filePath = path.join(PROCESS_DIR, file);
        const pid = fs.readFileSync(filePath, 'utf-8').trim();
        try {
            process.kill(pid);
            console.log(`Killed process with PID: ${pid}`);
            fs.unlinkSync(filePath); // Remove the file after killing the process
        } catch (error) {
            console.error(`Failed to kill process with PID: ${pid}`, error.message);
        }
    });
}

// Check Ollama and the model before starting the server
checkOllamaAndModel().then(() => {
    // Kill any leftover processes from previous runs
    logAndKillProcessesFromDirectory();

    // Define a route to handle POST requests for generating server files
    app.post('/generate-server-files', async (req, res) => {
        try {
            // Check if the maximum number of concurrent servers is reached
            if (runningProcesses.length >= MAX_CONCURRENT_SERVERS) {
                return res.status(429).json({
                    message: 'Maximum number of concurrent servers reached. Please try again later.'
                });
            }

            // Extract the code description from the request body
            const userPrompt = req.body.codeDescription;

            // Combine the predefined prompt with the user's prompt
            const combinedPrompt = PREDEFINED_PROMPT + userPrompt;

            // Call the local Ollama engine with the combined prompt
            const response = await axios.post('http://localhost:11434/api/generate', {
                prompt: combinedPrompt,
                model: MODEL_NAME
            }, {
                headers: {
                    'Accept': 'application/json'
                },
                responseType: 'stream' // Set response type to stream
            });

            let serverFiles = '';

            // Process each line of the response stream
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                lines.forEach(line => {
                    if (line.trim()) { // Check if the line is not empty
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                serverFiles += json.response; // Append only the response part
                            }
                        } catch (e) {
                            console.error('Error parsing JSON line:', e);
                        }
                    }
                });
            });

            response.data.on('end', () => {
                // Keep only the lines between ```javascript and ```
                serverFiles = serverFiles.split('```javascript')[1].split('```')[0];

                // Create a temporary directory
                const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'server-'));

                // Write the server files to a file in the temporary directory
                const serverFilePath = path.join(tempDir, 'server.js');
                fs.writeFile(serverFilePath, serverFiles, (err) => {
                    if (err) {
                        console.error('Error writing server.js:', err);
                        return res.status(500).send('Failed to write server.js');
                    }

                    // Function to extract dependencies from the server file
                    function extractDependencies(serverFiles) {
                        const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
                        const dependencies = {};
                        let match;
                        while ((match = requireRegex.exec(serverFiles)) !== null) {
                            const packageName = match[1];
                            dependencies[packageName] = "latest"; // Use "latest" to get the most recent version
                        }
                        return dependencies;
                    }

                    // Extract dependencies from the server.js file
                    const dependencies = extractDependencies(serverFiles);

                    // Create a package.json file with the necessary dependencies
                    const packageJson = {
                        name: "generated-server",
                        version: "1.0.0",
                        main: "server.js",
                        dependencies: {
                            express: "^4.17.1",
                            cors: "^2.8.5",
                            "body-parser": "^1.19.0",
                            ...dependencies // Add extracted dependencies
                        }
                    };
                    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

                    // Install necessary packages
                    execSync('npm install', { cwd: tempDir });

                    // Function to attempt running the server
                    const tryRunServer = (port) => {
                        // Check if the port is already used
                        if (usedPorts.has(port)) {
                            return tryRunServer(port + 1);
                        }

                        // Update the server.js file to use the new port
                        const updatedServerFiles = serverFiles.replace(/const port = \d+;/, `const port = ${port};`);
                        fs.writeFile(serverFilePath, updatedServerFiles, (writeErr) => {
                            if (writeErr) {
                                console.error('Error updating server.js:', writeErr);
                                return res.status(500).send('Failed to update server.js');
                            }

                            // Run the server.js file as a subprocess
                            const serverProcess = spawn('node', ['server.js'], { cwd: tempDir, detached: true, stdio: 'ignore' });

                            serverProcess.on('error', (error) => {
                                if (error.message.includes('EADDRINUSE')) {
                                    // If the port is in use, try the next port
                                    tryRunServer(port + 1);
                                } else {
                                    console.error('Error executing server.js:', error);
                                    return res.status(500).send('Failed to execute server.js');
                                }
                            });

                            serverProcess.unref();

                            // Add the port to the used ports set
                            usedPorts.add(port);

                            // Generate a UUID for this process
                            const processUUID = uuidv4();
                            runningProcesses.push({ pid: serverProcess.pid, uuid: processUUID, port: port });

                            // Write the process ID to a file in the process directory
                            const processFilePath = path.join(PROCESS_DIR, `${processUUID}.txt`);
                            fs.writeFileSync(processFilePath, `${serverProcess.pid}`);

                            // Respond with the UUID, PID, engine name, port, code, and directory path
                            res.status(200).json({
                                message: 'Server files generated, saved, and executed successfully!',
                                pid: serverProcess.pid,
                                uuid: processUUID,
                                engine_name: MODEL_NAME,
                                port: port,
                                code: updatedServerFiles,
                                directory: tempDir
                            });
                        });
                    };

                    // Start trying to run the server from port 10001
                    tryRunServer(10001);
                });
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to generate server files');
        }
    });

    // Define a route to handle POST requests for killing a server process
    app.post('/kill-server', (req, res) => {
        const { pid, uuid } = req.body;

        // Find the process with the given PID and UUID
        const processIndex = runningProcesses.findIndex(proc => proc.pid === pid && proc.uuid === uuid);

        if (processIndex !== -1) {
            try {
                const { port } = runningProcesses[processIndex];
                process.kill(pid);
                runningProcesses.splice(processIndex, 1); // Remove the process from the array
                usedPorts.delete(port); // Free up the port
                res.status(200).send('Process killed successfully');
            } catch (error) {
                console.error('Error killing process:', error);
                res.status(500).send('Failed to kill process');
            }
        } else {
            res.status(404).send('Process not found or UUID mismatch');
        }

        // Clear the runningProcesses array
        runningProcesses.length = 0;
    });

    // Define a route to list all running processes
    app.get('/process', (req, res) => {
        res.json(runningProcesses);
    });

    app.listen(SERVER_PORT, () => {
        console.log(`Server is running on port ${SERVER_PORT}`);
    });
});