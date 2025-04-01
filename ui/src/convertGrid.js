import fs from "fs"

// Load the JSON file
const json = JSON.parse(fs.readFileSync('tileMap4.json', 'utf8'));
const tilesets = json.tilesets;

// Function to convert GID to an object with local ID and flip flags
function getTileInfo(gid) {
    if (gid === 0) return 0; // Empty tile remains 0

    // Mask out flip flags (bits 31-29)
    const flipHorizontal = (gid & 0x80000000) !== 0;
    const flipVertical = (gid & 0x40000000) !== 0;
    const flipDiagonal = (gid & 0x20000000) !== 0;
    const baseId = gid & 0x1FFFFFFF; // Clear top 3 bits

    // Find the correct tileset
    for (let i = tilesets.length - 1; i >= 0; i--) {
        if (baseId >= tilesets[i].firstgid) {
            const localId = baseId - tilesets[i].firstgid;
            return {
                id: localId,
                flipH: flipHorizontal,
                flipV: flipVertical,
                flipD: flipDiagonal
            };
        }
    }
    console.warn(`No tileset found for GID ${gid}, returning 0`);
    return 0;
}

// Process each tile layer
json.layers.forEach(layer => {
    if (layer.type === "tilelayer" && layer.data) {
        console.log(`Processing layer: ${layer.name}`);
        layer.data = layer.data.map(gid => getTileInfo(gid));
    }
});

// Save the modified JSON
fs.writeFileSync('tileMap4_local.json', JSON.stringify(json, null, 2), 'utf8');
console.log('Converted JSON saved as tileMap4_local.json');
