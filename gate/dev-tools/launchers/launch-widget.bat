@echo off
:: GATE 2028 Widget Launcher
:: Opens the widget as a standalone app window (no browser chrome)
:: Positioned at top-right corner of the screen

for %%I in ("%~dp0..\..\widget.html") do SET WIDGET_PATH=%%~fI
SET FILE_URL=file:///%WIDGET_PATH:\=/%

:: Try Microsoft Edge first (best PWA support)
WHERE msedge >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    start "" msedge --app="%FILE_URL%" --window-size=400,680 --window-position=1480,50 --no-default-browser-check --disable-extensions
    GOTO :EOF
)

:: Fallback: Google Chrome
WHERE chrome >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    start "" chrome --app="%FILE_URL%" --window-size=400,680 --window-position=1480,50 --no-default-browser-check
    GOTO :EOF
)

:: Fallback: Firefox
WHERE firefox >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    start "" firefox --window "%FILE_URL%"
    GOTO :EOF
)

echo No compatible browser found. Please open widget.html manually.
pause
