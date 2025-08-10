# 📁 PDF-PJE - Estrutura Organizada

## 🎯 Organização por Módulos

### 🚀 Scripts Principais (Raiz)
- `start.py` - Script principal para iniciar a aplicação
- `run_web.sh` - Script de execução da aplicação web
- `requirements.txt` - Dependências Python

### 🔧 Core - Lógica Principal
```
src/core/
├── __init__.py
├── pje.py          # Scraper PJE (lógica principal)
└── config.py       # Configurações e credenciais
```

### 🌐 Web - Interface Web
```
src/web/
├── __init__.py
├── web_app.py      # Aplicação Flask
├── templates/      # Templates HTML
└── static/         # Arquivos CSS/JS
```

### 🖥️ Launcher - Scripts Desktop
```
src/launcher/
├── __init__.py
├── launch_pje_web.command      # Launcher principal
└── create_desktop_shortcut.sh  # Script para criar atalho
```

### 📚 Docs - Documentação
```
docs/
├── README.md           # Documentação principal
├── LAUNCHER_README.md  # Instruções do launcher
└── ESTRUTURA_WEB.md    # Estrutura anterior
```

### 📁 Outros
- `downloads/` - PDFs baixados
- `venv/` - Ambiente virtual
- `.gitignore` - Arquivos ignorados pelo Git

## ✅ Benefícios da Organização

- ✅ **Separação clara** - Cada módulo tem sua responsabilidade
- ✅ **Fácil manutenção** - Código organizado e estruturado
- ✅ **Escalabilidade** - Fácil adicionar novos módulos
- ✅ **Profissional** - Estrutura padrão de projetos Python
- ✅ **Documentação centralizada** - Tudo em docs/

## 🎯 Como Usar

### Opção 1: Launcher Desktop
```bash
./src/launcher/create_desktop_shortcut.sh
# Duplo clique no arquivo na área de trabalho
```

### Opção 2: Manual
```bash
./run_web.sh
# Acesse: http://localhost:5001
```

### Opção 3: Direto
```bash
python start.py
# Acesse: http://localhost:5001
```

## 🔧 Configuração

Edite `src/core/config.py`:
```python
PJE_USER = "seu_usuario"
PJE_PASSWORD = "sua_senha"
```

## 📝 Imports Atualizados

- `start.py` - Script principal com imports corretos
- `src/web/web_app.py` - Importa módulos do core
- `src/launcher/launch_pje_web.command` - Caminhos atualizados

**Projeto organizado e profissional!** 🚀
