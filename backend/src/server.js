const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 8080;
const RECONNECT_INTERVAL = 3000; // Intervalo de reconexão em milissegundos

let wss;
let connectedClients = [];

function setupWebSocketServer() {
    wss = new WebSocketServer({ port: PORT });

    wss.on("connection", handleConnection);
}

function handleConnection(ws) {
    console.log("Nova conexão WebSocket estabelecida.");

    ws.on("message", handleMessage);
    ws.on("close", handleClose);

    connectedClients.push(ws);
}

function handleMessage(data) {
    console.log("Mensagem recebida:", data.toString());

    // Envie a mensagem para todos os clientes conectados
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data.toString());
        }
    });
}

function handleClose() {
    console.log("Conexão WebSocket fechada inesperadamente.");

    // Remova o cliente desconectado da lista de clientes conectados
    connectedClients = connectedClients.filter(client => client.readyState === WebSocket.OPEN);

    // Tente reconectar após um intervalo de tempo
    setTimeout(setupWebSocketServer, RECONNECT_INTERVAL);
}

setupWebSocketServer();
