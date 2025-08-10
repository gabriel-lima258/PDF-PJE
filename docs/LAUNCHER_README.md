# 🚀 Launcher Desktop - Scraper PJE

Este projeto agora inclui um launcher que pode ser executado diretamente da área de trabalho com um duplo clique!

## 📁 Arquivos Criados

- `launch_pje_web.command` - Launcher principal executável
- `create_desktop_shortcut.sh` - Script para criar atalho na área de trabalho
- `LAUNCHER_README.md` - Este arquivo de instruções

## 🎯 Como Usar

### Opção 1: Criar Atalho Automático (Recomendado)

1. Execute o script de criação do atalho:
   ```bash
   ./create_desktop_shortcut.sh
   ```

2. O atalho será criado automaticamente na sua área de trabalho

3. Dê duplo clique no arquivo `launch_pje_web.command` na área de trabalho

### Opção 2: Copiar Manualmente

1. Copie o arquivo `launch_pje_web.command` para sua área de trabalho
2. Dê duplo clique no arquivo

**Nota**: O launcher agora procura automaticamente o projeto em locais comuns:
- Documents/PDF-PJE
- Desktop/PDF-PJE  
- Downloads/PDF-PJE
- Projects/PDF-PJE
- Development/PDF-PJE

## ✨ Funcionalidades do Launcher

- ✅ **Execução automática** - Inicia com um duplo clique
- ✅ **Verificação de dependências** - Instala automaticamente se necessário
- ✅ **Ambiente virtual** - Cria e ativa automaticamente
- ✅ **Navegador automático** - Abre o navegador automaticamente
- ✅ **Interface colorida** - Feedback visual do progresso
- ✅ **Tratamento de erros** - Mensagens claras em caso de problemas
- ✅ **Limpeza automática** - Para a aplicação corretamente ao fechar

## 🔧 O que o Launcher Faz

1. **Verifica Python 3** - Garante que Python está instalado
2. **Cria ambiente virtual** - Se não existir
3. **Instala dependências** - Flask e outras bibliotecas necessárias
4. **Inicia servidor** - Executa a aplicação Flask
5. **Abre navegador** - Abre automaticamente http://localhost:5001
6. **Aguarda finalização** - Mantém a aplicação rodando

## 🛑 Como Parar a Aplicação

- **Opção 1**: Feche a janela do terminal
- **Opção 2**: Pressione `Ctrl+C` no terminal
- **Opção 3**: Feche o navegador e depois o terminal

## 🎨 Personalização

Você pode renomear o arquivo na área de trabalho para algo mais amigável:
- `PJE Web App.command`
- `Scraper PJE.command`
- `Consulta PJE.command`

## 🔍 Solução de Problemas

### Erro: "Python 3 não está instalado"
- Instale Python 3 do site oficial: https://www.python.org/downloads/

### Erro: "Projeto PDF-PJE não encontrado"
- Certifique-se de que o projeto está em um dos locais verificados:
  - Documents/PDF-PJE
  - Desktop/PDF-PJE
  - Downloads/PDF-PJE
  - Projects/PDF-PJE
  - Development/PDF-PJE

### Erro: "Falha ao criar ambiente virtual"
- Verifique se você tem permissões de escrita no diretório
- Tente executar: `python3 -m venv venv` manualmente

### Aplicação não abre no navegador
- Acesse manualmente: http://localhost:5001
- Verifique se a porta 5001 não está sendo usada por outro programa

## 📝 Logs

O launcher exibe informações detalhadas sobre:
- Status da instalação de dependências
- Progresso da inicialização
- Erros e avisos
- URL de acesso

## 🎉 Pronto!

Agora você tem uma aplicação desktop completa que pode ser executada com um simples duplo clique na área de trabalho!
