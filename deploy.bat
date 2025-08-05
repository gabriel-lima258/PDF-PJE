@echo off
setlocal enabledelayedexpansion

REM Script de deploy para PJe PDF Scraper (Windows)
REM Uso: deploy.bat [build|start|stop|restart|logs|clean]

set "COMMAND=%1"
if "%COMMAND%"=="" set "COMMAND=help"

echo ================================
echo   PJe PDF Scraper - Deploy
echo ================================

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker não está instalado. Por favor, instale o Docker primeiro.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.
    exit /b 1
)

REM Verificar se arquivo .env existe
if not exist .env (
    echo [WARNING] Arquivo .env não encontrado. Criando a partir do exemplo...
    if exist env.example (
        copy env.example .env
        echo [INFO] Arquivo .env criado. Por favor, edite as configurações necessárias.
    ) else (
        echo [ERROR] Arquivo env.example não encontrado.
        exit /b 1
    )
)

if "%COMMAND%"=="build" (
    echo [INFO] Construindo imagem Docker...
    docker-compose build --no-cache
    echo [INFO] Build concluído!
    goto :eof
)

if "%COMMAND%"=="start" (
    echo [INFO] Iniciando serviços...
    docker-compose up -d
    echo [INFO] Serviços iniciados!
    echo [INFO] API disponível em: http://localhost:5000
    echo [INFO] Health check: http://localhost:5000/health
    goto :eof
)

if "%COMMAND%"=="stop" (
    echo [INFO] Parando serviços...
    docker-compose down
    echo [INFO] Serviços parados!
    goto :eof
)

if "%COMMAND%"=="restart" (
    echo [INFO] Reiniciando serviços...
    docker-compose restart
    echo [INFO] Serviços reiniciados!
    goto :eof
)

if "%COMMAND%"=="logs" (
    echo [INFO] Exibindo logs...
    docker-compose logs -f
    goto :eof
)

if "%COMMAND%"=="clean" (
    echo [WARNING] Isso irá remover todos os containers, volumes e imagens. Continuar? (S/N)
    set /p "response="
    if /i "!response!"=="S" (
        echo [INFO] Limpando containers, volumes e imagens...
        docker-compose down -v --rmi all
        docker system prune -f
        echo [INFO] Limpeza concluída!
    ) else (
        echo [INFO] Operação cancelada.
    )
    goto :eof
)

if "%COMMAND%"=="status" (
    echo [INFO] Status dos serviços:
    docker-compose ps
    goto :eof
)

if "%COMMAND%"=="help" (
    echo Uso: %0 [comando]
    echo.
    echo Comandos disponíveis:
    echo   build   - Construir imagem Docker
    echo   start   - Iniciar serviços
    echo   stop    - Parar serviços
    echo   restart - Reiniciar serviços
    echo   logs    - Ver logs em tempo real
    echo   clean   - Limpar containers e volumes
    echo   status  - Ver status dos serviços
    echo   help    - Mostrar esta ajuda
    echo.
    echo Exemplos:
    echo   %0 build   # Construir imagem
    echo   %0 start   # Iniciar aplicação
    echo   %0 logs    # Ver logs
    goto :eof
)

echo [ERROR] Comando inválido: %COMMAND%
echo Use: %0 help
exit /b 1 