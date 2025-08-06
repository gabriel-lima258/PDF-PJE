# Deploy na VPS com Docker e Traefik

Este guia explica como fazer o deploy da aplicação Selenium PDF na VPS usando Docker e Traefik.

## Pré-requisitos

- VPS com Docker e Docker Compose instalados
- Traefik configurado e rodando
- Domínio configurado e apontando para a VPS
- Certificado SSL (Let's Encrypt via Traefik)

## Estrutura de Arquivos

```
Selenium - PDF/
├── api_server.py          # Aplicação Flask
├── pje.py                 # Script Selenium
├── config.py              # Configurações
├── requirements.txt       # Dependências Python
├── Dockerfile            # Configuração do container
├── docker-compose.yml    # Orquestração com Traefik
├── .dockerignore         # Arquivos ignorados no build
├── deploy.sh             # Script de deploy
├── env.example           # Exemplo de variáveis de ambiente
├── .env                  # Variáveis de ambiente (criar)
├── pdfs/                 # Diretório para PDFs
└── downloads/            # Diretório para downloads
```

## Passos para Deploy

### 1. Preparar o Ambiente

```bash
# Clonar o repositório na VPS
git clone <seu-repositorio>
cd "Selenium - PDF"

# Copiar arquivo de exemplo
cp env.example .env

# Editar as variáveis de ambiente
nano .env
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```env
# Configurações do PJE
USER=seu_usuario_pje
PASSWORD=sua_senha_pje

# Configurações da API
API_URL=https://api.seu-dominio.com/upload
API_KEY=sua_api_key_segura

# Configurações do servidor Flask
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
FLASK_ENV=production

# Configurações do domínio para Traefik
DOMAIN=seu-dominio.com

# Configurações opcionais
DOWNLOAD_TIMEOUT=45
WEBDRIVER_WAIT=10
```

### 3. Configurar Traefik

Certifique-se de que o Traefik está configurado com:

- Network `traefik_network` criada
- Certificados SSL configurados
- Entrypoints `websecure` configurado

### 4. Executar Deploy

```bash
# Tornar o script executável
chmod +x deploy.sh

# Executar o deploy
./deploy.sh
```

### 5. Verificar Deploy

```bash
# Verificar status dos containers
docker-compose ps

# Verificar logs
docker-compose logs api

# Testar health check
curl https://api.seu-dominio.com/health
```

## Endpoints da API

- **Health Check**: `GET https://api.seu-dominio.com/health`
- **Upload PDF**: `POST https://api.seu-dominio.com/upload`
- **Listar PDFs**: `GET https://api.seu-dominio.com/pdfs`
- **Download PDF**: `GET https://api.seu-dominio.com/download/<filename>`
- **Download Múltiplo**: `POST https://api.seu-dominio.com/download-multiple`
- **Executar Scraper**: `GET https://api.seu-dominio.com/executar-scraper?cpf=<CPF>`
- **Status Scraper**: `GET https://api.seu-dominio.com/scraper-status/<job_id>`
- **Listar Status**: `GET https://api.seu-dominio.com/scraper-status`

## Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar aplicação
docker-compose down

# Reiniciar aplicação
docker-compose restart

# Ver logs em tempo real
docker-compose logs -f api

# Rebuild e restart
docker-compose up -d --build
```

### Backup e Restore

```bash
# Backup dos PDFs
tar -czf backup_pdfs_$(date +%Y%m%d).tar.gz pdfs/

# Backup das configurações
cp .env backup_env_$(date +%Y%m%d)
```

### Monitoramento

```bash
# Ver uso de recursos
docker stats

# Ver logs do Traefik
docker logs traefik

# Verificar certificados SSL
docker exec traefik traefik version
```

## Troubleshooting

### Problemas Comuns

1. **Container não inicia**
   ```bash
   docker-compose logs api
   ```

2. **Traefik não roteia**
   ```bash
   docker logs traefik
   docker network ls
   ```

3. **Certificado SSL não funciona**
   ```bash
   docker exec traefik traefik version
   ```

4. **Permissões de arquivo**
   ```bash
   sudo chown -R $USER:$USER pdfs/ downloads/
   chmod 755 pdfs/ downloads/
   ```

### Logs Importantes

- **Aplicação**: `docker-compose logs api`
- **Traefik**: `docker logs traefik`
- **Sistema**: `journalctl -u docker`

## Segurança

- Use senhas fortes para o PJE
- Configure firewall adequadamente
- Mantenha o sistema atualizado
- Monitore logs regularmente
- Faça backups periódicos

## Atualizações

Para atualizar a aplicação:

```bash
# Pull das mudanças
git pull

# Rebuild e restart
docker-compose up -d --build
```

## Suporte

Em caso de problemas:

1. Verifique os logs: `docker-compose logs api`
2. Teste localmente primeiro
3. Verifique configurações do Traefik
4. Consulte a documentação do Traefik 