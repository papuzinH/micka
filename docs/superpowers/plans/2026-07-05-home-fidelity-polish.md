# Plan — Pasada final de fidelidad del Home (feedback del cliente)

> **Fecha:** 2026-07-05 · **Rama:** `stage-2-site` (o rama de pulido derivada) · **Stage:** cierre de Stage 2
> **Objetivo:** aplicar los 10 fixes de fidelidad del Home reportados por el cliente contra el Figma,
> antes de cerrar Stage 2 formalmente y arrancar Stage 3 (Motion). Sin GSAP todavía.

## Contexto / fuente de verdad

- **Figma file key:** `D1d7pqScYAAPmXHEqkW3Cm` (Micka — Photography)
- **Home Desktop:** nodo `128:154` · **Hero group:** `133:223` · **UI Kit:** `20:3`
- Antes de tocar cada componente, el ejecutor **debe** traer el nodo Figma con
  `mcp__claude_ai_Figma__get_design_context` para specs exactos (ya hay valores clave abajo).
- **Tokens disponibles** (Tailwind v4, `tailwind.config.ts` + `globals.css`):
  - Colores: `brand-black #000`, `brand-gray #202020`, `brand-gray-bg #212121`,
    `brand-gray-light #373636`, `brand-white`, `brand-violet #a020f0`, `brand-violet-dark #8315c8`.
  - Tipografía: `font-display` (Syne) / `font-body` (Inter). Escala:
    `text-h1` (45/800), `text-h2` (30/700), `text-card` (20/700), `text-h3` (16/700),
    `text-h4` (14/700), `text-body` (14/400), `text-body-semibold` (14/600).
- **i18n:** claves en `src/messages/{en,fr}.json`. Cualquier cambio de string/estructura
  (p.ej. separar acentos, dividir el footer) debe replicarse en **ambos** archivos.
- **Verificación por task:** `npx tsc --noEmit` + ESLint limpios. Al final: unit tests,
  `npx next build`, y validación visual con `chrome-devtools` (o Playwright) en **EN y FR**,
  desktop y mobile. Recordar: `npx next build` directo (no `rtk`) para builds reales.

## Decisiones ya confirmadas por el cliente (2026-07-05)

1. **Fix #1 (toggle idioma):** **tomar el diseño del Figma (`72:164`) y convertirlo en un toggle
   switch.** Es decir: partir de la estética de la píldora del UI Kit (fondo gris, radio 10px,
   sombra inset, código + bandera) pero materializarla como **switch** (control de dos estados con
   thumb deslizante), no como botón.
2. **Fix #3 (bordes/divisores):** **los bordes ya existen en el código pero no tienen el estilo del
   Figma.** No se agregan/quitan divisores: se **corrige el estilo** de los existentes para que
   coincidan con las líneas del diseño (violeta sólido `#A020F0`, 2px — ver Task 3).

---

## Tasks

### Task 1 — Toggle de idioma como switch (partiendo del diseño Figma)  ·  `src/components/ui/ToggleLanguage.tsx`
- **Decisión del cliente:** tomar el diseño del Figma `72:164` y **convertirlo en un toggle switch**.
- **Figma:** `72:164` (componente Toggle Language, variantes English/French). Estética a conservar:
  fondo `brand-gray #202020`, radio `10px`, texto `body-semibold` (Inter 14/600) blanco,
  sombra `inset -4px 4px 4px -1px rgba(0,0,0,.25)`, bandera circular ~14px.
- **Cambios (switch de dos estados):**
  - Materializar como **switch deslizante**: pista (track) con la estética de la píldora del Figma y
    un **thumb** que se mueve entre los dos estados EN ⇄ FR. Mostrar el código + bandera del estado
    (o ambos con el activo resaltado en `brand-violet`/`brand-gray-light` y el inactivo atenuado —
    elegir la variante que mejor lea el "switch" manteniendo el look del UI Kit).
  - Al accionar: `router.replace(pathname, { locale: other })` (comportamiento actual intacto).
  - Accesibilidad: `role="switch"` + `aria-checked={locale === 'fr'}` (o el criterio que se defina)
    y `aria-label` descriptivo. Respetar `prefers-reduced-motion` en la transición del thumb.
  - Conservar tokens (radio 10px, sombra inset, `body-semibold`).
