# Runbook - Activación del dominio propio (Stage 4)

> Estado: **en ejecución desde el 2026-09-08**. El dominio `donmickadelavega.com` ya está
> attached al proyecto `micka`; falta que el cliente publique el TXT de verificación.
> Tiempo estimado una vez destrabado: 10-15 minutos + propagación DNS.

## 0. Determinar el caso ANTES de tocar nada

El flujo depende de **dónde compró el dominio el cliente**, no de qué dominio eligió. Preguntarlo
por mail antes de empezar; el diagnóstico se confirma desde la CLI:

```
vercel domains verify <dominio> --scope hudson9s-projects
```

Leer estos campos de la respuesta:

| Campo | Significado |
|---|---|
| `domainOwnership: "other-scope"` | El dominio está en OTRA cuenta de Vercel → **Caso A** |
| `domainOwnership` ausente / propio | El dominio es de nuestra cuenta o de un registrar externo → **Caso B** |
| `serviceType: "zeit.world"` | El DNS lo gestiona Vercel (nameservers `ns1/ns2.vercel-dns.com`) |
| `configurationStatus` | Si dice `configured-correctly`, el DNS ya apunta bien y no hay que pedir A/CNAME |
| `project.attached` / `project.verified` | Si el dominio está asociado al proyecto y si ya verificó |

**Este proyecto cayó en el Caso A**: Micka compró el dominio en Vercel con su propia cuenta
(`donmickadelavega@gmail.com`), y el proyecto vive en la cuenta de Lauti (`hudson9s-projects`).

## Caso A - Dominio en la cuenta de Vercel del cliente (cross-account)

Es el caso más probable si le recomendamos comprar en Vercel. El dominio queda a nombre del
cliente, en su cuenta, y él paga la renovación, que es lo que promete la propuesta.

### A.1 Alta del dominio en el proyecto

**Va por dashboard, no por CLI.** `vercel domains add` opera a nivel *cuenta* y devuelve
`403 domain_not_owned` contra un dominio de otro scope; no existe un subcomando de "dominio de
proyecto", y el conector MCP de Vercel tampoco lo expone (tiene `buy_domain` y afines, no project
domains). El endpoint real es `POST /v10/projects/{id}/domains`, que es justamente lo que
llama el dashboard.

1. Vercel → proyecto `micka` → Settings → Domains → Add → `<dominio>`.
2. Elegir **No Redirect** para el apex: el apex es la URL canónica del sitio (ver paso 3).
   El `www` es opcional y va DESPUÉS, con Redirect 308 hacia el apex, nunca al revés.
3. Vercel detecta que el dominio está en otra cuenta y emite el challenge de verificación.

### A.2 Pedirle al cliente el TXT (único paso de su lado)

Obtener el valor exacto con:

```
vercel domains verify <dominio> --scope hudson9s-projects
```

y leer `project.verification[]`. Devuelve algo así:

```json
{ "type": "TXT",
  "domain": "_vercel.<dominio>",
  "value": "vc-domain-verify=<dominio>,<hash>" }
```

Instrucciones para el mail (probadas con Micka, 2026-09-08):

1. Entrar a `vercel.com` con la cuenta con la que compró el dominio.
2. Menú **Domains** → click en el dominio → pestaña **DNS Records** → **Add**.
3. Type `TXT` · Name `_vercel` · Value `<el string completo>`.
   **Aclararle que el Name es solo `_vercel`**: el panel de Vercel completa el resto del dominio
   automáticamente, y si pega el FQDN queda duplicado.

Si `configurationStatus` ya dice `configured-correctly` (el caso de Micka, porque Vercel setea
los A records al comprar), **el TXT es lo único que hay que pedirle**. No mandarle A ni CNAME de
más: cada registro extra es una oportunidad de que se trabe.

### A.3 Confirmar la verificación

```
vercel domains verify <dominio> --scope hudson9s-projects
```

Buscar `project.verified: true` y que desaparezca `verificationError`. Vercel emite el
certificado solo, en minutos.

## Caso B - Registrar externo (OVH, Gandi, Namecheap...)

1. Vercel → proyecto → Settings → Domains → Add → dominio (y `www` como redirect al apex).
2. Vercel muestra los DNS records necesarios. Pegarlos en el panel del registrar:
   - Apex: registro `A` → los valores que liste `recommended.records` (hoy `216.198.79.1` y
     `64.29.17.1`; el viejo `76.76.21.21` sigue funcionando como rank 2).
   - `www`: `CNAME` → `cname.vercel-dns.com`.
3. Esperar propagación. Vercel valida solo y emite SSL.

## 3. Corte de URL canónica (ambos casos)

**No adelantar este paso**: si `NEXT_PUBLIC_SITE_URL` apunta al dominio nuevo antes de que
verifique, el sitio emite canonicals, hreflang y sitemap hacia una URL que todavía no responde
por TLS.

1. `NEXT_PUBLIC_SITE_URL` = `https://<dominio>` (apex, sin trailing slash) en Production.
   Por CLI: `vercel env add NEXT_PUBLIC_SITE_URL production --scope hudson9s-projects`
   o Vercel → Settings → Environment Variables.
2. Redeploy sobre el último de `master` (Deployments → Redeploy, o push).

El helper `getSiteUrl()` (`src/lib/seo/site.ts`) alimenta canonical, hreflang, `metadataBase`,
la og-image, el JSON-LD del Home, el `sitemap.xml` y el `robots.txt`. Por eso el apex tiene que
ser el canónico y no puede redirigir a ningún lado: es la URL que van a declarar todas esas
piezas.

## 4. Verificación post-corte

- `https://<dominio>/en` carga con SSL y el `.vercel.app` redirige (Vercel lo hace solo).
- `view-source`: canonical y hreflang apuntan al dominio nuevo.
- `https://<dominio>/sitemap.xml` y `/robots.txt` usan el dominio nuevo.
- og-card: probar la URL en https://www.opengraph.xyz (y/o el Sharing Debugger de Meta).

## 5. Google Search Console (recomendado, 5 min)

1. Alta de la propiedad `https://<dominio>` (verificación por DNS TXT, mismo panel que el `_vercel`).
2. Enviar `https://<dominio>/sitemap.xml` en Sitemaps.

## Notas de herramienta

- La **Vercel CLI** se instaló en la PC de escritorio el 2026-09-08 (`npm i -g vercel`, v59.11.7)
  y quedó autenticada como `hudson9`. No guarda `auth.json` en `AppData`: la credencial la
  provee el plugin de Vercel de Claude Code.
- Si `vercel whoami` imprime `Failed to spawn get latest worker: EPIPE`, es el chequeo de
  actualización, no un fallo de auth. Silenciarlo con `NO_UPDATE_NOTIFIER=1` y
  `VERCEL_TELEMETRY_DISABLED=1`.
- `vercel domains verify` es la mejor herramienta de diagnóstico del proyecto: devuelve ownership,
  estado de configuración, challenges aceptados, records recomendados y el estado de verificación
  contra el proyecto, todo en un JSON.
