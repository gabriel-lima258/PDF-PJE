# Script para criar atalho na area de trabalho (Windows)
# Este script copia o launcher para a area de trabalho

Write-Host "Criando atalho na area de trabalho..." -ForegroundColor Green

# Obter o diretorio do script
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$LAUNCHER_PATH = Join-Path $SCRIPT_DIR "launch_pje_web.bat"
$DESKTOP_PATH = [Environment]::GetFolderPath("Desktop")

# Verificar se o launcher existe
if (-not (Test-Path $LAUNCHER_PATH)) {
    Write-Host "Arquivo launch_pje_web.bat nao encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de que este script esta no diretorio do projeto." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Copiar para a area de trabalho
Copy-Item $LAUNCHER_PATH $DESKTOP_PATH

Write-Host "Atalho criado com sucesso!" -ForegroundColor Green
Write-Host "Localizacao: $DESKTOP_PATH\launch_pje_web.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora voce pode:" -ForegroundColor Yellow
Write-Host "   1. Dar duplo clique no arquivo 'launch_pje_web.bat' na area de trabalho" -ForegroundColor White
Write-Host "   2. O navegador abrira automaticamente com a aplicacao" -ForegroundColor White
Write-Host "   3. Para parar, feche a janela do terminal ou pressione Ctrl+C" -ForegroundColor White
Write-Host ""
Write-Host "Dica: Voce pode renomear o arquivo na area de trabalho para algo mais amigavel, como PJE Web App" -ForegroundColor Cyan

Read-Host "Pressione Enter para sair"
