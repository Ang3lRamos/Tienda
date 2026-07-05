# Flujo de autenticación y autorización

## Componentes

- **Supabase Auth** gestiona credenciales, emite **JWT** y mantiene la sesión
  en cookies httpOnly (patrón SSR con `@supabase/ssr`).
- **`profiles`** es el espejo público de `auth.users`. Se crea automáticamente
  al registrarse mediante el trigger `handle_new_user()` (rol `customer` por
  defecto).
- **RBAC**: `roles` + `permissions` + `role_permissions`. El rol vive en
  `profiles.role_id`.

## Registro (sign up)

```
Usuario → /register → Server Action signUp()
   → supabase.auth.signUp({ email, password, options:{ data:{ full_name } } })
   → trigger on_auth_user_created → crea profiles(role=customer)
   → email de confirmación (configurable en Supabase)
```

## Inicio de sesión (sign in)

```
Usuario → /login → Server Action signIn()
   → supabase.auth.signInWithPassword()
   → cookies de sesión establecidas (httpOnly)
   → redirect a ?redirect o /account
```

También se soporta OAuth (Google) vía `signInWithOAuth` + callback en
`app/(auth)/callback/route.ts` (preparado para el módulo de auth).

## Sesión en el servidor

- `middleware.ts` llama a `updateSession()` en cada request:
  - refresca el token si expiró,
  - protege `/account`, `/checkout` (requieren sesión),
  - protege `/admin` (requiere rol `admin` o `staff`).
- Los Server Components leen el usuario con `createServerSupabase()`.

## Autorización (capas de defensa)

1. **Middleware** — primera barrera para rutas privadas.
2. **RLS en Postgres** — barrera real e infranqueable: aunque alguien llame a la
   API directamente, sólo verá/modificará lo que las policies permitan.
   - Helper `is_admin()` (SECURITY DEFINER) usado en las policies de escritura.
3. **Validación Zod** — en cada Server Action antes de tocar la BD.

## Seguridad adicional

- **XSS**: React escapa por defecto; se evita `dangerouslySetInnerHTML`.
- **SQL Injection**: se usa el query builder de `supabase-js` (consultas
  parametrizadas); nunca se concatena SQL con input del usuario.
- **service_role key**: sólo en el servidor (`createAdminSupabase`), jamás en
  el bundle del cliente.
- **CSRF**: Server Actions de Next.js incluyen protección de origen.
