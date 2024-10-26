// chat prototype

const ws = new WebSocket(`ws://${window.location.hostname}:8080`);

const body = document.getElementById("msgs");


// send is a form
const send = document.getElementById("send");

ws.addEventListener("message", (e) =>{
    const message = e.data;

    const msgs = document.getElementById("submit").value;
    n = document.createElement("p");
    n.innerText = msgs;
    body.appendChild(n)

    n.innerText = message



});



ws.addEventListener("open", () =>{
send.addEventListener("submit", (e) => {
    e.preventDefault();
    const msgs = document.getElementById("submit").value;
    console.log(msgs);
    n = document.createElement("p");
    n.innerText = msgs;
    body.appendChild(n)
    document.getElementById("submit").value = "";

    ws.send(msgs);
    msgs.value=""

    });
});


ws.addEventListener("message", (event) => {
    const message = event.data;


});