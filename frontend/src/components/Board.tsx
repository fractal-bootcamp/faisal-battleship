import { Cell, GameState, Board as BoardType } from "../GameEngine";

interface BoardProps {
    cells: BoardType
    onCellClick: (index: number) => void
    title: string
    gameState: GameState
    isBattleActive: boolean
    isDisabled?: boolean
    className?: string
    isAiBoard?: boolean
}

const Board: React.FC<BoardProps> = ({
    cells,
    onCellClick,
    title,
    gameState,
    isBattleActive,
    isDisabled: forceDisabled,
    className,
    isAiBoard
}) => {
    // Determine if this is player1's board
    const isPlayer1Board = title.toLowerCase().includes("player 1") || title.toLowerCase().includes("my board")

    // Board should be disabled when:
    // 1. It's forced disabled (AI board during placement) OR
    // 2. During battle phase:
    //    - If it's player1's turn, disable player1's board
    //    - If it's player2's turn, disable player2's board
    const isDisabled = forceDisabled ||
        (isBattleActive &&
            ((gameState.ctx.currentPlayer === "player1" && isPlayer1Board) ||
                (gameState.ctx.currentPlayer === "player2" && !isPlayer1Board)))

    // Function to get cell style based on its state
    const getCellStyle = (value: Cell) => {
        const baseStyle = "w-full h-full flex items-center justify-center transition-colors duration-200"

        // Hide AI ships during placement phase
        if (isAiBoard && !isBattleActive && value === "🚢") {
            return `${baseStyle} bg-white hover:bg-gray-100`
        }

        switch (value) {
            case "💥":
                return `${baseStyle} bg-red-200 hover:bg-red-300`
            case "👻":
                return `${baseStyle} bg-gray-200 hover:bg-gray-300`
            case "🚢":
                return `${baseStyle} bg-blue-200 hover:bg-blue-300`
            default:
                return `${baseStyle} bg-white hover:bg-gray-100`
        }
    }

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">
                {isAiBoard && !isBattleActive ? "AI Board" : title}
            </h2>
            <div
                className={`grid grid-cols-10 gap-1 w-96 h-96 ${isDisabled ? 'opacity-60' : ''
                    } ${className || ''}`}
            >
                {cells.flat().map((value, index) => (
                    <div
                        key={index}
                        onClick={() => !isDisabled && onCellClick(index)}
                        className={`border border-gray-300 
                            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className={getCellStyle(value)}>
                            {isAiBoard && value === "🚢" && !isBattleActive ? "" : value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Board; 