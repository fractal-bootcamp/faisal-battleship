import { createContext, useContext, useState } from "react"
import { GameMode } from "../GameEngine"
import { v4 as uuidv4 } from "uuid"
import { useNavigate } from "react-router-dom"

interface GameContextType {
    player1Name: string
    player2Name: string | null
    mode: GameMode
    startGame: (player1: string, player2: string | null, selectedMode: GameMode) => void
}

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => {
    const context = useContext(GameContext)
    if (!context) throw new Error('useGame must be used within GameProvider')
    return context
}

export const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [player1Name, setPlayer1Name] = useState<string>("")
    const [player2Name, setPlayer2Name] = useState<string | null>(null)
    const [mode, setMode] = useState<GameMode>("1vsAiMarine")
    const navigate = useNavigate()

    const startGame = (
        player1: string,
        player2: string | null,
        selectedMode: GameMode,
    ) => {
        setPlayer1Name(player1)
        setPlayer2Name(player2)
        setMode(selectedMode)
        const id = uuidv4()
        navigate(`/game/${id}`)
    }

    return (
        <GameContext.Provider value={{ player1Name, player2Name, mode, startGame }}>
            {children}
        </GameContext.Provider>
    )
} 