-- ============================================================
-- Plataforma Financiera Chat-First
-- Migracion 003: Datos de prueba (desarrollo)
-- ============================================================
-- NOTA: Este script usa UUIDs fijos para facilitar el testing.
-- NO ejecutar en produccion. Solo para desarrollo local.
-- IMPORTANTE: Los perfiles normalmente se crean via trigger al registrarse
-- en auth.users. Estos inserts son para poblar datos sin pasar por auth.
-- ============================================================

-- Desactivar RLS temporalmente para insertar datos de prueba
-- (En produccion los datos se crean a traves de la app con auth)
ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE espacios DISABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_espacio DISABLE ROW LEVEL SECURITY;
ALTER TABLE apartados DISABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Perfiles de prueba
-- ============================================================
INSERT INTO perfiles (id, nombre, email, moneda) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Carlos Lopez',   'carlos@email.com',   'MXN'),
  ('b2222222-2222-2222-2222-222222222222', 'Maria Lopez',    'maria@email.com',     'MXN'),
  ('c3333333-3333-3333-3333-333333333333', 'Pedro Ramirez',  'pedro@email.com',     'MXN'),
  ('d4444444-4444-4444-4444-444444444444', 'Ana Lopez',      'ana@email.com',       'MXN')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Espacios
-- ============================================================
-- Espacio personal de Carlos
INSERT INTO espacios (id, nombre, tipo, icono, propietario_id) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Mi Espacio Personal',   'personal',    'user', 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Espacio compartido familiar
INSERT INTO espacios (id, nombre, tipo, icono, descripcion, propietario_id) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'Casa Familia Lopez',    'compartido',  'home', 'Gastos del hogar', 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Espacio compartido viaje
INSERT INTO espacios (id, nombre, tipo, icono, descripcion, propietario_id) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'Viaje Cancun',          'compartido',  'plane', 'Gastos del viaje a Cancun', 'b2222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Miembros de cada espacio
-- ============================================================
-- Carlos en su espacio personal
INSERT INTO miembros_espacio (espacio_id, perfil_id, rol, aceptado_en) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'propietario', now())
ON CONFLICT (espacio_id, perfil_id) DO NOTHING;

-- Familia Lopez (4 miembros)
INSERT INTO miembros_espacio (espacio_id, perfil_id, rol, aceptado_en) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'propietario',    now()),
  ('e2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'administrador',  now()),
  ('e2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'miembro',        now()),
  ('e2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', 'miembro',        now())
ON CONFLICT (espacio_id, perfil_id) DO NOTHING;

-- Viaje Cancun (3 miembros)
INSERT INTO miembros_espacio (espacio_id, perfil_id, rol, aceptado_en) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'propietario', now()),
  ('e3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'miembro',     now()),
  ('e3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'miembro',     now())
ON CONFLICT (espacio_id, perfil_id) DO NOTHING;

-- ============================================================
-- Apartados para el espacio personal de Carlos
-- ============================================================
INSERT INTO apartados (id, espacio_id, nombre, icono, presupuesto, orden) VALUES
  ('ap111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Comida',          'utensils',   1000, 1),
  ('ap222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Transporte',      'car',         500, 2),
  ('ap333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Renta',           'home',        800, 3),
  ('ap444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'Entretenimiento', 'gamepad-2',   400, 4),
  ('ap555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'Ahorro',          'piggy-bank', 2300, 5)
ON CONFLICT (id) DO NOTHING;

-- Apartados para Casa Familia Lopez
INSERT INTO apartados (id, espacio_id, nombre, icono, presupuesto, orden) VALUES
  ('ap666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'Despensa',  'shopping-cart', 4000, 1),
  ('ap777777-7777-7777-7777-777777777777', 'e2222222-2222-2222-2222-222222222222', 'Servicios', 'zap',           3000, 2),
  ('ap888888-8888-8888-8888-888888888888', 'e2222222-2222-2222-2222-222222222222', 'Renta',     'home',          8000, 3)
ON CONFLICT (id) DO NOTHING;

-- Apartados para Viaje Cancun
INSERT INTO apartados (id, espacio_id, nombre, icono, presupuesto, orden) VALUES
  ('ap999999-9999-9999-9999-999999999999', 'e3333333-3333-3333-3333-333333333333', 'Hotel',       'bed',    6000, 1),
  ('apAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 'e3333333-3333-3333-3333-333333333333', 'Comida',      'utensils', 3000, 2),
  ('apBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'e3333333-3333-3333-3333-333333333333', 'Actividades', 'compass', 2000, 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Transacciones de ejemplo (espacio personal de Carlos)
-- Estas coinciden con los datos mock del frontend
-- ============================================================
INSERT INTO transacciones (apartado_id, espacio_id, perfil_id, tipo, monto, descripcion, texto_original, fecha) VALUES
  -- Comida
  ('ap111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 150.00, 'Comida',             'Gaste 150 en comida',        CURRENT_DATE),
  ('ap111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 200.00, 'Super semanal',      'Fui al super y gaste 200',   CURRENT_DATE - INTERVAL '2 days'),
  ('ap111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 300.00, 'Cena restaurante',   'Cene fuera por 300',         CURRENT_DATE - INTERVAL '5 days'),
  -- Transporte
  ('ap222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 100.00, 'Uber al trabajo',    'Pague 100 de Uber',          CURRENT_DATE),
  -- Renta (pago completo)
  ('ap333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 800.00, 'Renta mensual',      'Pague la renta 800',         CURRENT_DATE - INTERVAL '10 days'),
  -- Entretenimiento
  ('ap444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 200.00, 'Netflix y Spotify',  'Suscripciones 200',          CURRENT_DATE - INTERVAL '3 days'),
  ('ap444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 150.00, 'Cine con amigos',    'Fui al cine gaste 150',      CURRENT_DATE - INTERVAL '7 days'),
  -- Ahorro
  ('ap555555-5555-5555-5555-555555555555', 'e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'gasto', 250.00, 'Ahorro quincenal',   'Aparte 250 para ahorro',     CURRENT_DATE - INTERVAL '1 day');

-- ============================================================
-- Transacciones del espacio familiar
-- ============================================================
INSERT INTO transacciones (apartado_id, espacio_id, perfil_id, tipo, monto, descripcion, texto_original, fecha) VALUES
  ('ap666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'gasto', 1500.00, 'Despensa semanal',    'Compre la despensa 1500',  CURRENT_DATE - INTERVAL '2 days'),
  ('ap666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'gasto', 800.00,  'Frutas y verduras',   'Gaste 800 en frutas',      CURRENT_DATE - INTERVAL '4 days'),
  ('ap777777-7777-7777-7777-777777777777', 'e2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'gasto', 1200.00, 'Luz y agua',          'Pague luz y agua 1200',    CURRENT_DATE - INTERVAL '8 days'),
  ('ap888888-8888-8888-8888-888888888888', 'e2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'gasto', 8000.00, 'Renta del mes',       'Pague la renta 8000',      CURRENT_DATE - INTERVAL '10 days');

-- ============================================================
-- Re-activar RLS despues de insertar datos de prueba
-- ============================================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE espacios ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_espacio ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartados ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
