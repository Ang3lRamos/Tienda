/**
 * Auditoría de responsive: detecta contenido que se sale de la pantalla
 * (lo que obliga a alejar el zoom en móvil).
 *
 * Detecta dos cosas:
 *  - CORTADO: elementos que exceden el viewport y los recorta body/html.
 *  - SCROLL-H: contenedores con scroll horizontal interno (tablas anchas).
 *
 * Uso:
 *   npm i -D playwright && npx playwright install chromium
 *   npm run dev
 *   node scripts/check-overflow.mjs 390 [--shoot]
 *
 * Crea un usuario admin temporal (service role) y lo elimina al terminar.
 */
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const BASE = 'http://localhost:3000';
const W = Number(process.argv[2] || 390);
const SHOOT = process.argv.includes('--shoot');

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim() || '';
const supa = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `qa-ovf-${Date.now()}@example.com`;
const password = 'Test1234!pw';
const { data: created, error: cErr } = await supa.auth.admin.createUser({ email, password, email_confirm: true });
if (cErr) { console.error('createUser', cErr.message); process.exit(1); }
const uid = created.user.id;
const { data: adminRole } = await supa.from('roles').select('id').eq('name', 'admin').maybeSingle();
if (adminRole) await supa.from('profiles').update({ role_id: adminRole.id }).eq('id', uid);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 2, isMobile: W < 768, hasTouch: W < 768 });
const page = await ctx.newPage();

// --- login (esperando hidratación de React) ---
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000); // dev mode: hidratación lenta
await page.fill('#email', email);
await page.fill('#password', password);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL(/\/account/, { timeout: 25000 }).catch(() => {});
if (!page.url().includes('/account')) {
  console.error('LOGIN FALLÓ →', page.url());
  await browser.close(); await supa.auth.admin.deleteUser(uid); process.exit(1);
}
console.log('login OK · viewport', W);

const routes = [
  '/', '/catalogo', '/carrito', '/checkout',
  '/account', '/account/direcciones', '/account/pedidos', '/account/favoritos',
  '/admin', '/admin/pedidos', '/admin/productos', '/admin/resenas',
  '/admin/inventario', '/admin/promociones', '/admin/usuarios', '/admin/clientes',
  '/producto/camiseta-oversize-essential',
];
try {
  await page.goto(`${BASE}/admin/pedidos`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const href = await page.locator('a[href^="/admin/pedidos/"]').first().getAttribute('href').catch(() => null);
  if (href) routes.push(href);
} catch {}

if (SHOOT) fs.mkdirSync('.qa', { recursive: true });
let problems = 0;

for (const route of routes) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(900);
    const res = await page.evaluate((vw) => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right <= vw + 2 || r.width > vw * 4) continue;
        // ¿quién recorta? si es body/html => el contenido se CORTA en pantalla
        let p = el.parentElement, clipper = null, local = false;
        while (p) {
          const ov = getComputedStyle(p).overflowX;
          if (ov !== 'visible') {
            clipper = p.tagName;
            local = !(p.tagName === 'BODY' || p.tagName === 'HTML');
            break;
          }
          p = p.parentElement;
        }
        if (local) continue; // scroll/clip intencional (tablas, marquee)
        out.push({ tag: el.tagName.toLowerCase(), cls: el.className?.toString?.().slice(0, 50) || '', right: Math.round(r.right), w: Math.round(r.width), text: (el.textContent || '').trim().slice(0, 26) });
      }
      // Contenedores con scroll horizontal interno: el contenido no cabe en
      // pantalla (tablas anchas) → el usuario tiene que alejar/desplazar.
      const scrollers = [];
      for (const el of document.querySelectorAll('body *')) {
        const ov = getComputedStyle(el).overflowX;
        if (ov !== 'auto' && ov !== 'scroll') continue;
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
          scrollers.push({
            tag: el.tagName.toLowerCase(),
            cls: el.className?.toString?.().slice(0, 50) || '',
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
          });
        }
      }
      const seen = new Map();
      for (const o of out) { const k = o.tag + o.cls; if (!seen.has(k) || seen.get(k).right < o.right) seen.set(k, o); }
      return { cut: [...seen.values()].sort((a, b) => b.right - a.right).slice(0, 6), scrollers, docW: document.documentElement.scrollWidth };
    }, W);
    const bad = res.cut.length > 0 || res.scrollers.length > 0;
    if (!bad) console.log(`OK   ${route}`);
    else {
      problems++;
      console.log(`⚠️   ${route}  (docScrollW=${res.docW})`);
      for (const c of res.cut) console.log(`       CORTADO <${c.tag}> right=${c.right} w=${c.w} "${c.text}" .${c.cls}`);
      for (const s of res.scrollers) console.log(`       SCROLL-H <${s.tag}> ${s.scrollW}px en ${s.clientW}px .${s.cls}`);
    }
    if (SHOOT) await page.screenshot({ path: `.qa/${W}${route.replace(/\//g, '_') || '_home'}.png`, fullPage: true });
  } catch (e) {
    console.log(`ERR  ${route} ${e.message.slice(0, 60)}`);
  }
}

console.log(problems === 0 ? `\n✅ Sin desbordes a ${W}px` : `\n❌ ${problems} rutas con desborde a ${W}px`);
await browser.close();
await supa.auth.admin.deleteUser(uid);
