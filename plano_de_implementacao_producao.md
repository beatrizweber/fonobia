# Plano de implementação — Produção (VPS)

Passo a passo pra colocar o AjudaÁudio no ar, do zero, numa VPS **AlmaLinux 9** (família RHEL/CentOS — usa `dnf`, `firewalld` e SELinux, diferente de Ubuntu/Debian). Domínio de exemplo usado neste guia: `ajudaaudio.vivitsolucoes.com.br` — troque pelo seu se for diferente.

Marque cada passo conforme for concluindo. Sempre que tiver um "✅ Verificação", rode o comando antes de seguir pro próximo — não pule.

---

## 0. Antes de começar

- [ ] IP da VPS e acesso SSH (usuário + senha, ou chave)
- [ ] Domínio apontando pra essa VPS via registro DNS tipo A:
  ```
  Tipo: A
  Nome: @ (e "www", se quiser os dois)
  Valor: SEU_IP_DA_VPS
  ```
  Sem isso, o site só funciona por `http://SEU_IP` (e o passo de HTTPS não funciona).
- [ ] Os segredos de produção (já estão no bloco do passo 4 abaixo, revise antes de colar).

---

## 1. Conectar na VPS

Do seu computador:

```bash
ssh root@SEU_IP_DA_VPS
```

Troque `root` pelo usuário que sua provedora te deu, se for diferente.

---

## 2. Instalar o Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker --now
```

Isso instala o Docker Engine **e** o plugin do Docker Compose (`docker compose`, sem hífen) juntos.

### ✅ Verificação

```bash
docker --version
docker compose version
```

---

## 3. Clonar o repositório

```bash
cd /opt
git clone https://github.com/beatrizweber/fonobia.git
cd fonobia
```

Todos os comandos a partir daqui assumem que você está em `/opt/fonobia`.

---

## 4. Criar o `.env` de produção

O projeto usa **um único `.env` na raiz** (não existe mais `.env` separado em `client/` nem `server/`) — alimenta o backend, o build do frontend e o `docker-compose.yml` ao mesmo tempo.

```bash
cat > .env <<'EOF'
# --- Servidor ---
PORT=3001

# --- Banco de dados ---
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senai
DB_NAME=ajudaaudio
DB_SSL=false

# --- IA do chat (Zélia) ---
GEMINI_API_KEY=COLE_AQUI_SUA_CHAVE_GEMINI
GROQ_API_KEY=COLE_AQUI_SUA_CHAVE_GROQ

# --- Autenticação ---
# Gere com: openssl rand -hex 48
JWT_SECRET=COLE_AQUI_UM_SEGREDO_ALEATORIO_LONGO

# --- E-mail transacional ---
SMTP_EMAIL=interlagos.escuderia@gmail.com
SMTP_APP_PASSWORD=COLE_AQUI_A_SENHA_DE_APP_DO_GMAIL

# --- Endereços da aplicação ---
FRONTEND_URL=http://ajudaaudio.vivitsolucoes.com.br
CORS_ORIGENS=

