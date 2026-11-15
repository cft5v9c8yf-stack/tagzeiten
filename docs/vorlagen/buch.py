# After BUCH=1 or HEFT=1: bookmarks for the files named in buch.json, trim and bleed boxes for a file with bleed.
import json, pypdf
from pypdf.generic import RectangleObject
info = json.load(open('buch.json'))
MM = 72 / 25.4
for name, bleed in info['files']:
    w = pypdf.PdfWriter(clone_from=name)  # keeps the named destinations the links use
    for p in w.pages:
        if bleed:
            W, H = float(p.mediabox.width), float(p.mediabox.height)
            top = H - bleed * MM
            p.trimbox = RectangleObject([bleed * MM, top - 210 * MM, bleed * MM + 148 * MM, top])
            p.bleedbox = RectangleObject([0, 0, W, H])
    for title, n in info['marks']:
        w.add_outline_item(title, n - 1)
    w.add_metadata({'/Title': 'Henoch · Lesen und Hören', '/Author': 'Henoch'})
    w.page_mode = '/UseOutlines'
    w.write(name)
    print(name, len(w.pages))
