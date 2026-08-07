-- ============================================================
-- Mary Jane Head Shop — dados iniciais (rode depois do schema.sql)
-- ============================================================

-- Produtos de exemplo — edite ou apague depois pelo admin.html
INSERT INTO products (name, category, price, icon, description) VALUES
  ('Seda Raw Classic King Size', 'Tabacaria', 12.90, '📜', 'Papel clássico, queima uniforme, tamanho king size.'),
  ('Bolador Sadhu', 'Tabacaria', 39.90, '🌀', 'Bolador artesanal, o queridinho da banca.'),
  ('Filtros de papelão', 'Tabacaria', 6.90, '🧻', 'Pacote com filtros pra um bagulho bem montado.'),
  ('Isqueiro à prova de vento', 'Tabacaria', 24.90, '🔥', 'Chama firme mesmo em ambiente aberto.'),
  ('Dichavador 4 partes', 'Acessórios', 45.90, '⚙️', 'Alumínio resistente, trituração uniforme.'),
  ('Cinzeiro de cerâmica', 'Acessórios', 34.90, '🏺', 'Peça feita à mão, acabamento fosco.'),
  ('Piteira de vidro', 'Acessórios', 29.90, '🧪', 'Reutilizável, fácil de limpar, resfria a tragada.'),
  ('Bandeja de rolar', 'Acessórios', 59.90, '🗄️', 'Espaço organizado pra montar seu ritual.'),
  ('Vela aromática de ervas', 'Lifestyle', 32.90, '🕯️', 'Aroma suave pra ambientar o momento.'),
  ('Incenso natural', 'Lifestyle', 14.90, '🪔', 'Caixa com 20 unidades, aroma amadeirado.'),
  ('Pote hermético de vidro', 'Lifestyle', 27.90, '🫙', 'Mantém o aroma e a qualidade por mais tempo.'),
  ('Kit presente iniciante', 'Presentes', 89.90, '🎁', 'Seda, dichavador e piteira numa embalagem especial.'),
  ('Shoulder bag Mary Jane', 'Presentes', 119.90, '👜', 'Compacta, discreta, com divisórias internas.'),
  ('Cordão porta-isqueiro', 'Presentes', 19.90, '🔗', 'Nunca mais perca o isqueiro no rolê.')
ON CONFLICT DO NOTHING;

-- Usuário admin padrão
-- email: admin@maryjaneheadshop.com.br
-- senha: maryjane2026   (TROQUE assim que fizer o primeiro login!)
-- hash gerado com bcrypt (10 rounds) — veja backend/scripts/hash-password.js pra gerar outro
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@maryjaneheadshop.com.br', '$2b$10$7.5bWxSQo5clwIPREswWl.sXTrVGUDX0nRZU/9kfP1PB5ao.A/2Iu')
ON CONFLICT (email) DO NOTHING;
