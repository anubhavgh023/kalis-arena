package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand/v2"
	"os"
	"sync"
)

// v1: GenerateRandomColor
// func GenerateRandomColor() string {
// 	hue := rand.Intn(360)            // Random hue (0-359)
// 	saturation := rand.Intn(51) + 50 // Random saturation (50-100%)
// 	lightness := rand.Intn(31) + 40  // Random lightness (40-70%)
//
// 	return fmt.Sprintf("hsl(%d, %d%%, %d%%)", hue, saturation, lightness)
// }

// hueOptions represents distinct hues spaced across the color wheel (0-360°)
var hueOptions = []int{0, 60, 120, 180, 240, 300} // Red, Yellow, Green, Cyan, Blue, Magenta
var usedHues = make(map[int]bool)

var hueMutex sync.Mutex

// v2: GenerateRandomColor
func GenerateRandomColor() string {
	hueMutex.Lock()
	defer hueMutex.Unlock()

	// If all hues are used, reset (unlikely with few players)
	if len(usedHues) >= len(hueOptions) {
		for k := range usedHues {
			delete(usedHues, k)
		}
	}

	// Pick an unused hue
	var hue int
	for {
		hue = hueOptions[rand.IntN(len(hueOptions))]
		if !usedHues[hue] {
			usedHues[hue] = true
			break
		}
	}

	// Broader, distinct ranges for saturation and lightness
	saturation := rand.IntN(41) + 60 // 60-100%
	lightness := rand.IntN(31) + 35  // 35-65%

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
