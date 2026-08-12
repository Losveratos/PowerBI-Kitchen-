#!/usr/bin/env python3
"""WCAG-Kontrast-Check für das Power BI Design Framework.

Modi:
  Einzelpaar:   check_contrast.py "#1F2937" --bg "#FAFAFB"
  Palette:      check_contrast.py --palette palette.json
                  { "ink": "#1F2937", "bg": "#FAFAFB", ...,
                    "pairs": [["ink","bg"], ...] }
                  Ohne "pairs" werden alle Rollen gegen "bg" und
                  "bg-card" (falls vorhanden) geprüft.
  Grauleiter:   check_contrast.py --ladder "#1F2937" --bg "#FAFAFB"

Bewertet gegen WCAG AA: 4,5:1 (Normaltext), 3:1 (großer Text >= 18pt / UI).
Bei FAIL wird automatisch die nächstliegende bestehende Variante
(abgedunkelt bzw. aufgehellt) vorgeschlagen. Keine Abhängigkeiten.
"""
import argparse
import json
import sys

AA_NORMAL = 4.5
AA_LARGE = 3.0


def parse_hex(c: str) -> tuple[float, float, float]:
    c = c.strip().lstrip("#")
    if len(c) == 3:
        c = "".join(ch * 2 for ch in c)
    if len(c) != 6:
        raise ValueError(f"Ungültige Hex-Farbe: #{c}")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore


def to_hex(rgb) -> str:
    return "#{:02X}{:02X}{:02X}".format(*(max(0, min(255, round(v))) for v in rgb))


def rel_luminance(rgb) -> float:
    def channel(v: float) -> float:
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b) -> float:
    la, lb = rel_luminance(a), rel_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def scale(rgb, factor: float, toward_white: bool):
    """factor 0..1: 0 = Originalfarbe, 1 = Schwarz bzw. Weiß."""
    if toward_white:
        return tuple(v + (255 - v) * factor for v in rgb)
    return tuple(v * (1 - factor) for v in rgb)


def suggest_fix(fg, bg, target: float):
    """Nächstliegende Variante von fg, die das Ziel auf bg erreicht."""
    darker_bg = rel_luminance(bg) >= rel_luminance(fg)
    # fg muss vom bg weg: bei hellem bg dunkler werden, bei dunklem bg heller.
    toward_white = not darker_bg
    lo, hi = 0.0, 1.0
    if contrast(scale(fg, 1.0, toward_white), bg) < target:
        return None  # selbst Schwarz/Weiß reicht nicht (bg zu mittig)
    for _ in range(40):  # Bisektion auf den kleinsten ausreichenden Faktor
        mid = (lo + hi) / 2
        if contrast(scale(fg, mid, toward_white), bg) >= target:
            hi = mid
        else:
            lo = mid
    return to_hex(scale(fg, hi, toward_white))


def report_pair(name: str, fg_hex: str, bg_hex: str) -> bool:
    fg, bg = parse_hex(fg_hex), parse_hex(bg_hex)
    ratio = contrast(fg, bg)
    ok_normal = ratio >= AA_NORMAL
    ok_large = ratio >= AA_LARGE
    verdict = "PASS AA" if ok_normal else ("PASS nur groß/UI (>=3:1)" if ok_large else "FAIL")
    line = f"  {name:<24} {fg_hex.upper():>8} auf {bg_hex.upper():<8} → {ratio:4.2f}:1   {verdict}"
    print(line)
    if not ok_normal:
        fix = suggest_fix(fg, bg, AA_NORMAL)
        if fix:
            print(f"  {'':<24} Vorschlag für Normaltext: {fix} "
                  f"({contrast(parse_hex(fix), bg):.2f}:1)")
        else:
            print(f"  {'':<24} Kein Fix möglich — Hintergrund zu mittig, BG ändern.")
    return ok_normal


def ladder(ink_hex: str, bg_hex: str, steps: int = 5):
    ink, bg = parse_hex(ink_hex), parse_hex(bg_hex)
    print(f"Grauleiter aus {ink_hex.upper()} Richtung {bg_hex.upper()}:")
    for i in range(steps):
        f = i / (steps - 1) * 0.85  # letzte Stufe nicht ganz im BG verschwinden lassen
        c = tuple(ink[k] + (bg[k] - ink[k]) * f for k in range(3))
        hx = to_hex(c)
        ratio = contrast(parse_hex(hx), bg)
        use = ("Text" if ratio >= AA_NORMAL
               else "große Titel/UI" if ratio >= AA_LARGE
               else "nur Flächen/Linien (kein Text)")
        print(f"  Stufe {i + 1}: {hx}  ({ratio:4.2f}:1 auf BG — {use})")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("fg", nargs="?", help="Vordergrund-Hexfarbe, z. B. '#1F2937'")
    p.add_argument("--bg", default="#FFFFFF", help="Hintergrund (Default: #FFFFFF)")
    p.add_argument("--palette", help="Pfad zu palette.json")
    p.add_argument("--ladder", metavar="INK", help="Grauleiter aus dieser Farbe erzeugen")
    args = p.parse_args()

    if args.ladder:
        ladder(args.ladder, args.bg)
        return 0

    if args.palette:
        with open(args.palette, encoding="utf-8") as f:
            pal = json.load(f)
        roles = {k: v for k, v in pal.items() if k != "pairs" and isinstance(v, str)}
        pairs = pal.get("pairs")
        if not pairs:
            bgs = [b for b in ("bg", "bg-card") if b in roles]
            pairs = [[r, b] for r in roles for b in bgs
                     if r not in ("bg", "bg-card") and r != b]
        print(f"Kontrast-Report ({args.palette}):")
        all_ok = True
        for fg_role, bg_role in pairs:
            ok = report_pair(f"{fg_role} / {bg_role}", roles[fg_role], roles[bg_role])
            all_ok = all_ok and ok
        print("\nGesamt:", "alle Paare AA-konform ✓" if all_ok
              else "mindestens ein Paar unter 4,5:1 — Vorschläge oben übernehmen.")
        return 0 if all_ok else 1

    if not args.fg:
        p.error("Entweder FG-Farbe, --palette oder --ladder angeben.")
    ok = report_pair("fg / bg", args.fg, args.bg)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
