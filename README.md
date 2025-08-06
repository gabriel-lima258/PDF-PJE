# Documentação da API

Esta API gerencia o upload e download de PDFs baixados do PJe.

## 🌐 Endpoints

### 1. **Executar Scraper**
```
GET /executar-scraper?cpf=<CPF>
```
**Descrição**: Inicia o scraper do PJe para um CPF específico
**Parâmetros**:
- `cpf` (query): CPF para buscar processos

**Exemplo**:
```bash
curl "http://localhost:5000/executar-scraper?cpf=12345678901"
```

**Resposta**:
```json
{
  "message": "Scraper iniciado para CPF: 12345678901",
  "job_id": "12345678901_20241201_143022",
  "status_url": "/scraper-status/12345678901_20241201_143022"
}
```

---

### 2. **Status do Scraper**
```
GET /scraper-status/<job_id>
```
**Descrição**: Verifica o status de uma execução específica do scraper
**Parâmetros**:
- `job_id` (path): ID único da execução

**Exemplo**:
```bash
curl "http://localhost:5000/scraper-status/12345678901_20241201_143022"
```

**Resposta (em execução)**:
```json
{
  "job_id": "12345678901_20241201_143022",
  "cpf": "12345678901",
  "status": "running",
  "start_time": "2024-12-01T14:30:22.123456",
  "end_time": null,
  "duration_seconds": null,
  "progress": "Executando login..."
}
```

**Resposta (concluído)**:
```json
{
  "job_id": "12345678901_20241201_143022",
  "cpf": "12345678901",
  "status": "completed",
  "start_time": "2024-12-01T14:30:22.123456",
  "end_time": "2024-12-01T14:32:15.654321",
  "duration_seconds": 113.53,
  "progress": "Scraper concluído com sucesso",
  "result": [
    {
      "arquivo": "processo_1.pdf",
      "api_response": {...},
      "info": {...}
    }
  ]
}
```

---

### 3. **Listar Todos os Status**
```
GET /scraper-status
```
**Descrição**: Lista todos os status de execução do scraper
**Parâmetros opcionais**:
- `cpf` (query): Filtrar por CPF específico
- `status` (query): Filtrar por status (running, completed, error)

**Exemplo**:
```bash
# Listar todos
curl "http://localhost:5000/scraper-status"

# Filtrar por CPF
curl "http://localhost:5000/scraper-status?cpf=12345678901"

# Filtrar por status
curl "http://localhost:5000/scraper-status?status=completed"
```

**Resposta**:
```json
{
  "total_jobs": 5,
  "filtered_jobs": 2,
  "jobs": {
    "12345678901_20241201_143022": {
      "cpf": "12345678901",
      "status": "completed",
      "start_time": "2024-12-01T14:30:22.123456",
      "end_time": "2024-12-01T14:32:15.654321",
      "result": [...],
      "error": null,
      "progress": "Scraper concluído com sucesso"
    }
  }
}
```

---

---

### 4. **Upload de PDF**
```
POST /upload
```
**Descrição**: Recebe PDFs do script Selenium
**Formato**: `multipart/form-data`

**Campos**:
- `pdf` (file): Arquivo PDF
- `processo_info` (text, opcional): Informações do processo em JSON

**Exemplo**:
```bash
curl -X POST http://localhost:5000/upload \processo_info={\"cpf\":\"12345678901\",\"proces
  -F "pdf=@arquivo.pdf" \
  -F "so\":\"001\"}"
```

**Resposta**:
```json
{
  "success": true,
  "message": "PDF recebido com sucesso",
  "data": {
    "filename": "20231201_143022_arquivo.pdf",
    "filepath": "/path/to/file.pdf",
    "filesize": 12345,
    "upload_timestamp": "2023-12-01T14:30:22",
    "processo_info": {
      "cpf": "12345678901",
      "processo": "001"
    }
  }
}
```

---

### 5. **Listar PDFs**
```
GET /pdfs
```
**Descrição**: Lista todos os PDFs recebidos

**Exemplo**:
```bash
curl http://localhost:5000/pdfs
```

**Resposta**:
```json
{
  "success": true,
  "pdfs": [
    {
      "filename": "20231201_143022_arquivo1.pdf",
      "filesize": 12345,
      "upload_date": "2023-12-01T14:30:22"
    },
    {
      "filename": "20231201_143025_arquivo2.pdf",
      "filesize": 67890,
      "upload_date": "2023-12-01T14:30:25"
    }
  ],
  "total": 2
}
```

---

