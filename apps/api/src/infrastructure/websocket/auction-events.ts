import type { Server } from "http";
import type { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";

// Singleton instance for emitting events
let io: SocketIOServer | null = null;

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export interface AuctionExtendedPayload {
 auctionId: string;
 newEndsAt: string;
 wasExtended: boolean;
}

export interface NewBidPayload {
 auctionId: string;
 bidId: string;
 amount: number;
 bidderId: string;
 createdAt: string;
}

export type AuctionEvents = {
 "auction:extended": (payload: AuctionExtendedPayload) => void;
 "auction:new_bid": (payload: NewBidPayload) => void;
};

export function initWebSocket(httpServer: Server): SocketIOServer<AuctionEvents> {
 if (io) {
 return io;
 }

  const allowedOrigins = getAllowedOrigins();

 io = new SocketIOServer<AuctionEvents>(httpServer, {
 cors: {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
 methods: ["GET", "POST"],
 },
 });

 io.on("connection", (socket: Socket) => {
 // Join auction room for targeted updates
 socket.on("join:auction", (auctionId: string) => {
 void socket.join(`auction:${auctionId}`);
 });

 socket.on("leave:auction", (auctionId: string) => {
 void socket.leave(`auction:${auctionId}`);
 });
 });

 return io;
}

export function getWebSocket(): SocketIOServer | null {
 return io;
}

/**
 * Emits auction extension event to all clients watching the auction
 */
export function emitAuctionExtended(payload: AuctionExtendedPayload): void {
 if (!io) {
 return;
 }

 io.to(`auction:${payload.auctionId}`).emit("auction:extended", payload);
}

/**
 * Emits new bid event to all clients watching the auction
 */
export function emitNewBid(payload: NewBidPayload): void {
 if (!io) {
 return;
 }

 io.to(`auction:${payload.auctionId}`).emit("auction:new_bid", payload);
}
