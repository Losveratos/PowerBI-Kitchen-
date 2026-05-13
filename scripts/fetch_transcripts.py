#!/usr/bin/env python3
"""Holt Auto-Captions (de bevorzugt, en Fallback) fuer alle Videos in videos.json.

Strategie:
  1. yt-dlp gibt unter info['automatic_captions'][lang] eine Liste von
     Untertitel-Formaten zurueck, jedes mit URL.
  2. Wir nehmen das VTT-Format und parsen es zu Plain Text:
     - Header WEBVTT weg
     - Timestamps weg
     - <c>-Tags weg
     - Dedup aufeinanderfolgende identische Zeilen (YouTube rollt Subs ueber)
  3. Ergebnis pro Video in transcripts.json als {id: {text, lang, words}}.

Cache: bestehende transcripts.json wird gelesen; Videos mit text already
present werden uebersprungen. Aufrufen mit --force erzwingt re-fetch.
"""
import io
import json
import re
import sys
import time
import urllib.request
from pathlib import Path
from yt_dlp import YoutubeDL

try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).parent.parent
VIDEOS_JSON = ROOT / "videos.json"
OUT = ROOT / "transcripts.json"

PREFERRED_LANGS = ["de", "de-DE", "en", "en-US", "en-GB"]


def fetch_caption_url(video_id: str):
    """Liefert (lang, url) fuer die beste verfuegbare VTT-Caption."""
    opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "ignoreerrors": True,
        "writesubtitles": False,
        "writeautomaticsub": False,
    }
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        with YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as ex:
        print(f"  [error] {video_id}: {ex}", file=sys.stderr)
        return None, None
    if not info:
        return None, None
    captions = info.get("automatic_captions") or {}
    # Bevorzugte Sprache zuerst probieren, sonst irgendwas, das wir haben
    for lang in PREFERRED_LANGS:
        formats = captions.get(lang) or []
        for fmt in formats:
            if fmt.get("ext") == "vtt" and fmt.get("url"):
                return lang, fmt["url"]
    for lang, formats in captions.items():
        for fmt in formats:
            if fmt.get("ext") == "vtt" and fmt.get("url"):
                return lang, fmt["url"]
    return None, None


VTT_TIMESTAMP_RX = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->")
VTT_TAG_RX = re.compile(r"<[^>]+>")
VTT_TIMING_INLINE_RX = re.compile(r"<\d{2}:\d{2}:\d{2}\.\d{3}>")


def vtt_to_text(vtt: str) -> str:
    """Wandelt VTT in Plain Text um. Dedup wiederholter Zeilen (Rolling Captions)."""
    lines = []
    for raw in vtt.splitlines():
        ln = raw.strip()
        if not ln:
            continue
        if ln.startswith("WEBVTT") or ln.startswith("Kind:") or ln.startswith("Language:") or ln.startswith("NOTE"):
            continue
        if VTT_TIMESTAMP_RX.match(ln):
            continue
        # Cue-Nummer (rein numerisch)
        if ln.isdigit():
            continue
        ln = VTT_TIMING_INLINE_RX.sub("", ln)
        ln = VTT_TAG_RX.sub("", ln)
        ln = ln.strip()
        if not ln:
            continue
        if lines and ln == lines[-1]:
            continue
        lines.append(ln)
    text = " ".join(lines)
    # Mehrfache Whitespaces zusammenfassen
    text = re.sub(r"\s+", " ", text).strip()
    return text


def download_vtt(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main():
    force = "--force" in sys.argv

    if not VIDEOS_JSON.exists():
        print("videos.json fehlt — vorher classify.py laufen lassen.", file=sys.stderr)
        sys.exit(1)
    videos = json.loads(VIDEOS_JSON.read_text(encoding="utf-8"))

    existing = {}
    if OUT.exists() and not force:
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
            print(f"[cache] {len(existing)} Transkripte bereits vorhanden")
        except Exception:
            existing = {}

    out = dict(existing)
    new = 0
    miss = 0
    for i, v in enumerate(videos, 1):
        vid = v.get("ytId") or v.get("id")
        if not vid:
            continue
        if vid in out and out[vid].get("text"):
            print(f"  [{i:3}/{len(videos)}] cache  {vid}")
            continue
        lang, url = fetch_caption_url(vid)
        if not url:
            print(f"  [{i:3}/{len(videos)}] NO-SUB {vid}")
            out[vid] = {"text": "", "lang": None, "words": 0, "missing": True}
            miss += 1
            continue
        try:
            vtt = download_vtt(url)
            text = vtt_to_text(vtt)
        except Exception as ex:
            print(f"  [{i:3}/{len(videos)}] dl-err {vid}: {ex}", file=sys.stderr)
            out[vid] = {"text": "", "lang": lang, "words": 0, "missing": True}
            miss += 1
            continue
        words = len(text.split())
        out[vid] = {"text": text, "lang": lang, "words": words}
        new += 1
        print(f"  [{i:3}/{len(videos)}] OK {lang:6} {vid}  {words:>6} words")

        # Zwischenstand alle 10 Videos sichern
        if new % 10 == 0:
            OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        # Sanftes Throttling, damit YouTube nicht zickt
        time.sleep(0.6)

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    total_words = sum(e.get("words", 0) for e in out.values())
    size_kb = OUT.stat().st_size / 1024
    print(f"\n[done] {len(out)} Videos -> {OUT.name}  ({size_kb:.1f} KB, {total_words:,} words)")
    print(f"       neu: {new}  ohne_sub: {miss}")


if __name__ == "__main__":
    main()
