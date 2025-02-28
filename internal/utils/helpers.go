package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
)

func GenerateRandomColor() string {
	hue := rand.Intn(360)            // Random hue (0-359)
	saturation := rand.Intn(51) + 50 // Random saturation (50-100%)
	lightness := rand.Intn(31) + 40  // Random lightness (40-70%)

	return fmt.Sprintf("hsl(%d, %d%%, %d%%)", hue, saturation, lightness)
}

type canvasConfig struct {
	WIDTH  int `json:"width"`
	HEIGHT int `json:"height"`
}

type worldView struct {
	CANVAS canvasConfig `json:"canvas"`
}

func LoadConfig(path string) *worldView {
	file, err := os.ReadFile(path)
	if err != nil {
		log.Fatal("ERROR reading file, err:", err)
		return nil
	}

	var config worldView
	err = json.Unmarshal(file, &config)
	if err != nil {
		log.Fatal("ERROR unmarshaling file:", path)
		return nil
	}

	return &config
}
