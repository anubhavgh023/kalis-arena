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
	Seq   int     `json:"seq"`
	Color string  `json:"color"`
}

func NewPlayerMsg(msgType MsgType, id string, x, y, seq int, color string) PlayerMsg {
	return PlayerMsg{
		Type:  msgType,
		ID:    id,
		X:     x,
		Y:     y,
		Seq:   seq,
		Color: color,
	}
}
