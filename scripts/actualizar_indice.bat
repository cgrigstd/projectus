@echo off
setlocal
cd /d "%~dp0.."
where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python "%~dp0actualizar_indice.py" %*
) else (
  py -3 "%~dp0actualizar_indice.py" %*
)
exit /b %ERRORLEVEL%
