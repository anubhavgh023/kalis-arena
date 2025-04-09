export type PlayerState = {
    id: string
    type: "playerID" | "playerJoined" | "playerMoved" | "playerLeft";
    x: number;
    y: number;
}

const validTypes = new Set([
    "playerID",
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
}
