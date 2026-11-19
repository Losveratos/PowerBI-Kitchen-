#!/usr/bin/env python3
"""Carousel data inventory for the Daten-WG Knowledge Kitchen repo.

Reads git history of HEAD (read-only), maps every file path to at most one item
(longest matching path pattern wins), and computes per item:
first/last commit (author date), commits, current LOC, lines added; plus totals.

Usage:  python3 -I stats.py [repo] [out.json]
Item definitions (paths, titles, texts) live in items_def.py next to this file.
"""
import json, os, re, subprocess, sys, collections, datetime, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1] if len(sys.argv) > 1 else '/home/user/PowerBI-Kitchen-'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'items.json')
TODAY = datetime.date(2026, 11, 19)
ONGOING_FROM = datetime.date(2026, 10, 29)

spec = importlib.util.spec_from_file_location('items_def', os.path.join(HERE, 'items_def.py'))
D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)
ITEMS = D.ITEMS

def git(*a):
    return subprocess.run(['git', '-C', REPO, *a], check=True, capture_output=True).stdout

# ---------------------------------------------------------------- path -> item
patterns = []  # (pattern, item_id)
for it in ITEMS:
    for p in it['paths']:
        patterns.append((p, it['id']))
for p in getattr(D, 'UNATTRIBUTED', []):
    patterns.append((p, None))
seen = collections.Counter(p for p, _ in patterns)
dups = [p for p, c in seen.items() if c > 1]
assert not dups, f'pattern assigned twice: {dups}'

def match_len(pat, path):
    if pat.endswith('/'):
        return len(pat) if path.startswith(pat) else -1
    if pat.endswith('*'):
        return len(pat) - 1 if path.startswith(pat[:-1]) else -1
    return len(pat) + 1000 if path == pat else -1  # exact file beats any prefix

def item_of(path):
    best, bid = -1, None
    for pat, iid in patterns:
        l = match_len(pat, path)
        if l > best:
            best, bid = l, iid
    return bid

# ---------------------------------------------------------------- LOC exclusions
TEXT_EXT = {'html', 'htm', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'css', 'less', 'scss', 'py', 'ps1', 'sh',
            'json', 'md', 'tmdl', 'yml', 'yaml', 'toml', 'ipynb', 'resjson', 'dax',
            'pbir', 'pbism', 'pbip'}
EXCL_DIR_PARTS = {'node_modules', 'dist', '.tmp', 'build', 'vendor', 'fixtures', 'golden', 'data', 'demoData'}
EXCL_PREFIX = {
    'assets/vega/': 'Vendor-Bibliothek (Vega)',
    'assets/js/vendor/': 'Vendor-Bibliothek',
    'cert-export/': 'Kopie von ibcsInspiredChartDeck (AppSource-Sync)',
    '.claude/skills/fabscan/scripts/fabscan/': 'Kopie des fabscan-Pakets im Skill',
    'wissensgraph/thema/': 'generierte Themenseiten',
    'wissensgraph/library/': 'generierte Library-Dateien (md/json)',
}
EXCL_FILE = {
    'index.html': 'Sync-Kopie von daten_wg_learn_buckets.html (build_html.py)',
    'transcripts.json': 'Daten (Transkripte)',
    'videos.json': 'Daten (Video-Metadaten)',
    'wohlstandsatlas/atlas-data.js': 'generierte Karten- und Datendatei',
    'koelner-raser-story.html': 'generiert aus koeln-raser/story_template.html',
    'koelner-raser-story-v1.html': 'generierter Versions-Snapshot',
    'koelner-raser-story-v2.html': 'generierter Versions-Snapshot',
    'zwei-heimaten.html': 'generiert aus wohlstand-story/story_template.html',
    'pnl-treiberbaum-standalone.html': 'generierte Standalone-Datei (>1 MB, eingebettet)',
    'dataKitchenGantt/test/gantt.js': 'kompilierter Test-Harness (aus src/gantt.ts)',
    'dataKitchenGantt/test/datum.js': 'kompilierter Test-Harness (aus src/datum.ts)',
    'sessions/visual-standards-rechner-reviews/agg.json': 'Auswertungsdaten',
    'sessions/visual-standards-rechner-reviews/p1.json': 'Auswertungsdaten',
    'sessions/visual-standards-rechner-reviews/p2.json': 'Auswertungsdaten',
    'sessions/visual-standards-rechner-reviews/p3.json': 'Auswertungsdaten',
    'sessions/visual-standards-rechner-reviews/p4.json': 'Auswertungsdaten',
    'sessions/visual-standards-rechner-reviews/p5.json': 'Auswertungsdaten',
}
# >1 MB only because of embedded images, but hand-written: still counted
SIZE_OK = {'sessions/how-i-started-to-build-custom-visuals.html'}
LOCKFILES = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'}
MB = 1024 * 1024

