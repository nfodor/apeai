// test.js
// Author: Nicolas Fodor
// Copyright (c) 2023 Nicolas Fodor

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Define the API endpoint
const API_URL = 'http://localhost:5656/generate-server-files';

// Define the payload for the POST request
const payload = {
  codeDescription: 'Create an Express.js server with a welcome endpoint.'
};

// Directory where process information is stored
const PROCESS_DIR = path.join(__dirname, 'processes');

// Function to test the server
async function testServer() {
  try {
    // Make a POST request to generate server files
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { port, uuid, pid, directory } = response.data;

    // Check if the response contains a valid port
    if (port) {
      console.log(`Server started successfully on port ${port} with PID ${pid} and UUID ${uuid}.`);
      console.log(`Server files are located in: ${directory}`);

      // Test the running server
      try {
        const testResponse = await axios.get(`http://localhost:${port}`);
        if (testResponse.status === 200) {
          console.log(`Test successful: Received HTTP 200 OK`);
        } else {
          console.log(`Test failed: Unexpected HTTP response code ${testResponse.status}`);
          console.log(`Response data: ${JSON.stringify(testResponse.data)}`);
        }
      } catch (error) {
        console.error('Error during server test:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        }
      }

    } else {
      console.log('Failed to start server. Response:', response.data);
      console.log('Error details:', response.data.message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error during server generation:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Function to kill all processes referenced in the process files
function killProcesses() {
  try {
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
  } catch (error) {
    console.error('Error reading process files:', error.message);
  }
}

// Check command line arguments to determine action
const args = process.argv.slice(2);
if (args.includes('kill')) {
  killProcesses();
} else {
  testServer();
}

/*
Example of the original test.sh script:

#!/bin/bash
# Author: Nicolas Fodor
# Copyright (c) 2023 Nicolas Fodor

# Define the API endpoint
API_URL="http://localhost:5656/generate-server-files"

PAYLOAD='{
  "codeDescription": "Create an Express.js server with a welcome endpoint."
}'

# Make a POST request to generate server files
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" $API_URL)

# Extract the port, UUID, PID, and code from the response
port=$(echo $response | jq -r '.port')
uuid=$(echo $response | jq -r '.uuid')
pid=$(echo $response | jq -r '.pid')

# Check if the response contains a valid port
if [ "$port" != "null" ]; then
  echo "Server started successfully on port $port with PID $pid and UUID $uuid."

  # Test the running server
  test_response=$(curl -s "http://localhost:$port/welcome")

  # Check if the test response is valid
  if [[ $test_response == *"Welcome"* ]]; then
    echo "Test successful: $test_response"
  else
    echo "Test failed: Unexpected response from server."
  fi
else
  echo "Failed to start server. Response: $response"
fi
*/ 