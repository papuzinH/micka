# Runbook — Activación del dominio propio (Stage 4)

> Ejecutar cuando Micka compre el dominio. Tiempo estimado: 10-15 minutos + propagación DNS.

## 1. Candidatos a proponerle a Micka

(Verificar disponibilidad/precio en Namecheap o Porkbun antes de mandar; él compra
con SU cuenta — el dominio queda a su nombre, como pide la propuesta.)

- `donmickadelavega.com` — el branding completo, primera opción.
- `mickadelavega.com` — más corto, mismo apellido artístico.
- `donmicka.photography` — TLD descriptivo, lindo para tarjeta/IG bio.

## 2. Alta en Vercel (proyecto micka)

1. Vercel → proyecto → Settings → Domains → Add → dominio comprado (y `www.` como redirect).
2. Vercel muestra los DNS records necesarios.

## 3. DNS (en el registrar de Micka, guiarlo por chat/call)

- Apex (`donmickadelavega.com`): registro `A` → `76.76.21.21`.
- `www`: registro `CNAME` → `cname.vercel-dns.com`.
- Esperar propagación (minutos a horas). Vercel valida solo y emite SSL.

## 4. Corte de URL canónica

1. Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` = `https://<dominio>` (Production).
2. Redeploy (Deployments → Redeploy sobre el último de master).

## 5. Verificación post-corte

- `https://<dominio>/en` carga con SSL y el `.vercel.app` redirige (Vercel lo hace solo).
- `view-source`: canonical y hreflang apuntan al dominio nuevo.
- `https://<dominio>/sitemap.xml` y `/robots.txt` usan el dominio nuevo.
- og-card: probar la URL en https://www.opengraph.xyz (y/o el Sharing Debugger de Meta).

## 6. Google Search Console (recomendado, 5 min)

1. Alta de la propiedad `https://<dominio>` (verificación por DNS TXT — mismo registrar).
2. Enviar `https://<dominio>/sitemap.xml` en Sitemaps.
