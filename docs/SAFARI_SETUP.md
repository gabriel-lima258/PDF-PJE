# Configuração do Safari WebDriver

## Visão Geral

Este projeto suporta tanto **Chromium** (no Docker) quanto **Safari** (localmente no macOS). O Safari oferece melhor integração com o sistema macOS e pode ser mais estável para alguns casos de uso.

## 🍎 Execução Local com Safari (macOS)

### Pré-requisitos

1. **macOS** - Safari só funciona no macOS
2. **Python 3.11+** instalado
3. **Safari** instalado (vem por padrão no macOS)

### Configuração Inicial

1. **Execute o script de configuração:**
   ```bash
   python run_local_macos.py
   ```

2. **Configure suas credenciais:**
   Edite o arquivo `.env` criado:
   ```env
   USERNAME_PJE=seu_usuario_real
   PASSWORD=sua_senha_real
   USE_SAFARI=true
   ```

3. **Habilite o Safari WebDriver:**
   - Abra o Safari
   - Vá em **Safari > Develop > Allow Remote Automation**
   - Ou execute no terminal: `safaridriver --enable`

### Execução

```bash
python src/web/web_app.py
```

Acesse: http://localhost:5001

## 🐳 Execução com Docker (Chromium)

### Vantagens do Docker
- ✅ Funciona em qualquer sistema operacional
- ✅ Ambiente isolado e reproduzível
- ✅ Não interfere com configurações locais

### Execução

```bash
# Construir a imagem
docker build -t pdf-pje .

# Executar o container
docker run -p 5001:5001 -v $(pwd)/downloads:/app/downloads pdf-pje
```

## 🔄 Comparação: Safari vs Chromium

| Aspecto | Safari | Chromium |
|---------|--------|----------|
| **Sistema** | macOS apenas | Multi-plataforma |
| **Configuração** | Simples | Docker necessário |
| **Performance** | Nativa | Virtualizada |
| **Downloads** | Pasta Downloads padrão | Configurável |
| **Estabilidade** | Muito estável | Estável |
| **Manutenção** | Automática | Manual |

## 🛠️ Solução de Problemas

### Safari não inicia
1. Verifique se está no macOS
2. Habilite o Safari WebDriver: `safaridriver --enable`
3. Verifique se `USE_SAFARI=true` no arquivo `.env`

### Downloads não aparecem
- **Safari**: Verifique a pasta `~/Downloads`
- **Chromium**: Verifique a pasta `./downloads` (Docker) ou Desktop

### Erro de autenticação
- Verifique as credenciais no arquivo `.env`
- Certifique-se de que o usuário e senha estão corretos

## 📁 Estrutura de Downloads

### Safari (macOS)
```
~/Downloads/
├── Nome_Pessoa_1/
│   ├── processo1.pdf
│   └── processo2.pdf
└── Nome_Pessoa_2/
    └── processo3.pdf
```

### Chromium (Docker)
```
./downloads/
├── Nome_Pessoa_1/
│   ├── processo1.pdf
│   └── processo2.pdf
└── Nome_Pessoa_2/
    └── processo3.pdf
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

```env
# Configurações do PJE
USERNAME_PJE=seu_usuario
PASSWORD=sua_senha

# Configurações do Navegador
USE_SAFARI=true          # true para Safari, false para Chromium
DOWNLOAD_DIR=/caminho    # Diretório de downloads (Chromium)
```

### Logs Detalhados

O sistema fornece logs detalhados em tempo real:
- Status de cada etapa
- Progresso percentual
- Mensagens de erro específicas
- Localização dos arquivos baixados

## 🚀 Recomendações

### Para Desenvolvimento
- Use **Safari** no macOS para desenvolvimento rápido
- Use **Chromium** no Docker para testes de produção

### Para Produção
- Use **Chromium** no Docker para maior compatibilidade
- Configure volumes persistentes para downloads

### Para Usuários Finais
- **macOS**: Use Safari para melhor integração
- **Outros sistemas**: Use Docker com Chromium