### 6. **Download Individual**
```
GET /download/<filename>
```
**Descrição**: Baixa um PDF específico e o remove após o download
**Parâmetros**:
- `filename` (path): Nome do arquivo PDF

**Exemplo**:
```bash
curl -O "http://localhost:5000/download/20231201_143022_arquivo1.pdf"
```

**Resposta**: Arquivo PDF para download

---

### 7. **Download Múltiplo**
```
POST /download-multiple
```
**Descrição**: Baixa múltiplos PDFs em um arquivo ZIP e os remove após o download
**Formato**: `application/json`

**Corpo da requisição**:
```json
{
  "filenames": [
    "20231201_143022_arquivo1.pdf",
    "20231201_143025_arquivo2.pdf"
  ]
}
```

**Exemplo**:
```bash
curl -X POST http://localhost:5000/download-multiple \
  -H "Content-Type: application/json" \
  -d '{"filenames": ["arquivo1.pdf", "arquivo2.pdf"]}' \
  -o pdfs.zip
```

**Resposta**: Arquivo ZIP contendo os PDFs

---

### 8. **Health Check**
```
GET /health
```
**Descrição**: Verifica o status da API

**Exemplo**:
```bash
curl http://localhost:5000/health
```

**Resposta**:
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T14:30:22",
  "upload_folder": "pdfs"
}
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo Básico
1. **Executar Scraper**: `GET /executar-scraper?cpf=12345678901`
2. **Acompanhar Status**: `GET /scraper-status/<job_id>`
3. **Upload Automático**: O script PJe faz upload dos PDFs via `POST /upload`
4. **Listar PDFs**: `GET /pdfs` para ver os arquivos disponíveis
5. **Download**: 
   - Individual: `GET /download/<filename>`
   - Múltiplo: `POST /download-multiple`

### Fluxo com Status
1. **Iniciar scraper**:
   ```bash
   curl "http://localhost:5000/executar-scraper?cpf=12345678901"
   ```
   Resposta inclui `job_id` para acompanhamento

2. **Acompanhar progresso**:
   ```bash
   curl "http://localhost:5000/scraper-status/12345678901_20241201_143022"
   ```
   Verifica status: `running`, `completed` ou `error`

3. **Verificar quando concluído**:
   - Status `completed`: PDFs encontrados em `result`
   - Status `error`: Detalhes do erro em `error`

4. **Listar todos os status**:
   ```bash
   curl "http://localhost:5000/scraper-status"
   ```

---

## 📁 Estrutura de Arquivos

```
projeto/
├── pdfs/                    # Diretório onde os PDFs são salvos
├── api_server.py           # Servidor Flask com sistema de status
├── pje.py                  # Script do PJe
├── config.py               # Configurações
├── exemplo_status.py       # Script de exemplo para usar o sistema de status
├── STATUS_API.md           # Documentação detalhada do sistema de status
└── README.md               # Esta documentação
```

---

## ⚠️ Observações Importantes

- **Remoção automática**: Os arquivos são removidos automaticamente após o download
- **Nomes únicos**: Os arquivos recebem timestamp para evitar conflitos
- **Validação**: Apenas arquivos PDF são aceitos
- **Tamanho máximo**: 400MB por arquivo

---

## 🛠️ Como Usar

### 1. Iniciar o Servidor
```bash
python api_server.py
```

### 2. Usar o Script de Exemplo
```bash
python exemplo_status.py
```
O script oferece um menu interativo para:
- Executar scraper e acompanhar status
- Listar todos os status
- Verificar saúde da API

### 3. Usar via cURL
```bash
# Iniciar scraper
curl "http://localhost:5000/executar-scraper?cpf=12345678901"

# Acompanhar status (substitua pelo job_id retornado)
curl "http://localhost:5000/scraper-status/12345678901_20241201_143022"

# Listar todos os status
curl "http://localhost:5000/scraper-status"
```

2. **Execute o scraper**:
   ```bash
   curl "http://localhost:5000/executar-scraper?cpf=12345678901"
   ```

3. **Verifique os PDFs**:
   ```bash
   curl http://localhost:5000/pdfs
   ```

4. **Faça download**:
   ```bash
   # Individual
   curl -O "http://localhost:5000/download/arquivo.pdf"
   
   # Múltiplo
   curl -X POST http://localhost:5000/download-multiple \
     -H "Content-Type: application/json" \
     -d '{"filenames": ["arquivo1.pdf", "arquivo2.pdf"]}' \
     -o pdfs.zip
   ``` 
