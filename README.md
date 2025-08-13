# 🔍 Scraper PJE - Consulta de Processos

Programa que automatiza a busca de processos de "Cumprimento de Sentença" no PJE (Processo Judicial Eletrônico) por CPF.

## 🚀 Como Usar

### 1. **Pré-requisitos**
- Docker Desktop instalado
- Python 3.7+ (para detecção de desktop)
- Credenciais do PJE

### 2. **Configurar Credenciais**
Crie um arquivo `.env` na raiz do projeto:
```env
USERNAME_PJE=seu_usuario_real
PASSWORD=sua_senha_real
```

### 3. **Configurar Desktop (Primeira vez)**
```bash
# Detectar desktop automaticamente
python detect-desktop.py
```

### 4. **Executar**
```bash
docker-compose up --build
```

### 5. **Acessar**
Abra o navegador e acesse: **http://localhost:5001**

## 📁 Downloads no Desktop

Os PDFs são salvos **diretamente no seu desktop** em pastas organizadas por pessoa:

```
Desktop/
├── João Silva/          # Pasta criada automaticamente
│   ├── processo1.pdf
│   └── processo2.pdf
├── Maria Santos/        # Outra pessoa
│   └── processo3.pdf
└── ...
```

## ⚙️ Como Funciona

1. **Digite o nome e CPF** na interface web
2. **Clique em "Consultar"**
3. **Aguarde** o processo automático
4. **Encontre os PDFs** na pasta criada no seu desktop

## 📁 Estrutura do Projeto

```
PDF-PJE/
├── docker-compose.yml      # Configuração Docker
├── Dockerfile              # Imagem Docker
├── requirements.txt        # Dependências Python
├── .env                    # Suas credenciais (criar)
├── src/                    # Código fonte
└── downloads/              # Fallback de downloads
```

## ⚠️ Importante

- Use de forma ética e responsável
- Respeite os termos do PJE
- Mantenha suas credenciais seguras
- Evite muitas consultas em sequência

---

**Desenvolvido para facilitar consultas no PJE** ❤️
