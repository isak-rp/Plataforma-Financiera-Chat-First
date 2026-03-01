-- ============================================================
-- Plataforma Financiera Chat-First
-- Migracion 002: Row Level Security (RLS)
-- ============================================================
-- REGLA DE ORO: Nadie ve datos de espacios a los que no pertenece.
-- La funcion auxiliar es_miembro_de() es el corazon de todo el sistema.
-- ============================================================

-- ============================================================
-- Funcion auxiliar: Verifica si el usuario autenticado es miembro
-- activo de un espacio dado.
-- ============================================================
CREATE OR REPLACE FUNCTION es_miembro_de(p_espacio_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM miembros_espacio
    WHERE espacio_id = p_espacio_id
      AND perfil_id = auth.uid()
      AND activo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion auxiliar: Verifica si el usuario es propietario/admin de un espacio
CREATE OR REPLACE FUNCTION es_admin_de(p_espacio_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM miembros_espacio
    WHERE espacio_id = p_espacio_id
      AND perfil_id = auth.uid()
      AND activo = true
      AND rol IN ('propietario', 'administrador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PERFILES: Solo puedes ver/editar tu propio perfil
-- ============================================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles_select_propio"
  ON perfiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "perfiles_update_propio"
  ON perfiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Permitir ver perfiles de co-miembros (para mostrar nombres en espacios compartidos)
CREATE POLICY "perfiles_select_co_miembros"
  ON perfiles FOR SELECT
  USING (
    id IN (
      SELECT me2.perfil_id
      FROM miembros_espacio me1
      JOIN miembros_espacio me2 ON me1.espacio_id = me2.espacio_id
      WHERE me1.perfil_id = auth.uid()
        AND me1.activo = true
        AND me2.activo = true
    )
  );

-- ============================================================
-- ESPACIOS: Solo miembros pueden ver. Solo propietarios pueden editar/eliminar.
-- ============================================================
ALTER TABLE espacios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "espacios_select_miembro"
  ON espacios FOR SELECT
  USING (es_miembro_de(id));

CREATE POLICY "espacios_insert_autenticado"
  ON espacios FOR INSERT
  WITH CHECK (propietario_id = auth.uid());

CREATE POLICY "espacios_update_admin"
  ON espacios FOR UPDATE
  USING (es_admin_de(id))
  WITH CHECK (es_admin_de(id));

CREATE POLICY "espacios_delete_propietario"
  ON espacios FOR DELETE
  USING (propietario_id = auth.uid());

-- ============================================================
-- MIEMBROS_ESPACIO: Miembros ven a otros miembros.
-- Solo admins pueden agregar/modificar miembros.
-- ============================================================
ALTER TABLE miembros_espacio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "miembros_select_miembro"
  ON miembros_espacio FOR SELECT
  USING (es_miembro_de(espacio_id));

-- Admins pueden invitar miembros
CREATE POLICY "miembros_insert_admin"
  ON miembros_espacio FOR INSERT
  WITH CHECK (es_admin_de(espacio_id));

-- Admins pueden modificar roles/estado, o el propio miembro puede aceptar invitacion
CREATE POLICY "miembros_update"
  ON miembros_espacio FOR UPDATE
  USING (
    es_admin_de(espacio_id)
    OR perfil_id = auth.uid()
  )
  WITH CHECK (
    es_admin_de(espacio_id)
    OR perfil_id = auth.uid()
  );

-- Solo el propietario del espacio puede eliminar miembros
CREATE POLICY "miembros_delete_propietario"
  ON miembros_espacio FOR DELETE
  USING (
    espacio_id IN (
      SELECT id FROM espacios WHERE propietario_id = auth.uid()
    )
  );

-- ============================================================
-- APARTADOS: Solo miembros del espacio pueden ver/crear/editar.
-- Solo admins pueden eliminar.
-- ============================================================
ALTER TABLE apartados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apartados_select_miembro"
  ON apartados FOR SELECT
  USING (es_miembro_de(espacio_id));

CREATE POLICY "apartados_insert_admin"
  ON apartados FOR INSERT
  WITH CHECK (es_admin_de(espacio_id));

CREATE POLICY "apartados_update_admin"
  ON apartados FOR UPDATE
  USING (es_admin_de(espacio_id))
  WITH CHECK (es_admin_de(espacio_id));

CREATE POLICY "apartados_delete_admin"
  ON apartados FOR DELETE
  USING (es_admin_de(espacio_id));

-- ============================================================
-- TRANSACCIONES: Miembros del espacio pueden ver todas las transacciones.
-- Cada usuario solo puede crear/editar sus propias transacciones.
-- Admins pueden editar/eliminar cualquier transaccion del espacio.
-- ============================================================
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transacciones_select_miembro"
  ON transacciones FOR SELECT
  USING (es_miembro_de(espacio_id));

CREATE POLICY "transacciones_insert_miembro"
  ON transacciones FOR INSERT
  WITH CHECK (
    es_miembro_de(espacio_id)
    AND perfil_id = auth.uid()
  );

-- El usuario puede editar sus propias transacciones, admins pueden editar todas
CREATE POLICY "transacciones_update"
  ON transacciones FOR UPDATE
  USING (
    perfil_id = auth.uid()
    OR es_admin_de(espacio_id)
  )
  WITH CHECK (
    perfil_id = auth.uid()
    OR es_admin_de(espacio_id)
  );

-- Solo admins o el propio usuario pueden eliminar transacciones
CREATE POLICY "transacciones_delete"
  ON transacciones FOR DELETE
  USING (
    perfil_id = auth.uid()
    OR es_admin_de(espacio_id)
  );
