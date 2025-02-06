# Express.js API Generator

## Overview

Welcome to the future of API development! The Express.js API Generator is the only API you'll ever need. Imagine an API so powerful that it takes a simple description of what you need and instantly spins up a fully functional server, ready to serve your requests. No more tedious setup or configuration—just describe your API, and let our generator handle the rest.

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

## Why Express.js?

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It is the de facto standard server framework for Node.js, known for its simplicity, speed, and scalability. By using Express.js, this API generator leverages:

- **Simplicity and Flexibility**: Express.js offers a straightforward approach to building APIs, making it easy to create and manage routes, middleware, and server logic.
- **Performance**: Built on Node.js, Express.js is designed for high performance, handling multiple requests efficiently.
- **Extensibility**: With a vast ecosystem of middleware and plugins, Express.js can be easily extended to meet specific needs.
- **Community and Support**: As one of the most popular frameworks, Express.js has a large community and extensive documentation, ensuring robust support and resources.

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

## Usage

### Starting the Application

1. **Run the Application**:
   ```bash
   node index.js
   ```

   This will start the main server on port `5656`.

### Creating a New API Server

To create a new API server, send a POST request to the `/generate-server-files` endpoint with a JSON payload describing the API you want to create.

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

## Troubleshooting

- **Ollama Not Running**: Ensure that the Ollama engine is installed and accessible. The application will attempt to start it if it's not running.
- **Port Conflicts**: The application automatically manages ports, but ensure no other services are using the same range of ports.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 