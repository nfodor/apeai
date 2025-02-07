# APE AI - The Revolutionary No-Code API Server

## Overview

Discover APE AI - the revolutionary no-code API server where you describe what you need in plain English, and it spins up custom APIs on demand. Say goodbye to coding and hello to simplicity! #NoCode #APIMagic #APEAI

APE AI is designed as an API-first platform, meaning you can create new API servers and define their specifications directly through the API. This empowers developers and non-developers alike to rapidly prototype and deploy custom APIs without writing a single line of code.

## Quick Start Example

To create a new API server, simply use a `curl` command with a natural language description of the API you want:

```bash
curl -X POST http://localhost:5656/generate-server-files \
     -H "Content-Type: application/json" \
     -d '{
           "codeDescription": "Create a simple Express.js API with a GET endpoint that returns a welcome message"
         }'
```

This command sends a request to the API generator, which will interpret your description and create a new server instance based on your specifications.


## Features

- **Instant API Creation**: Provide a description, and watch as a new Express.js API server is generated and deployed in seconds.
- **Scalability**: Built on Node.js, this application can be configured to leverage your system's CPU and memory resources, allowing it to scale according to your needs.
- **Seamless Integration**: Automatically checks and starts the Ollama engine, ensuring your environment is always ready.
- **Smart Port Management**: Each server is assigned a unique port, eliminating conflicts and ensuring smooth operation.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.
- **Ollama**: This application requires the Ollama engine to generate server code. Make sure it's installed and accessible.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/express-api-generator.git
   cd express-api-generator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables** (Optional):
   - `MODEL_NAME`: Specify the model name for the Ollama engine. Defaults to `Qwen2.5-Coder:1.5B`.

## Setup Environment Variables

1. **Copy the Sample `.env` File**:
   Copy the `env.sample` file to `.env` in the root directory of your project. This file will be used to configure environment-specific settings.

   ```bash
   cp env.sample .env
   ```

2. **Edit the `.env` File**:
   Open the `.env` file and adjust the values as needed for your environment. The default values are already set, so you can leave them as is if they suit your needs.

   ```plaintext
   MODEL_NAME=Qwen2.5-Coder:1.5B
   SERVER_PORT=5656
   ```


## Usage

### Starting the Application

1. **Run the Application**:
   ```bash
   npm start
   ```

   This will start the main server on port `5656`.

### Creating a New API Server

To create a new API server, send a POST request to the `/generate-server-files` endpoint with a JSON payload describing the API you want to create in a property called `codeDescription`.

#### Example Request

```bash
curl -X POST http://localhost:5656/generate-server-files \
     -H "Content-Type: application/json" \
     -d '{
           "codeDescription": "Create a simple Express.js API with a GET endpoint that returns a welcome message"
         }'
```

#### Response

The response will include details about the newly created server, such as the port number, process ID, and a UUID for managing the server instance.

```json
{
  "message": "Server files generated, saved, and executed successfully!",
  "pid": 12345,
  "uuid": "68db56ac-7377-48f7-96f2-d70c94735411",
  "engine_name": "Qwen2.5-Coder:1.5B",
  "port": 10001,
  "code": "..."
}
```

### Managing Servers

- **Killing a Server**: To stop a running server, send a POST request to the `/kill-server` endpoint with the server's `pid` and `uuid`.

#### Example Kill Request

```bash
curl -X POST http://localhost:5656/kill-server \
     -H "Content-Type: application/json" \
     -d '{
           "pid": 12345,
           "uuid": "68db56ac-7377-48f7-96f2-d70c94735411"
         }'
```

## Testing the API

To test the API, you can use the following command:

```bash
npm test
```

This command runs the `test.js` script, which sends a request to generate a server and tests its functionality.

## Killing Processes

To kill all running server processes, use the following command:

```bash
npm run kill
```

This command runs the `test.js` script with the `kill` argument, which terminates all processes referenced in the process files.

## Troubleshooting

- **Ollama Not Running**: Ensure that the Ollama engine is installed and accessible. The application will attempt to start it if it's not running.
- **Port Conflicts**: The application automatically manages ports, but ensure no other services are using the same range of ports.


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 