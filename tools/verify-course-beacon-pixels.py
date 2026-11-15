"""Check matching rendered frames, not light configuration alone."""
import json
from pathlib import Path
from PIL import Image, ImageChops

root = Path('output/course-beacon/final')
results = []
for bright, dark in [('light-on', 'light-off'), ('cover-unshadowed', 'cover-shadow')]:
    a = Image.open(root / (bright + '.png')).convert('RGB')
    b = Image.open(root / (dark + '.png')).convert('RGB')
    assert a.size == b.size
    red = ImageChops.subtract(a.getchannel('R'), b.getchannel('R'))
    green = ImageChops.subtract(a.getchannel('G'), b.getchannel('G'))
    mask = ImageChops.multiply(red.point(lambda v: 255 if v > 8 else 0),
                              ImageChops.subtract(red, green).point(lambda v: 255 if v > 5 else 0))
    count = mask.histogram()[255]
    assert count > 1000, (bright, dark, count)
    results.append({'bright': bright, 'dark': dark, 'redIncreasePixels': count,
                    'peakRedDifference': red.getextrema()[1], 'size': a.size})
report = {'passed': True, 'comparisons': results}
(root / 'pixel-report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report))
