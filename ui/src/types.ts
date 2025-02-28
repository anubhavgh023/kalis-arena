export type PlayerState = {
    id: string
    type: "playerId" | "playerJoined" | "playerMoved" | "playerLeft";
    x: number;
    y: number;
    color: string;
}

const validTypes = new Set([
    "playerId",
    "playerJoined",
    "playerMoved",
    "playerLeft"
])

export function isPlayerState(arg: any): arg is PlayerState {
    return arg
        && typeof (arg.id) === 'string'
        && validTypes.has(arg.type)
        && typeof (arg.x) === 'number'
        && typeof (arg.y) === 'number'
        && typeof (arg.color) === 'string'
}




