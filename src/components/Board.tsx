import { Fragment, useState, useEffect } from "react"


type Direction = "horizontal" | "vertical"
interface Ship {
    name: string
    length: number
}
interface BoardProps {
    board: Array<Array<string>>
    setBoard?: (board: Array<Array<string>>) => void
    onAttack?: (row: number, col: number) => void
    isAiBoard?: boolean
    shipsPlaced?: number // Track ship placed
    setShipsPlaced?: (count: number) => void // Update ship placement count
}

// Set characteristic and number of ships 
const ships: Ship[] = [
    { name: "Carrier", length: 5 },
    { name: "Battleship", length: 4 },
    { name: "Destroyer", length: 3 },
    { name: "Submarine", length: 3 },
    { name: "Patrol Boat", length: 2 },
]

const Board: React.FC<BoardProps> = ({
    board,
    setBoard,
    onAttack,
    isAiBoard = false,
    shipsPlaced = 0,
    setShipsPlaced = () => { },
}) => {
    console.log('infinite board?')
    const [selectedShipIndex, setSelectedShipIndex] = useState<number>(0) // Track the selected ship
    const [placementDirection, setPlacementDirection] = useState<Direction>("horizontal") // Track placement direction

    // Detect arrow key for placement direction
    useEffect(() => {
        console.log('infinite 2?')
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                setPlacementDirection("horizontal")
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                setPlacementDirection("vertical")
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Validate ship placement before placeing ship
    const isPlacementValid = (row: number, col: number): boolean => {
        const ship = ships[selectedShipIndex]

        // Horizontal placement validation
        if (placementDirection === "horizontal") {
            if (col + ship.length > board[0].length) return false
            for (let i = 0; i < ship.length; i++) {
                if (board[row][col + i] !== "") return false
            }
        }
        // Vertical placement validation
        else if (placementDirection === "vertical") {
            if (row + ship.length > board.length) return false
            for (let i = 0; i < ship.length; i++) {
                if (board[row + i][col] !== "") return false
            }
        }
        return true
    }

    // Handle board logic for ship placement and attack  
    const handleCellClick = (row: number, col: number) => {
        if (onAttack) {
            onAttack(row, col) // Call attack function during battle phase
        } else if (setBoard && shipsPlaced < ships.length) {
            // Check if placement if valid
            if (isPlacementValid(row, col)) {
                const newBoard = [...board]
                const ship = ships[selectedShipIndex] // Get the selected ship

                // Place ship in the selected direction
                for (let i = 0; i < ship.length; i++) {
                    if (placementDirection === "horizontal") {
                        newBoard[row][col + i] = "S";
                    } else if (placementDirection === "vertical") {
                        newBoard[row + i][col] = "S";
                    }
                }
                setBoard(newBoard)
                setShipsPlaced(shipsPlaced + 1) // Update ship placement count
                setSelectedShipIndex(selectedShipIndex + 1) // Move to the next ship
            }
        }
    }

    // Handle cell render when clicked 
    const handleCellRendring = (cell: string) => {
        if (isAiBoard && cell === "S") return "bg-blue-300 text-blue-300" // Hide Ai ship placement
        return cell === "S"
            ? "bg-blue-700 text-white"
            : cell === "💥"
                ? "bg-red-200"
                : cell === "👻"
                    ? "bg-gray-300"
                    : "bg-blue-300"
    }

    return (
        <div>
            {/* Display remaining ships */}
            {!isAiBoard && (
                <div className="mb-4">
                    <ul>
                        {ships.slice(shipsPlaced).map((ship, index) => (
                            <li key={index}>
                                {ship.name} – Length: {ship.length}
                            </li>
                        ))}
                    </ul>
                    <div>
                        {/* Render current placement direction */}
                        <p>
                            Ship direction: {placementDirection}
                        </p>
                    </div>
                </div>
            )}

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
        </div>
    )
}

// Ai placement logic
export const shipPlacementForAi = (board: Array<Array<string>>) => {
    const directions: Direction[] = ["horizontal", "vertical"]

    console.log("in ship placement for ai")
    // Handle ship placement logic
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

    const placeShip = (
        board: Array<Array<string>>,
        row: number,
        col: number,
        length: number,
        direction: Direction
    ) => {
        console.log("start loop")
        if (direction === "horizontal") {
            for (let i = 0; i < length; i++) {
                board[row][col + i] = "S";
            }
        } else {
            for (let i = 0; i < length; i++) {
                board[row + i][col] = "S";
            }
        }
        console.log("end loop")
    }

    // Handle placement of each ship logic
    for (const ship of ships) {
        let placed = false
        while (!placed) {
            console.log('looping')
            const row = Math.floor(Math.random() * board.length)
            const col = Math.floor(Math.random() * board[0].length)
            const direction = directions[Math.floor(Math.random() * directions.length)]

            if (isPlacementValid(board, row, col, ship.length, direction)) {
                placeShip(board, row, col, ship.length, direction)
                console.log('placed = true')
                placed = true
            }
        }
    }
    return board
}

export default Board