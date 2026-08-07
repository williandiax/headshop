-- ============================================================
-- Mary Jane Head Shop — schema do banco de dados (PostgreSQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Produtos ----------
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('Tabacaria','Acessórios','Lifestyle','Presentes')),
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  icon        TEXT DEFAULT '🌿',
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Vendas / Pedidos ----------
-- Guardamos uma "foto" do produto (nome/preço) no momento do pedido,
-- assim o histórico de vendas não muda se o produto for editado ou excluído depois.
CREATE TABLE IF NOT EXISTS orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price        NUMERIC(10,2) NOT NULL,
  category     TEXT,
  status       TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','confirmada','cancelada')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Eventos de métricas (visitas, cliques, visualizações) ----------
CREATE TABLE IF NOT EXISTS metric_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('pageview','whatsapp_click','product_view')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Usuários admin ----------
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Índices ----------
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_metric_events_type ON metric_events(event_type);
CREATE INDEX IF NOT EXISTS idx_metric_events_product ON metric_events(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ---------- updated_at automático ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
