import { useState } from "react"
import { isEmpty } from "lodash"

export type Direction = "horizontal" | "vertical"
export type GamePhase = "placement" | "battle" | "finished"
export type GameMode = "1vs1" | "1vsAiMarine"
export type PlayerRole = "player1" | "player2" | null

export type Cell = "👻" | "💥" | "S" | ""
export type Board = Cell[][] // 10x10 board of cells
export type CellIndex = number // This is 0-99 are valid options

export type Shot = CellIndex
export type ShipLocation = { [index: CellIndex]: Cell } // {23: "💥", 33: "S", 43: "S"}
export type ShipName = ShipType
export enum ShipType {
    Carrier = "carrier",
    Battleship = "battleship",
    Destroyer = "destroyer",
    Submarine = "submarine",
    Patrol = "patrol",
}
export interface ShipDetails {
    name: ShipName
    length: number
    direction: Direction
    location: ShipLocation | null // The cells occupied by ship
}

export interface GameState {
    ctx: {
        boardSize: number // The board is 100 cells, 10x10
        currentPlayer: PlayerRole // Ai will always be player2
        isEnemyAI: boolean // Tracks whether the enemy is AI
        gamePhase: GamePhase // Tracks phase of the game
        alert: string | null // Any error or success alerts
    },
    player1: PlayerState // Important that this key matches the Player
    player2: PlayerState
}

export interface PlayerState {
    ships: Record<ShipName, ShipDetails> // Using Record to map ship names to ShipDetails
    board: Board // Player1 board
    myShots: Shot[] // History of all the shots made this game
    shotsLeft: number // Number of shots player has left
}

const alerts = {
    shipPlacementError: "Error placing ship -- ship would be placed out of bounds.",
    shipOverlapError: "Error placing ship -- overlapping with another ship.",
    attackPlacementError: "You already attacked this area.",
    playerRoleError: "Invalid attacking player role.",
    winAlert: (player: PlayerRole) => `${player} Won!`,
}

// Utility function to initialize empty board
export const initializeEmptyBoard = (): Board => {
    return Array.from({ length: 10 }, () => Array(10).fill(""))
}

export const createInitialGameState = (isEnemyAI: boolean): GameState => ({
    ctx: {
        boardSize: 100,
        currentPlayer: "player1",
        gamePhase: "placement",
        isEnemyAI,
        alert: null,
    },
    player1: {
        ships: {
            carrier: { name: ShipType.Carrier, length: 5, direction: "horizontal", location: {} },
            battleship: { name: ShipType.Battleship, length: 4, direction: "horizontal", location: {} },
            destroyer: { name: ShipType.Destroyer, length: 3, direction: "horizontal", location: {} },
            submarine: { name: ShipType.Submarine, length: 3, direction: "horizontal", location: {} },
            patrol: { name: ShipType.Patrol, length: 2, direction: "horizontal", location: {} },
        },
        board: initializeEmptyBoard(),
        myShots: [],
        shotsLeft: 1,
    },
    player2: {
        ships: {
            carrier: { name: ShipType.Carrier, length: 5, direction: "horizontal", location: {} },
            battleship: { name: ShipType.Battleship, length: 4, direction: "horizontal", location: {} },
            destroyer: { name: ShipType.Destroyer, length: 3, direction: "horizontal", location: {} },
            submarine: { name: ShipType.Submarine, length: 3, direction: "horizontal", location: {} },
            patrol: { name: ShipType.Patrol, length: 2, direction: "horizontal", location: {} },
        },
        board: initializeEmptyBoard(),
        myShots: [],
        shotsLeft: 1,
    }
})

export const placeShip = (
    prevGame: GameState,
    player: PlayerRole,
    shipName: ShipName,
    placementLocation: CellIndex
): GameState => {
    if (player !== "player1" && player !== "player2") {
        return prevGame // Ensure player is valid before proceeding
    }

    const game = structuredClone(prevGame) // create a deep copy of the previous game state so we don't modify it in place.
    const playerState = game[player]
    const ship = playerState.ships[shipName]

    // Check if ship already exists
    if (!isEmpty(ship.location)) {
        console.warn("This ship (" + ship.name + ") already exists")
        return game;
    }

    // Calculate board size
    const boardSize = Math.sqrt(game.ctx.boardSize)
    const isVertical = ship.direction === "vertical"
    const isHorizontal = ship.direction === "horizontal"

    // Determine if ship is out of bound
    const placementRow = Math.floor(placementLocation / boardSize) // so this would be 9 for the final row, and 0 for the first row // this should be integer division
    const placementCol = placementLocation % boardSize

    const outOfBound =
        (isHorizontal && placementCol + ship.length > boardSize) ||
        (isVertical && placementRow + ship.length > boardSize)

    if (outOfBound) {
        game.ctx.alert = alerts.shipPlacementError
        console.warn(game.ctx.alert)
        return game
    }

    // Check for overlap with existing ship
    const newLocation: ShipLocation = {} // Initialize as object to map cell indices
    for (let i = 0; i < ship.length; i++) {
        const cellIndex = isVertical
            ? placementLocation + i * boardSize
            : placementLocation + i

        if (playerState.board[Math.floor(cellIndex / boardSize)][cellIndex % boardSize] === "S") {
            game.ctx.alert = alerts.shipOverlapError
            console.warn(game.ctx.alert);
            return game
        }
        newLocation[cellIndex] = "S"
    }

    // Place ship on board
    Object.keys(newLocation).forEach(cellIndex => {
        playerState.board[Math.floor(Number(cellIndex) / boardSize)][Number(cellIndex) % boardSize] = "S"
    })
    ship.location = newLocation

    return game
}

