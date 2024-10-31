import { Outlet } from 'react-router-dom'
import { GameContextProvider } from './contexts/GameContext'

const App = () => {
  return (
    <GameContextProvider>
      <div className="min-h-screen bg-gray-100">
        <Outlet />
      </div>
    </GameContextProvider>
  )
}

export default App