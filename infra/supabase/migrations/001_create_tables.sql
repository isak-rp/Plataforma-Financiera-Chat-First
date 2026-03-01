-- ============================================================
-- Plataforma Financiera Chat-First
-- Migracion 001: Tablas principales
-- ============================================================
-- Ejecutar en Supabase SQL Editor (o via supabase cli)
-- Orden: perfiles -> espacios -> miembros_espacio -> apartados -> transacciones
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PERFILES (Profiles)
-- Extiende auth.users de Supabase con datos de la app
-- ============================================================
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  moneda TEXT NOT NULL DEFAULT 'MXN',
  zona_horaria TEXT NOT NULL DEFAULT 'America/Mexico_City',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para actualizar "actualizado_en" automaticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_perfiles_actualizado
  BEFORE UPDATE ON perfiles
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- Trigger para crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION crear_perfil_al_registrar()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_crear_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION crear_perfil_al_registrar();

-- ============================================================
-- 2. ESPACIOS (Workspaces)
-- Cada usuario tiene al menos 1 espacio personal.
-- Los espacios compartidos permiten gastos familiares/grupales.
-- ============================================================
CREATE TYPE tipo_espacio AS ENUM ('personal', 'compartido');

CREATE TABLE IF NOT EXISTS espacios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo tipo_espacio NOT NULL DEFAULT 'personal',
  descripcion TEXT,
  icono TEXT DEFAULT 'wallet',
  propietario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_espacios_actualizado
  BEFORE UPDATE ON espacios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- ============================================================
-- 3. MIEMBROS_ESPACIO (Workspace Members)
-- Tabla pivote que relaciona usuarios con espacios.
-- Esto es CLAVE para el multi-tenant: toda consulta filtra por espacio_id
-- y el usuario debe ser miembro de ese espacio.
-- ============================================================
CREATE TYPE rol_miembro AS ENUM ('propietario', 'administrador', 'miembro');

CREATE TABLE IF NOT EXISTS miembros_espacio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  espacio_id UUID NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  rol rol_miembro NOT NULL DEFAULT 'miembro',
  invitado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  aceptado_en TIMESTAMPTZ,
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(espacio_id, perfil_id)
);

-- Indice para consultas frecuentes
CREATE INDEX idx_miembros_espacio_perfil ON miembros_espacio(perfil_id);
CREATE INDEX idx_miembros_espacio_espacio ON miembros_espacio(espacio_id);

