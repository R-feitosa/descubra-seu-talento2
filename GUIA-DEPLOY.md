# Guia de Deploy - Jogo "Descubra seu Talento"

## 📦 Preparação para Produção

### 1. Verificar Dependências

Certifique-se de que todas as dependências estão instaladas:

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=file:./data.db

# Sessão
SESSION_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres

# Ambiente
NODE_ENV=production
PORT=3000
```

**Importante:** Gere uma chave secreta forte para `SESSION_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Build do Projeto

Execute o build para produção:

```bash
pnpm build
```

Isso irá:
- Compilar o frontend (Vite)
- Compilar o backend (esbuild)
- Gerar arquivos otimizados na pasta `dist/`

### 4. Inicializar Banco de Dados

Se for a primeira vez, execute as migrações:

```bash
pnpm db:push
```

---

## 🚀 Opções de Deploy

### Opção 1: Deploy em VPS (Recomendado)

#### Requisitos
- Node.js 18+ instalado
- Python 3.11+ instalado
- PM2 para gerenciamento de processos

#### Passos

1. **Instalar PM2 globalmente:**
```bash
npm install -g pm2
```

2. **Clonar o repositório no servidor:**
```bash
git clone <seu-repositorio>
cd rfeitosa-talento-game
```

3. **Instalar dependências:**
```bash
pnpm install
```

4. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
nano .env  # Editar com suas configurações
```

5. **Build do projeto:**
```bash
pnpm build
```

6. **Iniciar com PM2:**
```bash
pm2 start dist/index.js --name "rfeitosa-talento"
pm2 save
pm2 startup  # Seguir instruções para auto-start
```

7. **Configurar Nginx como reverse proxy:**

```nginx
server {
    listen 80;
    server_name seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Configurar SSL com Let's Encrypt:**
```bash
sudo certbot --nginx -d seudominio.com.br
```

---

### Opção 2: Deploy no Vercel (Simplificado)

**Nota:** O Vercel é ideal para o frontend, mas pode ter limitações para o backend Python.

1. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Configurar variáveis de ambiente no dashboard do Vercel**

---

### Opção 3: Deploy no Railway (Recomendado para Full-Stack)

1. **Criar conta no Railway:** https://railway.app

2. **Conectar repositório GitHub**

3. **Configurar variáveis de ambiente no dashboard**

4. **Deploy automático a cada push**

---

### Opção 4: Deploy no Render (Gratuito)

1. **Criar conta no Render:** https://render.com

2. **Criar novo Web Service**

3. **Conectar repositório**

4. **Configurar:**
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

5. **Adicionar variáveis de ambiente**

---

## 🔧 Configurações Importantes

### Python no Servidor

Certifique-se de que Python 3.11+ está instalado e que o ReportLab está disponível:

```bash
python3.11 -m pip install reportlab pillow
```

### Permissões de Arquivos

O servidor precisa ter permissão para:
- Criar arquivos temporários em `/tmp/`
- Ler arquivos em `client/public/pdf-assets/`

### Banco de Dados

O projeto usa SQLite por padrão. Para produção, considere:
- Fazer backup regular do arquivo `data.db`
- Ou migrar para PostgreSQL (requer alteração no `DATABASE_URL`)

---

## 📊 Monitoramento

### Logs com PM2

```bash
# Ver logs em tempo real
pm2 logs rfeitosa-talento

# Ver logs de erro
pm2 logs rfeitosa-talento --err

# Monitorar recursos
pm2 monit
```

### Reiniciar Aplicação

```bash
# Reiniciar
pm2 restart rfeitosa-talento

# Recarregar sem downtime
pm2 reload rfeitosa-talento

# Parar
pm2 stop rfeitosa-talento
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] `SESSION_SECRET` forte e único
- [ ] HTTPS configurado (SSL/TLS)
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] Backups automáticos do banco de dados
- [ ] Rate limiting configurado (se necessário)
- [ ] Headers de segurança configurados

### Headers de Segurança (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## 📈 Otimizações

### Cache de Assets

Configure cache para arquivos estáticos no Nginx:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Compressão Gzip

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
pnpm install
pnpm build
```

### Erro: "Port already in use"
```bash
# Verificar processo na porta
lsof -i :3000
# Matar processo
kill -9 <PID>
```

### Erro: "PDF generation failed"
```bash
# Verificar Python
python3.11 --version
# Instalar ReportLab
python3.11 -m pip install reportlab pillow
```

### Erro: "Database locked"
```bash
# Parar aplicação
pm2 stop rfeitosa-talento
# Verificar processos
ps aux | grep node
# Reiniciar
pm2 restart rfeitosa-talento
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs: `pm2 logs rfeitosa-talento`
2. Consultar documentação do projeto
3. Contatar equipe de desenvolvimento

---

## ✅ Checklist Final de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Banco de dados inicializado
- [ ] Python 3.11+ e ReportLab instalados
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/HTTPS configurado
- [ ] Domínio apontando para o servidor
- [ ] Backups automáticos configurados
- [ ] Monitoramento ativo
- [ ] Teste completo do jogo realizado
- [ ] Teste de geração de PDF realizado

---

**Data de criação:** 20 de outubro de 2025
**Versão:** 1.0.0 - Produção

