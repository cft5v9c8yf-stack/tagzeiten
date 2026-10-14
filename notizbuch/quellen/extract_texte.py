#!/usr/bin/env python3
"""Reads the verified Sunday texts out of the app repo (branch claude/focused-pascal-sol6ng) into JSON.

Nothing is retyped: the texts stay exactly as the app has them (public domain, rule 12).

Usage:
    git show origin/claude/focused-pascal-sol6ng:src/content/lections.ts > /tmp/lections.ts
    git show origin/claude/focused-pascal-sol6ng:src/content/weeklyVerses.ts > /tmp/weeklyVerses.ts
    git show origin/claude/focused-pascal-sol6ng:data/advent-lektionen.json > advent-lektionen.json
    python3 extract_texte.py /tmp/lections.ts /tmp/weeklyVerses.ts

Writes loehe-epistel.json and wochensprueche.json next to this file.

Note: verses with several excerpts (e.g. advent3, advent4, misericordias) are joined with a plain space here.
The app composes them itself; use the app's logic before printing those.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent


def js_strings(block):
    """Yield the string literals ('...' or `...`) of a JS array body, unescaping \\' and \\\\."""
    i, n = 0, len(block)
    while i < n:
        ch = block[i]
        if ch in "'`":
            quote, j, buf = ch, i + 1, []
            while j < n and block[j] != quote:
                if block[j] == "\\" and j + 1 < n:
                    buf.append(block[j + 1])
                    j += 2
                else:
                    buf.append(block[j])
                    j += 1
            yield "".join(buf)
            i = j + 1
        else:
            i += 1


def loehe(path):
    t = pathlib.Path(path).read_text(encoding="utf-8")
    consts = dict(re.findall(r"const (\w+) =\s*\n?\s*'(.*?)';", t, re.S))
    seg = t[t.index("export const EPISTLE_LECTIONS"):t.index("export interface FeastLection")]
    out = {}
    for m in re.finditer(r"\n  (\w+): \{\n(.*?)\n  \},", seg, re.S):
        key, body = m.group(1), m.group(2)
        field = lambda f: (re.search(f + r": ['`](.*?)['`],\n", body, re.S) or [None, ""])[1]
        src = field("source")
        for name, val in consts.items():
            src = src.replace("${" + name + "}", val)
        paras = re.search(r"paragraphs: \[(.*?)\n    \],", body, re.S)
        out[key] = {"ref": field("ref"), "titel": field("title"), "quelle": src,
                    "absaetze": list(js_strings(paras.group(1))) if paras else []}
    return out


def verses(path):
    t = pathlib.Path(path).read_text(encoding="utf-8")
    seg = t[t.index("export const WEEKLY_VERSES"):t.index("/** Feasts within a week")]
    out = {}
    for m in re.finditer(r"\n  (\w+): v\(", seg):
        i, items = m.end(), []
        while seg[i] != ")":  # string literals up to the closing parenthesis of v(...)
            if seg[i] in "'`\"":
                quote, j, buf = seg[i], i + 1, []
                while seg[j] != quote:
                    if seg[j] == "\\":
                        buf.append(seg[j + 1])
                        j += 2
                    else:
                        buf.append(seg[j])
                        j += 1
                items.append("".join(buf))
                i = j + 1
            else:
                i += 1
        ref, parts = items[0], items[2:]
        text = " ".join(x.strip() for x in parts)
        text = text[0].upper() + text[1:]
        if text[-1] not in ".!?":
            text += "."
        out[m.group(1)] = {"ref": ref, "text": text}
    return out


if __name__ == "__main__":
    l, w = loehe(sys.argv[1]), verses(sys.argv[2])
    (HERE / "loehe-epistel.json").write_text(json.dumps(l, ensure_ascii=False, indent=2), encoding="utf-8")
    (HERE / "wochensprueche.json").write_text(json.dumps(w, ensure_ascii=False, indent=2), encoding="utf-8")
    print(len(l), "Löhe-Betrachtungen,", len(w), "Wochensprüche")
