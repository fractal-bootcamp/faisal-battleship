import { useParams } from "react-router-dom"
import GamePage from "./GamePage"
import { GameMode } from "../GameEngine"

interface GamePageWrapperProps {
    player1Name: string
    player2Name: string
    mode: GameMode
}

const GamePageWrapper: React.FC<GamePageWrapperProps> = ({
    player1Name,
    player2Name,
    mode,
}) => {
    const { idSession } = useParams<{ idSession: string }>()

    return (
        <GamePage
            player1Name={player1Name}
            player2Name={player2Name}
            mode={mode}
            idSession={idSession!}
        />
    )
}


export default GamePageWrapper