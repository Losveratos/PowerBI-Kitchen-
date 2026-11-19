#!/usr/bin/env python3
"""Baut data.js + Vorschaubilder für das LinkedIn-Karussell (carousel.html).

Aufruf:  python3 build.py <items.json> <shots-ordner>
- items.json: Inventar mit Git-Statistik (first/last commit, commits, loc, ...)
- shots-ordner: Screenshots je Projekt (<id>.png) plus index.json

Regeln:
- Enddatum = last_own_commit (ohne seitenweite Sammel-Commits wie Schriften/Navigation).
- „läuft" nur für Produkte und Werkzeuge mit eigenen Commits ab 29.10.2026,
  die mindestens 21 Tage vorher gestartet sind (Posts, Talks, Doku, Events nie).
"""
import json, os, sys
from datetime import date
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
IMG_DIR = os.path.join(HERE, 'img')
TODAY = '2026-11-19'
LIVE_KINDS = {'Power-BI-Visual', 'Skill', 'Plattform', 'Werkzeug'}
PREFER_HINT = {'chartkitchen-visual', 'pnl-visual'}   # echte Renderings statt Doku-Screenshot
W, H = 744, 500                                                    # 2× Kartenbild (372 × 250)


def fit(src, dst, crop_top=None):
    im = Image.open(src).convert('RGB')
    if crop_top:
        im = im.crop((0, 0, im.width, min(im.height, crop_top)))
    r = W / H
    if im.width / im.height > r:                    # zu breit → Mitte
        nw = int(im.height * r); x = (im.width - nw) // 2
        im = im.crop((x, 0, x + nw, im.height))
    else:                                           # zu hoch → oben anfangen
        im = im.crop((0, 0, im.width, int(im.width / r)))
    im.resize((W, H), Image.LANCZOS).save(dst, quality=84, optimize=True)


