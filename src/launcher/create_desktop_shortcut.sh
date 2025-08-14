#!/bin/bash

# Script para criar atalho na área de trabalho
# Este script copia o launcher para a área de trabalho

echo "🖥️  Criando atalho na área de trabalho..."

# Obter o diretório atual
CURRENT_DIR="$(pwd)"
LAUNCHER_PATH="$CURRENT_DIR/src/launcher/launch_pje_web.command"
DESKTOP_PATH="$HOME/Desktop"

# Verificar se o launcher existe
if [ ! -f "$LAUNCHER_PATH" ]; then
    echo "❌ Arquivo launch_pje_web.command não encontrado!"
    echo "Certifique-se de que este script está no diretório do projeto."
    exit 1
fi

# Copiar para a área de trabalho
cp "$LAUNCHER_PATH" "$DESKTOP_PATH/"

# Tornar executável
chmod +x "$DESKTOP_PATH/launch_pje_web.command"

echo "✅ Atalho criado com sucesso!"
echo "📍 Localização: $DESKTOP_PATH/launch_pje_web.command"
echo ""
echo "🎯 agora você pode:"
echo "   1. Dar duplo clique no arquivo 'launch_pje_web.command' na área de trabalho"
echo "   2. O navegador abrirá automaticamente com a aplicação"
echo "   3. Para parar, feche a janela do terminal ou pressione Ctrl+C"
echo ""
echo "💡 Dica: Você pode renomear o arquivo na área de trabalho para algo mais amigável, como 'PJE Web App'"