- **Tests:** actualizar `src/components/ui/__tests__/ToggleLanguage.test.tsx` al nuevo markup
  (role switch / aria-checked; posiblemente ambos labels visibles).

### Task 2 — Footer: lado izquierdo  ·  `src/components/layout/Footer.tsx`
- **Problema:** el bloque izquierdo muestra "Micka's Photos" (una línea, todo blanco) + un
  `tagline`. El diseño no lleva tagline y el wordmark va en **dos líneas y bicolor**.
- **Figma:** frame `128:217` (Footer Desktop) → texto `128:219`:
  - `MICKA'S` en **violet `#a020f0`** (`text-brand-violet`)
  - `PHOTOS` en **blanco**
  - Fuente **Syne Bold 30px** (`font-display text-h2`), uppercase, `leading-[30px]`,
    text-shadow `0 4px 4px rgba(0,0,0,.25)`.
  - **Sin** `tagline`.
  - Derecha: nav links (Homepage/Portfolio/About Me/Reviews/Collabs/Contact) — ya existen, revisar spacing.
- **Cambios:**
  - Reemplazar el `<p>` + tagline por dos líneas: `MICKA'S` (violet) / `PHOTOS` (white),
    `font-display text-h2 uppercase` con la text-shadow.
  - Eliminar el uso de `tf("tagline")`. Quitar la clave `footer.tagline` de `en.json`/`fr.json`
    (o dejarla huérfana si se prefiere no tocar i18n; preferible limpiar).

### Task 3 — Corregir el estilo de los bordes/divisores  ·  `BioBlock.tsx`, `ContactCta.tsx` (+ verificar `EditorialIntro.tsx`)
- **Decisión del cliente:** los bordes **ya existen en el código pero con el estilo equivocado**;
  hay que dejarlos como en el Figma.
- **Estilo correcto (verificado en los nodos `Line`):** **violeta sólido `#A020F0` (`brand-violet`),
  grosor `2px`**. NO blanco/tenue. Los `Line` del diseño son trazos violeta de 2px:
  - `Line 1` (`128:215`): **horizontal** ~940px por encima del bloque CTA ("Brands. Teams. Athletes.").
  - `Line 2` (`128:216`): **vertical** ~250px entre el retrato y la tira editorial (BioBlock).
    (SVG con forma orgánica sutil, más grueso al centro; en código basta un `border`/rule violeta 2px.)
  - `Line 1` (`128:185`, `128:190`): borde **izquierdo violeta 2px** de las cajas editoriales.
- **Cambios:**
  - **BioBlock:** el divisor actual `md:border-l md:border-white/15` está **mal** (blanco tenue).
    Cambiar a **`md:border-l-2 md:border-brand-violet`** (violeta 2px), replicando `Line 2` (`128:216`).
  - **ContactCta:** hoy **no** tiene la línea. Agregar la **regla horizontal violeta 2px** por encima
    del título (`border-t-2 border-brand-violet` en el contenedor, o un `<hr>`), replicando `Line 1`
    (`128:215`). Ajustar ancho/posición al diseño.
  - **EditorialIntro:** su borde `border-l-2 border-brand-violet` ya coincide con `128:185` (violeta
    2px) — **verificar** que se mantenga y no se rompa con el cambio del Task 6.
  - **Nota:** en el Figma estos `Line` son SVG con `--stroke-0 #A020F0`; un `border`/`hr` sólido
    violeta de 2px es la traducción fiel (no hace falta gradiente ni imagen).

### Task 4 — Tipografía de CraftBlock  ·  `src/components/home/CraftBlock.tsx`
- **Problema:** usa `text-body` (Inter 14/400). El diseño usa **Syne Bold** y el acento es
  **violet-dark**, no violet, y va en salto de línea.
- **Figma:** nodo `128:208` → `font-['Syne:Bold']`, **14px (H4)**, `leading-normal`:
  - Parte normal en **blanco**.
  - Acento en **`#8315c8` (`text-brand-violet-dark`)**, en su **propia línea/párrafo**.
