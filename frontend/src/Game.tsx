import { isEmpty } from "lodash";
import { ShipName, useGameEngine, handleAiTurn, placeShip } from "./GameEngine";
import ShipStatus from "./components/ShipStatus";
import { GameMode } from "./GameEngine";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Board from "./components/Board";

interface GameProps {
    mode: GameMode
    player1Name: string
    player2Name: string
}

const Game: React.FC<GameProps> = ({ mode, player1Name, player2Name }) => {
    const navigate = useNavigate();
    const { gameState, setGameState, reset, attack, place } = useGameEngine(mode)

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
            // Only allow placing ships on player1's board in AI mode
            if (mode === "1vsAiMarine" && board === 2) {
                return; // Disable clicks on AI board during placement
            }

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

    // Auto-place AI ships when player1 finishes placement
    useEffect(() => {
        if (mode === "1vsAiMarine" && !currentPlacementForPlayer1 && currentPlacementForPlayer2) {
            // Place AI ships automatically
            const ships = Object.keys(gameState.player2.ships) as ShipName[];
            ships.forEach(shipName => {
                let placed = false;
                while (!placed) {
                    const randomIndex = Math.floor(Math.random() * gameState.ctx.boardSize);
                    const newGameState = placeShip(gameState, "player2", shipName, randomIndex);
                    if (newGameState.ctx.alert === null) {
                        setGameState(newGameState);
                        placed = true;
                    }
                }
            });
        }
    }, [currentPlacementForPlayer1]);

    return (
        <div className="flex flex-col items-center p-8">
            {/* Game Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Battleship Game</h1>
                {/* <div className="text-xl mb-2">Current Phase: {getGamePhaseMessage()}</div> */}
                <div className="text-lg font-semibold">It's {gameState.ctx.currentPlayer}'s turn</div>
            </div>

            {/* Buttons Container */}
            <div className="mb-6 flex gap-4">
                <button
                    onClick={reset}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Reset Game
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Game Lobby
                </button>
            </div>

            {/* Game Boards Container */}
            <div className="flex flex-col items-center">
                {/* Boards */}
                <div className="flex justify-center gap-8 mb-4">
                    {/* Player 1's section */}
                    <div className="flex flex-col items-center gap-4">
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
                                    title={mode === "1vsAiMarine" ? "My Board" : "Player 1's Board"}
                                    gameState={gameState}
                                    isBattleActive={isBattleActive}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Player 2's section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                            <div className="flex gap-4">
                                <Board
                                    cells={gameState.player2.board}
                                    onCellClick={getOnBoardClick(2)}
                                    title={mode === "1vsAiMarine" ? "AI Board" : "Player 2's Board"}
                                    gameState={gameState}
                                    isBattleActive={isBattleActive}
                                    isDisabled={mode === "1vsAiMarine" && !isBattleActive}
                                    isAiBoard={mode === "1vsAiMarine"}
                                    className={`${mode === "1vsAiMarine" && !isBattleActive ? 'opacity-50' : ''}`}
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
                        <p className="text-xl mb-6">
                            {/* Show "AI" instead of "player2" when in AI mode */}
                            {mode === "1vsAiMarine" && gameState.ctx.winner === "player2"
                                ? "AI Wins!"
                                : `${gameState.ctx.winner} Wins!`}
                        </p>
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

export default Game