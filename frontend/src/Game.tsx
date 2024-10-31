import { isEmpty } from "lodash";
import { type Board, Cell, CellIndex, GameState, ShipName, useGameEngine, handleAiTurn } from "./GameEngine";
import ShipStatus from "./components/ShipStatus";
import { GameMode } from "./GameEngine";
import { useEffect, useState } from "react";

interface GameProps {
    mode: GameMode
    player1Name: string
    player2Name: string
}

const Game: React.FC<GameProps> = ({ mode, player1Name, player2Name }) => {
    const { gameState, reset, attack, place } = useGameEngine()
    const [gameStateState, setGameState] = useState(gameState)

    // Add AI turn effect
    useEffect(() => {
        if (mode === "1vsAiMarine" &&
            gameState.ctx.currentPlayer === "player2" &&
            gameState.ctx.gamePhase === "battle") {
            const timer = setTimeout(() => {
                const newGameState = handleAiTurn(gameState)
                setGameState(newGameState)
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [gameState.ctx.currentPlayer, gameState.ctx.gamePhase])

    const currentPlacementForPlayer1 = Object.entries(gameState.player1.ships).find(([_, shipDetails]) => {
        return isEmpty(shipDetails.location)
    })?.[0] as ShipName | undefined

    const currentPlacementForPlayer2 = Object.entries(gameState.player2.ships).find(([_, shipDetails]) => {
        return isEmpty(shipDetails.location)
    })?.[0] as ShipName | undefined

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



    const handleRestart = () => {
        reset()
    }

    return (
        <div className="flex flex-col items-center p-8">
            {/* Game Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Battleship Game</h1>
                {/* <div className="text-xl mb-2">Current Phase: {getGamePhaseMessage()}</div> */}
                <div className="text-lg font-semibold">It's {gameState.ctx.currentPlayer}'s turn</div>
            </div>

            {/* Reset Button */}
            <div className="mb-6">
                <button
                    onClick={reset}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Reset Game
                </button>
            </div>

            {/* Game Boards Container */}
            <div className="flex flex-col items-center">
                {/* Boards */}
                <div className="flex justify-center gap-8 mb-4">
                    {/* Player 1's section */}
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-xl font-bold mb-4">
                            {mode === "1vsAiMarine" && gameState.ctx.currentPlayer === "player2"
                                ? "AI Marine's Turn"
                                : `${gameState.ctx.currentPlayer === "player1" ? "My Board" : "Enemy Board"}`}
                        </h2>
                        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                            <div className="flex gap-4">
                                <ShipStatus
                                    ships={gameState.player1.ships}
                                    isPlayer2={false}
                                    isBattleActive={isBattleActive}
                                />
                                <Board
                                    cells={gameState.player1.board}
                                    onCellClick={getOnBoardClick(1)}
                                    title="Player 1"
                                    gameState={gameState}
                                    isBattleActive={isBattleActive}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Player 2's section */}
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-xl font-bold mb-4">
                            {gameState.ctx.currentPlayer === "player1" ? "Enemy Board" : "My Board"}
                        </h2>
                        <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                            <div className="flex gap-4">
                                <Board
                                    cells={gameState.player2.board}
                                    onCellClick={getOnBoardClick(2)}
                                    title="Player 2"
                                    gameState={gameState}
                                    isBattleActive={isBattleActive}
                                />
                                <ShipStatus
                                    ships={gameState.player2.ships}
                                    isPlayer2={true}
                                    isBattleActive={isBattleActive}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Message under boards */}
                {gameState.ctx.alert && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded w-full max-w-2xl text-center" role="alert">
                        <p>{gameState.ctx.alert}</p>
                    </div>
                )}
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
    // Function to get cell style based on its state
    const getCellStyle = (value: Cell) => {
        const baseStyle = "w-full h-full flex items-center justify-center transition-colors duration-200"

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

    // Check if this board belongs to the current player
    const isCurrentPlayerBoard = title === `Player ${gameState.ctx.currentPlayer === "player1" ? "1" : "2"}`

    // During battle, disable current player's board. Outside battle, enable all boards
    const isDisabled = isBattleActive ? isCurrentPlayerBoard : false

    return (
        <div className="grid grid-cols-10 gap-1 w-96 h-96">
            {cells.flat().map((value, index) => (
                <div
                    key={index}
                    onClick={() => !isDisabled && onCellClick(index)}
                    className={`border border-gray-300 
                        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    <div className={getCellStyle(value)}>
                        {value}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Game