# 🔍 Scraper PJE - Consulta de Processos

Programa Python que automatiza a busca de processos de "Cumprimento de Sentença" no PJE (Processo Judicial Eletrônico) por CPF.

## 🚀 Interface Web

### 🖥️ Launcher Desktop (Mais Fácil!)
```bash
# Criar atalho na área de trabalho
./create_desktop_shortcut.sh

# Depois é só dar duplo clique no arquivo na área de trabalho!
```
- ✅ **Execução com um clique** - Duplo clique na área de trabalho
- ✅ **Navegador automático** - Abre automaticamente
- ✅ **Instalação automática** - Dependências instaladas automaticamente
- ✅ **Interface colorida** - Feedback visual do progresso
- ✅ **Tratamento de erros** - Mensagens claras

### 🌐 Interface Web (Manual)
```bash
./run_web.sh
# Acesse: http://localhost:5001
```
- Interface web moderna com Bootstrap
- Responsivo (mobile-friendly)
- Histórico de consultas
- Acessível remotamente
- Validação de CPF em tempo real

## ⚙️ Configuração

1. **Configure suas credenciais** no `config.py`:
```python
PJE_USER = "seu_usuario"
PJE_PASSWORD = "sua_senha"
```

2. **Execute o setup** (opcional):
```bash
python setup.py
```

## 📁 Estrutura

```
PDF-PJE/
├── web_app.py                  # Interface Web
├── pje.py                      # Lógica do scraper
├── config.py                   # Configurações
├── launch_pje_web.command      # Launcher Desktop
├── create_desktop_shortcut.sh  # Script para criar atalho
├── LAUNCHER_README.md          # Instruções do launcher
├── run_web.sh                  # Script Web
├── requirements.txt            # Dependências Python
├── templates/                  # Templates HTML
├── static/                     # Arquivos web
├── downloads/                  # PDFs baixados
└── venv/                       # Ambiente virtual
```

## 📋 Pré-requisitos

- Python 3.7+
- Google Chrome
- Conexão com internet
- Credenciais do PJE

## ⚠️ Avisos

- Use de forma ética e responsável
- Respeite os termos do PJE
- Mantenha credenciais seguras
- Evite muitas consultas em sequência

---

**Desenvolvido para facilitar consultas no PJE** ❤️
