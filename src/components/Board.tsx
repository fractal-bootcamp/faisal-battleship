import { Fragment } from "react/jsx-runtime"

interface BoardProps {
    board: Array<Array<string>>
    setBoard?: (board: Array<Array<string>>) => void
}

const Board: React.FC<BoardProps> = ({ board, setBoard }) => {
    // Handle board logic    
    const handleCellClick = (row: number, col: number) => {
        if (setBoard) {
            const newBoard = [...board]
            newBoard[row][col] = "S"
            setBoard(newBoard)
        }
    }
    // Handle cell render when clicked 
    const handleCellRendring = (cell: string) => {
        return cell === "S" ? "bg-blue-700 text-white" : "bg-blue-300"
    }

    return (
        <div className="grid grid-cols-10 gap-1 w-max mx-auto my-6">
            {/* Conditional rendering for board */}
            {board.map((row, rowIndex) => (
                <Fragment key={rowIndex}>
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`w-8 h-8 flex items-center justify-center cursor-pointer border broder-gray-500 ${handleCellRendring(cell)}`}
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

export default Board