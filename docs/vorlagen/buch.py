# After BUCH=1: bookmarks for both A5 files, trim and bleed boxes for the file with bleed.
import json, pypdf
from pypdf.generic import RectangleObject
info = json.load(open('buch.json'))
MM = 72 / 25.4
for name, bleed in [('Henoch_Notizbuch_2027_A5.pdf', 0), ('Henoch_Notizbuch_2027_A5_Beschnitt.pdf', 3)]:
    r = pypdf.PdfReader(name); w = pypdf.PdfWriter()
    for p in r.pages:
        if bleed:
            W, H = float(p.mediabox.width), float(p.mediabox.height)
            top = H - bleed * MM
            p.trimbox = RectangleObject([bleed * MM, top - 210 * MM, bleed * MM + 148 * MM, top])
            p.bleedbox = RectangleObject([0, 0, W, H])
        w.add_page(p)
    for title, n in info['marks']:
        w.add_outline_item(title, n - 1)
    w.add_metadata({'/Title': 'Henoch · Lesen und Hören 2027', '/Author': 'Henoch'})
    w.write(name)
    print(name, len(w.pages))