# --- Frontend (Vite) ---
VITE_API_URL=http://ajudaaudio.vivitsolucoes.com.br
EOF
```

`FRONTEND_URL` e `VITE_API_URL` são **o mesmo domínio, sem `/api` no final** — o nginx (passo 7) coloca site e API atrás do mesmo domínio, só muda o caminho (`/` → site, `/api/` → backend).

### ✅ Verificação

```bash
cat .env
```

---

## 5. Remover o EasyPanel/Traefik

Essa VPS veio com o **EasyPanel** pré-instalado, com um **Traefik** ocupando as portas 80/443 — precisa tirar ele do caminho antes do nginx conseguir subir. Só faça isso numa VPS dedicada a este projeto (era o caso aqui — nada mais dependia do EasyPanel).

Os nomes dos containers (`easypanel.1.xxx`, `easypanel-traefik.1.xxx`) são serviços do **Docker Swarm** — um `docker stop`/`docker rm` normal não resolve, o Swarm recria sozinho. Remove o serviço de verdade:

```bash
docker service ls
docker service rm $(docker service ls --filter name=easypanel -q)
docker swarm leave --force
```

### ✅ Verificação

```bash
docker ps
sudo ss -tlnp | grep ':80 '
```

Não deve sobrar `easypanel`/`traefik` no `docker ps`, nem nada escutando na porta 80.

---

## 6. Subir os containers do AjudaÁudio

```bash
docker compose up -d --build
```

Builda `client` e `server`, sobe o Postgres, cria o schema automaticamente (`banco.sql`, só na primeira vez) e deixa tudo rodando em segundo plano.

### ✅ Verificação

```bash
docker compose ps
```
As três linhas (`db`, `server`, `client`) em `running` (`db` também `healthy`).

```bash
curl http://127.0.0.1:3001/api/health
curl -I http://127.0.0.1:8080
```
O primeiro responde `{"status":"OK",...}`, o segundo `HTTP/1.1 200 OK`.

Se algo não subir: `docker compose logs server` / `client` / `db`.

---

## 7. Instalar e configurar o nginx (proxy reverso)

### 7.1. Instalar e iniciar

```bash
sudo dnf install nginx -y
sudo systemctl enable nginx --now
```

### 7.2. Criar a configuração do site

No AlmaLinux/RHEL não existe `sites-available`/`sites-enabled` (isso é só do pacote Debian/Ubuntu) — os arquivos de site vão direto em `/etc/nginx/conf.d/*.conf`, carregados automaticamente:

```bash
sudo nano /etc/nginx/conf.d/ajudaaudio.conf
```

Cole (já com o domínio certo — se for outro, troque as duas ocorrências de `server_name`):

```nginx
server {
    listen 80;
    server_name ajudaaudio.vivitsolucoes.com.br;

    # O chat aceita foto/vídeo até 25MB
    client_max_body_size 30M;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Salve (`Ctrl+O`, `Enter`, `Ctrl+X`) e aplique:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7.3. SELinux (não pode pular)

O AlmaLinux tem SELinux ativado por padrão, e ele **bloqueia** o nginx de fazer proxy pra outras portas mesmo sendo `127.0.0.1`. Sem isso, o site carrega mas login/cadastro/chat dão 502:

```bash
sudo setsebool -P httpd_can_network_connect 1
```

### ✅ Verificação

```bash
systemctl status nginx
```
`active (running)`.

---

## 8. Firewall

```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

Só isso é necessário — as portas do Docker (`3001`, `8080`) já estão em `127.0.0.1`, inacessíveis de fora mesmo sem regra de firewall.

### ✅ Verificação

```bash
sudo firewall-cmd --list-all
```

---

## 9. Testar no navegador

```
http://ajudaaudio.vivitsolucoes.com.br
```

O site precisa carregar **e o login/cadastro precisa funcionar** (fala com `/api/...` no mesmo domínio). Se a página carrega mas login/cadastro dá erro de rede ou 502, o passo 7.3 (SELinux) ficou pra trás.

---

## 10. (Opcional, recomendado) HTTPS com Let's Encrypt

```bash
sudo dnf install epel-release -y
sudo dnf install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ajudaaudio.vivitsolucoes.com.br
```

O certbot edita o nginx sozinho (certificado + redireciona `http://` pra `https://`) e configura renovação automática.

Depois, **atualize o `.env`** trocando `http://` por `https://` em `FRONTEND_URL` e `VITE_API_URL`, e reconstrua só o front/back (sem derrubar o banco):

```bash
nano .env
docker compose up -d --build client server
```

### ✅ Verificação

```
https://ajudaaudio.vivitsolucoes.com.br
```
Cadeado de "conexão segura" no navegador.

---

## 11. Comandos do dia a dia

**Logs em tempo real:**
```bash
docker compose logs -f server
docker compose logs -f client
```

**Reiniciar tudo:**
```bash
docker compose restart
```

**Atualizar depois de um `git push` novo:**
```bash
cd /opt/fonobia
git pull
docker compose up -d --build
```

**Backup do banco:**
```bash
docker exec fonobia-db-1 pg_dump -U postgres ajudaaudio > backup_$(date +%Y%m%d).sql
```

**Restaurar um backup:**
```bash
cat backup_20260101.sql | docker exec -i fonobia-db-1 psql -U postgres -d ajudaaudio
```

**Parar tudo (sem apagar dados):**
```bash
docker compose down
```

**Parar tudo E apagar dados do banco/uploads (destrutivo):**
```bash
docker compose down -v
```

---

## Checklist final

- [x] Docker instalado (`docker --version`, `docker compose version`)
- [x] Repositório clonado em `/opt/fonobia`
- [x] `.env` criado na raiz, `FRONTEND_URL`/`VITE_API_URL` = `http://ajudaaudio.vivitsolucoes.com.br`
- [x] EasyPanel/Traefik removidos (porta 80 livre)
- [x] `docker compose up -d --build` — 3 serviços `running`/`healthy`
- [x] nginx instalado, config em `/etc/nginx/conf.d/ajudaaudio.conf`, `nginx -t` sem erro
- [x] `setsebool -P httpd_can_network_connect 1` rodado
- [x] Firewall (`firewalld`) liberando SSH/HTTP/HTTPS
- [ ] Site abre no navegador pelo domínio, **login funcionando** ← confirma isso agora
- [ ] HTTPS com certbot (opcional, mas recomendado antes de divulgar o link)
