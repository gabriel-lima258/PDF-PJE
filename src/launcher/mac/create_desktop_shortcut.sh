#!/bin/bash

# Script para criar atalho na area de trabalho (macOS)
# Este script copia o launcher para a area de trabalho

echo "🖥️  Criando atalho na area de trabalho..."

# Obter o diretorio atual
CURRENT_DIR="$(pwd)"
LAUNCHER_PATH="$CURRENT_DIR/mac/launch_pje_web.command"
DESKTOP_PATH="$HOME/Desktop"

# Verificar se o launcher existe
if [ ! -f "$LAUNCHER_PATH" ]; then
    echo "❌ Arquivo launch_pje_web.command nao encontrado!"
    echo "Certifique-se de que este script esta no diretorio do projeto."
    exit 1
fi

# Copiar para a area de trabalho
cp "$LAUNCHER_PATH" "$DESKTOP_PATH/"

# Tornar executavel
chmod +x "$DESKTOP_PATH/launch_pje_web.command"

echo "✅ Atalho criado com sucesso!"
echo "📍 Localizacao: $DESKTOP_PATH/launch_pje_web.command"
echo ""
echo "🎯 agora voce pode:"
echo "   1. Dar duplo clique no arquivo 'launch_pje_web.command' na area de trabalho"
echo "   2. O navegador abrira automaticamente com a aplicacao"
echo "   3. Para parar, feche a janela do terminal ou pressione Ctrl+C"
echo ""
echo "💡 Dica: Voce pode renomear o arquivo na area de trabalho para algo mais amigavel, como 'PJE Web App'"

