import { io, Socket } from "socket.io-client";
import {
    SocketEvents,
    PlayerRole,
    JoinSessionPayload,
    PlaceShipPayload,
    PlayerReadyPayload,
    AttackPayload,
    UpdatePlayerNamesPayload,
} from "../../../shared/types/SocketEvents";

// Interface defining the configuration options for the Socket.IO client connection
interface ServerConfig {
    url: string;
    options?: {
        autoConnect?: boolean;
        reconnection?: boolean;
    };
}

// Default configuration for connecting to the WebSocket server
const SERVER_CONFIG: ServerConfig = {
    url: "http://localhost:3000",
    options: {
        autoConnect: true, // Automatically connect when socket is created
        reconnection: true, // Enable automatic reconnection if connection is lost
    }
};

// Initialize Socket.IO client with the server configuration
const socket: Socket = io(SERVER_CONFIG.url, SERVER_CONFIG.options);

// Basic socket connection event handlers
socket.on(SocketEvents.CONNECT, () => {
    console.log("Connected to the server.");
});

socket.on(SocketEvents.DISCONNECT, () => {
    console.log("Disconnected from the server.");
});

// Object containing methods to emit events to the server
export const socketEmitters = {
    // Emits event when a player joins a game session
    joinSession: (payload: JoinSessionPayload) => {
        socket.emit(SocketEvents.JOIN_SESSION, payload);
    },

    // Emits event when a player places a ship on their board
    placeShip: (payload: PlaceShipPayload) => {
        socket.emit(SocketEvents.PLACE_SHIP, payload);
    },

    // Emits event when a player indicates they are ready to start
    playerReady: (payload: PlayerReadyPayload) => {
        socket.emit(SocketEvents.PLAYER_READY, payload);
    },

    // Emits event when a player makes an attack move
    attack: (payload: AttackPayload) => {
        socket.emit(SocketEvents.ATTACK, payload);
    },

    // Emits event when a player leaves the game session
    leaveSession: (idSession: string) => {
        socket.emit(SocketEvents.LEAVE_SESSION, idSession);
    }
};

// Factory function to create event listeners with callback handlers
export const createSocketListeners = (callbacks: {
    onAssignRole?: (role: PlayerRole) => void; // Handles player role assignment
    onUpdatePlayerNames?: (payload: UpdatePlayerNamesPayload) => void; // Handles player name updates
    onOpponentPlacedShip?: (payload: PlaceShipPayload) => void; // Handles opponent ship placement
    onOpponentReady?: (payload: PlayerReadyPayload) => void; // Handles opponent ready status
    onBothPlayersReady?: () => void; // Handles when both players are ready
    onOpponentAttack?: (payload: AttackPayload) => void; // Handles opponent attack moves
}) => {
    // Listen for role assignment from server
    socket.on(SocketEvents.ASSIGN_ROLE, (role: PlayerRole) => {
        callbacks.onAssignRole?.(role);
    });

    // Listen for player name updates
    socket.on(SocketEvents.UPDATE_PLAYER_NAMES, (payload: UpdatePlayerNamesPayload) => {
        callbacks.onUpdatePlayerNames?.(payload);
    });

    // Listen for opponent ship placement
    socket.on(SocketEvents.OPPONENT_PLACED_SHIP, (payload: PlaceShipPayload) => {
        callbacks.onOpponentPlacedShip?.(payload);
    });

    // Listen for opponent ready status
    socket.on(SocketEvents.OPPONENT_READY, (payload: PlayerReadyPayload) => {
        callbacks.onOpponentReady?.(payload);
    });

    // Listen for both players ready status
    socket.on(SocketEvents.BOTH_PLAYERS_READY, () => {
        callbacks.onBothPlayersReady?.();
    });

    // Listen for opponent attack moves
    socket.on(SocketEvents.OPPONENT_ATTACK, (payload: AttackPayload) => {
        callbacks.onOpponentAttack?.(payload);
    });

    // Cleanup function to remove all event listeners
    return () => {
        socket.off(SocketEvents.ASSIGN_ROLE);
        socket.off(SocketEvents.UPDATE_PLAYER_NAMES);
        socket.off(SocketEvents.OPPONENT_PLACED_SHIP);
        socket.off(SocketEvents.OPPONENT_READY);
        socket.off(SocketEvents.BOTH_PLAYERS_READY);
        socket.off(SocketEvents.OPPONENT_ATTACK);
    };
};

export default socket;