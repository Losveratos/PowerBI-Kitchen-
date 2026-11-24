@echo off
rem MockupKitchen live · Live-Helfer mk-live (setup, doctor, start, stop, diag, register-tool)
rem Aufruf aus dem Repo: mockup-live\bin\mk-live.cmd doctor "C:\...\Projekt"
rem Python: $MK_PYTHON, sonst py -3, sonst python im PATH.
setlocal
set "MK_SCRIPT=%~dp0..\agent\mk_live.py"
if defined MK_PYTHON (
  "%MK_PYTHON%" "%MK_SCRIPT%" %*
  exit /b %ERRORLEVEL%
)
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  py -3 "%MK_SCRIPT%" %*
  exit /b %ERRORLEVEL%
)
python "%MK_SCRIPT%" %*
exit /b %ERRORLEVEL%
