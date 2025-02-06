#!/bin/bash
# Author: Nicolas Fodor
# Copyright (c) 2023 Nicolas Fodor

# Define the API endpoint
API_URL="http://localhost:5656/generate-server-files"

# Define the payload for the POST request
PAYLOAD='{
  "codeDescription": "Create a simple Express.js server with a welcome endpoint"
}'

# Make a POST request to generate server files
response=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" $API_URL)

# Extract the port, UUID, and PID from the response
port=$(echo $response | jq -r '.port')
uuid=$(echo $response | jq -r '.uuid')
pid=$(echo $response | jq -r '.pid')

# Check if the response contains a valid port
if [ "$port" != "null" ]; then
  echo "Server started successfully on port $port with PID $pid and UUID $uuid."

  # Test the running server
  test_response=$(curl -s "http://localhost:$port")

  # Check if the test response is valid
  if [[ $test_response == *"Welcome"* ]]; then
    echo "Test successful: $test_response"
  else
    echo "Test failed: Unexpected response from server."
  fi
else
  echo "Failed to start server. Response: $response"
fi 