import { useState } from "react"
// set game mode at start
type GameMode = "1vs1" | "1vsComputer"
// set types of players
interface StartPageProps {
    OnGameStart: (
        player1Name: string,
        player2Name: string | null,
        mode: GameMode,
    ) => void
}
// create startpage component with usestate for props
const StartPage: React.FC<StartPageProps> = ({ OnGameStart }) => {
    const [player1Name, setPlayer1Name] = useState<string>("")
    const [player2Name, setPlayer2Name] = useState<string>("")
    const [mode, setMode] = useState<GameMode>("1vsComputer")

    // handle gamestart logic 
    const handleGameStart = () => {
        if (mode === "1vs1" && player1Name && player2Name) {
            OnGameStart(player1Name, player2Name, mode)
        } else if (mode === "1vsComputer" && player1Name) {
            OnGameStart(player1Name, "AI Marine", mode)
        } else {
            alert("Please fill out all the required field!")
        }
    }

    return (
        <div>
            <h1>Battleship Game</h1>
            <div>
                <label htmlFor="player1Name">
                    Player 1:
                </label>
                <input
                    type="text"
                    id="player1Name"
                    placeholder="Username"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                />
            </div>

            {/* conditional rendering for mode state*/}
            {mode === "1vs1" && (
                <div>
                    <label htmlFor="player2Name">
                        Player 2:
                    </label>
                    <input
                        type="text"
                        id="player2Name"
                        placeholder="Username"
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                    />
                </div>
            )}

            {/* Select game mode state*/}
            <div>
                <label htmlFor="mode">
                    Select Game Mode:
                </label>
                <select id="mode" value={mode} onChange={e => setMode(e.target.value as GameMode)}>
                    <option value="1vs1">
                        1vs1
                    </option>
                    <option value="1vsComputer">
                        1vsComputer
                    </option>
                </select>
            </div>
            <button onClick={handleGameStart}>
                Start Game
            </button>
        </div>
    )
}

export default StartPage