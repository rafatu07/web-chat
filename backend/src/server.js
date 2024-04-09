const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

// Array para armazenar os usuários ativos
let activeUsers = [];

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    // Função para enviar a lista de usuários ativos para todos os clientes conectados
    const sendActiveUsers = () => {
        const message = JSON.stringify({ type: "activeUsersUpdate", users: activeUsers });
        wss.clients.forEach((client) => client.send(message));
    };

    ws.on("message", (data) => {
        // Aqui você pode processar mensagens recebidas do cliente, se necessário
        // Por exemplo, adicionar lógica para lidar com mensagens de entrada/saída de usuários
        wss.clients.forEach((client) => client.send(data.toString()));
    });

    // Adiciona o novo usuário à lista de usuários ativos e envia uma atualização para todos os clientes
    ws.on("join", (userName) => {
        activeUsers.push(userName);
        sendActiveUsers();
    });

    // Remove o usuário da lista de usuários ativos e envia uma atualização para todos os clientes
    ws.on("leave", (userName) => {
        activeUsers = activeUsers.filter(user => user !== userName);
        sendActiveUsers();
    });

    console.log("client connected");
});
