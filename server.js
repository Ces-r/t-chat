const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const WebSocket = require('ws');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');
const PORT = 5000;
const IP = '192.168.1.86';

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store chat history on the server
const chatHistory = [];

// Handle new WebSocket connection
wss.on('connection', (ws) => {
    console.log("New client connected");

    // Send the entire chat history to the new client
    ws.send(JSON.stringify(chatHistory));

    // When a message is received from a client, broadcast it to all other clients
    ws.on('message', (message) => {
        const decodedMessage = Buffer.isBuffer(message) ? message.toString() : message;
        console.log("Received:", decodedMessage);

        // Add the new message to the chat history
        chatHistory.push(decodedMessage);

        // Broadcast the message to all connected clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(decodedMessage); // Send to other clients
            }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

// Routes
app.get('/login', async (req, res) => {

    return res.render('login');
});


app.get('/', async (req, res) => {
    return res.render("home");
});

app.get('/chat', (req, res) => {
    return res.render("chat");
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://${IP}:${PORT}`);
});
