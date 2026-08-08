import { WebSocketServer, WebSocket } from "ws";

type WsClient = WebSocket & { auctionId?: string; isAlive?: boolean };

export type AuctionEvent = {
  type: string;
  [key: string]: unknown;
};

interface AuctionWsHub {
  wss: WebSocketServer | null;
  broadcast: (auctionId: string, payload: AuctionEvent) => void;
  start: () => void;
}

declare global {
  var __auctionWsHub: AuctionWsHub | undefined;
}

function createHub(): AuctionWsHub {
  const hub: AuctionWsHub = {
    wss: null,
    broadcast: (auctionId, payload) => {
      if (!hub.wss) return;
      const data = JSON.stringify({ ...payload, auction: auctionId });
      for (const client of hub.wss.clients as Set<WsClient>) {
        if (client.readyState === WebSocket.OPEN && client.auctionId === auctionId) {
          client.send(data);
        }
      }
    },
    start: () => {
      if (hub.wss) return;
      const port = Number(process.env.AUCTION_WS_PORT || 3001);
      try {
        const wss = new WebSocketServer({ port });
        hub.wss = wss;

        wss.on("connection", (socket, req) => {
          const url = new URL(req.url || "/", "http://localhost");
          const auctionId = url.searchParams.get("auction");
          const client = socket as WsClient;
          client.auctionId = auctionId || undefined;
          client.isAlive = true;
          socket.on("pong", () => {
            client.isAlive = true;
          });
        });

        const heartbeat = setInterval(() => {
          for (const client of wss.clients as Set<WsClient>) {
            if (!client.isAlive) {
              client.terminate();
              continue;
            }
            client.isAlive = false;
            client.ping();
          }
        }, 30000);

        wss.on("close", () => clearInterval(heartbeat));
        console.log(`[auction-ws] listening on ws://localhost:${port}`);
      } catch (err) {
        console.error("[auction-ws] failed to start:", err);
      }
    },
  };
  return hub;
}

globalThis.__auctionWsHub = globalThis.__auctionWsHub || createHub();

export function startAuctionWsServer() {
  globalThis.__auctionWsHub?.start();
}

export function broadcastAuctionEvent(auctionId: string, payload: AuctionEvent) {
  globalThis.__auctionWsHub?.broadcast(auctionId, payload);
}
