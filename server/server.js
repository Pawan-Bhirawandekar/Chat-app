import express from "express"
import "dotenv/config" 
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/userRoutes.js"
import messageRouter from "./routes/messageRoutes.js"
import {Server} from "socket.io"
// import { Socket } from "dgram"

// Create Express app and HTTP Server
const app = express()
const server = http.createServer(app) //socket.io support http server

//Intialize socket.io server
export const io = new Server(server, {
    cors:{origin: "*"}
})

//Store online users
export const userSocketmap = {}; //{userId: socketId}

//Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketmap[userId] =socket.id;

    //Emit online user to all connected client
    io.emit("getOnlineUsers", Object.keys(userSocketmap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId)
        delete userSocketmap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketmap))
    })
})

//Middleware setup
app.use(express.json({limit : "4mb"}))
app.use(cors()) //connect all url with backend 

//API endpoint, Routes setup
app.use("/api/status" ,(req,res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect to MongoDB
await connectDB()


const PORT = process.env.PORT || 5000 //if port available in env variable or else run on port number 5000
server.listen(PORT, ()=> console.log("Server is running on PORT: "+PORT))