def main(items_path, shots):
    d = json.load(open(items_path))
    shot_ok = {}
    idx = os.path.join(shots, 'index.json')
    if os.path.exists(idx):
        for s in json.load(open(idx)):
            shot_ok[s['id']] = os.path.join(shots, os.path.basename(s['file']))
    os.makedirs(IMG_DIR, exist_ok=True)

    items = []
    for it in d['items']:
        last = it.get('last_own_commit') or it['last_commit']
        live = (it['kind_label'] in LIVE_KINDS and last >= '2026-10-29'
                and (date.fromisoformat(last) - date.fromisoformat(it['first_commit'])).days >= 21)
        hint = it.get('image_hint')
        hint = os.path.join(REPO, hint) if hint and not hint.endswith('.svg') else None
        shot = shot_ok.get(it['id']) or (os.path.join(shots, it['id'] + '.png') if os.path.exists(os.path.join(shots, it['id'] + '.png')) else None)
        src = (hint or shot) if it['id'] in PREFER_HINT else (shot or hint)
        own = os.path.join(HERE, 'src', it['id'] + '.png')       # eigenes Vorschaubild hat Vorrang
        if os.path.exists(own):
            src = own
        img = None
        if src and os.path.exists(src):
            fit(src, os.path.join(IMG_DIR, it['id'] + '.jpg'), crop_top=1400 if it['id'] == 'kpi-card' else None)
            img = 'img/' + it['id'] + '.jpg'
        else:
            print('kein Bild:', it['id'])
        items.append(dict(id=it['id'], title=it['title'], kind_label=it['kind_label'], short_desc=it['short_desc'],
                          first_commit=it['first_commit'], last_commit=last, commits=it['commits'],
                          loc=it['loc'], ongoing=live, img=img))

    T = d['totals']
    nf = lambda n: f'{n:,}'.replace(',', '.')
    biggest = max(items, key=lambda i: i['loc'])
    km = T['lines_added'] * 4.23 / 1e6                       # 12-pt-Zeile ≈ 4,23 mm
    bd = date.fromisoformat(T['busiest_day']['date'])
    months_de = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    best_m = max(d['months'], key=lambda m: m['commits'])

    data = dict(
        totals=dict(commits=T['commits'], loc=T['loc'], lines_added=T['lines_added']),
        months=[dict(month=m['month'], commits=m['commits'], started=m['items_started']) for m in d['months']],
        items=items,
        range=dict(start='2026-05-01', end='2026-11-30', today=TODAY),
        cover=dict(title1='Ein halbes Jahr', title2='Kitchen.',
                   strip=['chartkitchen-visual', 'rhein-story', 'pnl-visual', 'koelner-raser-story'],
                   lead=f'Seit dem 12. Mai 2026 kochen wir in der Daten-WG Knowledge Kitchen: '
                        f'Power-BI-Visuals, Visual Stories, Werkzeuge und Lernspiele. '
                        f'Alles auf einem Zeitstrahl, mit Commits und Zeilen Code.'),
        stats=dict(headline=f'{nf(T["commits"])} Commits in <em>{T["calendar_days"]} Tagen</em>',
                   chartNote=f'Stand {int(TODAY[8:])}. November 2026 · grün: stärkster Monat ({months_de[int(best_m["month"][5:]) - 1]})',
                   facts=[
                       dict(big=f'{T["busiest_day"]["commits"]} Commits', text=f'am {bd.day}. {months_de[bd.month - 1]}, dem fleißigsten Tag'),
                       dict(big=f'{km:.1f} km'.replace('.', ','), text=f'Endlospapier, wenn man alle {nf(T["lines_added"])} je geschriebenen Zeilen ausdruckt'),
                       dict(big=f'{nf(biggest["loc"])} Zeilen', text=f'im größten Projekt: {biggest["title"]}'),
                       dict(big=f'{T["commit_days"]} Tage', text=f'mit mindestens einem Commit, also an {round(100 * T["commit_days"] / T["calendar_days"])} % aller Tage'),
                   ]),
        big=[
            dict(id='chartkitchen-visual', fact='Version 1.53: 13 IBCS-inspirierte Chart-Modi, Vorlagen C01–C13, vier Sprachen.'),
            dict(id='pnl-visual', fact='Version 1.7: Mega-Table, Treiberbaum, Sankey, Bilanz und Cashflow in einem Visual.'),
            dict(id='gantt-visual', fact='Version 2.3: Projektplan mit PSP-Gliederung, kritischem Pfad und Basisplan.'),
            dict(id='mockup-kitchen', fact='Im Workshop skizzieren, als Spec exportieren, Claude Code baut die PBIP-Seite.'),
            dict(id='library', fact='Wissensgraph aus 159 Folgen: 1.124 Kernaussagen, 18.865 Verbindungen.'),
            dict(id='skills', fact='Acht Skills für Claude Code: Reports, Finance-Modell, Mockup-Umsetzung, Design.'),
        ],
        outro=dict(title1='Alles frei.', title2='Alles offen.',
                   lead='Die Power-BI-Visuals sind Open Source (ChartKitchen Apache 2.0, P&amp;L und Gantt MIT), '
                        'Stories, Werkzeuge und Spiele laufen direkt im Browser.',
                   cta=[f'<b>Ausprobieren:</b> alle {len(items)} Projekte auf der Seite',
                        '<b>Dranbleiben:</b> Daten-WG auf YouTube und Spotify',
                        '<b>Mitkochen:</b> Ideen und Feedback gern in die Kommentare']),
    )
    with open(os.path.join(HERE, 'data.js'), 'w', encoding='utf-8') as f:
        f.write('// erzeugt von build.py, nicht von Hand ändern\nwindow.DATA=' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    live = [i['id'] for i in items if i['ongoing']]
    print(f'{len(items)} Projekte, {sum(1 for i in items if i["img"])} mit Bild, läuft: {live}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
