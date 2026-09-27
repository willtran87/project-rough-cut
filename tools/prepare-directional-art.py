"""Prepare alpha cutouts and aligned sprite cells (explicitly authorized by user).

Shed: remove only border-connected neutral checkerboard; preserve enclosed art.
Joe: preserve generated alpha, align each walking pose, mirror right for left.
"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "art-source/runtime-png"
ASSETS.mkdir(parents=True, exist_ok=True)
SOURCES = ROOT / "art-source"


def keep_main_sprite(im):
    pixels = im.load()
    seen = set()
    largest = []
    for y in range(im.height):
        for x in range(im.width):
            if (x, y) in seen or pixels[x, y][3] == 0:
                continue
            component = [(x, y)]
            seen.add((x, y))
            for px, py in component:
                for nx, ny in ((px-1, py), (px+1, py), (px, py-1), (px, py+1)):
                    if 0 <= nx < im.width and 0 <= ny < im.height and (nx, ny) not in seen and pixels[nx, ny][3]:
                        seen.add((nx, ny))
                        component.append((nx, ny))
            if len(component) > len(largest):
                largest = component
    keep = set(largest)
    for x, y in seen - keep:
        pixels[x, y] = (0, 0, 0, 0)
    return im


def shed_cutout():
    im = Image.open(ROOT / "art-source/rough-cut-shed-directions-v1.png").convert("RGBA")
    width, height = im.size
    pixels = im.load()
    seen = bytearray(width * height)
    queue = deque()

    def enqueue(x, y):
        index = y * width + x
        if seen[index]:
            return
        seen[index] = 1
        r, g, b, _ = pixels[x, y]
        if min(r, g, b) >= 175 and max(r, g, b) - min(r, g, b) <= 24:
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)
    removed = 0
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        removed += 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)
    assert removed > width * height * .35, removed
    im.save(ASSETS / "rough-cut-shed-directions-v2.png", optimize=True)
    print("shed transparent exterior pixels:", removed)


def joe_walk():
    im = Image.open(SOURCES / "rough-cut-joe-walk-generated.png").convert("RGBA")
    assert im.getchannel("A").getextrema() == (0, 255)
    cell = 384
    atlas = Image.new("RGBA", (cell * 4, cell * 3))
    for row in range(3):
        source_row = 0 if row == 2 else row
        for frame in range(4):
            sprite = im.crop((frame * 362, source_row * 362, (frame + 1) * 362, (source_row + 1) * 362))
            sprite = keep_main_sprite(sprite)
            bounds = sprite.getchannel("A").getbbox()
            assert bounds
            sprite = sprite.crop(bounds)
            if row == 2:
                sprite = ImageOps.mirror(sprite)
            scale = min(352 / sprite.width, 336 / sprite.height)
            sprite = sprite.resize((round(sprite.width * scale), round(sprite.height * scale)), Image.Resampling.NEAREST)
            atlas.alpha_composite(sprite, (frame * cell + (cell - sprite.width) // 2, row * cell + 360 - sprite.height))
    atlas.save(ASSETS / "rough-cut-joe-walk-directions-v2.png", optimize=True)
    print("Joe atlas:", atlas.size, "12 aligned frames")


def cart_cutout():
    im = Image.open(SOURCES / "rough-cut-cart-directions-generated.png").convert("RGBA")
    # Open cab windows also contain the neutral checkerboard. The cart's
    # painted metal is dark; retain colored lamps and weathered highlights.
    im.putdata([(0, 0, 0, 0) if min(r, g, b) >= 185 and max(r, g, b)-min(r, g, b) <= 18
                else (r, g, b, a) for r, g, b, a in im.getdata()])
    atlas = Image.new("RGBA", (1536, 1024))
    for i, box in enumerate([(120, 0, 580, 517), (700, 0, 1500, 516),
                              (110, 504, 575, 1024), (700, 505, 1510, 1024)]):
        sprite = im.crop(box)
        sprite = keep_main_sprite(sprite)
        bounds = sprite.getchannel("A").getbbox()
        sprite = sprite.crop(bounds)
        scale = min(748/sprite.width, 492/sprite.height)
        sprite = sprite.resize((round(sprite.width*scale), round(sprite.height*scale)), Image.Resampling.NEAREST)
        atlas.alpha_composite(sprite, ((i % 2)*768+(768-sprite.width)//2, (i//2)*512+502-sprite.height))
    atlas.save(ASSETS / "rough-cut-cart-directions-v1.png", optimize=True)


if __name__ == "__main__":
    shed_cutout()
    joe_walk()
    cart_cutout()
