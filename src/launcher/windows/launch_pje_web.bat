@echo off
chcp 65001 >nul

echo.
echo ================================
echo     SCRAPER PJE - WEB APP
echo ================================
echo.

echo [INFO] Procurando projeto PDF-PJE...

REM Tentar encontrar o projeto em locais comuns
set "PROJECT_DIR="

REM Verificar se estamos dentro da pasta PDF-PJE
if exist "start.py" if exist "src\core\pje.py" (
    set "PROJECT_DIR=%CD%"
    goto :found
)

REM Verificar se PDF-PJE esta na pasta atual
if exist "PDF-PJE\start.py" if exist "PDF-PJE\src\core\pje.py" (
    set "PROJECT_DIR=%CD%\PDF-PJE"
    goto :found
)

REM Verificar outros locais comuns
for %%d in (
    "%USERPROFILE%\OneDrive\Attachments\Área de Trabalho\PDF-PJE"
    "%USERPROFILE%\OneDrive\Attachments\Area de Trabalho\PDF-PJE"
    "%USERPROFILE%\Documents\PDF-PJE"
    "%USERPROFILE%\Desktop\PDF-PJE"
    "%USERPROFILE%\Downloads\PDF-PJE"
    "%USERPROFILE%\Projects\PDF-PJE"
    "%USERPROFILE%\Development\PDF-PJE"
) do (
    if exist "%%~d\start.py" if exist "%%~d\src\core\pje.py" (
        set "PROJECT_DIR=%%~d"
        goto :found
    )
)

echo [ERROR] Projeto PDF-PJE nao encontrado!
echo [ERROR] Locais verificados:
echo [ERROR]   - %CD%
echo [ERROR]   - %CD%\PDF-PJE
echo [ERROR]   - %USERPROFILE%\OneDrive\Attachments\Área de Trabalho\PDF-PJE
echo [ERROR]   - %USERPROFILE%\OneDrive\Attachments\Area de Trabalho\PDF-PJE
echo [ERROR]   - %USERPROFILE%\Documents\PDF-PJE
echo [ERROR]   - %USERPROFILE%\Desktop\PDF-PJE
echo [ERROR]   - %USERPROFILE%\Downloads\PDF-PJE
echo [ERROR]   - %USERPROFILE%\Projects\PDF-PJE
echo [ERROR]   - %USERPROFILE%\Development\PDF-PJE
echo.
echo [ERROR] Certifique-se de que o projeto PDF-PJE esta em um desses locais.
pause
exit /b 1

:found
echo [INFO] Projeto encontrado em: %PROJECT_DIR%

REM Mudar para o diretorio do projeto
cd /d "%PROJECT_DIR%"

echo [INFO] Iniciando Scraper PJE - Interface Web...

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python nao esta instalado!
    echo [ERROR] Por favor, instale o Python primeiro.
    pause
    exit /b 1
)

REM Verificar se o ambiente virtual existe
if not exist "venv" (
    echo [WARNING] Ambiente virtual nao encontrado!
    echo [INFO] Criando ambiente virtual...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Falha ao criar ambiente virtual!
        pause
        exit /b 1
    )
)

REM Ativar ambiente virtual
echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate.bat

REM Verificar se Flask esta instalado
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [INFO] Instalando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Verificar se todas as dependencias estao instaladas
echo [INFO] Verificando dependencias...
pip install flask requests python-dotenv selenium webdriver-manager

REM Iniciar aplicacao
echo [INFO] Iniciando servidor web...
echo [INFO] Acesse: http://localhost:5001
echo [INFO] Para parar, feche esta janela ou pressione Ctrl+C
echo.

REM Abrir navegador apos um delay
start /b "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5001"

REM Iniciar Flask
python start.py

