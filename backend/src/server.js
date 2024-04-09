const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const activeUsers = new Set(); // Conjunto para armazenar os nomes dos usuários ativos

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    console.log("client connected");

    ws.on("message", (data) => {
        const message = JSON.parse(data);

        if (message.type === "join") {
            activeUsers.add(message.userName); // Adiciona o usuário ativo ao conjunto
            const userJoinedMessage = {
                type: "userJoined",
                userName: message.userName,
                users: Array.from(activeUsers) // Envia a lista atualizada de usuários ativos para todos os clientes
            };
            broadcast(JSON.stringify(userJoinedMessage));
        } else if (message.type === "leave") {
            activeUsers.delete(message.userName); // Remove o usuário ativo do conjunto
            const userLeftMessage = {
                type: "userLeft",
                userName: message.userName,
                users: Array.from(activeUsers) // Envia a lista atualizada de usuários ativos para todos os clientes
            };
            broadcast(JSON.stringify(userLeftMessage));
        } else {
            // Se não for uma mensagem de entrada ou saída de usuário, apenas retransmita a mensagem para todos os clientes
            wss.clients.forEach((client) => client.send(data));
        }
    });
});

// Função para enviar uma mensagem para todos os clientes conectados
function broadcast(message) {
    wss.clients.forEach((client) => client.send(message));
}
