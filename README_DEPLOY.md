# Deploy em Produção - PJe PDF Scraper

Este documento explica como fazer o deploy do projeto PJe PDF Scraper em produção usando Docker.

## 📋 Pré-requisitos

- Docker (versão 20.10+)
- Docker Compose (versão 2.0+)
- 4GB RAM mínimo
- 10GB espaço em disco

## 🚀 Deploy Rápido

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd selenium-pdf
```

### 2. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env com suas credenciais do PJe
nano .env
```

### 3. Execute o deploy
```bash
chmod +x deploy.sh
./deploy.sh build
./deploy.sh start
```

## 🔧 Configuração Detalhada

### Variáveis de Ambiente (.env)

```env
# Configurações do PJe (OBRIGATÓRIO)
USER=seu_usuario_pje
PASSWORD=sua_senha_pje

# Configurações da API
API_URL=http://localhost:5000/upload
API_KEY=

# Configurações do servidor Flask
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
FLASK_ENV=production
```

### Comandos do Script de Deploy

```bash
# Construir imagem
./deploy.sh build

# Iniciar serviços
./deploy.sh start

# Parar serviços
./deploy.sh stop

# Reiniciar serviços
./deploy.sh restart

# Ver logs
./deploy.sh logs

# Ver status
./deploy.sh status

# Limpar tudo
./deploy.sh clean
```

## 🐳 Comandos Docker Diretos

### Build da imagem
```bash
docker-compose build --no-cache
```

### Iniciar serviços
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Parar serviços
```bash
docker-compose down
```

### Ver status
```bash
docker-compose ps
```

## 📊 Monitoramento

### Health Check
A aplicação possui health check automático:
```bash
curl http://localhost:5000/health
```

### Logs em tempo real
```bash
docker-compose logs -f pje-scraper
```

### Status dos containers
```bash
docker-compose ps
```

## 🔒 Segurança

### Usuário não-root
O container roda com usuário não-root (`appuser`) para maior segurança.

### Volumes persistentes
Os PDFs são armazenados em volumes Docker persistentes:
- `pdfs_data`: PDFs recebidos
- `downloads_data`: Downloads temporários

### Variáveis de ambiente
As credenciais sensíveis são passadas via variáveis de ambiente.

## 🛠️ Troubleshooting

### Problemas comuns

#### 1. Container não inicia
```bash
# Verificar logs
docker-compose logs pje-scraper

# Verificar se as variáveis de ambiente estão corretas
docker-compose config
```

#### 2. Chrome não funciona no container
```bash
# Rebuild da imagem
docker-compose build --no-cache pje-scraper
```

#### 3. Problemas de permissão
```bash
# Verificar permissões dos volumes
docker-compose exec pje-scraper ls -la /app
```

#### 4. API não responde
```bash
# Verificar se a porta está exposta
docker port pje-scraper-api

# Testar health check
curl http://localhost:5000/health
```

### Logs detalhados
```bash
# Logs da aplicação
docker-compose logs pje-scraper

# Logs do sistema
docker-compose exec pje-scraper dmesg

# Verificar processos
docker-compose exec pje-scraper ps aux
```

## 📈 Escalabilidade

### Múltiplas instâncias
Para escalar horizontalmente:
```bash
docker-compose up -d --scale pje-scraper=3
```

### Load Balancer
Adicione um load balancer (nginx/traefik) para distribuir carga.

### Monitoramento
Integre com ferramentas como:
- Prometheus + Grafana
- ELK Stack
- Datadog

## 🔄 Atualizações

### Atualizar aplicação
```bash
# Parar serviços
./deploy.sh stop

# Pull das mudanças
git pull

# Rebuild e start
./deploy.sh build
./deploy.sh start
```

### Backup dos dados
```bash
# Backup dos volumes
docker run --rm -v pje-scraper_pdfs_data:/data -v $(pwd):/backup alpine tar czf /backup/pdfs_backup.tar.gz -C /data .
docker run --rm -v pje-scraper_downloads_data:/data -v $(pwd):/backup alpine tar czf /backup/downloads_backup.tar.gz -C /data .
```

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cliente       │    │   Load Balancer │    │   Container     │
│   (Browser)     │───▶│   (Opcional)    │───▶│   PJe Scraper   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Volumes       │
                                              │   - pdfs_data   │
                                              │   - downloads   │
                                              └─────────────────┘
```

## 📝 Checklist de Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env` configurado
- [ ] Credenciais do PJe válidas
- [ ] Porta 5000 disponível
- [ ] Espaço em disco suficiente
- [ ] Memória RAM suficiente (4GB+)
- [ ] Build da imagem bem-sucedido
- [ ] Container iniciado sem erros
- [ ] Health check passando
- [ ] API respondendo corretamente
- [ ] Logs sem erros críticos

## 🆘 Suporte

Para problemas específicos:
1. Verifique os logs: `./deploy.sh logs`
2. Teste o health check: `curl http://localhost:5000/health`
3. Verifique as variáveis de ambiente
4. Consulte a documentação da API: `API_DOCUMENTATION.md` 