import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import RootLayout from '../src/RootLayout'
import Game from './Game'
import StartPage from './components/StartPage'
import './index.css'

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
        element: <Game
          mode="1vsAiMarine"
          player1Name="Player 1"
          player2Name="Player 2"
        />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
