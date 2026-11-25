@echo off
if defined FAKE_TE_PYTHON (
  "%FAKE_TE_PYTHON%" "%~dp0fake_te.py" %*
) else (
  python "%~dp0fake_te.py" %*
)
