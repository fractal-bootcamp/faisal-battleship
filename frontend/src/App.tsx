import { useEffect, useState } from "react"
import StartPage from "./components/StartPage"
import GamePageWrapper from "./components/GamePageWrapper"
import { GameMode } from "./GameEngine"
import { v4 as uuidv4 } from "uuid"
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"

const App: React.FC = () => {
  const [player1Name, setPlayer1Name] = useState<string>("")
  const [player2Name, setPlayer2Name] = useState<string | null>(null)
  const [mode, setmode] = useState<GameMode>("1vsAiMarine")
  const [sessionId, setSessionId] = useState<string | null>(null)

  const navigate = useNavigate()

  // Handle startgame logic
  const startGame = (
    player1: string,
    player2: string | null,
    selectedMode: GameMode,
  ) => {
    setPlayer1Name(player1)
    setPlayer2Name(player2)
    setmode(selectedMode)
    // Generate a unique session ID for the game
    const id = uuidv4()
    setSessionId(id)
  }

  // Redirect to the game session route
  useEffect(() => {
    if (sessionId) {
      navigate(`/game/${sessionId}`)
    }
  }, [sessionId, navigate])

  return (
    <Routes>
      {/* Start page route */}
      <Route
        path="/"
        element={<StartPage OnGameStart={startGame}
        />}
      />

      {/* Game page route with session Id */}
      <Route
        path="/game/:idSession"
        element={<GamePageWrapper
          player1Name={player1Name}
          player2Name={player2Name || ""}
          mode={mode}
        />}
      />
    </Routes>
  )
}

export default App