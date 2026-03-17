import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { env } from "@/shared/config/env";

// Event payloads from server
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

interface AuctionEventsContextValue {
 joinAuction: (auctionId: string) => void;
 leaveAuction: (auctionId: string) => void;
 isConnected: boolean;
 onAuctionExtended: ((callback: (payload: AuctionExtendedPayload) => void) => () => void) | null;
 onNewBid: ((callback: (payload: NewBidPayload) => void) => () => void) | null;
}

const AuctionEventsContext = createContext<AuctionEventsContextValue | null>(null);

interface AuctionEventsProviderProps {
 children: ReactNode;
}

export function AuctionEventsProvider({ children }: AuctionEventsProviderProps) {
 const socketRef = useRef<Socket | null>(null);
 const [isConnected, setIsConnected] = useState(false);

 useEffect(() => {
 const socket = io(env.apiBaseUrl, {
 transports: ["websocket"],
 autoConnect: true,
 });

 socketRef.current = socket;

 socket.on("connect", () => {
 setIsConnected(true);
 });

 socket.on("disconnect", () => {
 setIsConnected(false);
 });

 socket.on("connect_error", () => {
 // Connection errors are handled silently - reconnection is automatic
 });

 return () => {
 socket.disconnect();
 socketRef.current = null;
 };
 }, []);

 const joinAuction = useCallback((auctionId: string) => {
 if (socketRef.current) {
 socketRef.current.emit("join:auction", auctionId);
 }
 }, []);

 const leaveAuction = useCallback((auctionId: string) => {
 if (socketRef.current) {
 socketRef.current.emit("leave:auction", auctionId);
 }
 }, []);

 const onAuctionExtended = useCallback((callback: (payload: AuctionExtendedPayload) => void) => {
 const socket = socketRef.current;
 if (!socket) return () => {};

 socket.on("auction:extended", callback);

 return () => {
 socket.off("auction:extended", callback);
 };
 }, []);

 const onNewBid = useCallback((callback: (payload: NewBidPayload) => void) => {
 const socket = socketRef.current;
 if (!socket) return () => {};

 socket.on("auction:new_bid", callback);

 return () => {
 socket.off("auction:new_bid", callback);
 };
 }, []);

 const value: AuctionEventsContextValue = {
 joinAuction,
 leaveAuction,
 isConnected,
 onAuctionExtended,
 onNewBid,
 };

 return (
 <AuctionEventsContext.Provider value={value}>
 {children}
 </AuctionEventsContext.Provider>
 );
}

export function useAuctionEvents() {
 const context = useContext(AuctionEventsContext);
 if (!context) {
 throw new Error("useAuctionEvents must be used within an AuctionEventsProvider");
 }
 return context;
}

export function useAuctionRoom(auctionId: string) {
 const { joinAuction, leaveAuction, onAuctionExtended, onNewBid, isConnected } =
 useAuctionEvents();

 const [extendedPayload, setExtendedPayload] = useState<AuctionExtendedPayload | null>(null);
 const [newBidPayload, setNewBidPayload] = useState<NewBidPayload | null>(null);

 useEffect(() => {
 joinAuction(auctionId);

 const cleanupExtended = onAuctionExtended?.((payload) => {
 if (payload.auctionId === auctionId) {
 setExtendedPayload(payload);
 }
 });

 const cleanupNewBid = onNewBid?.((payload) => {
 if (payload.auctionId === auctionId) {
 setNewBidPayload(payload);
 }
 });

 return () => {
 leaveAuction(auctionId);
 cleanupExtended?.();
 cleanupNewBid?.();
 };
 }, [auctionId, joinAuction, leaveAuction, onAuctionExtended, onNewBid]);

 return {
 isConnected,
 extendedPayload,
 newBidPayload,
 clearExtension: () => setExtendedPayload(null),
 clearNewBid: () => setNewBidPayload(null),
 };
}
