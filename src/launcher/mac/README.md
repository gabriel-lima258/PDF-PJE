# PJE Web App - macOS Setup

Este diretório contém os scripts para criar atalhos na área de trabalho no macOS.

## Arquivos Disponíveis

- `create_desktop_shortcut.sh` - Script bash para criar atalho
- `launch_pje_web.command` - Launcher da aplicação web para macOS

## Como Usar

### Opção 1: Executar o script bash (Recomendado)
1. Abra o Terminal
2. Navegue até o diretório `src/launcher/mac/`
3. Execute: `chmod +x create_desktop_shortcut.sh && ./create_desktop_shortcut.sh`

### Opção 2: Executar manualmente
1. Copie o arquivo `launch_pje_web.command` para sua área de trabalho
2. Dê duplo clique no arquivo para iniciar a aplicação

### Opção 3: Via Finder
1. Abra o Finder e navegue até `src/launcher/mac/`
2. Dê duplo clique em `create_desktop_shortcut.sh`
3. Se necessário, permita a execução no Terminal

## O que o Script Faz

1. **Localiza o projeto**: Procura o projeto PDF-PJE em locais comuns
2. **Verifica dependências**: Confirma se Python 3 está instalado
3. **Cria ambiente virtual**: Se necessário, cria um ambiente virtual Python
4. **Instala dependências**: Instala todas as bibliotecas necessárias
5. **Inicia o servidor**: Inicia a aplicação web Flask
6. **Abre o navegador**: Abre automaticamente o navegador no endereço correto

## Locais Procurados pelo Script

O script procura o projeto PDF-PJE nos seguintes locais:
- Diretório atual do script
- `$HOME/Documents/PDF-PJE`
- `$HOME/Desktop/PDF-PJE`
- `$HOME/Downloads/PDF-PJE`
- `$HOME/Projects/PDF-PJE`
- `$HOME/Development/PDF-PJE`

## Solução de Problemas

### Erro: "Python 3 não está instalado"
- Instale o Python 3.x usando Homebrew: `brew install python3`
- Ou baixe do site oficial: https://python.org

### Erro: "Projeto PDF-PJE não encontrado"
- Certifique-se de que o projeto está em um dos locais listados acima
- Ou mova o projeto para um desses locais

### Erro de permissão
- Execute: `chmod +x create_desktop_shortcut.sh`
- Ou execute: `chmod +x launch_pje_web.command`

### Aplicação não abre no navegador
- Acesse manualmente: http://localhost:5001
- Verifique se não há outro processo usando a porta 5001

### Erro de segurança do macOS
- Vá em Preferências do Sistema > Segurança e Privacidade
- Clique em "Permitir" para o Terminal ou aplicação

## Recursos

- **Interface colorida**: Mensagens coloridas para melhor visualização
- **Detecção automática**: Encontra automaticamente o projeto
- **Instalação automática**: Instala dependências se necessário
- **Abertura automática**: Abre o navegador automaticamente
- **Suporte completo**: Compatível com todas as versões do macOS

## Notas

- O script requer Python 3.x instalado
- A primeira execução pode demorar mais devido à instalação de dependências
- Para parar a aplicação, feche a janela do terminal ou pressione Ctrl+C
- O arquivo `.command` pode ser executado diretamente com duplo clique

