#!/bin/bash

# Script de deploy para PJe PDF Scraper
# Uso: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  PJe PDF Scraper - Deploy${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
}

# Verificar se arquivo .env existe
check_env() {
    if [ ! -f .env ]; then
        print_warning "Arquivo .env não encontrado. Criando a partir do exemplo..."
        if [ -f env.example ]; then
            cp env.example .env
            print_message "Arquivo .env criado. Por favor, edite as configurações necessárias."
        else
            print_error "Arquivo env.example não encontrado."
            exit 1
        fi
    fi
}

# Build da imagem
build() {
    print_message "Construindo imagem Docker..."
    docker-compose build --no-cache
    print_message "Build concluído!"
}

# Iniciar serviços
start() {
    print_message "Iniciando serviços..."
    docker-compose up -d
    print_message "Serviços iniciados!"
    print_message "API disponível em: http://localhost:5000"
    print_message "Health check: http://localhost:5000/health"
}

# Parar serviços
stop() {
    print_message "Parando serviços..."
    docker-compose down
    print_message "Serviços parados!"
}

# Reiniciar serviços
restart() {
    print_message "Reiniciando serviços..."
    docker-compose restart
    print_message "Serviços reiniciados!"
}

# Ver logs
logs() {
    print_message "Exibindo logs..."
    docker-compose logs -f
}

# Limpar containers e volumes
clean() {
    print_warning "Isso irá remover todos os containers, volumes e imagens. Continuar? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_message "Limpando containers, volumes e imagens..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_message "Limpeza concluída!"
    else
        print_message "Operação cancelada."
    fi
}

# Status dos serviços
status() {
    print_message "Status dos serviços:"
    docker-compose ps
}

# Menu principal
case "${1:-help}" in
    "build")
        print_header
        check_docker
        check_env
        build
        ;;
    "start")
        print_header
        check_docker
        check_env
        start
        ;;
    "stop")
        print_header
        check_docker
        stop
        ;;
    "restart")
        print_header
        check_docker
        restart
        ;;
    "logs")
        print_header
        check_docker
        logs
        ;;
    "clean")
        print_header
        check_docker
        clean
        ;;
    "status")
        print_header
        check_docker
        status
        ;;
    "help"|*)
        print_header
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  build   - Construir imagem Docker"
        echo "  start   - Iniciar serviços"
        echo "  stop    - Parar serviços"
        echo "  restart - Reiniciar serviços"
        echo "  logs    - Ver logs em tempo real"
        echo "  clean   - Limpar containers e volumes"
        echo "  status  - Ver status dos serviços"
        echo "  help    - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  $0 build   # Construir imagem"
        echo "  $0 start   # Iniciar aplicação"
        echo "  $0 logs    # Ver logs"
        ;;
esac 