-- ============================================================
-- 4. APARTADOS (Budget Envelopes / Categories)
-- Cada espacio tiene sus propios apartados de presupuesto.
-- ============================================================
CREATE TABLE IF NOT EXISTS apartados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  espacio_id UUID NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  icono TEXT DEFAULT 'wallet',
  presupuesto NUMERIC(12,2) NOT NULL DEFAULT 0,
  gastado NUMERIC(12,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#10b981', -- emerald-500 por defecto
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_apartados_actualizado
  BEFORE UPDATE ON apartados
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE INDEX idx_apartados_espacio ON apartados(espacio_id);

-- ============================================================
-- 5. TRANSACCIONES (Transactions)
-- El registro central de ingresos y gastos.
-- Cada transaccion pertenece a un apartado (y por extension a un espacio).
-- ============================================================
CREATE TYPE tipo_transaccion AS ENUM ('gasto', 'ingreso', 'transferencia');

-- Estado para gastos compartidos (Fase 4)
CREATE TYPE estado_transaccion AS ENUM ('confirmada', 'pendiente', 'aceptada', 'rechazada', 'liquidada');

CREATE TABLE IF NOT EXISTS transacciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartado_id UUID NOT NULL REFERENCES apartados(id) ON DELETE CASCADE,
  espacio_id UUID NOT NULL REFERENCES espacios(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE SET NULL,
  tipo tipo_transaccion NOT NULL DEFAULT 'gasto',
  estado estado_transaccion NOT NULL DEFAULT 'confirmada',
  monto NUMERIC(12,2) NOT NULL,
  descripcion TEXT NOT NULL,
  -- Metadata de la IA: guarda el texto original del usuario
  texto_original TEXT,
  -- Para gastos compartidos (Fase 4)
  dividido_entre UUID[] DEFAULT '{}',
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_transacciones_actualizado
  BEFORE UPDATE ON transacciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE INDEX idx_transacciones_espacio ON transacciones(espacio_id);
CREATE INDEX idx_transacciones_apartado ON transacciones(apartado_id);
CREATE INDEX idx_transacciones_perfil ON transacciones(perfil_id);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);

-- ============================================================
-- 6. Trigger para actualizar "gastado" en apartados automaticamente
-- Cada vez que se inserta/actualiza/elimina una transaccion,
-- recalcula el total gastado del apartado correspondiente.
-- ============================================================
CREATE OR REPLACE FUNCTION recalcular_gastado_apartado()
RETURNS TRIGGER AS $$
DECLARE
  target_apartado_id UUID;
BEGIN
  -- Determinar cual apartado recalcular
  IF TG_OP = 'DELETE' THEN
    target_apartado_id := OLD.apartado_id;
  ELSE
    target_apartado_id := NEW.apartado_id;
  END IF;

  -- Recalcular el total gastado
  UPDATE apartados
  SET gastado = COALESCE((
    SELECT SUM(monto)
    FROM transacciones
    WHERE apartado_id = target_apartado_id
      AND tipo = 'gasto'
      AND estado IN ('confirmada', 'aceptada', 'liquidada')
  ), 0)
  WHERE id = target_apartado_id;

  -- Si cambiamos de apartado, recalcular el anterior tambien
  IF TG_OP = 'UPDATE' AND OLD.apartado_id != NEW.apartado_id THEN
    UPDATE apartados
    SET gastado = COALESCE((
      SELECT SUM(monto)
      FROM transacciones
      WHERE apartado_id = OLD.apartado_id
        AND tipo = 'gasto'
        AND estado IN ('confirmada', 'aceptada', 'liquidada')
    ), 0)
    WHERE id = OLD.apartado_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalcular_gastado
  AFTER INSERT OR UPDATE OR DELETE ON transacciones
  FOR EACH ROW
  EXECUTE FUNCTION recalcular_gastado_apartado();

-- ============================================================
-- 7. Trigger para crear espacio personal al registrarse
-- Automaticamente crea un espacio personal con apartados basicos.
-- ============================================================
CREATE OR REPLACE FUNCTION crear_espacio_personal()
RETURNS TRIGGER AS $$
DECLARE
  nuevo_espacio_id UUID;
BEGIN
  -- Crear espacio personal
  INSERT INTO espacios (nombre, tipo, icono, propietario_id)
  VALUES ('Mi Espacio Personal', 'personal', 'user', NEW.id)
  RETURNING id INTO nuevo_espacio_id;

  -- Agregar como propietario
  INSERT INTO miembros_espacio (espacio_id, perfil_id, rol, aceptado_en)
  VALUES (nuevo_espacio_id, NEW.id, 'propietario', now());

  -- Crear apartados basicos
  INSERT INTO apartados (espacio_id, nombre, icono, presupuesto, orden) VALUES
    (nuevo_espacio_id, 'Comida',          'utensils',   1000, 1),
    (nuevo_espacio_id, 'Transporte',      'car',         500, 2),
    (nuevo_espacio_id, 'Renta',           'home',        800, 3),
    (nuevo_espacio_id, 'Entretenimiento', 'gamepad-2',   400, 4),
    (nuevo_espacio_id, 'Ahorro',          'piggy-bank', 2300, 5);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_crear_espacio_personal
  AFTER INSERT ON perfiles
  FOR EACH ROW
  EXECUTE FUNCTION crear_espacio_personal();
