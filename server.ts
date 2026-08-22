import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeRooms: gameRooms.size, onlinePlayers: onlineUsers.size });
  });

  // Real-time Multiplayer State Store for thousands of concurrent users
  const onlineUsers = new Map<string, { username: string; room: string | null }>();
  const gameRooms = new Map<string, { gameId: string; players: string[]; state: any }>();
  const matchmakingQueue: { socketId: string; username: string; gameId: string }[] = [];

  io.on("connection", (socket) => {
    console.log(`[Socket] Player connected: ${socket.id}`);

    socket.on("join_lobby", (data: { username: string }) => {
      onlineUsers.set(socket.id, { username: data.username || 'کاربر مهمان', room: null });
      io.emit("online_count", onlineUsers.size);
    });

    // Matchmaking queue for thousands of concurrent players
    socket.on("find_match", (data: { gameId: string; username: string }) => {
      console.log(`[Matchmaking] ${data.username} looking for match in ${data.gameId}`);
      matchmakingQueue.push({ socketId: socket.id, username: data.username, gameId: data.gameId });

      // Check if there is another player in queue for the same game
      const sameGameIndex = matchmakingQueue.findIndex(
        (item) => item.gameId === data.gameId && item.socketId !== socket.id
      );

      if (sameGameIndex !== -1) {
        const opponent = matchmakingQueue.splice(sameGameIndex, 1)[0];
        // Remove current user from queue as well
        const myIndex = matchmakingQueue.findIndex((item) => item.socketId === socket.id);
        if (myIndex !== -1) matchmakingQueue.splice(myIndex, 1);

        const roomCode = `room_${Math.random().toString(36).substring(2, 8)}`;
        gameRooms.set(roomCode, {
          gameId: data.gameId,
          players: [opponent.socketId, socket.id],
          state: { turn: opponent.socketId, board: null }
        });

        socket.join(roomCode);
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) {
          opponentSocket.join(roomCode);
        }

        io.to(roomCode).emit("match_found", {
          roomCode,
          gameId: data.gameId,
          player1: opponent.username,
          player2: data.username,
          firstTurn: opponent.socketId
        });
        console.log(`[Matchmaking] Match created: ${roomCode} between ${opponent.username} and ${data.username}`);
      } else {
        socket.emit("waiting_match", { message: "در صف انتظار حریف..." });
      }
    });

    socket.on("cancel_matchmaking", () => {
      const idx = matchmakingQueue.findIndex((item) => item.socketId === socket.id);
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1);
      }
    });

    socket.on("make_move", (data: { roomCode: string; moveData: any }) => {
      socket.to(data.roomCode).emit("opponent_move", data.moveData);
    });

    socket.on("send_chat", (data: { roomCode: string; sender: string; message: string }) => {
      io.to(data.roomCode).emit("receive_chat", data);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      const idx = matchmakingQueue.findIndex((item) => item.socketId === socket.id);
      if (idx !== -1) matchmakingQueue.splice(idx, 1);
      io.emit("online_count", onlineUsers.size);
      console.log(`[Socket] Player disconnected: ${socket.id}`);
    });
  });

  // Vite middleware setup for development, or static for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] GameServer running on http://0.0.0.0:${PORT} (Ready for 1000s of concurrent players)`);
  });
}

startServer();
