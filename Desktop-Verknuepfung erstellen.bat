@echo off
rem ------------------------------------------------------------
rem  Legt einmalig eine Verknuepfung "BlindTrainer" auf dem Desktop an.
rem  Danach reicht ein Doppelklick auf das Symbol.
rem ------------------------------------------------------------
set "DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=[Environment]::GetFolderPath('Desktop');" ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $d 'BlindTrainer.lnk'));" ^
  "$s.TargetPath=$env:DIR + 'BlindTrainer starten.bat';" ^
  "$s.WorkingDirectory=$env:DIR;" ^
  "$s.IconLocation=$env:DIR + 'icon.ico';" ^
  "$s.WindowStyle=7;" ^
  "$s.Description='BlindTrainer - 10-Finger-Lernspiel';" ^
  "$s.Save()"
if errorlevel 1 (
  echo Die Verknuepfung konnte leider nicht erstellt werden.
) else (
  echo Fertig! Auf dem Desktop liegt jetzt "BlindTrainer".
)
pause
