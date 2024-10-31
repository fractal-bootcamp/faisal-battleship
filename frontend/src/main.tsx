import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Game from './Game'
import StartPage from './components/StartPage'
import './index.css'
import { useGame } from './contexts/GameContext';

const GameWrapper = () => {
  const { player1Name, player2Name, mode } = useGame();

  return (
    <Game
      mode={mode}
      player1Name={player1Name || ''}
      player2Name={mode === "1vsAiMarine" ? "AI" : (player2Name || '')}
    />
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <StartPage />
      },
      {
        path: 'game/:idSession',
        element: <GameWrapper />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
