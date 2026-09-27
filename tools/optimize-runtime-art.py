"""Build compact WebP runtime images from preserved PNG masters.

Run without flags to prepare/rebuild images. --activate relocates redundant
runtime PNGs into art-source/runtime-png and updates runtime asset references.
The social preview PNG stays published for existing shared links.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse
import hashlib
import json
import re
import shutil
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "web/assets"
MASTERS = ROOT / "art-source/runtime-png"
OUTPUT = ASSETS / "optimized"
CACHE_PATH = ROOT / "art-source/runtime-art-manifest.json"
CACHE = {e["source"]: e for e in json.loads(CACHE_PATH.read_text(encoding="utf-8"))["entries"]} if CACHE_PATH.exists() else {}


def encode(source):
    destination = OUTPUT / (source.stem + ".webp")
    original = Image.open(source).convert("RGBA")
    # Retain exact RGB for small pixel animation strips. Large painted assets
    # retain their authored resolution and lossless alpha at high RGB quality.
    lossless = source.name in {"joe-mower-animated-v1.png", "joe-mower-erratic-head-v1.png"}
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    cached = CACHE.get(source.name, {})
    if not destination.exists() or cached.get("sourceSha256") != source_hash:
        original.save(destination, "WEBP", quality=90, method=6, lossless=lossless, exact=True)
    decoded = Image.open(destination).convert("RGBA")
    assert decoded.size == original.size, source.name
    assert ImageChops.difference(original.getchannel("A"), decoded.getchannel("A")).getbbox() is None, source.name
    return {"source": source.name, "runtime": "optimized/" + destination.name,
            "sourceBytes": source.stat().st_size, "runtimeBytes": destination.stat().st_size,
            "dimensions": list(original.size), "losslessRGB": lossless, "exactAlpha": True,
            "sourceSha256": source_hash}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--activate", action="store_true")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = {p.name: p for p in MASTERS.glob("*.png")}
    sources.update({p.name: p for p in ASSETS.glob("*.png")})
    with ThreadPoolExecutor(max_workers=3) as executor:
        entries = sorted(executor.map(encode, sources.values()), key=lambda row: row["source"])
    manifest = {"entries": entries, "sourceBytes": sum(e["sourceBytes"] for e in entries),
                "runtimeBytes": sum(e["runtimeBytes"] for e in entries)}
    report = ROOT / "art-source/runtime-art-manifest.json"
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if args.activate:
        MASTERS.mkdir(parents=True, exist_ok=True)
        for name, source in sources.items():
            if source.parent == ASSETS and name != "rough-cut-opening.png":
                target = MASTERS / name
                if target.exists():
                    if target.read_bytes() != source.read_bytes():
                        raise RuntimeError(f"Conflicting master: {target}")
                    source.unlink()
                else:
                    shutil.move(str(source), str(target))
        game = ROOT / "web/game.js"
        text = game.read_text(encoding="utf-8")
        text = re.sub(r'(\./assets/)([^/"\']+)\.png', r'\1optimized/\2.webp', text)
        game.write_text(text, encoding="utf-8")
        index = ROOT / "web/index.html"
        text = index.read_text(encoding="utf-8")
        text = text.replace('href="./assets/rough-cut-opening.png"', 'href="./assets/optimized/rough-cut-opening.webp"')
        text = text.replace('href="./assets/rough-cut-grass-curtain.png"', 'href="./assets/optimized/rough-cut-grass-curtain.webp"')
        index.write_text(text, encoding="utf-8")
    print(json.dumps({"images": len(entries), "sourceMB": round(manifest["sourceBytes"] / 1e6, 2),
                      "runtimeMB": round(manifest["runtimeBytes"] / 1e6, 2), "activated": args.activate}))


if __name__ == "__main__":
    main()
