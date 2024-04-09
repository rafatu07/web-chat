const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
        const message = JSON.parse(data);

        if (message.type === "join") {
            const userJoinedMessage = {
                type: "userJoined",
                userName: message.userName
            };
            broadcast(JSON.stringify(userJoinedMessage));
        } else if (message.type === "leave") {
            const userLeftMessage = {
                type: "userLeft",
                userName: message.userName
            };
            broadcast(JSON.stringify(userLeftMessage));
        } else {
            // Se não for uma mensagem de entrada ou saída de usuário, apenas retransmita a mensagem para todos os clientes
            wss.clients.forEach((client) => client.send(data));
        }
    });

    console.log("client connected");
});

// Função para enviar uma mensagem para todos os clientes conectados
function broadcast(message) {
    wss.clients.forEach((client) => client.send(message));
}
