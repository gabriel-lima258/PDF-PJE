#!/bin/bash

# Iniciar Xvfb (servidor X virtual) para o Chrome
echo "🚀 Iniciando servidor X virtual..."
Xvfb :99 -screen 0 1920x1080x24 > /dev/null 2>&1 &

# Aguardar o servidor X iniciar
sleep 2

# Verificar se o Chrome está funcionando
echo "🔍 Verificando Chrome..."
google-chrome --version

# Configurar permissões para downloads
echo "📁 Configurando diretório de downloads..."
chmod 777 /app/downloads

# Verificar se arquivo .env existe, se não, criar um template
if [ ! -f /app/.env ]; then
    echo "📝 Criando arquivo .env template..."
    cat > /app/.env << EOF
# Configurações do PJE
USERNAME_PJE=seu_usuario_aqui
PASSWORD=sua_senha_aqui

# Configurações opcionais
# DOWNLOAD_DIR=/app/downloads
# CHROME_HEADLESS=true
EOF
    echo "⚠️  IMPORTANTE: Configure suas credenciais no arquivo .env antes de usar!"
fi

# Verificar se as credenciais estão configuradas
if grep -q "seu_usuario_aqui" /app/.env; then
    echo "⚠️  ATENÇÃO: Configure suas credenciais do PJE no arquivo .env"
    echo "   - USERNAME_PJE=seu_usuario_real"
    echo "   - PASSWORD=sua_senha_real"
fi

echo "🌐 Iniciando aplicação web..."
echo "📍 Acesse: http://localhost:5001"
echo "📁 Downloads serão salvos em: /app/downloads"

# Iniciar a aplicação Flask
exec python src/web/web_app.py
