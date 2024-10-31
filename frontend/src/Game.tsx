import { isEmpty } from "lodash";
import { ShipName, useGameEngine, handleAiTurn, Direction, placeShip } from "./services/GameEngine";
import ShipStatus from "./components/ShipStatus";
import { GameMode } from "./services/GameEngine";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Board from "./components/Board";
import { socketEmitters, createSocketListeners } from "../src/services/SocketOnGameState";
import { PlayerRole } from "../../shared/types/SocketEvents";


interface GameProps {
    mode: GameMode
    player1Name: string
    player2Name: string
    idSession?: string
}

const Game: React.FC<GameProps> = ({ mode, player1Name, player2Name, idSession }) => {
    const navigate = useNavigate();
    const { gameState, setGameState, reset, attack, place } = useGameEngine(mode);
    const [placementDirection, setPlacementDirection] = useState<Direction>("horizontal");
    const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
    const [opponentReady, setOpponentReady] = useState(false);

    // Find next ship to place for each player
    const currentPlacementForPlayer1 = Object.entries(gameState.player1.ships).find(([_, shipDetails]) => {
        return isEmpty(shipDetails.location)
    })?.[0] as ShipName | undefined;

    const currentPlacementForPlayer2 = Object.entries(gameState.player2.ships).find(([_, shipDetails]) => {
        return isEmpty(shipDetails.location)
    })?.[0] as ShipName | undefined;

    const isBattleActive = !currentPlacementForPlayer1 && !currentPlacementForPlayer2;

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

    // Initialize socket connection for multiplayer
    useEffect(() => {
        if (mode === "1vs1" && idSession) {
            socketEmitters.joinSession({
                idSession,
                playerName: player1Name,
            });

            const cleanup = createSocketListeners({
                onAssignRole: (role) => {
                    setPlayerRole(role);
                },
                onOpponentPlacedShip: (payload) => {
                    const { ship, direction, row, col } = payload;
                    const index = row * 10 + col;
                    const targetPlayer = payload.playerRole === PlayerRole.PLAYER1 ? "player1" : "player2";

                    setGameState(prev => {
                        const newState = placeShip(prev, targetPlayer, ship.name as ShipName, index, direction);
                        return newState;
                    });
                },
                onOpponentAttack: (payload) => {
                    const index = payload.row * 10 + payload.col;
                    attack(index);
                },
                onOpponentReady: () => {
                    setOpponentReady(true);
                }
            });

            return () => {
                cleanup();
                socketEmitters.leaveSession(idSession);
            };
        }
    }, [mode, idSession]);

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                setPlacementDirection("horizontal")
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                setPlacementDirection("vertical")
            }
        }

        if (!isBattleActive) {
            window.addEventListener("keydown", handleKeyDown)
            return () => window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isBattleActive])

    const getOnBoardClick = (board: number) => (index: number) => {
        const thisPlayer = board === 1 ? "player1" : "player2";
        const row = Math.floor(index / 10);
        const col = index % 10;

        // During placement phase
        if (!isBattleActive) {
            // Prevent placing on AI's board during placement
            if (mode === "1vsAiMarine" && board === 2) return;

            // Check if it's the player's board in multiplayer
            if (mode === "1vs1" &&
                ((playerRole === PlayerRole.PLAYER1 && board === 2) ||
                    (playerRole === PlayerRole.PLAYER2 && board === 1))) {
                return;
            }

            const currentPlacement = board === 1 ? currentPlacementForPlayer1 : currentPlacementForPlayer2;
            if (currentPlacement) {
                place(thisPlayer, currentPlacement, index, placementDirection);

                // Emit ship placement in multiplayer mode
                if (mode === "1vs1" && idSession && playerRole) {
                    socketEmitters.placeShip({
                        idSession,
                        playerRole,
                        row,
                        col,
                        ship: {
                            name: currentPlacement,
                            length: gameState[thisPlayer].ships[currentPlacement].length
                        },
                        direction: placementDirection
                    });
                }
            }
            return;
        }

        // During battle phase
        if (mode === "1vs1" && idSession && playerRole) {
            // Allow attacks only on opponent's board
            if ((playerRole === PlayerRole.PLAYER1 && board === 2) ||
                (playerRole === PlayerRole.PLAYER2 && board === 1)) {
                socketEmitters.attack({
                    idSession,
                    row,
                    col,
                    playerRole
                });
                attack(index);
            }
        } else if ((gameState.ctx.currentPlayer === "player1" && board === 2) ||
            (gameState.ctx.currentPlayer === "player2" && board === 1)) {
            attack(index);
        }
    };

    const handleRestart = () => {
        reset()
    }

    // Auto-place AI ships when player1 finishes placement
    useEffect(() => {
        if (mode === "1vsAiMarine" && gameState.ctx.currentPlayer === "player2" && gameState.ctx.gamePhase === "battle") {
            // Place AI ships automatically
            const aiGameState = handleAiTurn(gameState)
            setGameState(aiGameState)
        }
    }, [currentPlacementForPlayer1, gameState.ctx.gamePhase]);

    useEffect(() => {
        // Handle keyboard events for ship direction
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                setPlacementDirection("horizontal")
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                setPlacementDirection("vertical")
            }
        }

        // Only add the event listener during placement phase
        if (!isBattleActive) {
            window.addEventListener("keydown", handleKeyDown)
            return () => window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isBattleActive]) // Dependency on battle state

    const handleStartBattle = () => {
        if (mode === "1vs1" && idSession && playerRole) {
            socketEmitters.playerReady({
                idSession,
                playerRole
            });

            // Only transition to battle phase if opponent is also ready
            if (opponentReady) {
                setGameState(prev => ({
                    ...prev,
                    ctx: {
                        ...prev.ctx,
                        gamePhase: "battle"
                    }
                }));
            }
        } else {
            // For AI mode, transition immediately
            setGameState(prev => ({
                ...prev,
                ctx: {
                    ...prev.ctx,
                    gamePhase: "battle"
                }
            }));
        }
    };

    // Auto-place AI ships when player1 finishes placement
    useEffect(() => {
        if (mode === "1vsAiMarine" && !currentPlacementForPlayer1 && gameState.ctx.gamePhase === "placement") {
            const aiGameState = handleAiTurn(gameState);
            setGameState(aiGameState);
        }
    }, [currentPlacementForPlayer1, gameState.ctx.gamePhase]);

    return (
        <div className="flex flex-col items-center p-8">
            {/* Game Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Battleship Game</h1>
                <div className="text-lg font-semibold">
                    {gameState.ctx.currentPlayer === "player1"
                        ? player1Name
                        : (mode === "1vsAiMarine" ? "AI" : player2Name)
                    }'s turn
                </div>
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
                                    title={`${player1Name}'s Board`}
                                    gameState={gameState}
                                    isBattleActive={isBattleActive}
                                    isOpponentBoard={gameState.ctx.currentPlayer === "player2"}
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
                                    title={mode === "1vsAiMarine" ? "AI's Board" : `${player2Name}'s Board`}
                                    gameState={gameState}
                                    isBattleActive={isBattleActive}
                                    isDisabled={mode === "1vsAiMarine" && !isBattleActive}
                                    isAiBoard={mode === "1vsAiMarine"}
                                    isOpponentBoard={gameState.ctx.currentPlayer === "player1"}
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

            {!isBattleActive && (
                <div className="text-sm text-gray-600 mb-2 text-center">
                    <div className="font-semibold mb-1">
                        Current Direction: {placementDirection === "horizontal" ? "→ Horizontal" : "↓ Vertical"}
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setPlacementDirection("horizontal")}
                                className={`px-3 py-1 rounded ${placementDirection === "horizontal" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                Horizontal (←→)
                            </button>
                            <button
                                onClick={() => setPlacementDirection("vertical")}
                                className={`px-3 py-1 rounded ${placementDirection === "vertical" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                Vertical (↑↓)
                            </button>
                        </div>

                        {/* Add Start Battle button when all ships are placed */}
                        {!currentPlacementForPlayer1 && (mode === "1vsAiMarine" || !currentPlacementForPlayer2) && (
                            <div className="mt-4">
                                {mode === "1vs1" && !opponentReady ? (
                                    <div className="text-yellow-600 mb-2">
                                        Waiting for opponent to finish placement...
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleStartBattle}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Start Battle
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Show opponent ready status in multiplayer */}
                        {mode === "1vs1" && opponentReady && !isBattleActive && (
                            <div className="text-green-600 font-semibold">
                                Opponent is ready!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {gameState.ctx.showWinnerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">🎉 Game Over! 🎉</h2>
                        <p className="text-xl mb-6">
                            {gameState.ctx.winner === "player1"
                                ? `${player1Name} Wins!`
                                : (mode === "1vsAiMarine" ? "AI Wins!" : `${player2Name} Wins!`)
                            }
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
                                Game Lobby
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Game