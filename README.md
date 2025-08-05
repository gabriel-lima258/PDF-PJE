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
  "message": "Scraper iniciado para CPF: 12345678901"
}
```

---

### 2. **Upload de PDF**
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
curl -X POST http://localhost:5000/upload \
  -F "pdf=@arquivo.pdf" \
  -F "processo_info={\"cpf\":\"12345678901\",\"processo\":\"001\"}"
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

### 3. **Listar PDFs**
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

### 4. **Download Individual**
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

### 5. **Download Múltiplo**
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

### 6. **Health Check**
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

1. **Executar Scraper**: `GET /executar-scraper?cpf=12345678901`
2. **Upload Automático**: O script PJe faz upload dos PDFs via `POST /upload`
3. **Listar PDFs**: `GET /pdfs` para ver os arquivos disponíveis
4. **Download**: 
   - Individual: `GET /download/<filename>`
   - Múltiplo: `POST /download-multiple`

---

## 📁 Estrutura de Arquivos

```
projeto/
├── pdfs/                    # Diretório onde os PDFs são salvos
├── api_server.py           # Servidor Flask
├── pje.py                  # Script do PJe
├── config.py               # Configurações
└── API_DOCUMENTATION.md    # Esta documentação
```

---

## ⚠️ Observações Importantes

- **Remoção automática**: Os arquivos são removidos automaticamente após o download
- **Nomes únicos**: Os arquivos recebem timestamp para evitar conflitos
- **Validação**: Apenas arquivos PDF são aceitos
- **Tamanho máximo**: 400MB por arquivo

---

## 🛠️ Como Usar

1. **Inicie o servidor**:
   ```bash
   python api_server.py
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
