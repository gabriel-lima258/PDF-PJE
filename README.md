# 🔍 Scraper PJE - Consulta de Processos

Programa Python que automatiza a busca de processos de "Cumprimento de Sentença" no PJE (Processo Judicial Eletrônico) por CPF.

## 🚀 Interface Web

### 🖥️ Launcher Desktop (Mais Fácil!)
```bash
# Criar atalho na área de trabalho
./src/launcher/create_desktop_shortcut.sh

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
- **🆕 Campo de nome** - Cria pasta personalizada no Desktop
- **🆕 Organização automática** - PDFs separados por pessoa

## ⚙️ Configuração

1. **Configure suas credenciais** no `src/core/config.py`:
```python
PJE_USER = "seu_usuario"
PJE_PASSWORD = "sua_senha"
```

## 🆕 Nova Funcionalidade: Nome e Organização

A aplicação agora inclui um campo para o nome da pessoa, criando automaticamente uma pasta personalizada no Desktop para organizar os downloads:

- **Campo Nome**: Obrigatório, nome completo da pessoa
- **Pasta Personalizada**: Criada em `~/Desktop/[Nome da Pessoa]`
- **Organização Automática**: PDFs separados por pessoa
- **Interface Melhorada**: Validação de ambos os campos

## 📁 Estrutura Organizada

```
PDF-PJE/
├── start.py                     # Script principal
├── run_web.sh                   # Script de execução
├── requirements.txt             # Dependências Python
├── src/
│   ├── core/                    # Lógica principal
│   │   ├── pje.py              # Scraper PJE
│   │   └── config.py           # Configurações
│   ├── web/                     # Interface web
│   │   ├── web_app.py          # Aplicação Flask
│   │   ├── templates/          # Templates HTML
│   │   └── static/             # Arquivos CSS/JS
│   └── launcher/                # Scripts desktop
│       ├── launch_pje_web.command
│       └── create_desktop_shortcut.sh
├── docs/                        # Documentação
│   ├── README.md               # Documentação principal
│   ├── LAUNCHER_README.md      # Instruções do launcher
│   └── ESTRUTURA_WEB.md        # Estrutura do projeto
├── downloads/                   # PDFs baixados
└── venv/                        # Ambiente virtual
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
