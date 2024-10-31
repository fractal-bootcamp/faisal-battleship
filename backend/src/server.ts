import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { SocketEvents, JoinSessionPayload, PlaceShipPayload, PlayerReadyPayload, AttackPayload, PlayerRole } from '../../shared/types/SocketEvents';

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
io.on(SocketEvents.CONNECT, (socket) => {
    console.log("A user connected");

    // Listen for session connection
    socket.on(SocketEvents.JOIN_SESSION, ({ idSession, playerName }: JoinSessionPayload) => {
        socket.join(idSession);
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
            // Assign role to player
            socket.emit(SocketEvents.ASSIGN_ROLE, PlayerRole.PLAYER1);
        } else if (!gameSessions[idSession].player2Name) {
            gameSessions[idSession].player2Name = playerName;
            socket.emit(SocketEvents.ASSIGN_ROLE, PlayerRole.PLAYER2);
        } else {
            socket.emit(SocketEvents.ASSIGN_ROLE, PlayerRole.SPECTATOR); // If no more slots, assign spectator role
        }

        io.to(idSession).emit(SocketEvents.UPDATE_PLAYER_NAMES, {
            player1Name: gameSessions[idSession].player1Name,
            player2Name: gameSessions[idSession].player2Name,
        });
    });

    socket.on(SocketEvents.PLACE_SHIP, (data: PlaceShipPayload) => {
        const { idSession, playerRole } = data;
        console.log(`Ship placed by ${playerRole} in session ${idSession}:`, data);


        if (playerRole === "player1") {
            gameSessions[idSession].player1ShipsPlaces = true;
        } else if (playerRole === "player2") {
            gameSessions[idSession].player2ShipsPlaces = true;
        }

        //
        socket.to(idSession).emit(SocketEvents.OPPONENT_PLACED_SHIP, data);

        if (gameSessions[idSession].player1ShipsPlaces &&
            gameSessions[idSession].player2ShipsPlaces
        ) {
            io.to(idSession).emit(SocketEvents.BOTH_PLAYERS_READY);
        }
    });

    socket.on(SocketEvents.PLAYER_READY, ({ idSession, playerRole }: PlayerReadyPayload) => {
        const room = gameSessions[idSession];

        if (!room) return;

        if (playerRole === "player1") {
            room.player1Ready = true;
        } else {
            room.player2Ready = true;
        }

        if (room.player1Ready && room.player2Ready) {
            io.to(idSession).emit(SocketEvents.BOTH_PLAYERS_READY);
        } else {
            socket.to(idSession).emit(SocketEvents.OPPONENT_READY);
        }
    });

    socket.on(SocketEvents.ATTACK, (data: AttackPayload) => {
        const { idSession } = data;
        console.log("Player attack:", data);
        socket.to(data.idSession).emit(SocketEvents.OPPONENT_ATTACK, data);
    });

    socket.on(SocketEvents.LEAVE_SESSION, (idSession: string) => {
        socket.leave(idSession);
        console.log(`User left session: ${idSession}`);
    });

    socket.on(SocketEvents.DISCONNECT, () => {
        console.log("User disconnected");
    });
})

server.listen(PORT, () => {
    console.log(`Server running on port: http://localhost:${PORT}`);
})