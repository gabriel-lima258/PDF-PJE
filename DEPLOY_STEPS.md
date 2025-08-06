# 🚀 Deploy na VPS - Passos Rápidos

## ✅ Pré-requisitos Verificados
- [x] Docker instalado na VPS
- [x] Traefik configurado e rodando
- [x] Domínio configurado

## 📋 Passos para Deploy

### 1. Preparar Projeto na VPS
```bash
# Na sua VPS
git clone <seu-repositorio>
cd "Selenium - PDF"
cp env.example .env
nano .env  # Configure suas variáveis
```

### 2. Configurar .env
```env
USER=seu_usuario_pje
PASSWORD=sua_senha_pje
API_URL=https://api.seu-dominio.com/upload
API_KEY=sua_api_key_segura
DOMAIN=seu-dominio.com
FLASK_DEBUG=False
FLASK_ENV=production
```

### 3. Executar Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Verificar Deploy
```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs api

# Testar API
curl https://api.seu-dominio.com/health
```

## 🔧 Comandos Úteis

```bash
# Parar aplicação
docker-compose down

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f api

# Rebuild
docker-compose up -d --build
```

## 🌐 URLs da API

- **Health**: `https://api.seu-dominio.com/health`
- **Upload**: `POST https://api.seu-dominio.com/upload`
- **PDFs**: `GET https://api.seu-dominio.com/pdfs`
- **Scraper**: `GET https://api.seu-dominio.com/executar-scraper?cpf=<CPF>`

## 🆘 Troubleshooting

```bash
# Se container não inicia
docker-compose logs api

# Se Traefik não roteia
docker logs traefik

# Se certificado não funciona
docker exec traefik traefik version
```

## 📚 Documentação Completa

- `README_DEPLOY.md` - Guia detalhado
- `traefik-setup.md` - Configuração do Traefik
- `STATUS_API.md` - Documentação da API 