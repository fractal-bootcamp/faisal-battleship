import { ShipDetails } from "../GameEngine"

interface ShipStatusProps {
    ships: Record<string, ShipDetails>
    isPlayer2: boolean
    isBattleActive: boolean
}

const ShipStatus = ({ ships, isPlayer2, isBattleActive }: ShipStatusProps) => {
    const getShipStatus = (ship: ShipDetails) => {
        if (!ship.location) return ship.length
        const remainingHits = Object.values(ship.location).filter(cell => cell === "🚢").length
        return remainingHits
    }

    const colorScheme = {
        player1: {
            container: 'bg-white',
            placementContainer: 'bg-gray-100 border-gray-200',
            activeShipContainer: 'bg-sky-50 border-sky-200',
            destroyedContainer: 'bg-red-100 border-red-200',
            placedShip: 'bg-sky-500 border-sky-600',
            unplacedShip: 'bg-gray-300 border-gray-300',
            hitSection: 'bg-red-500 border-red-600'
        },
        player2: {
            container: 'bg-white',
            placementContainer: 'bg-gray-100 border-gray-200',
            activeShipContainer: 'bg-amber-50 border-amber-200',
            destroyedContainer: 'bg-red-100 border-red-200',
            placedShip: 'bg-amber-500 border-amber-600',
            unplacedShip: 'bg-gray-300 border-gray-300',
            hitSection: 'bg-red-500 border-red-600'
        }
    }

    const currentScheme = isPlayer2 ? colorScheme.player2 : colorScheme.player1

    const getContainerStyle = (isDestroyed: boolean) => {
        if (!isBattleActive) {
            return currentScheme.placementContainer
        }
        return isDestroyed ? currentScheme.destroyedContainer : currentScheme.activeShipContainer
    }

    const getSquareStyle = (ship: ShipDetails, isDestroyed: boolean) => {
        if (!isBattleActive) {
            return Object.keys(ship.location || {}).length === 0
                ? currentScheme.unplacedShip
                : currentScheme.placedShip
        }

        return isDestroyed ? currentScheme.hitSection : currentScheme.placedShip
    }

    return (
        <div className={`${currentScheme.container} p-4 mt-11 shadow-md w-64 h-fit border border-gray-200`}>
            <h3 className="text-lg font-bold mb-3 text-center">
                Navy Fleet
            </h3>
            <div className="space-y-2">
                {Object.entries(ships).map(([shipName, ship]) => {
                    const hitsRemaining = getShipStatus(ship)
                    const isDestroyed = ship.location !== null && hitsRemaining === 0

                    return (
                        <div
                            key={shipName}
                            className={`flex justify-between items-center p-2 rounded border
                                ${getContainerStyle(isDestroyed)}`}
                        >
                            <span className="capitalize font-medium">{shipName}</span>
                            <div className="flex space-x-1">
                                {[...Array(ship.length)].map((_, i) => {
                                    const isHit = isBattleActive && i >= hitsRemaining

                                    return (
                                        <span
                                            key={i}
                                            className={`w-4 h-4 rounded-sm border
                                                ${isHit
                                                    ? currentScheme.hitSection
                                                    : getSquareStyle(ship, isDestroyed)}`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ShipStatus