- **Cambios:**
  - Cambiar `text-body` → `font-display text-h4` (Syne 14/700) en ambos párrafos, blanco.
  - Cambiar `<span className="text-brand-violet">` → **`text-brand-violet-dark`** y ponerlo como
    bloque en **nueva línea** (no continuación inline). Ej: envolver el acento en `<span className="block">`
    o separarlo con `<br />`.
  - Aplicar a los dos pares (`light`/`lightAccent` y `standard`/`standardAccent`).

### Task 5 — Título "Starred albums" fuera del fondo de líneas  ·  `src/components/home/StarredAlbums.tsx`
- **Problema:** el fondo de líneas diagonales es `absolute inset-0` y cubre **también** el título.
  En el diseño el título está **encima/afuera** del panel de líneas.
- **Figma:** título `128:193` en `y=1523`; el panel de líneas (`Group 9` `2409:217` → `Rectangle 17`
  `128:194`) empieza en `y=1595`. → el título va **sobre negro plano, arriba** del panel.
- **Cambios:**
  - Sacar el `<h2>` del contenedor que tiene el fondo de líneas. Estructura sugerida:
    `<h2>` (sobre `bg-brand-black`) **fuera** del div con el `repeating-linear-gradient`; el panel de
    líneas envuelve **solo** el grid de cards (+ CTA, confirmar si el CTA va dentro o fuera del panel).
  - Mantener el `repeating-linear-gradient` como fondo del panel de cards.

### Task 6 — EditorialIntro: títulos blancos + acentos en salto de línea  ·  `src/components/home/EditorialIntro.tsx`
- **Problema:** el título de card ("Core Focus") está en `text-brand-violet`. Debe ser **siempre
  blanco**. Los textos violetas deben ir **siempre en un salto de línea** (bloque propio).
- **Figma:** nodo `128:188` (Core Focus) en blanco; acentos en su propia línea.
- **Cambios:**
  - `focusTitle`: `text-brand-violet` → **`text-brand-white`**.
  - `introAccent` y `focusAccent`: en vez de `{" "}<span className="text-brand-violet">…`,
    ponerlos como **bloque en nueva línea** (`<span className="block mt-3 text-brand-violet">` o `<br/>`).
    Confirmar tono violeta contra Figma (probablemente `brand-violet`; si el diseño usa `#8315c8`,
    usar `brand-violet-dark`).

### Task 7 — Color del texto del Marquee  ·  `src/components/home/Marquee.tsx`
- **Problema:** el texto (y el separador `|`) están en `text-brand-black`. Debe ser **blanco**.
- **Cambios:** `text-brand-black` → **`text-brand-white`** en el `<span>` del texto. Verificar
  contraste sobre la barra `bg-brand-violet` (blanco sobre violeta es correcto por diseño).

### Task 8 — BioBlock: proporciones de fotos + título a la izquierda  ·  `src/components/home/BioBlock.tsx`
- **Problema:** la tira de fotos (`{/* Heading editorial + tira de fotos */}`) fuerza las 3 imágenes
  a `aspect-[3/4]` uniforme con `object-cover`. Deben ir en **proporción original**, con tamaños
  adaptados; y el **título alineado a la izquierda**.
- **Figma:** `Group 13` (`2413:248`):
  - Título `128:176` "Women's Cycling — Aesthetics & Intensity": **Syne Bold 30px** (`text-h2`),
    blanco, **left-aligned** (`whitespace-nowrap` en desktop).
  - Fotos (`Group 12` `2413:247`), **proporciones y offsets distintos**:
    - Foto 1 `128:177`: **307×231** (~4:3 landscape, la más grande, arriba-izq).
    - Foto 2 `128:178`: **210×170** (~5:4), desplazada hacia abajo (`y=727`).
    - Foto 3 `128:179`: **212×170** (~5:4), `y=674`.
- **Cambios:**
  - Reemplazar el `grid grid-cols-3` de `aspect-[3/4]` por un layout que respete las proporciones
    (p.ej. anchos/relaciones por foto: la 1 landscape más ancha, la 2 y 3 más chicas y escalonadas).
    Usar `object-cover` dentro de cada caja pero con **aspect ratios propios** (~4:3 / ~5:4), no un
    3/4 uniforme. Adaptar a mobile (stack o escala).
  - Asegurar el `<h2>` en `text-left` (hoy hereda del flex-col; confirmar que no quede centrado).

