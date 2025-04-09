package game

type MsgType string

const (
	MsgTypePlayerID    MsgType = "playerID"
	MsgTypePlayerJoin  MsgType = "playerJoined"
	MsgTypePlayerMove  MsgType = "playerMoved"
	MsgTypePlayerLeave MsgType = "playerLeft"
)

type PlayerMsg struct {
	Type MsgType `json:"type"`
	ID   string  `json:"id"`
	X    int     `json:"x"`
	Y    int     `json:"y"`
}

func NewPlayerMsg(msgType MsgType, id string, x, y int) PlayerMsg {
	return PlayerMsg{
		Type: msgType,
		ID:   id,
		X:    x,
		Y:    y,
	}
}
