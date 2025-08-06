# API de Status do Scraper

Este documento descreve as rotas de status para acompanhar a execução do scraper PJE.

## Rotas Disponíveis

### 1. Executar Scraper
**GET** `/executar-scraper?cpf=<CPF>`

Inicia a execução do scraper para um CPF específico.

**Exemplo:**
```bash
curl "http://localhost:5000/executar-scraper?cpf=12345678901"
```

**Resposta:**
```json
{
  "message": "Scraper iniciado para CPF: 12345678901",
  "job_id": "12345678901_20241201_143022",
  "status_url": "/scraper-status/12345678901_20241201_143022"
}
```

### 2. Verificar Status Individual
**GET** `/scraper-status/<job_id>`

Verifica o status de uma execução específica do scraper.

**Exemplo:**
```bash
curl "http://localhost:5000/scraper-status/12345678901_20241201_143022"
```

**Resposta (em execução):**
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

**Resposta (concluído):**
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

**Resposta (erro):**
```json
{
  "job_id": "12345678901_20241201_143022",
  "cpf": "12345678901",
  "status": "error",
  "start_time": "2024-12-01T14:30:22.123456",
  "end_time": "2024-12-01T14:30:25.123456",
  "duration_seconds": 2.0,
  "progress": "Erro: Elemento não encontrado",
  "error": "Elemento não encontrado"
}
```

### 3. Listar Todos os Status
**GET** `/scraper-status`

Lista todos os status de execução do scraper.

**Parâmetros opcionais:**
- `cpf`: Filtrar por CPF específico
- `status`: Filtrar por status (running, completed, error)

**Exemplo:**
```bash
# Listar todos
curl "http://localhost:5000/scraper-status"

# Filtrar por CPF
curl "http://localhost:5000/scraper-status?cpf=12345678901"

# Filtrar por status
curl "http://localhost:5000/scraper-status?status=completed"
```

**Resposta:**
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
    },
    "98765432100_20241201_144500": {
      "cpf": "98765432100",
      "status": "running",
      "start_time": "2024-12-01T14:45:00.123456",
      "end_time": null,
      "result": null,
      "error": null,
      "progress": "Executando login..."
    }
  }
}
```

## Estados do Status

- **`running`**: Scraper em execução
- **`completed`**: Scraper concluído com sucesso
- **`error`**: Scraper falhou com erro

## Fluxo de Uso

1. **Iniciar scraper:**
   ```bash
   curl "http://localhost:5000/executar-scraper?cpf=12345678901"
   ```

2. **Acompanhar status:**
   ```bash
   # Usar o job_id retornado na resposta anterior
   curl "http://localhost:5000/scraper-status/12345678901_20241201_143022"
   ```

3. **Verificar quando concluído:**
   - Status mudará para `completed` ou `error`
   - Campo `result` conterá os PDFs encontrados (se sucesso)
   - Campo `error` conterá detalhes do erro (se falha)

## Limpeza Automática

Os status são mantidos em memória durante a execução do servidor. Para limpeza automática, você pode implementar um sistema de expiração baseado no timestamp de `end_time`. 