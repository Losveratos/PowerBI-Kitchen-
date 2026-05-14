#!/usr/bin/env python3
"""Holt alle Videos vom Daten-WG-Kanal mit yt-dlp und schreibt videos_raw.json.

Strategie: Erst flach (alle IDs), dann pro Video die volle Beschreibung.
yt-dlp.extract_info auf den Channel direkt liefert zwar volle Infos,
ist aber bei 100+ Videos sehr langsam — daher: flat + per-ID detail.
"""
import io
import json
import sys
import time
from pathlib import Path
from yt_dlp import YoutubeDL

# Windows console hat oft cp1252 — wir wollen UTF-8 fuer Logs
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass


def safe(s):
    """Reduziert einen String auf ASCII, um Console-Encoding-Crashes zu vermeiden."""
    if s is None:
        return ""
    return str(s).encode("ascii", "replace").decode("ascii")

CHANNEL_BASE = "https://www.youtube.com/@Daten-WG"
CHANNEL_TABS = ["videos", "streams", "shorts"]
ROOT = Path(__file__).parent.parent
OUT_RAW = ROOT / "videos_raw.json"
OUT_FLAT = ROOT / "videos_flat.json"
EXTRA_IDS = ROOT / "extra_video_ids.json"  # optionale manuelle Liste externer Videos


def _fetch_tab(tab: str) -> list:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "skip_download": True,
        "ignoreerrors": True,
    }
    url = f"{CHANNEL_BASE}/{tab}"
    try:
        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as ex:
        print(f"  [tab {tab}] error: {ex}", file=sys.stderr)
        return []
    entries = (info or {}).get("entries") or []
    out = []
    for e in entries:
        if not e or not e.get("id"):
            continue
        out.append({
            "id": e.get("id"),
            "title": e.get("title"),
            "duration": e.get("duration"),
            "url": e.get("url"),
            "tab": tab,
        })
    print(f"  [tab {tab}] {len(out)} Eintraege")
    return out


def _load_extra_ids() -> list:
    """Optionale Liste externer Video-IDs (z. B. aus anderen Kanaelen)."""
    if not EXTRA_IDS.exists():
        return []
    try:
        ids = json.loads(EXTRA_IDS.read_text(encoding="utf-8"))
    except Exception as ex:
        print(f"  [extras] error reading {EXTRA_IDS.name}: {ex}", file=sys.stderr)
        return []
    if isinstance(ids, list):
        return [str(i).strip() for i in ids if i]
    return []


def fetch_flat():
    """Liefert die deduplizierte Liste aller Video-IDs aus /videos, /streams, /shorts + extras."""
    seen = {}
    for tab in CHANNEL_TABS:
        for v in _fetch_tab(tab):
            vid = v["id"]
            if vid not in seen:
                seen[vid] = v
    # Manuelle Zusatz-IDs als pseudo-tab "extra" mergen
    extras = _load_extra_ids()
    for vid in extras:
        if vid not in seen:
            seen[vid] = {"id": vid, "title": None, "duration": None, "url": None, "tab": "extra"}
    if extras:
        print(f"  [tab extra] {len(extras)} manuelle Eintraege aus {EXTRA_IDS.name}")
    flat = list(seen.values())
    OUT_FLAT.write_text(json.dumps(flat, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[flat] {len(flat)} unique Videos ueber alle Tabs -> {OUT_FLAT.name}")
    return flat


def fetch_detail(video_id: str, retries: int = 2):
    """Holt volle Metadaten für ein einzelnes Video."""
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "ignoreerrors": True,
    }
    url = f"https://www.youtube.com/watch?v={video_id}"
    for attempt in range(retries + 1):
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
            if info:
                return info
        except Exception as ex:
            print(f"  [retry {attempt+1}] {video_id}: {ex}", file=sys.stderr)
            time.sleep(2)
    return None


def main():
    flat = fetch_flat()
    if not flat:
        print("Keine Videos gefunden — yt-dlp gibt nichts zurück.", file=sys.stderr)
        sys.exit(1)

    # Falls schon raw-data existiert: nur neue holen
    existing = {}
    if OUT_RAW.exists():
        try:
            prev = json.loads(OUT_RAW.read_text(encoding="utf-8"))
            existing = {v["id"]: v for v in prev if v.get("id")}
            print(f"[cache] {len(existing)} Videos bereits im Cache")
        except Exception:
            pass

    detailed = []
    for i, v in enumerate(flat, 1):
        vid = v["id"]
        if vid in existing and existing[vid].get("description") is not None:
            detailed.append(existing[vid])
            print(f"  [{i}/{len(flat)}] cache: {vid}")
            continue
        print(f"  [{i}/{len(flat)}] fetch: {vid} :: {safe(v.get('title',''))[:60]}")
        info = fetch_detail(vid)
        if not info:
            # Fallback: minimal Eintrag
            detailed.append({
                "id": vid,
                "title": v.get("title"),
                "duration": v.get("duration"),
                "description": "",
                "upload_date": None,
                "chapters": [],
                "tags": [],
            })
            continue
        detailed.append({
            "id": info.get("id"),
            "title": info.get("title"),
            "duration": info.get("duration"),
            "upload_date": info.get("upload_date"),
            "description": info.get("description") or "",
            "chapters": info.get("chapters") or [],
            "tags": info.get("tags") or [],
            "channel": info.get("channel"),
            "view_count": info.get("view_count"),
        })
        # Zwischenstand sichern, falls Abbruch
        if i % 10 == 0:
            OUT_RAW.write_text(json.dumps(detailed, ensure_ascii=False, indent=2), encoding="utf-8")

    OUT_RAW.write_text(json.dumps(detailed, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[done] {len(detailed)} Videos mit Details -> {OUT_RAW.name}")


if __name__ == "__main__":
    main()
