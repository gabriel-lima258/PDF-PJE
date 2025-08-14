#!/bin/bash

# ========================================
# LAUNCHER PJE WEB - Interface Desktop
# ========================================
# Este arquivo pode ser colocado na área de trabalho
# e executado com duplo clique para iniciar a aplicação

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}    SCRAPER PJE - WEB APP${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Função para abrir o navegador automaticamente
open_browser() {
    sleep 3
    print_status "Abrindo navegador automaticamente..."
    open http://localhost:5001
}

# Função para limpar ao sair
cleanup() {
    print_status "Finalizando aplicação..."
    if [ ! -z "$FLASK_PID" ]; then
        kill $FLASK_PID 2>/dev/null
    fi
    print_status "Aplicação finalizada."
    exit 0
}

# Configurar trap para limpeza ao sair
trap cleanup SIGINT SIGTERM

# Função para encontrar o diretório do projeto
find_project_dir() {
    local current_dir="$1"
    local search_dirs=(
        "$current_dir"
        "$HOME/Documents/PDF-PJE"
        "$HOME/Desktop/PDF-PJE"
        "$HOME/Downloads/PDF-PJE"
        "$HOME/Projects/PDF-PJE"
        "$HOME/Development/PDF-PJE"
    )
    
    for dir in "${search_dirs[@]}"; do
        if [ -f "$dir/start.py" ] && [ -f "$dir/src/core/pje.py" ]; then
            echo "$dir"
            return 0
        fi
    done
    
    return 1
}

# Obter o diretório do script (onde o launcher está)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Tentar encontrar o diretório do projeto
print_status "Procurando projeto PDF-PJE..."
PROJECT_DIR=$(find_project_dir "$SCRIPT_DIR")

if [ -z "$PROJECT_DIR" ]; then
    print_error "Projeto PDF-PJE não encontrado!"
    print_error "Locais verificados:"
    print_error "  - $SCRIPT_DIR"
    print_error "  - $HOME/Documents/PDF-PJE"
    print_error "  - $HOME/Desktop/PDF-PJE"
    print_error "  - $HOME/Downloads/PDF-PJE"
    print_error "  - $HOME/Projects/PDF-PJE"
    print_error "  - $HOME/Development/PDF-PJE"
    print_error ""
    print_error "Certifique-se de que o projeto PDF-PJE está em um desses locais."
    read -p "Pressione Enter para sair..."
    exit 1
fi

print_status "Projeto encontrado em: $PROJECT_DIR"

# Mudar para o diretório do projeto
cd "$PROJECT_DIR"

# Exibir cabeçalho
print_header
print_status "Iniciando Scraper PJE - Interface Web..."

# Verificar se Python 3 está instalado
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 não está instalado!"
    print_error "Por favor, instale o Python 3 primeiro."
    read -p "Pressione Enter para sair..."
    exit 1
fi

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    print_warning "Ambiente virtual não encontrado!"
    print_status "Criando ambiente virtual..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Falha ao criar ambiente virtual!"
        read -p "Pressione Enter para sair..."
        exit 1
    fi
fi

# Ativar ambiente virtual
print_status "Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se Flask está instalado
if ! pip show flask > /dev/null 2>&1; then
    print_status "Instalando dependências..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        print_error "Falha ao instalar dependências!"
        read -p "Pressione Enter para sair..."
        exit 1
    fi
fi

# Verificar se todas as dependências estão instaladas
print_status "Verificando dependências..."
pip install flask requests python-dotenv selenium webdriver-manager

# Iniciar aplicação em background e abrir navegador
print_status "Iniciando servidor web..."
print_status "Acesse: http://localhost:5001"
print_status "Para parar, feche esta janela ou pressione Ctrl+C"
echo ""

# Iniciar Flask em background
python start.py &
FLASK_PID=$!

# Aguardar um pouco e abrir navegador
open_browser

# Aguardar o processo Flask
wait $FLASK_PID
