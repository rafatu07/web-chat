// login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")

// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")
const clearMessagesButton = document.getElementById("clearMessagesButton"); // Adicione o elemento do botão de limpar mensagens

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)

    scrollScreen()

    // Exiba o botão de limpar mensagens se o usuário for o administrador
    if (user.name === "admin") {
        clearMessagesButton.style.display = "block";
    } else {
        clearMessagesButton.style.display = "none";
    }
}

const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    // Verifique se o usuário é admin e mostre o botão de limpar mensagens se for o caso
    if (user.name === "admin") {
        clearMessagesButton.style.display = "block";
    } else {
        clearMessagesButton.style.display = "none";
    }

    // WebSocket: conecte-se ao servidor WebSocket
    websocket = new WebSocket("wss://web-chat-back-ende.onrender.com");
    websocket.onmessage = processMessage;
}

const sendMessage = (event) => {
    event.preventDefault()

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message))

    chatInput.value = ""
}

// Adicione um evento de clique para o botão de limpar mensagens
clearMessagesButton.addEventListener("click", () => {
    // Limpe as mensagens da interface do usuário
    chatMessages.innerHTML = "";

    // Oculte o botão de limpar mensagens
    clearMessagesButton.style.display = "none";
});

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)
