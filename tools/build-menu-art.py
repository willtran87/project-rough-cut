"""Produce bounded-size menu derivatives of existing chapter illustrations."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'web/assets'
out = root / 'menu'
out.mkdir(exist_ok=True)
sources = {
    'night-order': 'level-one-opening/04-gate-closed.webp',
    'back-nine': 'back-nine-opening/02-one-cart-side-profile.webp',
    'under-green': 'under-green-opening/01-below-the-fairway.webp',
    'final-cut': 'final-cut-story/01-final-review.webp',
}
for name, source in sources.items():
    original = Image.open(root / 'optimized' / source).convert('RGB')
    for suffix, width, quality in [('scene', 1440, 80), ('thumb', 480, 78)]:
        im = original.copy()
        im.thumbnail((width, width), Image.Resampling.LANCZOS)
        im.save(out / f'{name}-{suffix}.webp', quality=quality, method=6)

# Small, sharp pixel lettering, rendered once by the browser. No font download.
glyphs = {
 'R':['11110','10001','10001','11110','10100','10010','10001'],
 'O':['01110','10001','10001','10001','10001','10001','01110'],
 'U':['10001','10001','10001','10001','10001','10001','01110'],
 'G':['01111','10000','10000','10111','10001','10001','01110'],
 'H':['10001','10001','10001','11111','10001','10001','10001'],
 'C':['01111','10000','10000','10000','10000','10000','01111'],
 'T':['11111','00100','00100','00100','00100','00100','00100'],
}
parts=[]
x=1
for letter in 'ROUGH CUT':
    if letter == ' ':
        x+=3
        continue
    for y,row in enumerate(glyphs[letter]):
        for col,bit in enumerate(row):
            if bit=='1': parts.append(f'M{x+col} {y+1}h1v1h-1z')
    x+=6
path=''.join(parts)
(out/'rough-cut.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x} 11" shape-rendering="crispEdges"><path fill="#604d31" transform="translate(0 1)" d="{path}"/><path fill="#efd59c" d="{path}"/><path fill="#a58a56" d="M1 10h{x-2}v1H1z"/><path fill="#12231f" d="M15 10h2v1h-2zM36 10h3v1h-3z"/></svg>')
