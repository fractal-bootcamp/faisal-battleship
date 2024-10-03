import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"

const PORT = process.env.PORT || 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    }
})

// app.use(cors({ origin: "http://localhost:5173" }))

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("testEvent", (data) => {
        console.log("Received event from client:", data);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`);
})