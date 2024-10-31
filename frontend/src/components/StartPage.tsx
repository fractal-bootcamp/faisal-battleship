import { useState } from "react"
import { GameMode } from "../GameEngine"
import { useGame } from "../contexts/GameContext"

const StartPage = () => {
    const { startGame } = useGame()
    const [player1Name, setPlayer1Name] = useState<string>("")
    const [player2Name, setPlayer2Name] = useState<string>("")
    const [mode, setMode] = useState<GameMode>("1vsAiMarine")

    // handle gamestart logic 
    const handleGameStart = () => {
        if (mode === "1vs1" && player1Name && player2Name) {
            startGame(player1Name, player2Name, mode)
        } else if (mode === "1vsAiMarine" && player1Name) {
            startGame(player1Name, "AI Marine", mode)
        } else {
            alert("Please fill out all the required field!")
        }
    }

    return (
        <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-10">
            <h1 className="text-4xl font-bold mb-8 text-center">
                Battleship 🚢
            </h1>
            <div className="mb-4 w-full">
                <label htmlFor="player1Name" className="block text-lg font-semibold mb-2">
                    Player 1:
                </label>
                <input
                    type="text"
                    id="player1Name"
                    placeholder="Username"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* conditional rendering for mode state*/}
            {mode === "1vs1" && (
                <div className="mb-4 w-full">
                    <label htmlFor="player2Name" className="block text-lg font-semibold mb-2">
                        Player 2:
                    </label>
                    <input
                        type="text"
                        id="player2Name"
                        placeholder="Username"
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            {/* Select game mode state*/}
            <div className="mb-6 w-full">
                <label htmlFor="mode" className="block text-lg font-semibold mb-2">
                    Game Mode:
                </label>
                <select id="mode" value={mode} onChange={e => setMode(e.target.value as GameMode)} className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="1vs1">
                        1 vs 1
                    </option>
                    <option value="1vsAiMarine">
                        1 vs AI Marine
                    </option>
                </select>
            </div>
            <button onClick={handleGameStart} className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition w-full">
                Start Game
            </button>
        </div>
    )
}

export default StartPage