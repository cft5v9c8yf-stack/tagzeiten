# Merges the GoodNotes templates into one sorted file with bookmarks.
import sys, pypdf
G = 'goodnotes/Henoch_'
order = [('Deckblatt', [G+'Deckblatt.pdf']), ('Inhalt', ['komplett/inhalt.pdf']), ('Zum Gebrauch', ['komplett/gebrauch.pdf']),
 ('Inhaltsverzeichnis', [G+'Inhaltsverzeichnis.pdf']),
 ('Jeden Tag · Bibellese', [G+'Bibellese.pdf', G+'Bibellese_Vertiefen.pdf']),
 ('Am Sonntag · Predigtnotiz', [G+'Predigtnotiz.pdf', G+'Predigtnotiz_Mitnehmen.pdf']),
 ('Jede Woche · Reflexion', [G+'Reflexion_Woche_1.pdf', G+'Reflexion_Woche_2.pdf', G+'Reflexion_Woche_kompakt_quer.pdf']),
 ('Jeder Monat · Deckblätter', [G+f'Monat_{i:02d}_{n}.pdf' for i, n in enumerate(['Januar','Februar','Maerz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'], 1)]),
 ('Jedes Quartal', [G+'Reflexion_Quartal.pdf']),
 ('Jedes Jahr', [G+'Reflexion_Jahr_Ausblick.pdf', G+'Reflexion_Jahr_Rueckblick.pdf']),
 ('Bibelstudium', [G+f'Studie_{n}.pdf' for n in ['Abschnitt','Wort','Person','Ort','Abschrift','Stellen','Notizen','Skizze','Ertrag']]),
 ('Freie Seite', [G+'Frei.pdf'])]
sub = {'Monat': ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
       'Studie': ['Abschnitt','Wortstudie','Person','Ort','Abschrift','Stellen','Notizen','Skizze','Ertrag']}
w = pypdf.PdfWriter()
for title, files in order:
    first = len(w.pages)
    for f in files:
        w.append(f, import_outline=False)
    parent = w.add_outline_item(title, first)
    key = 'Monat' if 'Monat' in title else 'Studie' if title == 'Bibelstudium' else None
    if key:
        for k, n in enumerate(sub[key]): w.add_outline_item(n, first + k, parent=parent)
w.add_metadata({'/Title': 'Henoch · Lesen und Hören', '/Author': 'Henoch'})
w.page_mode = '/UseOutlines'
w.write(sys.argv[1]); print('pages', len(w.pages))
