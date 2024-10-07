import { useParams } from "react-router-dom"
import Game from "../Game"
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
        <Game />
    )
}

export default GamePageWrapper