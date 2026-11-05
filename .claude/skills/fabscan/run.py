#!/usr/bin/env python3
"""Startet fabscan aus diesem Skill-Ordner (keine Installation nötig)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts"))
from fabscan.cli import main  # noqa: E402

sys.exit(main())
