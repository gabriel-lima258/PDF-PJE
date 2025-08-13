# PJE Web App - Windows Setup

Este diretório contém os scripts para criar atalhos na área de trabalho no Windows.

## Arquivos Disponíveis

- `create_desktop_shortcut.ps1` - Script PowerShell principal
- `create_desktop_shortcut.bat` - Script .bat para executar o PowerShell
- `launch_pje_web.bat` - Launcher da aplicação web para Windows

## Como Usar

### Opção 1: Executar o script .bat (Recomendado)
1. Navegue até o diretório `src/launcher/windows/`
2. Dê duplo clique em `create_desktop_shortcut.bat`
3. O script criará automaticamente um atalho na sua área de trabalho

### Opção 2: Executar via PowerShell
1. Abra o PowerShell como administrador
2. Navegue até o diretório `src/launcher/windows/`
3. Execute: `powershell -ExecutionPolicy Bypass -File create_desktop_shortcut.ps1`

### Opção 3: Executar manualmente
1. Copie o arquivo `launch_pje_web.bat` para sua área de trabalho
2. Dê duplo clique no arquivo para iniciar a aplicação

## O que o Script Faz

1. **Localiza o projeto**: Procura o projeto PDF-PJE em locais comuns
2. **Verifica dependências**: Confirma se Python está instalado
3. **Cria ambiente virtual**: Se necessário, cria um ambiente virtual Python
4. **Instala dependências**: Instala todas as bibliotecas necessárias
5. **Inicia o servidor**: Inicia a aplicação web Flask
6. **Abre o navegador**: Abre automaticamente o navegador no endereço correto

## Locais Procurados pelo Script

O script procura o projeto PDF-PJE nos seguintes locais:
- Diretório atual do script
- `%USERPROFILE%\OneDrive\Attachments\Área de Trabalho\PDF-PJE`
- `%USERPROFILE%\Documents\PDF-PJE`
- `%USERPROFILE%\Desktop\PDF-PJE`
- `%USERPROFILE%\Downloads\PDF-PJE`
- `%USERPROFILE%\Projects\PDF-PJE`
- `%USERPROFILE%\Development\PDF-PJE`

## Solução de Problemas

### Erro: "Python não está instalado"
- Instale o Python 3.x do site oficial: https://python.org
- Certifique-se de marcar a opção "Add Python to PATH" durante a instalação

### Erro: "Projeto PDF-PJE não encontrado"
- Certifique-se de que o projeto está em um dos locais listados acima
- Ou mova o projeto para um desses locais

### Erro de Execution Policy no PowerShell
- Execute o script .bat em vez do .ps1
- Ou execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Aplicação não abre no navegador
- Acesse manualmente: http://localhost:5001
- Verifique se não há outro processo usando a porta 5001

## Recursos

- **Interface colorida**: Mensagens coloridas para melhor visualização
- **Detecção automática**: Encontra automaticamente o projeto
- **Instalação automática**: Instala dependências se necessário
- **Abertura automática**: Abre o navegador automaticamente
- **Suporte a UTF-8**: Suporte completo a caracteres especiais

## Notas

- O script requer Python 3.x instalado
- A primeira execução pode demorar mais devido à instalação de dependências
- Para parar a aplicação, feche a janela do terminal ou pressione Ctrl+C

