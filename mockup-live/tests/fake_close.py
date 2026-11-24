#!/usr/bin/env python3
"""Attrappe fürs Schließen von Power BI Desktop (live_runner.py --close-cmd).

Aufruf: fake_close <pid>. Passt die pid zur verbundenen Instanz in $FAKE_BRIDGE_CONFIG,
gilt Desktop danach als geschlossen (mode not_connected); sonst Exit 1. Jeder Aufruf
landet im Log der Bridge-Attrappe als ["_close", pid]. Ein echter Prozess wird nie
angefasst.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fake_bridge as FB  # noqa: E402


def main(argv) -> int:
    cfg = FB.config()
    FB.log_call(cfg, ["_close"] + list(argv))
    if not argv:
        print("pid fehlt", file=sys.stderr)
        return 2
    if cfg.get("closeFail"):
        print("Zugriff verweigert (Test)", file=sys.stderr)
        return 1
    if cfg.get("mode") != "connected" or str(cfg.get("pid") or 4242) != str(argv[0]):
        print("keine Desktop-Instanz mit pid %s" % argv[0], file=sys.stderr)
        return 1
    cfg = dict(cfg, mode="not_connected", closed=int(cfg.get("closed") or 0) + 1)
    FB.save_config(cfg)
    print("geschlossen: %s" % argv[0])
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
