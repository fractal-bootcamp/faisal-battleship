import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import StartPage from "./components/StartPage"
import GamePage from "./components/GamePage"
import GamePageWrapper from "./components/GamePageWrapper"

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Route for start page */}
        <Route path="/" element={<StartPage />} />

        {/* Route for the game session */}
        <Route path="/game/:idSession" element={<GamePageWrapper />} />

      </Routes>
    </Router>
  )
}

export default App