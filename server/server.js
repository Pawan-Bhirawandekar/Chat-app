import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP Server
const app = express();
const server = http.createServer(app); // socket.io needs http server

// Initialize socket.io server
export const io = new Server(server, {
  cors: { origin: "*" },
});

// Store online users
export const userSocketmap = {}; // {userId: socketId}

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketmap[userId] = socket.id;

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketmap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    if (userId) delete userSocketmap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketmap));
  });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// API endpoints
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Function to start the server and handle port conflicts
const startServer = (port = process.env.PORT || 5000) => {
  server.listen(port, () => console.log(`Server running on PORT: ${port}`))
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1); // Try next port
      } else {
        console.error(err);
      }
    });
};

// Start server only in non-production for dev
if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default server; // Export server for deployment
