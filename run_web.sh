#!/bin/bash

# Script de execução da Interface Web
# Este script ativa o ambiente virtual e executa a aplicação Flask

echo "🚀 Iniciando Scraper PJE - Interface Web..."

# Verifica se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa o ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Verifica se as dependências estão instaladas
echo "📋 Verificando dependências..."
if ! pip show flask > /dev/null 2>&1; then
    echo "📦 Instalando dependências..."
    pip install -r requirements.txt
fi

# Executa a aplicação web
echo "▶️  Executando interface web..."
echo "🌐 Acesse: http://localhost:5001"
echo "⏹️  Para parar, pressione Ctrl+C"
echo ""
python start.py

# Desativa o ambiente virtual
deactivate

echo "✅ Programa finalizado."
