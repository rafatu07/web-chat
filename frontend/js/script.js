const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const activeUsersList = document.querySelector(".active-users");

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
    const { type, userName } = JSON.parse(data);

    if (type === "userJoined") {
        const userElement = document.createElement("li");
        userElement.textContent = userName;
        activeUsersList.appendChild(userElement); // Adiciona o usuário à lista de usuários online
    } else if (type === "userLeft") {
        const userList = activeUsersList.querySelectorAll("li");
        userList.forEach(user => {
            if (user.textContent === userName) {
                user.remove(); // Remove o usuário da lista de usuários online
            }
        });
    } else {
        // Se a mensagem for uma mensagem de chat normal, processe-a normalmente
        const { userId, userName, userColor, content } = JSON.parse(data);
        const message = userId == user.id ?
            createMessageSelfElement(content) :
            createMessageOtherElement(content, userName, userColor);
        chatMessages.appendChild(message);
        scrollScreen();
    }
};

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://web-chat-back-ende.onrender.com");
    websocket.onmessage = processMessage;

    // Envie uma mensagem ao servidor informando que o usuário entrou no chat
    const joinMessage = {
        type: "join",
        userName: user.name
    };
    websocket.send(JSON.stringify(joinMessage));
};

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
