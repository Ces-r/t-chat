const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

const messageContainer = document.querySelector(".message");
let history = JSON.parse(localStorage.getItem('chatHistory')) || []; 


 
        const settings  = document.getElementById("settings").addEventListener("click", ()=>{
            location.href = "./settings";
        })

        const logout = document.getElementById("logout").addEventListener("click", ()=> {
            location.href = "./logout";
        });

    const night = document.getElementById("night").addEventListener("click", () => {
        const moon = document.getElementById("moon"); 
        const bg = document.getElementById("everything");
        const messagebox = document.getElementById("msgs");
        const bar = document.getElementById("send");
        const buttons = document.querySelectorAll("button");

        
        bg.classList.toggle("text-white");
        bg.classList.toggle("bg-dark");
        bg.classList.toggle("bg-white");

        
        messagebox.classList.toggle("bg-dark");
        messagebox.classList.toggle("bg-gray-100");

        
        bar.classList.toggle("bg-dark");
        bar.classList.toggle("bg-white");
        bar.classList.toggle("border-white");

        
        buttons.forEach(button => {
            button.classList.toggle("text-white"); 
            button.classList.toggle("bg-dark");   
            button.classList.toggle("border-white"); 
            button.classList.toggle("bg-white");   
            button.classList.toggle("text-dark");  
        });

        
        if (bg.classList.contains("bg-dark")) {
            moon.setAttribute("stroke", "white");  
        } else {
            moon.setAttribute("stroke", "black");  
        }
    });



function scrollToBottom() {
    const msgs = document.getElementById("msgs");
    msgs.scrollTop = msgs.scrollHeight;
}



function ensureTenorScriptExecution() {
    if (!window.hasLoadedTenorScript) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://tenor.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
        window.hasLoadedTenorScript = true; 
    }
}

const send = document.getElementById("send");

function parseMessageContent(content) {
    //console.log(content);
    if (content.includes("https://www.")) {
        content = content.replace("https://www.", "");
    }

    
    const youtubeRegex = /(https?:\/\/(?:www\.)?youtube\.com\/(?:v|e(?:mbed)?)\/([^\/\n\s]+)|(?:youtube\.com\/(?:watch\?v=|v\/))([^\/\n\s]+)|https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+))(?:[^\s]*)/g;

    const tenorRegex = /https:\/\/(?:tenor\.com\/view\/([^\/\n\s]+)-([^\/\n\s]+)|media\.tenor\.com\/images\/([^\/\n\s]+)\/original\.gif)/g;
    const result = [];
    let lastIndex = 0;

    
    content.replace(youtubeRegex, function(match, group1, videoId, group2) {
        result.push(content.substring(lastIndex, content.indexOf(match, lastIndex)));

        const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId || group2}`;
        const iframeHTML = `<iframe width="560" height="315" src="${youtubeEmbedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="rounded-4 p-2"></iframe>`;
        result.push(iframeHTML);

        lastIndex = content.indexOf(match, lastIndex) + match.length;
    });

    content.replace(tenorRegex, function(match, gifName, gifId, gifDirectId) {
        result.push(content.substring(lastIndex, content.indexOf(match, lastIndex)));

        const id = gifId || gifDirectId;
        //console.log("Tenor gifId:", id);

        
        const tenorEmbedHTML = `
                <div class="tenor-gif-embed w-full h-64 mt-2 rounded-2" 
                     data-postid="${id}" 
                     data-share-method="host" 
                     data-aspect-ratio="1.80435" 
                     data-width="200%" 
                     style="width: 250px; height: 250px; position: relative;" 
                     data-processed="true">
                    <div style="padding-top: 55.42161997395184%;">
                        <iframe frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no"
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                                src="https://tenor.com/embed/${id}?canonicalurl=${window.location.href}">
                        </iframe>
                    </div>
                </div>
            
        `;


        

        result.push(tenorEmbedHTML);

        lastIndex = content.indexOf(match, lastIndex) + match.length;
    });

    result.push(content.substring(lastIndex));
    return result.join('');
}



function loadHistory(message) {
    //console.log("Loading message:", message); 

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('flex', 'items-center', 'gap-4', 'border-dark', 'rounded', 'relative', 
                                   'hover:shadow-[5px_5px_0px_0_rgba(0,0,0,1)]', 'hover:brightness-75', 
                                   'transition-border', 'transition-all', 'duration-500', 'mb-2'); 

    if (message.picture) {  
        const userpic = document.createElement('img');
        userpic.classList.add('w-10', 'h-10', 'rounded-full', 'absolute', 'top-1', 'left-1', 'ring-2', 'ring-gray-500');
        userpic.src = message.picture; 
        messageContainer.appendChild(userpic);
    }

    const userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('ml-14');

    const usernameDiv = document.createElement('div');
    usernameDiv.classList.add('font-bold');
    usernameDiv.innerText = message.username || "Anonymous";

    const messageText = document.createElement('p');
    messageText.classList.add('text-m');

    const parsedContent = parseMessageContent(message.content);
    messageText.innerHTML = parsedContent;

    userInfoDiv.appendChild(usernameDiv);
    userInfoDiv.appendChild(messageText);

    messageContainer.appendChild(userInfoDiv);

    document.getElementById("msgs").appendChild(messageContainer);

    ensureTenorScriptExecution();
    scrollToBottom();
}


history.forEach(loadHistory);


ws.addEventListener("message", (e) => {
    const message = JSON.parse(e.data); 

    
    loadHistory(message);

   
    history.push(message);
    localStorage.setItem('chatHistory', JSON.stringify(history));
    scrollToBottom();
});


ws.addEventListener("open", () => {
    send.addEventListener("submit", (e) => {
        e.preventDefault();
        const msgs = document.getElementById("submit").value;
        
        if (msgs.length === 0) return;

        //console.log("Sending message:", msgs);

        
        const newMessage = {
            username: user.username,
            content: msgs,
            picture: user.profilepic
        };

        
        loadHistory(newMessage);

        
        history.push(newMessage);

        
        localStorage.setItem('chatHistory', JSON.stringify(history));
        scrollToBottom();
       
        ws.send(JSON.stringify(newMessage));  
        
        
        document.getElementById("submit").value = "";

        
        
    });
});

window.onload = scrollToBottom();