def exclusion(path, size=None):
    """Return a short reason string if the file must not count, else None."""
    base = path.rsplit('/', 1)[-1]
    ext = base.rsplit('.', 1)[-1].lower() if '.' in base else ''
    if ext not in TEXT_EXT:
        return 'kein Quelltext (Binär/Bild/CSV/TXT/...)'
    if base in LOCKFILES:
        return 'Lockfile'
    if base.endswith('.min.js') or base.endswith('.min.css'):
        return 'minifiziert'
    if path in EXCL_FILE:
        return EXCL_FILE[path]
    for pre, why in EXCL_PREFIX.items():
        if path.startswith(pre):
            return why
    parts = path.split('/')[:-1]
    for p in parts:
        if p in EXCL_DIR_PARTS:
            return {'data': 'Datenordner', 'demoData': 'Demo-Daten', 'fixtures': 'Test-Fixtures (Daten)',
                    'golden': 'generierte Golden-Files', 'dist': 'Build-Output', 'vendor': 'Vendor'}.get(p, 'Build/Vendor-Ordner')
    if path.startswith('md/') and path != 'md/README.md':
        return 'generierte Markdown-Spiegel (scripts/build_md.py)'
    if size is not None and size > MB and path not in SIZE_OK:
        return 'Datei > 1 MB (generiert/eingebettet)'
    return None

def count_lines(abspath):
    with open(abspath, 'rb') as f:
        b = f.read()
    if not b:
        return 0
    n = b.count(b'\n')
    return n if b.endswith(b'\n') else n + 1

# ---------------------------------------------------------------- current files
head = git('rev-parse', '--short', 'HEAD').decode().strip()
tracked = [p for p in git('ls-files', '-z').decode().split('\0') if p]
loc = collections.Counter()
loc_excl = collections.defaultdict(collections.Counter)  # item -> reason -> files
loc_excl_lines = collections.defaultdict(collections.Counter)
total_loc = 0
unattributed = []
files_per_item = collections.Counter()
for p in tracked:
    ap = os.path.join(REPO, p)
    if not os.path.isfile(ap):
        continue
    iid = item_of(p)
    if iid is None:
        unattributed.append(p)
    files_per_item[iid] += 1
    why = exclusion(p, os.path.getsize(ap))
    if why:
        loc_excl[iid][why] += 1
        continue
    n = count_lines(ap)
    loc[iid] += n
    total_loc += n

# ---------------------------------------------------------------- history
raw = git('log', 'HEAD', '-z', '--numstat', '-M', '--date=short',
          '--format=%x01%H %ad %P')
commits = []  # (hash, date, is_merge, [(added, path_new, path_old)])
for chunk in raw.split(b'\x01')[1:]:
    head_line, _, rest = chunk.partition(b'\n')
    h, d, *parents = head_line.decode().split(' ')
    files = []
    toks = rest.split(b'\0')
    i = 0
    while i < len(toks):
        t = toks[i].strip(b'\n')
        if not t:
            i += 1; continue
        cols = t.split(b'\t')
        if len(cols) == 3 and cols[2] == b'':   # rename: path pair follows
            old = toks[i + 1].decode(); new = toks[i + 2].decode(); i += 3
        elif len(cols) == 3:
            old = new = cols[2].decode(); i += 1
        else:
            i += 1; continue
        a = None if cols[0] == b'-' else int(cols[0])
        files.append((a, new, old))
    commits.append((h, d, len([x for x in parents if x]) > 1, files))

all_dates = [c[1] for c in commits]
item_commits = collections.defaultdict(set)
item_dates = collections.defaultdict(list)
item_added = collections.Counter()
total_added = 0
commit_items = {}
for h, d, is_merge, files in commits:
    touched = set()
    for a, new, old in files:
        iids = {item_of(new), item_of(old)}
        touched |= iids
        if a is None:
            continue
        cur = os.path.join(REPO, new)
        size = os.path.getsize(cur) if os.path.isfile(cur) else None
        if exclusion(new, size):
            continue
        total_added += a
        item_added[item_of(new)] += a
    commit_items[h] = (d, {x for x in touched if x is not None})
    for iid in touched:
        if iid is None:
            continue
        if h not in item_commits[iid]:
            item_commits[iid].add(h)
            item_dates[iid].append(d)

