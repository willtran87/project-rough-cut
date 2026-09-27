"""Verify the complete managed art inventory and prepare labeled QA sheets."""
from pathlib import Path
import json
import hashlib
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/a27/art-inventory"
OUT.mkdir(parents=True, exist_ok=True)
entries = json.loads((ROOT / "art-source/runtime-art-manifest.json").read_text())["entries"]
font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 14)
results = []
for start in range(0, len(entries), 12):
    sheet = Image.new("RGB", (2048, 1200), "#102017")
    draw = ImageDraw.Draw(sheet)
    for offset, entry in enumerate(entries[start:start+12]):
        source = ROOT / "art-source/runtime-png" / entry["source"]
        if not source.exists():
            source = ROOT / "web/assets" / entry["source"]
        runtime = ROOT / "web/assets" / entry["runtime"]
        assert hashlib.sha256(source.read_bytes()).hexdigest() == entry["sourceSha256"]
        with Image.open(source) as original, Image.open(runtime) as compressed:
            assert list(original.size) == entry["dimensions"] == list(compressed.size)
            alpha_diff = ImageChops.difference(original.convert("RGBA").getchannel("A"), compressed.convert("RGBA").getchannel("A"))
            assert alpha_diff.getbbox() is None, runtime
            thumb = compressed.convert("RGBA")
            thumb.thumbnail((496, 350))
            x, y = (offset % 4)*512, (offset // 4)*400
            for cy in range(y+38,y+396,16):
                for cx in range(x,x+512,16):
                    color = "#39483e" if ((cx-x)//16+(cy-y-38)//16)%2 else "#223229"
                    draw.rectangle((cx,cy,cx+15,cy+15),fill=color)
            sheet.paste(thumb,(x+(512-thumb.width)//2,y+40+(350-thumb.height)//2),thumb)
            label = runtime.stem.replace("rough-cut-", "")
            draw.text((x+8,y+4),label,fill="#eef3df",font=font)
            draw.text((x+8,y+21),f"{compressed.width}x{compressed.height} | exact alpha",fill="#b6dfd1",font=font)
        results.append({"file":entry["runtime"],"dimensions":entry["dimensions"],"sourceHashMatches":True,"alphaMatches":True})
    sheet.save(OUT/f"inventory-{start//12+1}.png")
(OUT/"verification.json").write_text(json.dumps({"passed":True,"count":len(results),"entries":results},indent=2))
print(f"{len(results)} runtime images preserve dimensions, source hashes and exact alpha; five review sheets saved.")
