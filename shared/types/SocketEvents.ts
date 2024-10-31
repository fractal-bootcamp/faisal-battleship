// Common types
export type Direction = "horizontal" | "vertical";

export enum PlayerRole {
    PLAYER1 = "player1",
    PLAYER2 = "player2",
    SPECTATOR = "spectator"
}

export enum SocketEvents {
    // Connection events
    CONNECT = "connection",
    DISCONNECT = "disconnect",

    // Session events
    JOIN_SESSION = "joinSession",
    LEAVE_SESSION = "leaveSession",

    // Role assignments
    ASSIGN_ROLE = "assignRole",
    UPDATE_PLAYER_NAMES = "updatePlayerNames",

    // Game state events
    PLACE_SHIP = "placeShip",
    OPPONENT_PLACED_SHIP = "opponentPlacedShip",

    // Player readiness
    PLAYER_READY = "playerReady",
    OPPONENT_READY = "opponentReady",
    BOTH_PLAYERS_READY = "bothPlayersReady",

    // Battle events
    ATTACK = "attack",
    OPPONENT_ATTACK = "opponentAttack",
}

// Socket event payload types
export interface JoinSessionPayload {
    idSession: string;
    playerName: string;
}

export interface PlaceShipPayload {
    idSession: string;
    playerRole: PlayerRole;
    row: number;
    col: number;
    ship: {
        name: string;
        length: number;
    };
    direction: Direction;
}

export interface PlayerReadyPayload {
    idSession: string;
    playerRole: PlayerRole;
}

export interface AttackPayload {
    idSession: string;
    row: number;
    col: number;
    playerRole: PlayerRole;
}

export interface UpdatePlayerNamesPayload {
    player1Name: string;
    player2Name: string | null;
}

// Game session state interface
export interface GameSession {
    player1Ready: boolean;
    player2Ready: boolean;
    player1Name: string | null;
    player2Name: string | null;
    player1ShipsPlaced: boolean;
    player2ShipsPlaced: boolean;
}

// Socket configuration type
export interface ServerConfig {
    url: string;
    options?: {
        autoConnect?: boolean;
        reconnection?: boolean;
        // Add other socket.io options as needed
    };
}

// Socket callbacks interface
export interface SocketCallbacks {
    onAssignRole?: (role: PlayerRole) => void;
    onUpdatePlayerNames?: (payload: UpdatePlayerNamesPayload) => void;
    onOpponentPlacedShip?: (payload: PlaceShipPayload) => void;
    onOpponentReady?: (payload: PlayerReadyPayload) => void;
    onBothPlayersReady?: () => void;
    onOpponentAttack?: (payload: AttackPayload) => void;
}

// Socket emitters interface
export interface SocketEmitters {
    joinSession: (payload: JoinSessionPayload) => void;
    placeShip: (payload: PlaceShipPayload) => void;
    playerReady: (payload: PlayerReadyPayload) => void;
    attack: (payload: AttackPayload) => void;
    leaveSession: (idSession: string) => void;
} 