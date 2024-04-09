const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
let activeUsers = []; // Lista de usuários ativos

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
        const message = JSON.parse(data);
        
        if (message.type === "join") {
            // Adiciona o novo usuário à lista de usuários ativos
            activeUsers.push(message.userName);
            // Envia uma mensagem para todos os clientes contendo a lista atualizada de usuários ativos
            updateActiveUsers();
        } else if (message.type === "leave") {
            // Remove o usuário que saiu da lista de usuários ativos
            activeUsers = activeUsers.filter(user => user !== message.userName);
            // Envia uma mensagem para todos os clientes contendo a lista atualizada de usuários ativos
            updateActiveUsers();
        } else {
            // Se não for uma mensagem de entrada ou saída de usuário, apenas retransmita a mensagem para todos os clientes
            wss.clients.forEach((client) => client.send(data));
        }
    });

    console.log("client connected");
});

// Função para enviar uma mensagem para todos os clientes conectados contendo a lista de usuários ativos
function updateActiveUsers() {
    const message = {
        type: "activeUsersUpdate",
        users: activeUsers
    };
    wss.clients.forEach((client) => client.send(JSON.stringify(message)));
}
