type PlayerState = {
    id: string
    type: "playerId" | "playerJoined" | "playerMoved" | "playerLeft";
    x: number;
    y: number;
    color: string;
}

