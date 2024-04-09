const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

// Array para armazenar os usuários ativos
let activeUsers = [];

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    // Envia a lista de usuários ativos para o novo cliente conectado
    ws.send(JSON.stringify({ type: "activeUsersUpdate", users: activeUsers }));

    ws.on("message", (data) => {
        const message = JSON.parse(data);

        if (message.type === "join") {
            handleUserJoin(message.userName);
        } else if (message.type === "leave") {
            handleUserLeave(message.userName);
        } else {
            // Reenvia a mensagem para todos os clientes
            wss.clients.forEach((client) => client.send(data));
        }
    });

    console.log("client connected");
});

// Função para lidar com a entrada de um novo usuário
function handleUserJoin(userName) {
    if (!activeUsers.includes(userName)) {
        activeUsers.push(userName);
        broadcastActiveUsersUpdate();
    }
}

// Função para lidar com a saída de um usuário
function handleUserLeave(userName) {
    activeUsers = activeUsers.filter(user => user !== userName);
    broadcastActiveUsersUpdate();
}

// Função para enviar uma mensagem de atualização da lista de usuários ativos para todos os clientes
function broadcastActiveUsersUpdate() {
    const message = JSON.stringify({ type: "activeUsersUpdate", users: activeUsers });
    wss.clients.forEach((client) => client.send(message));
}
