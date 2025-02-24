package utils

import (
	"fmt"
	"math/rand"
)

func GenerateRandomColor() string {
	hue := rand.Intn(360)            // Random hue (0-359)
	saturation := rand.Intn(51) + 50 // Random saturation (50-100%)
	lightness := rand.Intn(31) + 40  // Random lightness (40-70%)

	return fmt.Sprintf("hsl(%d, %d%%, %d%%)", hue, saturation, lightness)
}

// func GenerateRandomColor() string {
// 	// Generate random RGB values
// 	r := rand.Intn(256) // 0-255
// 	g := rand.Intn(256)
// 	b := rand.Intn(256)
//
// 	return fmt.Sprintf("rgb(%d, %d, %d)", r, g, b)
// }
