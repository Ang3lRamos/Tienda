-- =====================================================================
-- 0007 — Datos legales editables desde el panel
--
-- Los datos del responsable (razón social, NIT, domicilio) estaban fijos
-- en `config/legal.ts` y obligaban a redesplegar para cambiarlos. Se
-- mueven a `store_settings` (misma tabla singleton que envío/impuestos),
-- así el admin los edita en /admin/configuracion sin tocar el código.
--
-- Alimentan los términos, la política de privacidad y la de tratamiento de
-- datos. Lectura pública (esas páginas son públicas), escritura solo admin,
-- heredadas de las políticas RLS que ya tiene la tabla.
-- =====================================================================

alter table store_settings
  add column if not exists legal_name    text,
  add column if not exists tax_id        text,
  add column if not exists legal_address text,
  add column if not exists legal_city    text,
  -- Correo específico para ejercer derechos de habeas data. Si queda vacío,
  -- las páginas legales usan el correo de contacto general.
  add column if not exists privacy_email text;

comment on column store_settings.legal_name    is 'Razón social del responsable del tratamiento de datos';
comment on column store_settings.tax_id         is 'NIT con dígito de verificación';
comment on column store_settings.legal_address  is 'Domicilio de notificaciones';
comment on column store_settings.legal_city     is 'Ciudad del domicilio';
comment on column store_settings.privacy_email  is 'Correo para derechos de habeas data (Ley 1581); si es null se usa contact_email';
