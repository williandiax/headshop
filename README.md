# Mary Jane Head Shop — projeto completo

## Estrutura

```
index.html        → site público (catálogo, gate de idade, contato)
admin.html         → painel administrativo (site separado)
app.js              → toda a lógica da API (Express)
server.js            → sobe a API localmente ou em hosts tradicionais (Railway, Render, VPS)
api/index.js          → entrada da API no formato serverless (usado pelo Vercel)
vercel.json            → configuração de rotas para o Vercel
database/schema.sql     → estrutura do banco (tabelas)
database/seed.sql        → produtos de exemplo + usuário admin padrão
scripts/hash-password.js  → gera hash bcrypt pra trocar senha do admin direto no banco
```

## Deploy em produção
Siga o passo a passo em **[DEPLOY.md](./DEPLOY.md)** — Supabase pro banco e Vercel pro site + admin + API, tudo no mesmo domínio.

## Rodando localmente

### 1. Banco de dados
Use um banco Postgres (Supabase/Neon têm plano grátis, ou instale localmente). Rode nessa ordem:
```
database/schema.sql
database/seed.sql
```

### 2. API
```bash
cp .env.example .env     # preencha com a DATABASE_URL do seu banco
npm install
npm start
```
A API sobe em `http://localhost:4000`.

### 3. Sites
Não abra os `.html` direto no navegador (o `file://` bloqueia as chamadas à API). Sirva com um servidor local simples:
```bash
python3 -m http.server 5500
```
Depois acesse `http://localhost:5500/index.html` e `http://localhost:5500/admin.html`.
O `API_BASE` dentro dos HTMLs já detecta sozinho se está em `localhost` (usa `http://localhost:4000`) ou em produção (usa o mesmo domínio) — não precisa editar nada na mão.

## Login padrão do admin
```
email: admin@maryjaneheadshop.com.br
senha: maryjane2026
```
**Troque a senha assim que entrar pela primeira vez** (tem campo pra isso dentro do `admin.html`).

## Como as vendas são registradas
Cada clique em "Comprar no WhatsApp" no site cria um pedido com status `pendente` no banco.
Quando a venda realmente fechar na conversa do WhatsApp, alguém da equipe entra no `admin.html`
e marca o pedido como `confirmada` (ou `cancelada`, se não foi pra frente). O faturamento exibido
no dashboard soma só os pedidos confirmados.
