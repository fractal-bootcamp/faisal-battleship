import { useState } from "react"
import StartPage from "./components/StartPage"
import GamePage from "./components/GamePage"

type GameMode = "1vs1" | "1vsComputer"

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [player1Name, setPlayer1Name] = useState<string>("")
  const [player2Name, setPlayer2Name] = useState<string | null>(null)
  const [mode, setmode] = useState<GameMode>("1vs1")

  // Handle startgame logic
  const startGame = (
    player1: string,
    player2: string | null,
    selectedMode: GameMode,
  ) => {
    setPlayer1Name(player1)
    setPlayer2Name(player2)
    setmode(selectedMode)
    setGameStarted(true)
  }

  return (
    <div>
      {/* Conditional rendering for gamestart state */}
      {!gameStarted
        ? (
          <StartPage OnGameStart={startGame} />
        ) : (
          <GamePage
            player1Name={player1Name}
            player2Name={player2Name}
            mode={mode}
          />
        )
      }
    </div>
  )
}

export default App