const { WebSocketServer } = require("ws")
const dotenv = require("dotenv")

dotenv.config()

const wss = new WebSocketServer({ port: process.env.PORT || 8080 })

wss.on("connection", (ws) => {
    ws.on("error", console.error)

    ws.on("message", (data) => {
        wss.clients.forEach((client) => client.send(data.toString()))
    })

    console.log("client connected")
})

ws.on("join", (userName) => {
    activeUsers.push(userName);
    sendActiveUsers(); // Envia uma mensagem de atualização de usuários
});

ws.on("leave", (userName) => {
    activeUsers = activeUsers.filter(user => user !== userName);
    sendActiveUsers(); // Envia uma mensagem de atualização de usuários
});

function sendActiveUsers() {
    const message = JSON.stringify({ type: "activeUsersUpdate", users: activeUsers });
    wss.clients.forEach(client => client.send(message));
}
