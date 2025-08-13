@echo off
chcp 65001 >nul

REM Executar o script PowerShell para criar o atalho
powershell -ExecutionPolicy Bypass -File "%~dp0create_desktop_shortcut.ps1"

pause
