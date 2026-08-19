# Como subir o projeto — Supabase (banco) + Vercel (site, admin e API)

Essa combinação é gratuita pra começar e não exige gerenciar servidor.

---

## Parte 1 — Banco de dados no Supabase

### 1.1 Criar o projeto
1. Acesse [supabase.com](https://supabase.com) e crie uma conta (dá pra usar login do GitHub)
2. Clique em **New project**
3. Escolha um nome (ex: `mary-jane-headshop`), uma senha forte para o banco (guarde ela!) e a região mais próxima (ex: São Paulo/`sa-east-1`)
4. Aguarde uns 2 minutos até o projeto ficar pronto

### 1.2 Rodar o schema e o seed
1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Abra o arquivo `database/schema.sql` deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**
4. Repita o processo com o `database/seed.sql` (nova query, colar, Run)
5. Confira em **Table Editor** se as tabelas `products`, `orders`, `metric_events` e `admin_users` foram criadas e se os 14 produtos aparecem em `products`

### 1.3 Pegar a connection string
1. Vá em **Project Settings** (ícone de engrenagem) → **Database**
2. Procure por **Connection string** → aba **URI**
3. Copie a string (algo como `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-...supabase.com:6543/postgres`)
4. Troque `[YOUR-PASSWORD]` pela senha que você criou no passo 1.1
5. Guarde essa URL — você vai colar ela no Vercel daqui a pouco

> Dica: use a connection string do modo **Transaction pooler** (porta 6543), que é a recomendada pra aplicações serverless como a que vamos hospedar no Vercel.

---

## Parte 2 — Site, admin e API no Vercel

O projeto já está preparado pra isso: o `index.html` e o `admin.html` ficam como site estático, e a pasta `/api` vira automaticamente uma função serverless que responde pela API.

### 2.1 Colocar o projeto num repositório Git
Se ainda não fez isso:
```bash
git init
git add .
git commit -m "primeira versão do projeto"
```
Suba pra um repositório no GitHub (crie um repo vazio lá e siga as instruções de `git remote add` + `git push` que o próprio GitHub mostra).

### 2.2 Importar no Vercel
1. Acesse [vercel.com](https://vercel.com) e crie uma conta (login com GitHub facilita)
2. Clique em **Add New → Project**
3. Selecione o repositório que você acabou de subir
4. Na tela de configuração, o Vercel deve detectar automaticamente que é um projeto Node — **não precisa mudar nada** em Build Command nem Output Directory

### 2.3 Configurar as variáveis de ambiente
Antes de clicar em **Deploy**, abra a seção **Environment Variables** e adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | a connection string do Supabase (Parte 1.3) |
| `JWT_SECRET` | qualquer string longa e aleatória (ex: gere uma em [randomkeygen.com](https://randomkeygen.com)) |
| `CORS_ORIGIN` | pode deixar em branco por enquanto (site e API vão ficar no mesmo domínio) |

### 2.4 Deploy
1. Clique em **Deploy** e aguarde
2. Quando terminar, o Vercel te dá uma URL tipo `https://mary-jane-headshop.vercel.app`
3. Acesse `https://SEU-PROJETO.vercel.app` → deve abrir o site com o catálogo carregando de verdade
4. Acesse `https://SEU-PROJETO.vercel.app/admin.html` → faça login com:
   ```
   email: admin@maryjaneheadshop.com.br
   senha: maryjane2026
   ```
5. **Troque essa senha imediatamente** no próprio painel (seção "Segurança")

> Você não precisa editar a linha do `API_BASE` nos arquivos HTML — ela já detecta sozinha se está rodando local ou em produção.

### 2.5 Domínio próprio (opcional)
Em **Project Settings → Domains** no Vercel, você pode apontar um domínio próprio (ex: `maryjaneheadshop.com.br`) seguindo as instruções de DNS que o Vercel mostra na hora.

---

## Testando se deu tudo certo

- [ ] O catálogo aparece na home com os produtos
- [ ] Clicar em "Comprar no WhatsApp" abre o WhatsApp com a mensagem preenchida
- [ ] No Supabase (Table Editor → `orders`), esse clique gerou uma linha nova com status `pendente`
- [ ] No `admin.html`, o pedido aparece na lista de Vendas e dá pra marcar como "Confirmada"
- [ ] Depois de confirmar, o "Faturamento confirmado" no topo do admin atualiza

## Problemas comuns

**Erro 500 na API / catálogo não carrega**
→ Confira se `DATABASE_URL` está certinha nas variáveis de ambiente do Vercel (senha sem `[ ]`, sem espaços).

**Login do admin não funcina**
→ Confirme se rodou o `seed.sql` no Supabase (é ele que cria o usuário admin).

**Alterei uma variável de ambiente e não mudou nada**
→ No Vercel, mudanças em variáveis de ambiente só valem a partir do próximo deploy. Vá em **Deployments** e clique em **Redeploy**.
