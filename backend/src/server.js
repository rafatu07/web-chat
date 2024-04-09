const { WebSocketServer } = require("ws");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const MESSAGES_FILE_PATH = "./messages/messages.json";

// Função para salvar a mensagem no arquivo JSON
function saveMessage(message) {
    let messages = [];
    if (fs.existsSync(MESSAGES_FILE_PATH)) {
        messages = JSON.parse(fs.readFileSync(MESSAGES_FILE_PATH, "utf-8"));
    }
    messages.push(message);
    fs.writeFileSync(MESSAGES_FILE_PATH, JSON.stringify(messages, null, 2));
}

// Função para criar o arquivo messages.json se ele não existir
function createMessagesFile() {
    // Verifica se o arquivo já existe
    if (!fs.existsSync(MESSAGES_FILE_PATH)) {
        // Cria o diretório se não existir
        const directory = path.dirname(MESSAGES_FILE_PATH);
        fs.mkdirSync(directory, { recursive: true });

        // Cria o arquivo messages.json
        fs.writeFileSync(MESSAGES_FILE_PATH, "[]");

        console.log("Arquivo messages.json criado com sucesso.");
    } else {
        console.log("O arquivo messages.json já existe.");
    }
}

// Chama a função para criar o arquivo messages.json
createMessagesFile();

// Inicia o servidor WebSocket
const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

// Evento de conexão com WebSocket
wss.on("connection", (ws) => {
    ws.on("error", console.error);

    // Evento de recebimento de mensagem
    ws.on("message", (data) => {
        const message = JSON.parse(data);
        saveMessage(message);
        // Envia a mensagem para todos os clientes conectados
        wss.clients.forEach((client) => client.send(data.toString()));
    });

    console.log("Cliente conectado.");
});
