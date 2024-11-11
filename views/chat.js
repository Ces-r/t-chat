const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

const body = document.getElementById("msgs");
let history = [];

// send form
const send = document.getElementById("send");

// function to load a message into the chat display
function loadHistory(msg) {
    const n = document.createElement("p");
    n.innerText = msg;
    body.appendChild(n);
}

// Listen for incoming messages (including chat history and new messages)
ws.addEventListener("message", (e) => {
    const message = e.data;

    // If the message is a JSON string, it's the chat history
    try {
        const parsedMessage = JSON.parse(message);
        if (Array.isArray(parsedMessage)) {
            // This is the initial history sent by the server
            parsedMessage.forEach(loadHistory);
            history = parsedMessage;  // Set the history to the received messages
        } else {
            // This is a new message
            loadHistory(message);
            history.push(message);  // Add the new message to the history
        }
    } catch (err) {
        // If it's not valid JSON, assume it's a new message
        loadHistory(message);
        history.push(message);  // Add the new message to the history
    }
});

// When the WebSocket connection opens
ws.addEventListener("open", () => {
    send.addEventListener("submit", (e) => {
        e.preventDefault();

        const msgs = document.getElementById("submit").value;
        // if the message contains nothing, don't send it
        if (msgs.length = 0) 
            return;

        console.log("Sending message:", msgs);
        // load up the previous messages, why does it happen here? idk
        loadHistory(msgs);   
        // add the message to the history     
        history.push(msgs);        

        // send it to the websocket
        ws.send(msgs);
        document.getElementById("submit").value = "";
    });
});
