"""mk-live aus dem Repo: python mockup-live/mk_live.py <Befehl> (startet agent/mk_live.py)."""
import pathlib, runpy, sys
sys.argv[0] = str(pathlib.Path(__file__).resolve().parent / "agent" / "mk_live.py"); runpy.run_path(sys.argv[0], run_name="__main__")
