export type Direction = "horizontal" | "vertical"
export type GamePhase = "placement" | "battle"
export type GameMode = "1vs1" | "1vsAiMarine"
export type Board = Array<Array<string>>

interface Ship {
    name: string
    length: number
}

export interface GameState {
    playerBoard: Board
    aiBoard: Board
    isPlayerTurn: boolean
    gamePhase: GamePhase
    playerHitStreak: boolean
    shipsPlaced: number
    destroyedAiShips: number
    selectedShipIndex: number
}

export const ships: Ship[] = [
    { name: "Carrier", length: 5 },
    { name: "Battleship", length: 4 },
    { name: "Destroyer", length: 3 },
    { name: "Submarine", length: 3 },
    { name: "Patrol", length: 2 },
]

export const initializeEmptyBoard = (): Board => {
    return Array(10).fill(null).map(() => Array(10).fill(""))
}

export const createInitialGameState = (): GameState => ({
    playerBoard: initializeEmptyBoard(),
    aiBoard: initializeEmptyBoard(),
    isPlayerTurn: true,
    gamePhase: "placement",
    playerHitStreak: false,
    shipsPlaced: 0,
    destroyedAiShips: 0,
    selectedShipIndex: 0,
})

export const isPlacementValid = (
    board: Board,
    row: number,
    col: number,
    ship: Ship,
    direction: Direction,
): boolean => {
    if (direction === "horizontal") {
        if (col + ship.length > board[0].length) return false
        for (let i = 0; i < ship.length; i++) {
            if (board[row][col + i] !== "") return false
        }
    } else {
        if (row + ship.length > board.length) return false
        for (let i = 0; i < ship.length; i++) {
            if (board[row + i][col] !== "") return false
        }
    }
    return true
}

export const placeShip = (
    board: Board,
    row: number,
    col: number,
    ship: Ship,
    direction: Direction,
): Board => {
    const newBoard = [...board]
    // Place ship horizontally
    if (direction === "horizontal") {
        for (let i = 0; i < ship.length; i++) {
            newBoard[row][col + i] = "S"
        }
    }
    // Place ship vertically
    else if (direction === "vertical") {
        for (let i = 0; i < ship.length; i++) {
            newBoard[row + i][col] = "S"
        }
    }
    return newBoard
}

export const handlePlayerAttack = (
    aiBoard: Board,
    row: number,
    col: number
): [Board, boolean, number, boolean] => {
    const newAiBoard = [...aiBoard]
    let hit = false
    let destroyedAiShips = 0
    let playerHitStreak = false

    if (newAiBoard[row][col] === "S") {
        newAiBoard[row][col] = "💥"
        hit = true
        destroyedAiShips++
        playerHitStreak = true
    } else if (newAiBoard[row][col] === "") {
        newAiBoard[row][col] = "👻"
        playerHitStreak = false
    }
    return [newAiBoard, hit, destroyedAiShips, playerHitStreak]
}

export const checkWinCondition = (board: Board): boolean => {
    for (let row of board) {
        for (let cell of row) {
            if (cell === "S") return false
        }
    }
    return true
}

export const placeShipsForAi = (): Board => {
    let board = initializeEmptyBoard()
    const directions: Direction[] = ["horizontal", "vertical"]

    for (const ship of ships) {
        let placed = false
        while (!placed) {
            const row = Math.floor(Math.random() * 10)
            const col = Math.floor(Math.random() * 10)
            const direction = directions[Math.floor(Math.random() * directions.length)]

            if (isPlacementValid(board, row, col, ship, direction)) {
                board = placeShip(board, row, col, ship, direction)
                placed = true
            }
        }
    }
    return board
}