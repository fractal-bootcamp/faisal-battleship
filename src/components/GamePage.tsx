import { useEffect, useState } from "react";
import Board, { shipPlacementForAi } from "./Board";

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

    // Handle Ai placement once game starts
    useEffect(() => {
        if (gamePhase === "battle") {
            setAiBoard(shipPlacementForAi(initializeEmptyBoard()))
        }
    }, [gamePhase])

    const handleStartBattle = () => {
        setGamePhase("battle")
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
                        <Board board={playerBoard} setBoard={setPlayerBoard} />
                        <button onClick={handleStartBattle}>
                            Start Battle
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Conditional rendering for playerturn */}
                        <h2>
                            {isPlayerTurn ? `${player1Name}'s Turn` : `AI's Turn`}
                        </h2>
                        <Board board={playerBoard} setBoard={setPlayerBoard} />
                        <Board board={aiBoard} />
                    </div>
                )
            }
        </div>
    )
}

export default GamePage