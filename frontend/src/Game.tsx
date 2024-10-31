import { isEmpty } from "lodash";
import { type Board, CellIndex, GameState, useGameEngine } from "./GameEngine";

const Game = () => {
    const { gameState, reset, attack, place } = useGameEngine()

    const currentPlacementForPlayer1 = Object.values(gameState.player1.ships).find((shipDetails) => {
        return isEmpty(shipDetails.location)
    })?.name

    const currentPlacementForPlayer2 = Object.values(gameState.player2.ships).find((ship) => {
        return isEmpty(ship.location)
    })?.name

    const isBattleActive = !currentPlacementForPlayer1 && !currentPlacementForPlayer2;

    const getOnBoardClick = (board: number) => (index: number) => {
        const thisPlayer = board === 1 ? "player1" : "player2"

        // During placement phase
        if (!isBattleActive) {
            // Allow placing ships on your own board
            const currentPlacement = board === 1 ? currentPlacementForPlayer1 : currentPlacementForPlayer2
            if (currentPlacement) {
                place(thisPlayer, currentPlacement, index)
            }
            return
        }

        // During battle phase
        // Only allow attacking opponent's board
        if (gameState.ctx.currentPlayer === "player1" && board === 2) {
            // Player 1 can attack Player 2's board
            attack(index)
        } else if (gameState.ctx.currentPlayer === "player2" && board === 1) {
            // Player 2 can attack Player 1's board
            attack(index)
        }
    }

    const getGamePhaseMessage = () => {
        if (isBattleActive) {
            return "Battle Phase: Attack your opponent's ships!"
        }
        if (currentPlacementForPlayer1) {
            return `Player 1 is placing ${currentPlacementForPlayer1}`
        }
        if (currentPlacementForPlayer2) {
            return `Player 2 is placing ${currentPlacementForPlayer2}`
        }
        return "All ships placed - Ready for battle!"
    }

    const handleRestart = () => {
        reset()
    }

    return (
        <div className="flex flex-col items-center p-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Battleship Game</h1>
                <div className="text-xl mb-2">Current Placement: {getGamePhaseMessage()}</div>
                <div className="text-lg font-semibold">It's {gameState.ctx.currentPlayer}'s turn</div>
            </div>

            <div className="mb-6">
                <button
                    onClick={reset}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Reset Game
                </button>
            </div>

            <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-4">Player 1's Board</h2>
                    <Board
                        cells={gameState.player1.board}
                        onCellClick={getOnBoardClick(1)}
                        title="Player 1"
                        gameState={gameState}
                        isBattleActive={isBattleActive}
                    />
                </div>

                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold mb-4">Player 2's Board</h2>
                    <Board
                        cells={gameState.player2.board}
                        onCellClick={getOnBoardClick(2)}
                        title="Player 2"
                        gameState={gameState}
                        isBattleActive={isBattleActive}
                    />
                </div>
            </div>

            {gameState.ctx.showWinnerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">🎉 Game Over! 🎉</h2>
                        <p className="text-xl mb-6">{gameState.ctx.winner} Wins!</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRestart}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

type BoardPlace = (placementLocation: CellIndex) => void
type Attack = (index: number) => void

const Board = ({ cells, onCellClick, title, gameState, isBattleActive }: {
    cells: Board,
    onCellClick: (index: number) => void,
    title: string,
    gameState: GameState,
    isBattleActive: boolean
}) => {
    // Flatten the 2D board array into 1D for easier mapping
    const board = cells.flat()

    // Check if this board belongs to the current player
    const isCurrentPlayerBoard = title === `Player ${gameState.ctx.currentPlayer === "player1" ? "1" : "2"}`

    // During battle, disable current player's board. Outside battle, enable all boards
    const isDisabled = isBattleActive ? isCurrentPlayerBoard : false

    return (
        <div className="grid grid-cols-10 gap-1 w-96 h-96">
            {board.map((value, index) => (
                <div
                    key={index}
                    onClick={() => !isDisabled && onCellClick(index)}
                    className={`border border-gray-300 flex items-center justify-center
                        ${isDisabled
                            ? 'cursor-not-allowed bg-gray-100'
                            : 'cursor-pointer bg-white hover:bg-gray-100'
                        }`}
                >
                    {value}
                </div>
            ))}
        </div>
    );
}

export default Game