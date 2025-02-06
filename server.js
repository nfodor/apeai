/**
 * Author: Nicolas Fodor
 * Copyright (c) 2023 Nicolas Fodor
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();

// Use CORS to allow cross-origin requests
app.use(cors());

// Parse incoming JSON data
app.use(bodyParser.json());

// Define a GET endpoint that returns a welcome message
app.get('/welcome', (req, res) => {
  const message = 'Welcome to our API!';
  res.status(200).json({ message });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
