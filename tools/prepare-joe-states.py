"""Align the generated state poses without stretching individual silhouettes."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / "art-source/joe-states-generated.png").convert("RGBA")
assert source.size == (1448, 1086)
assert source.getchannel("A").getextrema() == (0, 255)
atlas = Image.new("RGBA", (1536, 1152))
for row in range(3):
    sprites = []
    for column in range(4):
        sprite = source.crop((column*362, row*362, (column+1)*362, (row+1)*362))
        sprites.append(sprite.crop(sprite.getchannel("A").getbbox()))
    # One scale per view preserves listening versus leaning posture height.
    scale = min(352/max(s.width for s in sprites), 336/max(s.height for s in sprites))
    for column, sprite in enumerate(sprites):
        sprite = sprite.resize((round(sprite.width*scale), round(sprite.height*scale)), Image.Resampling.LANCZOS)
        atlas.alpha_composite(sprite, (column*384+(384-sprite.width)//2, row*384+360-sprite.height))
destination = root / "art-source/runtime-png/rough-cut-joe-state-directions-v1.png"
atlas.save(destination, optimize=True)
print(destination)
