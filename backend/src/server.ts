import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

const app = express()
const PORT = process.env.PORT || 3000

// Create server for initial socket connection
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
    }
})

// Create socket connection with event listerners and broadcast for synchtonization
io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for session connection
    socket.on("joinSession", (idSession) => {
        socket.join(idSession)
        console.log(`User joined session: ${idSession}`);

    })

    socket.on("leaveSession", (idSession) => {
        socket.leave(idSession)
        console.log(`User left session: ${idSession}`);

    })

    // Listen for ship placement
    socket.on("placeShip", (data) => {
        console.log("Ship placed by player:", data);
        // Broadcast ship placement to opponent
        socket.broadcast.emit("opponentPlacedShip", data)
    })

    // Listen for attack moves
    socket.on("attack", (data) => {
        console.log("Player attack:", data)
        // Broadcast attack to opponent
        socket.broadcast.emit("opponentAttack", data)
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`);
})