export const isDestroyed = (ship: ShipDetails): boolean => {
    if (!ship.location) return false
    return Object.values(ship.location).every(cell => cell === "💥")
}

export const handleAttack = (
    gameState: GameState,
    attackingPlayer: PlayerRole,
    targetCell: CellIndex
): GameState => {
    const game = structuredClone(gameState)
    if (attackingPlayer !== "player1" && attackingPlayer !== "player2") {
        game.ctx.alert = alerts.playerRoleError
        console.warn(game.ctx.alert)
        return gameState // Ensure player is valid before proceeding
    }

    const defendingPlayer = attackingPlayer === "player1" ? "player2" : "player1" // Determine defending player
    const defendingState = game[defendingPlayer] // Get defending player's state
    const attackingState = game[attackingPlayer] // Get defending player's state

    // Calculate board size
    const boardSize = Math.sqrt(game.ctx.boardSize)

    console.log(attackingState.board, targetCell)

    // currentValueOfTargetCell
    const cVOTC = defendingState.board[Math.floor(targetCell / boardSize)][targetCell % boardSize];

    // Prevent attacking same cell twice
    // @TODO: review
    if (["💥", "👻"].includes(cVOTC)) {
        game.ctx.alert = alerts.attackPlacementError
        console.warn(game.ctx.alert)
        return game
    }

    // Determine if the shot is a hit
    let hit = false
    for (const ship of Object.values(defendingState.ships)) {
        console.log(ship)
        if (ship.location && ship.location[targetCell] === "S") {
            console.log("hit")
            hit = true
            ship.location[targetCell] = "💥"
            defendingState.board[Math.floor(targetCell / boardSize)][targetCell % boardSize] = "💥"

            if (isDestroyed(ship)) {
                // Check if all ships are destroyed
                const allShipsDestroyed = Object.values(defendingState.ships)
                    .every(isDestroyed)
                if (allShipsDestroyed) {
                    game.ctx.alert = alerts.winAlert(attackingPlayer)
                    alert(game.ctx.alert)
                    game.ctx.gamePhase = "finished"

                    const newPlayerState: PlayerState = defendingState;


                    return {
                        ...game,
                        [defendingPlayer]: newPlayerState
                    }
                }
            }
            break
        }
    }

    // Mark the attack on enemy board if its a hit or miss
    defendingState.board[Math.floor(targetCell / boardSize)][targetCell % boardSize] =
        hit ? "💥" : "👻"

    // Track shot history
    game[attackingPlayer].myShots.push(targetCell)

    // If hit, player gets another shot; if miss, switch turns
    if (!hit) {
        game.ctx.currentPlayer = defendingPlayer
    }

    console.log("no hits", defendingState)

    return {
        ...game,
        [defendingPlayer]: defendingState
    }
}

// Handle Ai attack
export const handleAiTurn = (gameState: GameState): GameState => {
    let targetCell: CellIndex
    const game = structuredClone(gameState)

    // Calculate board size
    const boardSize = Math.sqrt(game.ctx.boardSize)

    // AI selects a random target that hasn't been attacked
    do {
        targetCell = Math.floor(Math.random() * boardSize * boardSize)
    } while (game.player2.board[Math.floor(targetCell / boardSize)][targetCell % boardSize] !== "")

    return handleAttack(game, "player2", targetCell)
}

export const resetGame = (isEnemyAI: boolean): GameState => {
    return createInitialGameState(isEnemyAI)
}

export const useGameEngine = () => {
    const isAI = true
    const [gameState, setGameState] = useState(createInitialGameState(isAI))

    const reset = () => {
        const newGameState = resetGame(isAI)

        setGameState(newGameState)
    }

    const attack = (targetCell: CellIndex) => {
        const newGameState = handleAttack(gameState, gameState.ctx.currentPlayer, targetCell);

        setGameState(newGameState)
    }

    const place = (player: PlayerRole, shipName: ShipName, placementLocation: CellIndex) => {
        const newGameState = placeShip(gameState, player, shipName, placementLocation)
        setGameState(newGameState)
    }


    return { gameState, reset, attack, place }
}