"""Create local QA contact sheets from browser captures; originals stay intact."""
from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "output/a-grade-closure")
CAPTURES = AUDIT / "acceptance"
LOOP = AUDIT / "core-loop" if len(sys.argv) > 1 else ROOT / "output/core-loop-2026-09-11"
FONT = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 20)
zones = ["tee", "audit", "water", "clubhouse", "maintenance", "dead-green", "range", "exits"]
for batch in range(2):
    sheet = Image.new("RGB", (2560, 1696), "#06150e")
    draw = ImageDraw.Draw(sheet)
    for row, zone in enumerate(zones[batch*4:batch*4+4]):
        for column, view in enumerate(["north", "east", "south", "west"]):
            im = Image.open(CAPTURES / f"{zone}-{view}.png").convert("RGB")
            im.thumbnail((640, 400))
            x, y = column*640, row*424
            sheet.paste(im, (x, y+24))
            draw.text((x+8, y+2), f"{zone.upper()} / {view.upper()}", fill="#e9edd7", font=FONT)
    sheet.save(CAPTURES / f"zone-review-{batch+1}.png")

# Diagnostic transforms only. They are approximate readability checks,
# not a substitute for evaluation by players with color-vision differences.
source = Image.open(CAPTURES / "opening-1280.png").convert("RGB")
ImageOps.grayscale(source).save(CAPTURES / "opening-grayscale.png")
for name, matrix in {
    "protan": (.567,.433,0,0, .558,.442,0,0, 0,.242,.758,0),
    "deutan": (.625,.375,0,0, .7,.3,0,0, 0,.3,.7,0),
}.items():
    source.convert("RGB", matrix).save(CAPTURES / f"opening-{name}.png")
print("Created two zone sheets and three readability transforms.")

# Broader critical-state diagnostics: gameplay, interaction, filing and menus.
critical = {
    "chase": CAPTURES / "chase-1280.png",
    "station": LOOP / "station-ready-1280.png",
    "cover-hold": LOOP / "cover-hold-1280.png",
    "filing": LOOP / "shed-filing-1280.png",
    "menu": AUDIT / "ui/menu-keyboard-1280.png",
    "settings": AUDIT / "ui/settings-keyboard-1280.png",
    "defeat": AUDIT / "ui/defeat-keyboard-1280.png",
    "victory": AUDIT / "ui/victory-keyboard-1280.png",
}
diagnostics = AUDIT / "diagnostics"
diagnostics.mkdir(parents=True, exist_ok=True)
matrices = {
    "protan": (.567,.433,0,0, .558,.442,0,0, 0,.242,.758,0),
    "deutan": (.625,.375,0,0, .7,.3,0,0, 0,.3,.7,0),
}
for label, filename in critical.items():
    source = Image.open(filename).convert("RGB")
    variants = [source, ImageOps.grayscale(source).convert("RGB")]
    variants += [source.convert("RGB", matrix) for matrix in matrices.values()]
    sheet = Image.new("RGB", (2560, 1464), "#06150e")
    draw = ImageDraw.Draw(sheet)
    for i, (name, im) in enumerate(zip(["original", "grayscale", *matrices], variants)):
        im.thumbnail((1280,720))
        x,y=(i%2)*1280,(i//2)*732
        sheet.paste(im,(x,y+12))
        draw.text((x+8,y),f"{label}: {name}",font=FONT,fill="#e9edd7")
    sheet.save(diagnostics/f"{label}.png")
print("Created eight critical-state diagnostic sheets.")