# site-wide sweep commits (fonts self-hosting, nav, md export ...) touch many items at once
SWEEP_MIN_ITEMS = 12
sweeps = {h for h, (d, its) in commit_items.items() if len(its) >= SWEEP_MIN_ITEMS}
item_own_dates = collections.defaultdict(list)
for h, (d, its) in commit_items.items():
    if h in sweeps:
        continue
    for iid in its:
        item_own_dates[iid].append(d)

# ---------------------------------------------------------------- assemble
def dd(s):
    return datetime.date.fromisoformat(s)

items_out = []
for it in ITEMS:
    iid = it['id']
    ds = sorted(item_dates[iid])
    first, last = (ds[0], ds[-1]) if ds else (None, None)
    ongoing = bool(ds) and dd(last) >= ONGOING_FROM and (dd(last) - dd(first)).days >= 21
    excl = loc_excl[iid]
    note_parts = [f'{n}× {why}' for why, n in sorted(excl.items(), key=lambda x: -x[1])]
    if it.get('loc_note_extra'):
        note_parts.insert(0, it['loc_note_extra'])
    items_out.append({
        'id': iid,
        'title': it['title'],
        'kind_label': it['kind_label'],
        'short_desc': it['short_desc'],
        'url': it.get('url'),
        'catalog_date': it.get('catalog_date'),
        'first_commit': first,
        'last_commit': last,
        'commits': len(item_commits[iid]),
        'commits_own': len(item_own_dates[iid]),
        'first_own_commit': min(item_own_dates[iid]) if item_own_dates[iid] else None,
        'last_own_commit': max(item_own_dates[iid]) if item_own_dates[iid] else None,
        'loc': loc[iid],
        'lines_added': item_added[iid],
        'ongoing': ongoing,
        'paths': it['paths'],
        'loc_note': ('Nicht gezählt: ' + '; '.join(note_parts)) if note_parts else 'alles gezählt',
        'image_hint': it.get('image_hint'),
        'tracked_files': files_per_item[iid],
    })
    assert len(it['short_desc']) <= 95, (iid, len(it['short_desc']))
items_out.sort(key=lambda x: (x['first_commit'] or '9999', x['id']))

day_counts = collections.Counter(all_dates)
busiest = max(day_counts.items(), key=lambda kv: (kv[1], kv[0]))
months = []
for m in ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']:
    months.append({
        'month': m,
        'commits': sum(1 for d in all_dates if d.startswith(m)),
        'items_started': sum(1 for x in items_out if (x['first_commit'] or '').startswith(m)),
        'items_started_ids': [x['id'] for x in items_out if (x['first_commit'] or '').startswith(m)],
    })

totals = {
    'head': head,
    'commits': len(commits),
    'commits_non_merge': sum(1 for c in commits if not c[2]),
    'first_commit': min(all_dates),
    'last_commit': max(all_dates),
    'loc': total_loc,
    'lines_added': total_added,
    'items': len(items_out),
    'commit_days': len(day_counts),
    'calendar_days': (dd(max(all_dates)) - dd(min(all_dates))).days + 1,
    'busiest_day': {'date': busiest[0], 'commits': busiest[1]},
    'tracked_files': len(tracked),
    'sweep_commits': sorted(({'hash': h[:7], 'date': commit_items[h][0], 'items': len(commit_items[h][1])}
                             for h in sweeps), key=lambda x: x['date']),
    'note_own': f'commits_own/first_own_commit/last_own_commit ignorieren Sammel-Commits, die >= {SWEEP_MIN_ITEMS} Items '
                'gleichzeitig anfassen (Schriften selbst hosten, Navigation, Markdown-Export ...).',
    'loc_in_items': sum(x['loc'] for x in items_out),
    'loc_unattributed': loc[None],
    'unattributed_paths': sorted({p if not p.startswith('assets/fonts/') else 'assets/fonts/' for p in unattributed}),
    'loc_rules': 'Zeilen in Quelltext-Dateien (' + ', '.join(sorted(TEXT_EXT)) + '); ohne node_modules/dist/build/vendor, *.min.*, Lockfiles, '
                 'Datenordner (data/, demoData/, Test-Fixtures, Golden-Files), Dateien > 1 MB, generierte Dateien '
                 '(md/-Spiegel, wissensgraph/thema+library, aus Templates gebaute Story-HTMLs, index.html-Sync-Kopie) '
                 'und Kopien (cert-export/, fabscan-Kopie im Skill). lines_added = Summe der hinzugefügten Zeilen aus '
                 'git log --numstat -M über HEAD mit denselben Regeln (Merges ohne eigene numstat).',
}
json.dump({'totals': totals, 'months': months, 'items': items_out},
          open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'wrote {OUT}: {len(items_out)} items, HEAD {head}')
