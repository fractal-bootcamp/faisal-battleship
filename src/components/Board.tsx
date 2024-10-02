import { Fragment } from "react"

interface Ship {
    name: string
    length: number
}
interface BoardProps {
    board: Array<Array<string>>
    setBoard?: (board: Array<Array<string>>) => void
    onAttack?: (row: number, col: number) => void
}

// Set characteristic and number of ships 
const ships: Ship[] = [
    { name: "Carrier", length: 5 },
    { name: "Battleship", length: 4 },
    { name: "Destroyer", length: 3 },
    { name: "Submarine", length: 3 },
    { name: "Patrol Boat", length: 2 },
]

const Board: React.FC<BoardProps> = ({ board, setBoard, onAttack }) => {
    // Handle board logic    
    const handleCellClick = (row: number, col: number) => {
        if (onAttack) {
            onAttack(row, col) // Call attack function during battle phase
        } else if (setBoard) {
            const newBoard = [...board]
            newBoard[row][col] = "S"
            setBoard(newBoard)
        }
    }
    // Handle cell render when clicked 
    const handleCellRendring = (cell: string) => {
        return cell === "S" ? "bg-blue-700 text-white" : cell === "💥" ? "bg-red-200" : cell === "👻" ? "bg-gray-300" : "bg-blue-300"
    }

    return (
        <div className="grid grid-cols-10 gap-1 w-max mx-auto my-6">
            {/* Conditional rendering for board */}
            {board.map((row, rowIndex) => (
                <Fragment key={rowIndex}>
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`w-8 h-8 flex items-center justify-center cursor-pointer border border-gray-500 ${handleCellRendring(cell)}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                            {cell}
                        </div>
                    ))}
                </Fragment>
            ))}
        </div>
    )
}

type Direction = "horizontal" | "vertical"

// Ai placement logic
export const shipPlacementForAi = (board: Array<Array<string>>) => {
    const directions: Direction[] = ["horizontal", "vertical"]

    // Handle ship placement validity logic
    const isPlacementValid = (
        board: Array<Array<string>>,
        row: number,
        col: number,
        length: number,
        direction: Direction
    ) => {
        if (direction === "horizontal") {
            if (col + length > board[0].length) return false
            for (let i = 0; i < length; i++) {
                if (board[row][col + i] === "S") return false
            }
        } else {
            if (row + length > board.length) return false
            for (let i = 0; i < length; i++) {
                if (board[row + i][col] === "S") return false
            }
        }
        return true
    }

    // Handle ship placement logic
    const placeShip = (
        board: Array<Array<string>>,
        row: number,
        col: number,
        length: number,
        direction: Direction
    ) => {
        if (direction === "horizontal") {
            for (let i = 0; i < length; i++) {
                board[row][col + i] = "S"
            }
        } else {
            for (let i = 0; i < length; i++) {
                board[row + i][col] = "S"
            }
        }
    }

    // Handle placement of each ship logic
    for (const ship of ships) {
        let placed = false
        while (!placed) {
            const row = Math.floor(Math.random() * board.length)
            const col = Math.floor(Math.random() * board[0].length)
            const direction = directions[Math.floor(Math.random() * directions.length)]

            if (isPlacementValid(board, row, col, ship.length, direction)) {
                placeShip(board, row, col, ship.length, direction)
                placed = true
            }
        }
    }
    return board
}

export default Board