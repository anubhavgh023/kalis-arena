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
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	Color string  `json:"color"`
}

func NewPlayerMsg(msgType MsgType, id string, x, y float64, color string) PlayerMsg {
	return PlayerMsg{
		Type:  msgType,
		ID:    id,
		X:     x,
		Y:     y,
		Color: color,
	}
}
