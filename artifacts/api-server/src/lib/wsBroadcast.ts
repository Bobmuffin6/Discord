import { WebSocket } from "ws";

const channelClients = new Map<number, Set<WebSocket>>();

export function registerClient(ws: WebSocket, channelId: number, prevChannelId: number | null) {
  if (prevChannelId !== null) {
    channelClients.get(prevChannelId)?.delete(ws);
  }
  if (!channelClients.has(channelId)) {
    channelClients.set(channelId, new Set());
  }
  channelClients.get(channelId)!.add(ws);
}

export function unregisterClient(ws: WebSocket, channelId: number | null) {
  if (channelId !== null) {
    channelClients.get(channelId)?.delete(ws);
  }
}

export function broadcastToChannel(channelId: number, message: unknown) {
  const clients = channelClients.get(channelId);
  if (!clients) return;
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
