"""Selbstenthaltenden Skill-Ordner bauen: SKILL.md + run.py + eingebettetes fabscan.

Layout:
  fabscan/
    SKILL.md
    run.py               startet fabscan aus scripts/
    scripts/fabscan/*.py
"""
from __future__ import annotations

import os
import shutil
import zipfile

PKG = os.path.dirname(os.path.abspath(__file__))

RUN_PY = '''#!/usr/bin/env python3
"""Startet fabscan aus diesem Skill-Ordner (keine Installation nötig)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts"))
from fabscan.cli import main  # noqa: E402

sys.exit(main())
'''


def _files():
    yield "SKILL.md", os.path.join(PKG, "skilldata", "SKILL.md")
    for fn in sorted(os.listdir(PKG)):
        if fn.endswith(".py"):
            yield f"scripts/fabscan/{fn}", os.path.join(PKG, fn)
    yield "scripts/fabscan/skilldata/SKILL.md", os.path.join(PKG, "skilldata", "SKILL.md")


def install(target: str) -> str:
    """Schreibt den Skill-Ordner nach target (vorhandene fabscan-Dateien werden ersetzt)."""
    scripts = os.path.join(target, "scripts")
    if os.path.isdir(scripts):
        shutil.rmtree(scripts)
    os.makedirs(target, exist_ok=True)
    for rel, src in _files():
        dst = os.path.join(target, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
    with open(os.path.join(target, "run.py"), "w", encoding="utf-8") as fh:
        fh.write(RUN_PY)
    return target


def write_zip(path: str) -> str:
    """ZIP mit Ordner fabscan/ an der Wurzel, wie claude.ai es zum Hochladen erwartet."""
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        for rel, src in _files():
            z.write(src, f"fabscan/{rel}")
        z.writestr("fabscan/run.py", RUN_PY)
    return path
