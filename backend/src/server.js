const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    // Quando um usuário entra no chat
    ws.on("join", (userName) => {
        const message = {
            type: "userJoined",
            userName: userName
        };
        broadcast(JSON.stringify(message));
    });

    // Quando um usuário sai do chat
    ws.on("leave", (userName) => {
        const message = {
            type: "userLeft",
            userName: userName
        };
        broadcast(JSON.stringify(message));
    });

    ws.on("message", (data) => {
        wss.clients.forEach((client) => client.send(data.toString()));
    });

    console.log("client connected");
});

// Função para enviar uma mensagem para todos os clientes conectados
function broadcast(message) {
    wss.clients.forEach((client) => client.send(message));
}
