import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const typingTimeoutRefs = useRef(new Map());
    const socketRef = useRef(null);

    const getAuth = () => ({
        userId: localStorage.getItem("userId"),
        token: localStorage.getItem("token"),
    });

    const { userId, token } = getAuth();

    useEffect(() => {
        // Only initialize once
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:8000", {
                transports: ["websocket", "polling"],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                forceNew: true,
                auth: {
                    userId,
                    token,
                },
            });

            socketRef.current.on("connect", () => {
                console.log("✅ Socket connected to server");
                setIsConnected(true);
            });

            socketRef.current.on("connect_error", (error) => {
                console.error("❌ Socket connection error:", error.message);
                setIsConnected(false);
            });

            socketRef.current.on("disconnect", () => {
                console.log("⚠️ Socket disconnected");
                setIsConnected(false);
            });
        }

        return () => {
            // Cleanup timers
            typingTimeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
            typingTimeoutRefs.current.clear();

            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, []); // no deps → only runs once

    useEffect(() => {
        if (!socketRef.current || !isConnected || !userId || !token) return;

        console.log("🔑 User authenticated, joining user room:", userId);

        // Example: join a private room
        socketRef.current.emit("joinRoom", { userId });
    }, [userId, token, isConnected]);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
