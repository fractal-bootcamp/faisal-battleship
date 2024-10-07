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

// Store sessions and player readiness
const gameSessions: {
    [key: string]: {
        player1Ready: boolean
        player2Ready: boolean
        player1Name: string | null
        player2Name: string | null
        player1ShipsPlaces: boolean
        player2ShipsPlaces: boolean
    }
} = {}

// Create socket connection with event listerners and broadcast for synchtonization
io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for session connection
    socket.on("joinSession", ({ idSession, playerName }) => {
        socket.join(idSession)
        console.log(`User joined session: ${idSession}, Name: ${playerName}`);

        // Initialize session state if not already created
        if (!gameSessions[idSession]) {
            gameSessions[idSession] = {
                player1Ready: false,
                player2Ready: false,
                player1Name: playerName,
                player2Name: null,
                player1ShipsPlaces: false,
                player2ShipsPlaces: false,
            }
            socket.emit("assignRole", "player1")
        } else if (!gameSessions[idSession].player2Name) {
            gameSessions[idSession].player2Name = playerName
            socket.emit("assignRole", "player2")
        } else {
            socket.emit("assignRole", "spectator") // If more than 2 players joined
        }

        // Update player names
        io.to(idSession).emit("updatePlayerNames", {
            player1Name: gameSessions[idSession].player1Name,
            player2Name: gameSessions[idSession].player2Name,
        })
    })

    // Listen for ship placement
    socket.on("placeShip", (data) => {
        const { idSession, playerRole } = data
        console.log(`Ship placed by ${playerRole} in session ${idSession}:`, data);

        // Store ship placement based on player role
        if (playerRole === "player1") {
            gameSessions[idSession].player1ShipsPlaces = true
        } else if (playerRole === "player2") {
            gameSessions[idSession].player2ShipsPlaces = true
        }

        // Notify opponent about ship placement
        socket.to(idSession).emit("opponentPlacedShip", data)

        // Start the game if both player placed their ships
        if (gameSessions[idSession].player1ShipsPlaces &&
            gameSessions[idSession].player2ShipsPlaces
        ) {
            io.to(idSession).emit("bothPlayersReady")
        }
    })

    // Handle player readiness
    socket.on("playerReady", ({ idSession, playerRole }) => {
        const room = gameSessions[idSession]

        if (!room) return

        // Update readiness for players
        if (playerRole === "player1") {
            room.player1Ready = true
        } else {
            room.player2Ready = true
        }

        // If both players are ready, notify session the for the game to start
        if (room.player1Ready && room.player2Ready) {
            io.to(idSession).emit("bothPlayersReady")
        } else {
            // Notify opponent the other player is ready
            socket.to(idSession).emit("opponentReady")
        }
    })

    // Listen for attack moves
    // this needs to be documented. wtf is data? other engineers on the team must know or they can't help.
    socket.on("attack", (data) => {
        const { idSession } = data
        console.log("Player attack:", data)
        // Broadcast attack to opponent
        socket.to(data.idSession).emit("opponentAttack", data)
    })

    socket.on("leaveSession", (idSession) => {
        socket.leave(idSession)
        console.log(`User left session: ${idSession}`);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`);
})