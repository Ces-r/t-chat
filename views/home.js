// a simple example using web sockets, two users can communicate with each other through HTML paragraphs.

const testo = document.getElementById("testo")
const form = document.getElementById("form")
const cursor = document.querySelector('.cursor');

const ws = new WebSocket(`ws://${window.location.hostname}:8080`);

 // Declare the message element
let messageElement;    

ws.addEventListener("message", (event) => {
   
    const message = event.data;

    // if it doesnt exist create it
    if (!messageElement) {
        messageElement = document.createElement("p");
        testo.appendChild(messageElement);
    }

    // update the text
    messageElement.innerText = message; 
});
    

// sending
ws.addEventListener("open", () =>{
const fun = document.addEventListener("mousemove", (e) =>{

    form.focus();
    let x = e.clientX;
    let y = e.clientY;
    
    form.style.position = 'absolute'; 
    form.style.left = `${x+20}px`;
    form.style.top = `${y}px`;
    
    form.addEventListener("input", () =>{

        ws.send(form.value)
        
    })


    // console.log(x, y)
    
});

});


