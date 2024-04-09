// login elements
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// chat elements
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const activeUsersList = document.querySelector(".active-users"); // Seleciona a lista de usuários ativos

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

// Função para criar elementos de mensagem do próprio usuário
const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.innerHTML = content;
    return div;
};

// Função para criar elementos de mensagem de outros usuários
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

// Função para gerar uma cor aleatória
const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

// Função para rolar a tela para baixo
const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

// Função para processar mensagens recebidas do servidor
const processMessage = ({ data }) => {
    const { type, userId, userName, userColor, content, users } = JSON.parse(data);

    // Verifica o tipo de mensagem recebida
    if (type === "activeUsersUpdate") {
        updateActiveUsers(users); // Chama a função para atualizar a lista de usuários ativos
    } else {
        const message = userId == user.id ?
            createMessageSelfElement(content) :
            createMessageOtherElement(content, userName, userColor);
        chatMessages.appendChild(message);
        scrollScreen();
    }
};

// Função para lidar com o envio do formulário de login
const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://web-chat-back-ende.onrender.com");
    websocket.onmessage = processMessage;
};

// Função para enviar uma mensagem
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

// Função para atualizar a lista de usuários ativos
function updateActiveUsers(users) {
    activeUsersList.innerHTML = ""; // Limpa a lista antes de adicionar os novos usuários
    users.forEach(user => {
        const userElement = document.createElement("li");
        userElement.textContent = user;
        activeUsersList.appendChild(userElement);
    });
}

// Adiciona os event listeners aos formulários
loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
