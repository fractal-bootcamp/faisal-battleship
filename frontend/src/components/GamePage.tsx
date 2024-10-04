import { useEffect, useState } from "react";
import Board from "./Board";
import socket from "../SocketOnGameState";
import {
    createInitialGameState,
    handlePlayerAttack,
    placeShipsForAi,
    checkWinCondition,
    ships,
    placeShip,
    isPlacementValid,
    Direction,
    GameMode,
} from "../GameEngine"

interface GamePageProps {
    player1Name: string
    player2Name: string | null
    mode: GameMode
    idSession: string
}

const GamePage: React.FC<GamePageProps> = ({
    player1Name,
    player2Name,
    mode,
}) => {
    const [gameState, setGameState] = useState(createInitialGameState())
    const [player2Board, setPlayer2Board] = useState(createInitialGameState().playerBoard) // Seperate board for player2 in 1vs1 mode
    const [placementDirection, setPlacementDirection] = useState<Direction>("horizontal")

    // Detect arrow key for placement direction
    useEffect(() => {
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

    // Listen for opponent ship placement and attack in 1vs1 mode
    useEffect(() => {
        if (mode === "1vs1") {
            // Listen for ship placement
            socket.on("opponentPlacedShip", (data) => {
                console.log("Oppenent placed a ship:", data);
                setPlayer2Board((prev) => (
                    placeShip(prev, data.row, data.col, data.ship, data.driection)
                ))
            })

            // Listen for opponent attack
            socket.on("attack", (data) => {
                console.log("Opponent attacked:", data);
                const [newBoard] = handlePlayerAttack(gameState.playerBoard, data.row, data.col)
                setGameState((prev) => ({
                    ...prev,
                    playerBoard: newBoard,
                    isPlayerTurn: true, // Switch turns
                }))

                //  Check if player1 ships are destroyed
                if (checkWinCondition(newBoard)) {
                    alert(`${player2Name} Won!`)
                    resetGame()
                }
            })
        }
    }, [gameState, mode])


    // Handle Ai turn with a delay in 1vsAiMarine mode
    useEffect(() => {
        if (!gameState.isPlayerTurn && gameState.gamePhase === "battle" && mode === "1vsAiMarine") {
            const aiTimeout = setTimeout(() => {
                let row, col
                do {
                    row = Math.floor(Math.random() * 10)
                    col = Math.floor(Math.random() * 10)
                } while (gameState.playerBoard[row][col] === "💥" || gameState.playerBoard[row][col] === "👻")

                const [newPlayerBoard] = handlePlayerAttack(gameState.playerBoard, row, col)

                setGameState((prev) => ({
                    ...prev,
                    playerBoard: newPlayerBoard,
                    isPlayerTurn: true // Switch turns back
                }))

                // Check if player1 ships are destroyed
                if (checkWinCondition(newPlayerBoard)) {
                    alert(`AI Marine Won!`)
                    resetGame()
                }
            }, 200)
            return () => clearTimeout(aiTimeout)
        }
    }, [gameState.isPlayerTurn, gameState.playerBoard, gameState.gamePhase, mode])

    // Handle ship placement logic and Emit placement to server for 1vs1 mode
    const handleShipPlacement = (row: number, col: number) => {
        if (gameState.shipsPlaced >= ships.length) return // All ships placed

        const ship = ships[gameState.shipsPlaced]
        const isValid = isPlacementValid(gameState.playerBoard, row, col, ship, placementDirection)

        if (isValid) {
            const newBoard = placeShip(gameState.playerBoard, row, col, ship, placementDirection)
            setGameState((prev) => ({
                ...prev,
                playerBoard: newBoard,
                shipsPlaced: prev.shipsPlaced + 1,
            }))

            // Emit placement to server in 1vs1 mode
            if (mode === "1vs1") {
                socket.emit("placeShip", {
                    row, col, ship, direction: placementDirection
                })
            }
        }
    }

    // Handle attack logic for both AI and player2
    const handleAttack = (row: number, col: number) => {
        // Prevent clicking when its not player's turn
        if (!gameState.isPlayerTurn || gameState.gamePhase !== "battle") return

        let newBoard, hit, destroyedShips, hitStreak

        if (mode === "1vs1") {
            [newBoard, hit, destroyedShips, hitStreak] = handlePlayerAttack(
                player2Board,
                row,
                col,
            )
            setPlayer2Board(newBoard)
            // Emit attack to server in 1vs1 mode
            socket.emit("attack", {
                row,
                col
            })
            // Check if player2 ships are destroyed
            if (checkWinCondition(newBoard)) {
                alert(`${player1Name} Won!`)
                resetGame()
            } else if (hit) {
                setGameState((prev) => ({
                    ...prev,
                    playerHitStreak: hitStreak, // Advantage for hit
                }))
            } else {
                setGameState((prev) => ({
                    ...prev,
                    isPlayerTurn: false, // Pass turn back
                }))
            }
        } else {
            [newBoard, hit, destroyedShips, hitStreak] = handlePlayerAttack(
                gameState.aiBoard,
                row,
                col
            )
            setGameState((prev) => ({
                ...prev,
                aiBoard: newBoard,
                destroyedAiShips: prev.destroyedAiShips + destroyedShips,
                playerHitStreak: hitStreak,
            }))
            // Check if Ai ships are destroyed
            if (checkWinCondition(newBoard)) {
                alert(`${player1Name} Won!`)
                resetGame()
            } else if (!hit) {
                setGameState((prev) => ({
                    ...prev,
                    isPlayerTurn: false, // Pas turn to Ai
                }))
            }
        }
    }

    // Utility functions
    const startBattle = () => {
        setGameState((prev) => ({
            ...prev,
            aiBoard: mode === "1vsAiMarine" ? placeShipsForAi() : prev.aiBoard,
            gamePhase: "battle",
            isPlayerTurn: true // Player1 starts
        }))
    }
    const resetGame = () => {
        setGameState(createInitialGameState())
        setPlayer2Board(createInitialGameState().playerBoard)
    }

    // Total number of ship parts
    const totalShipParts = ships.reduce((sum, ship) => sum + ship.length, 0)

    return (
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md w-full h-screen max-h-screen overflow-hidden">
            {/* Display the game title */}
            <h1 className="text-3xl font-bold mb-4">
                Battleship: {mode === "1vs1" ? `${player1Name} vs ${player2Name}` : `${player1Name} vs AI Marine`}
            </h1>

            {/* Render boards based on game phase */}
            <div className="flex justify-around w-full h-full max-w-5xl p-3 overflow-hidden">
                {/* Player 1's Board */}
                <div className="w-1/2 h-full flex flex-col items-center p-4">
                    <h2 className="text-xl font-semibold mb-2 text-center">{player1Name}'s Board</h2>

                    {gameState.gamePhase === "placement" && gameState.shipsPlaced < ships.length && (
                        <div className="mb-4 text-center flex flex-col">
                            <h2 className="text-lg font-semibold mb-2">Place Your Ships</h2>
                            <p className="mb-2">Placement Direction: {placementDirection}</p>
                            <ul className="mb-4">
                                {ships.slice(gameState.shipsPlaced).map((ship, index) => (
                                    <li key={index} className="text-md">
                                        {ship.name} (Length: {ship.length})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Board
                        board={gameState.playerBoard}
                        onAttack={gameState.gamePhase === "placement" ? handleShipPlacement : undefined}
                    />
                </div>

                {/* AI/Player 2's Board */}
                <div className="w-1/2 h-full flex flex-col items-center p-4">
                    <h2 className="text-xl font-semibold mb-2 text-center">{player2Name || "AI Marine"}'s Board</h2>
                    <Board
                        board={mode === "1vs1" ? player2Board : gameState.aiBoard}
                        isAiBoard={mode === "1vsAiMarine"}
                        onAttack={gameState.gamePhase === "battle" ? handleAttack : undefined}
                    />
                </div>
            </div>

            {/* Conditional rendering for game phase */}
            {gameState.gamePhase === "placement" && (
                <div className="text-center">
                    <h2 className="text-lg mb-2">Place your ships ({gameState.shipsPlaced}/{ships.length})</h2>
                    <button
                        onClick={startBattle}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                        disabled={gameState.shipsPlaced < ships.length}
                    >
                        Start Battle
                    </button>
                </div>
            )}

            {gameState.gamePhase === "battle" && (
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl mb-4">{gameState.isPlayerTurn ? `${player1Name}'s Turn` : `AI Marine's Turn`}</h2>
                    <p className="text-lg mb-4">
                        Ship parts destroyed: {gameState.destroyedAiShips} / {totalShipParts}
                    </p>
                    <button onClick={() => resetGame()} className="bg-red-500 text-white py-2 px-4 rounded mt-4">
                        Reset Game
                    </button>
                </div>
            )}
        </div>
    );

}

export default GamePage