// ============================================================
// Mary Jane Head Shop — API (Node.js + Express + PostgreSQL)
// ============================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*" }));
app.use(express.json());

// ---------- middleware de autenticação admin ----------
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token ausente." });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

// ============================================================
// AUTENTICAÇÃO
// ============================================================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Informe email e senha." });

  const { rows } = await pool.query("SELECT * FROM admin_users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

app.put("/api/auth/password", requireAdmin, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [hash, req.admin.id]);
  res.json({ ok: true });
});

// ============================================================
// PRODUTOS
// ============================================================

// público — catálogo do site
app.get("/api/products", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, category, price, icon, description FROM products WHERE active = true ORDER BY created_at DESC"
  );
  res.json(rows);
});

// admin — lista completa (inclusive inativos)
app.get("/api/admin/products", requireAdmin, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  res.json(rows);
});

app.post("/api/products", requireAdmin, async (req, res) => {
  const { name, category, price, icon, description } = req.body;
  if (!name || !category || price == null) {
    return res.status(400).json({ error: "Nome, categoria e preço são obrigatórios." });
  }
  const { rows } = await pool.query(
    `INSERT INTO products (name, category, price, icon, description)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, category, price, icon || "🌿", description || ""]
  );
  res.status(201).json(rows[0]);
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  const { name, category, price, icon, description, active } = req.body;
  const { rows } = await pool.query(
    `UPDATE products SET
       name = COALESCE($1, name),
       category = COALESCE($2, category),
       price = COALESCE($3, price),
       icon = COALESCE($4, icon),
       description = COALESCE($5, description),
       active = COALESCE($6, active)
     WHERE id = $7 RETURNING *`,
    [name, category, price, icon, description, active, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Produto não encontrado." });
  res.json(rows[0]);
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.status(204).send();
});

// ============================================================
// PEDIDOS / VENDAS
// ============================================================

// público — cria um pedido quando alguém clica em "Comprar no WhatsApp"
app.post("/api/orders", async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId é obrigatório." });

  const { rows: prodRows } = await pool.query("SELECT * FROM products WHERE id = $1", [productId]);
  const product = prodRows[0];
  if (!product) return res.status(404).json({ error: "Produto não encontrado." });

  const { rows } = await pool.query(
    `INSERT INTO orders (product_id, product_name, price, category, status)
     VALUES ($1,$2,$3,$4,'pendente') RETURNING *`,
    [product.id, product.name, product.price, product.category]
  );

  await pool.query(
    `INSERT INTO metric_events (event_type, product_id) VALUES ('whatsapp_click', $1)`,
    [product.id]
  );

  res.status(201).json(rows[0]);
});

// admin — lista de pedidos
app.get("/api/orders", requireAdmin, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200");
  res.json(rows);
});

// admin — atualizar status de um pedido (confirmar / cancelar)
app.put("/api/orders/:id", requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!["pendente", "confirmada", "cancelada"].includes(status)) {
    return res.status(400).json({ error: "Status inválido." });
  }
  const { rows } = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Pedido não encontrado." });
  res.json(rows[0]);
});

// ============================================================
// MÉTRICAS
// ============================================================

// público — registra visita de página ou visualização de produto
app.post("/api/track", async (req, res) => {
  const { type, productId } = req.body;
  if (!["pageview", "product_view"].includes(type)) {
    return res.status(400).json({ error: "Tipo de evento inválido." });
  }
  await pool.query(
    "INSERT INTO metric_events (event_type, product_id) VALUES ($1, $2)",
    [type, productId || null]
  );
  res.status(201).json({ ok: true });
});

// admin — dashboard consolidado
app.get("/api/metrics", requireAdmin, async (req, res) => {
  const [pageviews, whatsappClicks, revenue, orderCounts, topProducts] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM metric_events WHERE event_type = 'pageview'"),
    pool.query("SELECT COUNT(*)::int AS n FROM metric_events WHERE event_type = 'whatsapp_click'"),
    pool.query("SELECT COALESCE(SUM(price),0)::numeric AS total FROM orders WHERE status = 'confirmada'"),
    pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'pendente')::int AS pendente,
        COUNT(*) FILTER (WHERE status = 'confirmada')::int AS confirmada,
        COUNT(*) FILTER (WHERE status = 'cancelada')::int AS cancelada
      FROM orders
    `),
    pool.query(`
      SELECT p.id, p.name, p.icon, COUNT(m.id)::int AS views
      FROM products p
      LEFT JOIN metric_events m ON m.product_id = p.id AND m.event_type = 'product_view'
      GROUP BY p.id
      ORDER BY views DESC
      LIMIT 5
    `),
  ]);

  res.json({
    pageviews: pageviews.rows[0].n,
    whatsappClicks: whatsappClicks.rows[0].n,
    revenueConfirmed: revenue.rows[0].total,
    orders: orderCounts.rows[0],
    topProducts: topProducts.rows,
  });
});

// ============================================================
app.get("/api/health", (req, res) => res.json({ ok: true }));

module.exports = app;
