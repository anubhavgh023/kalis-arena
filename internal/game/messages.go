package game

type MsgType string

const (
	MsgTypePlayerID    MsgType = "playerId"
	MsgTypePlayerJoin  MsgType = "playerJoined"
	MsgTypePlayerMove  MsgType = "playerMoved"
	MsgTypePlayerLeave MsgType = "playerLeft"
)

type PlayerMsg struct {
	Type  MsgType `json:"type"`
	ID    string  `json:"id"`
	X     int     `json:"x"`
	Y     int     `json:"y"`
	Color string  `json:"color"`
}

func NewPlayerMsg(msgType MsgType, id string, x, y int, color string) PlayerMsg {
	return PlayerMsg{
		Type:  msgType,
		ID:    id,
		X:     x,
		Y:     y,
		Color: color,
	}
}
