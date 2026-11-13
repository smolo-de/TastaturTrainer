@echo off
rem ------------------------------------------------------------
rem  TastaturTrainer starten
rem  Oeffnet die App in einem eigenen Fenster (Edge/Chrome App-Modus).
rem  Falls beides fehlt, wird der Standard-Browser verwendet.
rem ------------------------------------------------------------
setlocal EnableDelayedExpansion
set "APP=%~dp0index.html"
set "URL=!APP:\=/!"
set "URL=file:///!URL: =%%20!"

set "BROWSER="
for %%K in (HKLM HKCU) do (
  if not defined BROWSER (
    for /f "tokens=2,*" %%A in ('reg query "%%K\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" /ve 2^>nul ^| findstr /c:"REG_SZ"') do set "BROWSER=%%B"
  )
)
for %%K in (HKLM HKCU) do (
  if not defined BROWSER (
    for /f "tokens=2,*" %%A in ('reg query "%%K\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| findstr /c:"REG_SZ"') do set "BROWSER=%%B"
  )
)

if defined BROWSER (
  start "" "!BROWSER!" --app="!URL!" --window-size=1300,900
) else (
  start "" "%APP%"
)
endlocal
