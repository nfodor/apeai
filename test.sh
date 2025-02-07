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
  test_response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:$port/welcome")
  
  # Check if the test response is valid
  if [ "$test_response" -eq 200 ]; then
    echo "Test successful: Received HTTP 200 OK"
  else
    echo "Test failed: Unexpected HTTP response code $test_response"
    echo "Attempting to fetch detailed response..."
    detailed_response=$(curl -s "http://localhost:$port/welcome")
    echo "Detailed response: $detailed_response"
  fi
else
  echo "Failed to start server. Response: $response"
  echo "Error details: $(echo $response | jq -r '.message')"
fi 