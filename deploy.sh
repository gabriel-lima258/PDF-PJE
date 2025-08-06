#!/bin/bash

# Script de deploy para VPS com Docker e Traefik
# Autor: Seu Nome
# Data: $(date)

set -e

echo "🚀 Iniciando deploy da aplicação Selenium PDF..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo env.example para .env e configure as variáveis:"
    echo "   cp env.example .env"
    echo "   nano .env"
    exit 1
fi

# Carregar variáveis de ambiente
source .env

# Verificar se as variáveis obrigatórias estão definidas
if [ -z "$USER" ] || [ -z "$PASSWORD" ]; then
    echo "❌ Variáveis USER e PASSWORD devem estar definidas no arquivo .env"
    exit 1
fi

# Verificar se o domínio está configurado
if [ -z "$DOMAIN" ]; then
    echo "⚠️  Variável DOMAIN não definida. Usando localhost..."
    DOMAIN="localhost"
fi

# Atualizar o docker-compose.yml com o domínio correto
sed -i "s/api.seu-dominio.com/api.$DOMAIN/g" docker-compose.yml

echo "📦 Construindo imagem Docker..."
docker-compose build --no-cache

echo "🔄 Parando containers existentes..."
docker-compose down

echo "🚀 Iniciando containers..."
docker-compose up -d

echo "⏳ Aguardando aplicação inicializar..."
sleep 10

# Verificar se a aplicação está rodando
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Aplicação iniciada com sucesso!"
    echo "🌐 URL da API: https://api.$DOMAIN"
    echo "💚 Health check: https://api.$DOMAIN/health"
    echo "📤 Upload endpoint: https://api.$DOMAIN/upload"
    echo "📋 Lista de PDFs: https://api.$DOMAIN/pdfs"
    echo "🔄 Executar scraper: GET https://api.$DOMAIN/executar-scraper?cpf=<CPF>"
else
    echo "❌ Erro: Aplicação não está respondendo"
    echo "📋 Logs do container:"
    docker-compose logs api
    exit 1
fi

echo "📊 Status dos containers:"
docker-compose ps

echo "🎉 Deploy concluído com sucesso!" 