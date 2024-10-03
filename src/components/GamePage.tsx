import { useEffect, useState } from "react";
import Board, { shipPlacementForAi, ships } from "./Board";

type GameMode = "1vs1" | "1vsComputer"
type GamePhase = "placement" | "battle"

interface GamePageProps {
    player1Name: string
    player2Name: string | null
    mode: GameMode
}

const GamePage: React.FC<GamePageProps> = ({
    player1Name,
    player2Name,
    mode,
}) => {

    // Initial gamestate logic
    const initializeEmptyBoard = (): Array<Array<string>> => {
        return Array(10).fill(null).map(() => Array(10).fill(""))
    }

    const [playerBoard, setPlayerBoard] = useState<Array<Array<string>>>(initializeEmptyBoard())
    const [aiBoard, setAiBoard] = useState<Array<Array<string>>>(initializeEmptyBoard())
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true)
    const [gamePhase, setGamePhase] = useState<GamePhase>("placement")
    const [playerHitStreak, setPlayerHitStreak] = useState<boolean>(false)
    const [shipsPlaced, setShipsPlaced] = useState<number>(0) // Track ships placed
    const [destroyedAiShips, setDestroyedAiShips] = useState<number>(0) // Track destroyed ships
    const [selectedShipIndex, setSelectedShipIndex] = useState<number>(0)

    // Total number of ship parts
    const totalShipParts = ships.reduce((sum, ship) => sum + ship.length, 0)

    // Handle player1 attack on player2 board logic
    const handlePlayerAttack = (row: number, col: number) => {
        // Prevent clicking when its not player's turn
        if (!isPlayerTurn || gamePhase !== "battle") return

        const newAiBoard = [...aiBoard]
        let hit = false

        if (newAiBoard[row][col] === "S") {
            newAiBoard[row][col] = "💥" // Hit target
            hit = true
            setPlayerHitStreak(true) // player gets advantage with another attack
            // Check how many ships have been destroyed
            const remainingAiShips = newAiBoard.flat().filter((cell) => cell === "S").length
            setDestroyedAiShips(totalShipParts - remainingAiShips)
        } else if (newAiBoard[row][col] === "") {
            newAiBoard[row][col] = "👻" // Miss target
            setPlayerHitStreak(false) // No additional turn if the miss
        }
        setAiBoard(newAiBoard)

        if (!hit) {
            setIsPlayerTurn(false) // End player's turn and switch to opponent
        }

        // Check win condition after player attack
        if (checkWinCondition(newAiBoard)) {
            alert(`${player1Name} Won!`)
            setGamePhase("placement") // Reset game
            handleResetGame()
        }
    }

    // Handle player2 attack on player 1 board logic
    useEffect(() => {
        if (!isPlayerTurn && !playerHitStreak && gamePhase === "battle") {
            const timeoutId = setTimeout(() => {
                const newPlayerBoard = [...playerBoard]

                let aiRow: number
                let aiCol: number

                do {
                    aiRow = Math.floor(Math.random() * 10)
                    aiCol = Math.floor(Math.random() * 10)
                } while (newPlayerBoard[aiRow][aiCol] === "💥" || newPlayerBoard[aiRow][aiCol] === "👻")

                if (newPlayerBoard[aiRow][aiCol] === "S") {
                    newPlayerBoard[aiRow][aiCol] = "💥" // Ai hits target
                } else {
                    newPlayerBoard[aiRow][aiCol] = "👻" // Ai miss target
                }
                setPlayerBoard(newPlayerBoard) // Update board
                setIsPlayerTurn(true) // Switch turns after attack

                // Check win condition after player attack
                if (checkWinCondition(newPlayerBoard)) {
                    alert(`AI Marine Won!`)
                    setGamePhase("placement") // Reset game
                    handleResetGame()
                }

            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [isPlayerTurn, playerBoard, playerHitStreak, gamePhase])

    // Handle ship status logic
    const checkWinCondition = (board: Array<Array<string>>) => {
        for (let row of board) {
            for (let cell of row) {
                if (cell === "S") return false // If there is still S, the game is not over yet
            }
        }
        return true // All ships are attacked, game over
    }

    // Utility function
    const handleStartBattle = () => {
        if (shipsPlaced === 5) {
            // Handle Ai placement first, then transition to battle phase
            const placement = shipPlacementForAi(initializeEmptyBoard())

            setAiBoard(placement)
            setGamePhase("battle")
        } else {
            alert(`Please place all your ships before starting the battle.`)
        }
    }

    // Reset/restart the game
    const handleResetGame = (fullReset: boolean = false) => {
        setPlayerBoard(initializeEmptyBoard())
        setAiBoard(initializeEmptyBoard())
        setGamePhase("placement")
        setShipsPlaced(0)
        setDestroyedAiShips(0)
        setSelectedShipIndex(0)

        if (fullReset) {
            setIsPlayerTurn(true)
            setPlayerHitStreak(false)
        }

    }

    return (
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-md w-full h-screen max-h-screen overflow-hidden">
            {/* Conditional rendering for player names */}
            <h1 className="text-3xl font-bold mb-4">
                Battleship: {mode === "1vs1"
                    ? `${player1Name} vs ${player2Name}`
                    : `${player1Name} vs AI Marine`
                }
            </h1>

            <div className="flex justify-around w-full h-full max-w-5xl p-3 overflow-hidden">
                <div className="w-1/2 h-full flex flex-col items-center p-4">
                    <h2 className="text-xl font-semibold mb-2 text-center">
                        {player1Name}'s Board
                    </h2>
                    <Board
                        board={playerBoard}
                        setBoard={setPlayerBoard}
                        shipsPlaced={shipsPlaced}
                        setShipsPlaced={setShipsPlaced}
                        selectedShipIndex={selectedShipIndex}
                        setSelectedShipIndex={setSelectedShipIndex}
                    />
                </div>
                <div className="w-1/2 h-full flex flex-col items-center p-4">
                    <h2 className="text-xl font-semibold mb-2 text-center">
                        AI Marine's Board
                    </h2>
                    <Board
                        board={aiBoard}
                        onAttack={handlePlayerAttack}
                        isAiBoard={true}
                    />
                </div>
            </div>

            {/* Conditional rendering for gamephase */}
            {gamePhase === "placement" && (
                <button onClick={handleStartBattle} className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition">
                    Start Battle
                </button>
            )}

            {gamePhase === "battle" && (
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl mb-4">
                        {isPlayerTurn ? `${player1Name}'s Turn` : `AI Marine's Turn`}
                    </h2>
                    <p className="text-lg mb-4">
                        Ship parts destroyed: {destroyedAiShips} / {totalShipParts}
                    </p>
                    <button onClick={() => handleResetGame(true)} className="bg-red-500 text-white py-2 px-4 rounded mt-4">
                        Reset Game
                    </button>
                </div>
            )}
        </div>
    )
}

export default GamePage