const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const noop = () => {};

function heartbeat() {
    this.isAlive = true;
}

wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    ws.on("error", console.error);

    ws.on("message", (data) => {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        });
    });

    console.log("client connected");
});

const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(noop);
    });
}, 30000); // Intervalo de 30 segundos para enviar pings

wss.on("close", () => {
    clearInterval(interval);
});
