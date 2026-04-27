import { createServer } from "node:http";

import { afterAll, describe, expect, test } from "bun:test";
import { io as createClient, type Socket as ClientSocket } from "socket.io-client";

import {
  emitNewBid,
  getWebSocket,
  initWebSocket,
  type NewBidPayload,
} from "#infrastructure/websocket/auction-events";

let client: ClientSocket | null = null;
let httpServer: ReturnType<typeof createServer> | null = null;

async function listenOnRandomPort(server: ReturnType<typeof createServer>): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (address && typeof address === "object") {
        resolve(address.port);
      }
    });
  });
}

async function waitForConnect(socket: ClientSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.once("connect_error", reject);
  });
}

afterAll(() => {
  client?.disconnect();
  void getWebSocket()?.close();

  if (httpServer?.listening) {
    httpServer.close();
  }
});

describe("auction websocket events", () => {
  test("emits bid events only to clients that joined the matching auction room", async () => {
    httpServer = createServer();
    initWebSocket(httpServer);
    const port = await listenOnRandomPort(httpServer);

    client = createClient(`http://127.0.0.1:${port}`, {
      transports: ["websocket"],
    });
    await waitForConnect(client);

    const payloadPromise = new Promise<NewBidPayload>((resolve) => {
      client?.once("auction:new_bid", resolve);
    });

    client.emit("join:auction", "auction-1");
    await new Promise((resolve) => setTimeout(resolve, 25));

    emitNewBid({
      auctionId: "auction-1",
      bidId: "bid-1",
      amount: 150,
      bidderId: "bidder-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    const payload = await payloadPromise;

    expect(payload).toEqual({
      auctionId: "auction-1",
      bidId: "bid-1",
      amount: 150,
      bidderId: "bidder-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