### Task 9 — Hero: subtítulo + botones  ·  `src/components/home/Hero.tsx`
- **Problema:** el subtítulo (pill) y los botones no coinciden con el diseño.
- **Figma:** `Group 8` (`133:223`):
  - Subtítulo `128:169` → texto `128:172` "One eye. One Vision. Zero Limits" en **violeta**
    (screenshot lo confirma), sobre pill gris con **doble rectángulo** (efecto borde/marco:
    `Rectangle 20` 595px exterior + `Rectangle 21` 583px interior), altura ~50px.
  - Botones `128:166` (266px, "Explore") y `128:167` (317px, "Collaborate"): **58px alto**,
    violet sólido, **sin flecha/ícono**, ancho ajustado al contenido.
- **Cambios:**
  - Subtítulo: cambiar `text-brand-white` → **violeta** (`text-brand-violet`, confirmar tono) y
    `font-body`/semibold; agregar el marco/borde (p.ej. `ring-1`/borde interior) para replicar el
    doble rectángulo; mantener fondo gris.
  - Botones: pasar **`iconRight={null}`** para quitar la flecha por defecto; mantener `size="xl"`
    (58px). Verificar padding/ancho ajustado.

### Task 10 — Navbar: items agrupados con el toggle, spacing uniforme  ·  `src/components/layout/Navbar.tsx`
- **Problema:** hoy `justify-between` reparte: logo (izq) · links (centro) · toggle (der). El cliente
  quiere los items del menú **en el mismo grupo que el toggle**, con **separación uniforme**.
- **Figma:** en `128:154`: logo `128:293` a la izquierda; `Frame 5` (`128:157`) con los 6 Menu Items
  (cada uno 150px, distribución uniforme en 900px) + `Toggle Language` (`128:228`) **agrupados a la
  derecha**, adyacentes.
- **Cambios:**
  - Reestructurar el nav a **dos grupos**: `logo` (izquierda) y `[links + ToggleLanguage]` (derecha),
    en un mismo contenedor flex a la derecha. Quitar el efecto de `justify-between` que separa los links.
  - Espaciado **uniforme** entre items (gap constante) en desktop.
  - Mantener el menú mobile (overlay) como está; solo cambia el layout desktop (`md:flex`).

---

## Orden sugerido de ejecución

Fixes triviales primero (bajo riesgo), luego los estructurales:
1. **Rápidos:** #7 Marquee → #6 EditorialIntro → #4 CraftBlock → #9 Hero (subtítulo+botones).
2. **Layout:** #10 Navbar → #5 StarredAlbums → #2 Footer.
3. **Más elaborados:** #8 BioBlock (proporciones) → #3 Bordes (violeta 2px) → #1 Toggle switch.

Commit por task (o por grupo pequeño), mensaje descriptivo. No cerrar Stage 2 hasta validar visual
en EN/FR desktop+mobile contra los frames del Figma.

## Verificación final (checklist)

- [x] `npx tsc --noEmit` limpio
- [x] ESLint limpio
- [x] Unit tests verdes (actualizado `ToggleLanguage.test.tsx` por el nuevo switch) — 45/45
- [x] `npx next build` OK
- [ ] Validación visual EN + FR, desktop + mobile, contra `128:154` / `3:6` — **pendiente: la hace el
      cliente directamente** (pidió que el agente no corra tests visuales/e2e en navegador)
- [x] i18n: `en.json` y `fr.json` sincronizados (footer sin tagline, acentos re-estructurados en bloque)
- [ ] Actualizar `CLAUDE.md` (Estado actual + changelog) marcando la pasada de pulido completa

## Notas de mantenimiento

- Al cerrar: actualizar la sección **"Estado actual"** y **"Decisiones y cambios"** de `CLAUDE.md`
  con esta pasada de pulido, y marcar el punto pendiente
  *"Pequeños fixes de fidelidad del Home"* como resuelto.
- El detalle de diseño no cambia el spec (mismos tokens/modelo de datos); no tocar el spec salvo
  que el cambio del toggle switch amerite documentarlo como decisión de UI.
