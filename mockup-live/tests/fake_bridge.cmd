@echo off
if defined FAKE_BRIDGE_PYTHON (
  "%FAKE_BRIDGE_PYTHON%" "%~dp0fake_bridge.py" %*
) else (
  python "%~dp0fake_bridge.py" %*
)
