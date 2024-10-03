import { useEffect, useState } from "react";
import Board, { shipPlacementForAi } from "./Board";

type GameMode = "1vs1" | "1vsComputer"
type GamePhase = "placement" | "battle"

const game = {

}

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
    console.log('infinite 1?')
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
        }
    }

    // Handle player2 attack on player 1 board logic
    useEffect(() => {
        console.log('infinite 1?')
        if (!isPlayerTurn && !playerHitStreak && gamePhase === "battle") {
            setTimeout(() => {
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
                }

            }, 500)
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
        console.log("asasdasdasd")
        if (shipsPlaced === 5) {
            // Handle Ai placement first, then transition to battle phase

            console.log("try placement")
            const placement = shipPlacementForAi(initializeEmptyBoard())
            console.log(placement)

            setAiBoard(placement)
            setGamePhase("battle")
        } else {
            alert(`Please place all your ships before starting the battle.`)
        }
    }

    return (
        <div>
            {/* Conditional rendering for player names */}
            <h1>
                Battleship: {mode === "1vs1"
                    ? `${player1Name} vs ${player2Name}`
                    : `${player1Name} vs AI Marine`
                }
            </h1>

            {/* Conditional rendering for gamephase */}
            {gamePhase === "placement"
                ? (
                    <div>
                        <h2>
                            Place your ships
                        </h2>
                        <Board
                            board={playerBoard}
                            setBoard={setPlayerBoard}
                            shipsPlaced={shipsPlaced}
                            setShipsPlaced={setShipsPlaced}
                        />
                        <button onClick={handleStartBattle}>
                            Start Battle
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Conditional rendering for playerturn */}
                        <h2>
                            {isPlayerTurn ? `${player1Name}'s Turn` : `AI Marine's Turn`}
                        </h2>
                        <Board board={playerBoard} />
                        <Board board={aiBoard} onAttack={handlePlayerAttack} isAiBoard={true} />
                    </div>
                )
            }
        </div>
    )
}

export default GamePage