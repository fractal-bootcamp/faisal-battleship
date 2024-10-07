import { isEmpty } from "lodash";
import { Board, CellIndex, useGameEngine } from "./GameEngine";

const Game = () => {
    const { gameState, reset, attack, place } = useGameEngine()


    const currentPlacementForPlayer1 = Object.values(gameState.player1.ships).find((shipDetails) => {
        return isEmpty(shipDetails.location)
    })?.name

    const currentPlacementForPlayer2 = Object.values(gameState.player2.ships).find((shipDetails) => {
        return isEmpty(shipDetails.location)
    })?.name

    const isBattleActive = !currentPlacementForPlayer1 && !currentPlacementForPlayer2;

    // object.entries()
    // { a: 1, b: 2 } -> [["a", 1], ["b", 2]]


    // Higher Order Function
    const getOnBoardClick = (board: number) => (index: number) => {
        const thisPlayer = board === 1 ? "player1" : "player2"
        const otherPlayer = board === 1 ? "player2" : "player1"
        if (gameState.ctx.currentPlayer !== otherPlayer) {
            return;
        }

        if (isBattleActive) {
            attack(index)
        }

        if (!currentPlacementForPlayer1) {
            return;
        }

        place(thisPlayer, currentPlacementForPlayer1, index)
    }

    return <div>
        <div>It's {gameState.ctx.currentPlayer}'s turn</div>
        <button onClick={reset}>Reset Game</button>
        <Board cells={gameState.player1.board} onCellClick={getOnBoardClick(1)} />
        <Board cells={gameState.player2.board} onCellClick={getOnBoardClick(2)} />
    </div>
}

type BoardPlace = (placementLocation: CellIndex) => void
type Attack = (index: number) => void

const Board = ({ cells, onCellClick }: { cells: Board, onCellClick: (index: number) => void }) => {
    const board = cells.flat()


    return (
        <div className="grid grid-cols-10 gap-1 w-96 h-96">
            {board.map((value, index) => (
                <div
                    key={index}
                    onClick={() => onCellClick(index)}
                    className="bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                >
                    {value}
                </div>
            ))}
        </div>
    );

}

export default Game