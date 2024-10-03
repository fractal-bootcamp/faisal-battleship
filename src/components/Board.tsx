import { Fragment, useState, useEffect } from "react"
import { Direction } from "../GameEngine"
interface BoardProps {
    board: Array<Array<string>>
    onAttack?: (row: number, col: number) => void
    isAiBoard?: boolean
}

const Board: React.FC<BoardProps> = ({
    board,
    onAttack,
    isAiBoard = false,
}) => {

    // Handle board logic for ship placement and attack  
    const handleCellClick = (row: number, col: number) => {
        if (onAttack) {
            onAttack(row, col) // Call attack function during battle phase
        }
    }

    // Handle cell render when clicked 
    const handleCellRendring = (cell: string) => {
        if (isAiBoard && cell === "S") return "bg-blue-300 text-blue-300" // Hide Ai ship placement

        switch (cell) {
            case "S":
                return "bg-blue-700 text-white"; // Player's ship
            case "💥":
                return "bg-red-200"; // Hit target
            case "👻":
                return "bg-gray-300"; // Missed target
            default:
                return "bg-blue-300"; // Empty cell
        }
    }

    return (
        <div className="grid grid-cols-10 gap-1 w-max mx-auto my-6">
            {board.map((row, rowIndex) => (
                <Fragment key={rowIndex}>
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`w-8 h-8 flex items-center justify-center cursor-pointer border border-gray-500 ${handleCellRendring(
                                cell
                            )}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                            {cell}
                        </div>
                    ))}
                </Fragment>
            ))}
        </div>
    );
};

export default Board