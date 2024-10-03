import express, { Request, Response } from "express"
import { createServer } from "http"
import { Server } from "socket.io"

const PORT = process.env.PORT || 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*", // Allow any origin
    }
})


io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    })

})


app.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`);
})