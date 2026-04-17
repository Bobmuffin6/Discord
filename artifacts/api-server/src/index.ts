import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { registerClient, unregisterClient } from "./lib/wsBroadcast";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws: WebSocket) => {
  let subscribedChannel: number | null = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "subscribe" && typeof msg.channelId === "number") {
        const prev = subscribedChannel;
        const channelId = msg.channelId as number;
        subscribedChannel = channelId;
        registerClient(ws, channelId, prev);
        logger.info({ channelId }, "WS client subscribed");
      }
    } catch (e) {
      logger.warn("Invalid WS message");
    }
  });

  ws.on("close", () => {
    unregisterClient(ws, subscribedChannel);
  });
});

server.listen(port, () => {
  logger.info({ port }, "Server listening");
});
