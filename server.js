const express = require('express');
const app = express();
const path = require('path');
// database stuff not useful for the moment
// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');
// const session = require('express-session');

// websocket stuff (new)
const server = require('http').createServer(app);
const WebSocket = require('ws');

// back to express and routes
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');
const PORT = 8080;
const IP = '192.168.1.86'


// create websocket server
const wss = new WebSocket.Server({ server });


// example!
wss.on('connection', (ws) => {
    console.log("New client connected");

    ws.on('message', (message) => {
        const decodedMessage = Buffer.isBuffer(message) ? message.toString() : message;
        console.log("Received:", decodedMessage);

        // Broadcast the message to all clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(decodedMessage); // send the original message
            }
        });
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});




//route 
app.get('/', async (req, res) => {
    return res.render("home")

});





// we no longer start as an app, we start as a server!
server.listen(PORT, IP, () => {
    console.log(`Server is running on http://${IP}:${PORT}`);
});
