const loginForm = document.querySelector(".login__form");
const loginInput = document.querySelector(".login__input");
const chatForm = document.querySelector(".chat__form");
const chatInput = document.querySelector(".chat__input");
const chatMessages = document.querySelector(".chat__messages");

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
];

const user = { id: "", name: "", color: "" };
let websocket;

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = content;
    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.classList.add("message--other");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    div.appendChild(span);
    span.innerHTML = sender;
    div.innerHTML += content;
    return div;
};

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);
    const message = (userId == user.id) ? createMessageSelfElement(content) : createMessageOtherElement(content, userName, userColor);
    chatMessages.appendChild(message);
    scrollScreen();
};

const checkConnection = () => {
    if (websocket.readyState === WebSocket.OPEN) {
        // Envia um ping ao servidor para manter a conexão ativa
        websocket.send("ping");
    }
};

// Estabelece a conexão WebSocket
const establishWebSocketConnection = () => {
    websocket = new WebSocket("wss://web-chat-back-ende.onrender.com");

    websocket.onmessage = (event) => {
        const message = event.data;
        if (message === "pong") {
            // Responde ao ping do servidor
            return;
        }
        processMessage(event);
    };

    websocket.onopen = () => {
        // Define um intervalo para enviar pings periodicamente
        setInterval(checkConnection, 30000); // Envia pings a cada 30 segundos
    };

    websocket.onerror = (error) => {
        console.error("Erro na conexão WebSocket:", error);
    };
};

// Manipuladores de eventos para login e envio de mensagens
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();
    loginForm.style.display = "none";
    chatForm.style.display = "block";
    establishWebSocketConnection();
});

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };
    websocket.send(JSON.stringify(message));
    chatInput.value = "";
});
