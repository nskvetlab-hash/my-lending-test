# Landing Page (Astro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the one-page portfolio landing for Ирина Качкина (сайты, приложения, чат-боты, AI-агенты) as a static Astro site, matching `brief.md` section-by-section, deployed to Netlify with a working contact form.

**Architecture:** Static-output Astro site (no server, no client framework). Each of the 7 content sections from `brief.md` is one self-contained `.astro` component assembled by `src/pages/index.astro` inside a shared `BaseLayout`. Visual design supports 3 switchable themes (CSS custom properties + `data-theme` attribute) so Ирина can compare them live on the Netlify preview before picking one. Because this is a static content site with no application logic, "tests" in this plan are **build + content assertions**: run `npm run build`, then `grep` the generated `dist/index.html` for the exact text/attributes the task introduced. This is the closest equivalent to TDD for static markup — write the assertion first (it fails because the element doesn't exist yet), implement the component, rerun the assertion (it passes).

**Tech Stack:** Astro (static output), `lucide-astro` for icons, self-hosted variable fonts via `@fontsource-variable/*` (no third-party Google Fonts requests, better Core Web Vitals), plain CSS with custom properties (no CSS framework), one small vanilla TypeScript file for the magnetic-button effect, Netlify Forms for the contact form (no backend code), deployed on Netlify.

**Spec:** `brief.md` (full ТЗ — content, structure, style variants, mandatory elements) and `research.md` (source of every UX/CRO/trend justification cited below). Both live at the repo root and travel with this plan — read both before implementing.

## Global Constraints

- Astro static output (`output: 'static'` in `astro.config.mjs`) — no SSR, no server runtime.
- Content is Russian only, exactly as written in `brief.md` — do not paraphrase headings/CTAs.
- Font substitution vs. `brief.md` Вариант 3: `Calibre`/`Söhne`/`SF Mono` are commercial/Apple-system fonts and are **not** used. Substituted with free equivalents: `Fraunces Variable` (headings) and `IBM Plex Mono` (labels/nav), both self-hosted via `@fontsource`. This preserves the "dark editorial, serif+mono contrast" intent from `brief.md` §4 without a font license.
- Every animation must have a `prefers-reduced-motion: reduce` fallback (research.md §4, Эксперт 1). No scrolljacking. No autoplay video/audio. No entry popups.
- WCAG contrast minimum 4.5:1 for body text; touch targets minimum 44×44px; visible `:focus-visible` outline that is not swallowed by the dark themes.
- Sticky nav with anchor links to all 7 sections (`#services`, `#portfolio`, `#process`, `#about`, `#pricing`, `#faq`); Hero has no separate nav link (it's the top of the page, `#top`).
- Contact form is handled entirely by Netlify Forms — no custom backend, no API route.
- Real business data the assistant cannot invent (case cover images, Telegram/MAX links, exact prices) is centralized in `src/data/*.ts` files so it is a one-line edit, never scattered across components.
- Telegram: `https://t.me/kachkina8`. MAX: `https://max.ru/u/f9LHodD0cOJvGC6bWqmbcDj65Lr9l3lmb98CLuwxqb_ehRvdc51EKcZf674` — both provided by the user, already final, not placeholders.

---

### Task 1: Project scaffolding, theming system, base layout

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `netlify.toml`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro` (placeholder body, filled in by later tasks)
- Create: `.gitignore`

**Interfaces:**
- Produces: CSS custom properties consumed by every component in later tasks — `--color-bg`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-2`, `--font-heading`, `--font-body`, `--font-mono`, `--radius`. Utility classes `.section`, `.btn`, `.btn-secondary`, `.reveal`.
- Produces: `<BaseLayout title={string} description={string}>` component with a default `<slot />` for page content.
- Produces: three theme values switchable via `document.documentElement.dataset.theme`: `"dark-ai"` (default, no attribute needed), `"light-conversion"`, `"dark-editorial"`.

- [ ] **Step 1: Initialize package.json and install dependencies**

Run:
```bash
npm init -y
npm install astro lucide-astro
npm install @fontsource-variable/space-grotesk @fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource-variable/fraunces @fontsource/ibm-plex-mono
```

- [ ] **Step 2: Edit `package.json` scripts**

```json
{
  "name": "my-lending-test",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```
(keep the `dependencies` block npm already wrote into the file — do not hand-edit versions)

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://REPLACE-WITH-NETLIFY-DOMAIN.netlify.app',
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.env
```

- [ ] **Step 6: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

- [ ] **Step 7: Create `src/styles/global.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
html, body { margin: 0; padding: 0; }

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

img, svg { max-width: 100%; display: block; }
a { color: inherit; }
button { font: inherit; cursor: pointer; background: none; border: none; }
ul { list-style: none; margin: 0; padding: 0; }

:root {
  --color-bg: #0F0F14;
  --color-bg-elevated: #17171F;
  --color-text: #EDEDED;
  --color-text-muted: #A0A0AC;
  --color-accent: #7C6FFF;
  --color-accent-2: #3DDCC7;
  --font-heading: 'Space Grotesk Variable', sans-serif;
  --font-body: 'Inter Variable', sans-serif;
  --font-mono: 'JetBrains Mono Variable', monospace;
  --radius: 16px;
}

:root[data-theme="light-conversion"] {
  --color-bg: #FAFAFA;
  --color-bg-elevated: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-muted: #5C5C5C;
  --color-accent: #2B47FF;
  --color-accent-2: #FF6B4A;
  --font-heading: 'Manrope Variable', sans-serif;
  --font-body: 'Manrope Variable', sans-serif;
  --font-mono: 'JetBrains Mono Variable', monospace;
  --radius: 6px;
}

:root[data-theme="dark-editorial"] {
  --color-bg: #0B0E14;
  --color-bg-elevated: #12151D;
  --color-text: #EDEDED;
  --color-text-muted: #8A8F9C;
  --color-accent: #4ADE80;
  --color-accent-2: #22C55E;
  --font-heading: 'Fraunces Variable', serif;
  --font-body: 'Inter Variable', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --radius: 2px;
}

h1, h2, h3 { font-family: var(--font-heading); line-height: 1.1; margin: 0 0 0.5em; font-weight: 600; }
h1 { font-size: clamp(2.25rem, 5vw + 1rem, 4.5rem); }
h2 { font-size: clamp(1.75rem, 3vw + 1rem, 3rem); }
p { margin: 0 0 1em; color: var(--color-text-muted); }

.section { padding: clamp(3rem, 8vw, 7rem) clamp(1rem, 5vw, 3rem); max-width: 1200px; margin: 0 auto; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.75rem;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #08080C;
  font-weight: 600;
  text-decoration: none;
  border: none;
  transition: transform 0.2s ease;
}
.btn:hover { transform: translateY(-2px); }
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-text-muted);
}

.hidden-field { position: absolute; left: -9999px; top: -9999px; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.reveal {
  animation: reveal-fade linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 30%;
}
@keyframes reveal-fade {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@supports not (animation-timeline: view()) {
  .reveal { opacity: 1; transform: none; animation: none; }
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

- [ ] **Step 8: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/manrope';
import '@fontsource-variable/fraunces';
import '@fontsource/ibm-plex-mono';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <script is:inline>
      const saved = localStorage.getItem('theme');
      if (saved && saved !== 'dark-ai') document.documentElement.dataset.theme = saved;
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

The inline `<script>` in `<head>` runs before paint so the saved theme choice never flashes the default theme first (classic FOUC fix for a client-persisted preference).

- [ ] **Step 9: Create placeholder `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout
  title="Ирина Качкина — сайты, приложения, боты и AI-агенты"
  description="Разрабатываю сайты, приложения, чат-ботов и AI-агентов. Работаете напрямую со мной, без менеджеров и наценки агентства."
>
  <main id="top">
    <p style="padding: 2rem;">Placeholder — sections added in later tasks.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 10: Verify the build**

Run:
```bash
npm run build
grep -q "Ирина Качкина" dist/index.html && echo "PASS: title present" || echo "FAIL"
grep -q "reveal-fade" dist/index.html || grep -rq "reveal-fade" dist/_astro/*.css && echo "PASS: global.css bundled" || echo "FAIL"
```
Expected: both PASS.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json netlify.toml .gitignore src/
git commit -m "Scaffold Astro project with 3-theme CSS system and base layout"
```

---

### Task 2: Sticky navigation

**Files:**
- Create: `src/components/Nav.astro`
- Modify: `src/pages/index.astro` (render `<Nav />` as first child of `<main>`)

**Interfaces:**
- Consumes: `--color-bg`, `--color-text`, `--color-text-muted`, `--color-accent`, `--font-heading` from `global.css` (Task 1).
- Produces: anchor targets the later section tasks must satisfy — `#services`, `#portfolio`, `#process`, `#about`, `#pricing`, `#faq`. If a later task's section `id` doesn't match one of these exactly, the nav link silently breaks — treat these six strings as the contract.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q 'href="#portfolio"' dist/index.html && echo "PASS" || echo "FAIL: nav link missing"
```
Expected: FAIL (Nav doesn't exist yet).

- [ ] **Step 2: Create `src/components/Nav.astro`**

```astro
---
const links = [
  { href: '#services', label: 'Услуги' },
  { href: '#portfolio', label: 'Портфолио' },
  { href: '#process', label: 'Процесс' },
  { href: '#about', label: 'Обо мне' },
  { href: '#pricing', label: 'Тарифы' },
  { href: '#faq', label: 'FAQ' },
];
---
<header class="nav">
  <a href="#top" class="nav__brand">Ирина Качкина</a>
  <nav class="nav__links" aria-label="Основная навигация">
    {links.map((link) => (
      <a href={link.href}>{link.label}</a>
    ))}
  </nav>
  <a href="#faq" class="btn nav__cta">Обсудить проект</a>
</header>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem clamp(1rem, 5vw, 3rem);
    background: color-mix(in srgb, var(--color-bg) 85%, transparent);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
  }
  .nav__brand {
    font-family: var(--font-heading);
    font-weight: 600;
    text-decoration: none;
    color: var(--color-text);
    white-space: nowrap;
  }
  .nav__links {
    display: flex;
    gap: 1.25rem;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .nav__links::-webkit-scrollbar { display: none; }
  .nav__links a {
    text-decoration: none;
    color: var(--color-text-muted);
    white-space: nowrap;
    font-size: 0.95rem;
    padding: 0.6rem 0.1rem;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
  .nav__links a:hover { color: var(--color-text); }
  .nav__cta { white-space: nowrap; padding: 0.6rem 1.1rem; font-size: 0.9rem; }
  @media (max-width: 640px) {
    .nav__cta { display: none; }
  }
</style>
```

- [ ] **Step 3: Wire into `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
---
<BaseLayout
  title="Ирина Качкина — сайты, приложения, боты и AI-агенты"
  description="Разрабатываю сайты, приложения, чат-ботов и AI-агентов. Работаете напрямую со мной, без менеджеров и наценки агентства."
>
  <Nav />
  <main id="top">
    <p style="padding: 2rem;">Placeholder — sections added in later tasks.</p>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Rerun the assertion**

```bash
npm run build
grep -q 'href="#portfolio"' dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro src/pages/index.astro
git commit -m "Add sticky navigation with section anchors"
```

---

### Task 3: Hero section

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section`, `.btn`, `.btn-secondary` from `global.css`; `lucide-astro`'s `ArrowRight` icon.
- Produces: `<section id="top">` — note this **replaces** the placeholder `<main id="top">` wrapper; `id="top"` moves onto the Hero's own `<section>`, and `<main>` becomes a plain wrapper with no id.
- Produces: image at `public/cases/teplicy-cover.jpg`, reused later by Task 5 (Portfolio) for the same case's card.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "делаю сама, от идеи до запуска" dist/index.html && echo "PASS" || echo "FAIL: hero missing"
```
Expected: FAIL.

- [ ] **Step 2: Add the hero cover image**

Export a cover screenshot of the "Тепличный бизнес под ключ" project from Behance (https://www.behance.net/gallery/251681289/proizvodstvo-teplic-teplichnyj-biznes-lending) or Figma, save as `public/cases/teplicy-cover.jpg` (landscape, ~1200×860px, JPEG quality ~80 for file size).

- [ ] **Step 3: Create `src/components/Hero.astro`**

```astro
---
import { ArrowRight } from 'lucide-astro';
---
<section id="top" class="hero section">
  <div class="hero__orb hero__orb--1" aria-hidden="true"></div>
  <div class="hero__orb hero__orb--2" aria-hidden="true"></div>
  <div class="hero__content">
    <h1 class="hero__heading">Сайты, приложения, боты и AI-агенты — делаю сама, от идеи до запуска</h1>
    <p class="hero__subtitle">Ирина Качкина, цифровой специалист. Работаете напрямую со мной — без менеджеров и наценки агентства.</p>
    <div class="hero__actions">
      <a href="#faq" class="btn">Обсудить проект <ArrowRight size={18} /></a>
      <a href="#portfolio" class="btn btn-secondary">Смотреть кейсы</a>
    </div>
  </div>
  <div class="hero__visual reveal">
    <img
      src="/cases/teplicy-cover.jpg"
      alt="Превью лендинга «Тепличный бизнес под ключ»"
      width="1200"
      height="860"
      loading="eager"
    />
  </div>
</section>

<style>
  .hero {
    position: relative;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
    gap: clamp(2rem, 5vw, 4rem);
    overflow: hidden;
    padding-top: clamp(4rem, 10vw, 8rem);
  }
  .hero__subtitle { font-size: 1.15rem; max-width: 42ch; }
  .hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
  .hero__heading {
    animation: hero-heading-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes hero-heading-reveal {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero__heading { animation: none; }
  }
  .hero__visual img {
    border-radius: var(--radius);
    box-shadow: 0 30px 60px -20px color-mix(in srgb, var(--color-accent) 40%, transparent);
  }
  .hero__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.5;
    z-index: -1;
  }
  .hero__orb--1 { width: 420px; height: 420px; background: var(--color-accent); top: -120px; left: -100px; }
  .hero__orb--2 { width: 360px; height: 360px; background: var(--color-accent-2); bottom: -140px; right: -80px; }
  @media (max-width: 860px) {
    .hero { grid-template-columns: 1fr; }
    .hero__visual { order: -1; }
  }
</style>
```

- [ ] **Step 4: Wire into `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---
<BaseLayout
  title="Ирина Качкина — сайты, приложения, боты и AI-агенты"
  description="Разрабатываю сайты, приложения, чат-ботов и AI-агентов. Работаете напрямую со мной, без менеджеров и наценки агентства."
>
  <Nav />
  <main>
    <Hero />
  </main>
</BaseLayout>
```

- [ ] **Step 5: Rerun the assertion**

```bash
npm run build
grep -q "делаю сама, от идеи до запуска" dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro public/cases/teplicy-cover.jpg
git commit -m "Add hero section with gradient orbs and case preview"
```

---

### Task 4: Services section (bento grid)

**Files:**
- Create: `src/components/Services.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section` from `global.css`; `lucide-astro` icons `Globe2`, `Smartphone`, `MessageCircle`, `Bot`.
- Produces: `<section id="services">` — satisfies the Nav contract from Task 2.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q 'id="services"' dist/index.html && echo "PASS" || echo "FAIL: services section missing"
```
Expected: FAIL.

- [ ] **Step 2: Create `src/components/Services.astro`**

```astro
---
import { Globe2, Smartphone, MessageCircle, Bot } from 'lucide-astro';

const services = [
  { icon: Globe2, title: 'Сайты и лендинги', text: 'Для бизнеса, которому нужно присутствие в сети и заявки с сайта', size: 'large' },
  { icon: Smartphone, title: 'Веб- и мобильные приложения', text: 'Для процессов, которые пора автоматизировать в отдельный продукт', size: 'small' },
  { icon: MessageCircle, title: 'Чат-боты', text: 'Для быстрых ответов клиентам в Telegram/WhatsApp без менеджера 24/7', size: 'small' },
  { icon: Bot, title: 'AI-агенты', text: 'Для задач, где нужно не просто ответить, а решить: подобрать, посчитать, записать', size: 'large' },
];
---
<section id="services" class="section services">
  <h2>Чем я могу помочь</h2>
  <div class="services__grid">
    {services.map((service) => (
      <article class={`services__card services__card--${service.size} reveal`}>
        <service.icon size={28} color="var(--color-accent)" />
        <h3>{service.title}</h3>
        <p>{service.text}</p>
      </article>
    ))}
  </div>
</section>

<style>
  .services__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
    margin-top: 2rem;
  }
  .services__card {
    background: var(--color-bg-elevated);
    border-radius: var(--radius);
    padding: 1.75rem;
    border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
  }
  .services__card--large { grid-column: span 3; }
  .services__card--small { grid-column: span 1; }
  .services__card h3 { font-size: 1.15rem; margin: 0.75rem 0 0.4rem; }
  .services__card p { margin: 0; font-size: 0.95rem; }
  @media (max-width: 720px) {
    .services__grid { grid-template-columns: 1fr; }
    .services__card--large, .services__card--small { grid-column: span 1; }
  }
</style>
```

- [ ] **Step 3: Wire into `src/pages/index.astro`** (add `import Services from '../components/Services.astro';` and `<Services />` after `<Hero />`)

- [ ] **Step 4: Rerun the assertion**

```bash
npm run build
grep -q 'id="services"' dist/index.html && grep -q "AI-агенты" dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Services.astro src/pages/index.astro
git commit -m "Add services bento grid section"
```

---

### Task 5: Portfolio / кейсы section

**Files:**
- Create: `src/data/cases.ts`
- Create: `src/components/Portfolio.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section`, `.reveal` from `global.css`.
- Produces: `<section id="portfolio">`; exports `Case` type and `cases` array from `src/data/cases.ts`, consumed only by `Portfolio.astro` (no other task reads this file).

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "Тепличный бизнес" dist/index.html && echo "PASS" || echo "FAIL: portfolio missing"
```
Expected: FAIL.

- [ ] **Step 2: Add the two remaining case cover images**

Export cover screenshots for the other two projects and save as:
- `public/cases/gofrokarton-cover.jpg` (from https://www.behance.net/gallery/220058865/proizvodstvo-gofrokartona-igofroupakovki-lending)
- `public/cases/konny-klub-cover.jpg` (from https://www.behance.net/gallery/203969439/konnyj-klub-lending)

(the first cover, `teplicy-cover.jpg`, already exists from Task 3)

- [ ] **Step 3: Create `src/data/cases.ts`**

```ts
export interface Case {
  title: string;
  task: string;
  solution: string;
  why: string;
  image: string;
  imageAlt: string;
  link: string;
}

export const cases: Case[] = [
  {
    title: 'Тепличный бизнес «под ключ»',
    task: 'Учебный проект (ONE PAGE school): спроектировать лендинг для компании, которая строит теплицы под ключ — от проекта до монтажа.',
    solution: 'Прототип в Figma с акцентом на визуальное доказательство (фото готовых теплиц), понятные этапы работы и форму заявки на расчёт.',
    why: 'Ниша с высоким чеком и офлайн-доверием — лендинг должен закрывать вопрос «покажите, что уже строили» и «сколько это будет стоить» ещё до звонка.',
    image: '/cases/teplicy-cover.jpg',
    imageAlt: 'Превью лендинга «Тепличный бизнес под ключ»',
    link: 'https://www.behance.net/gallery/251681289/proizvodstvo-teplic-teplichnyj-biznes-lending',
  },
  {
    title: 'Производство гофрокартона и гофроупаковки',
    task: 'Учебный проект (ONE PAGE school): лендинг для производителя гофрокартона и гофроупаковки, ориентированный на оптовых B2B-клиентов.',
    solution: 'Прототип с блоками «виды продукции», «производственные мощности» и формой запроса на расчёт партии.',
    why: 'B2B-аудитория выбирает поставщика по надёжности и мощностям производства, а не по эмоциям — упор на конкретику и цифры производства.',
    image: '/cases/gofrokarton-cover.jpg',
    imageAlt: 'Превью лендинга «Производство гофрокартона и гофроупаковки»',
    link: 'https://www.behance.net/gallery/220058865/proizvodstvo-gofrokartona-igofroupakovki-lending',
  },
  {
    title: 'Конный клуб в Казани',
    task: 'Учебный проект (ONE PAGE school): лендинг для конного клуба в Казани — запись на прогулки и тренировки верхом.',
    solution: 'Прототип с акцентом на атмосферные фото, расписание услуг (прогулки/тренировки/аренда) и удобную форму записи.',
    why: 'Эмоциональная ниша отдыха и спорта — решение продаёт впечатление и удобство записи, а не техническую спецификацию.',
    image: '/cases/konny-klub-cover.jpg',
    imageAlt: 'Превью лендинга «Конный клуб в Казани»',
    link: 'https://www.behance.net/gallery/203969439/konnyj-klub-lending',
  },
];
```

- [ ] **Step 4: Create `src/components/Portfolio.astro`**

```astro
---
import { cases } from '../data/cases';
import { ArrowUpRight, Sparkles } from 'lucide-astro';
---
<section id="portfolio" class="section portfolio">
  <h2>Проекты в работе и на практике</h2>
  <p class="portfolio__intro">Учебные и пилотные проекты — показываю подход к задаче, а не только результат.</p>
  <div class="portfolio__grid">
    {cases.map((item) => (
      <article class="portfolio__card reveal">
        <img src={item.image} alt={item.imageAlt} width="1200" height="860" loading="lazy" />
        <h3>{item.title}</h3>
        <dl>
          <dt>Задача</dt>
          <dd>{item.task}</dd>
          <dt>Решение</dt>
          <dd>{item.solution}</dd>
          <dt>Почему так</dt>
          <dd>{item.why}</dd>
        </dl>
        <a href={item.link} target="_blank" rel="noopener noreferrer" class="portfolio__link">
          Смотреть на Behance <ArrowUpRight size={16} />
        </a>
      </article>
    ))}
    <article class="portfolio__card portfolio__card--soon reveal">
      <Sparkles size={32} color="var(--color-accent)" />
      <h3>Рабочий проект — скоро</h3>
      <p>Здесь появится первый реальный кейс с клиентским результатом.</p>
    </article>
  </div>
</section>

<style>
  .portfolio__intro { max-width: 60ch; }
  .portfolio__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-top: 2rem;
  }
  .portfolio__card {
    background: var(--color-bg-elevated);
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
    padding-bottom: 1.5rem;
  }
  .portfolio__card img { width: 100%; height: auto; }
  .portfolio__card h3 { margin: 1rem 1.5rem 0.5rem; font-size: 1.2rem; }
  .portfolio__card dl { margin: 0 1.5rem; font-size: 0.9rem; }
  .portfolio__card dt { color: var(--color-text); font-weight: 600; margin-top: 0.6rem; }
  .portfolio__card dd { margin: 0.15rem 0 0; color: var(--color-text-muted); }
  .portfolio__link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 1rem 1.5rem 0;
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .portfolio__card--soon {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    border-style: dashed;
    border-width: 2px;
  }
  .portfolio__card--soon h3 { margin: 1rem 0 0.4rem; }
  .portfolio__card--soon p { margin: 0; font-size: 0.9rem; }
  @media (max-width: 780px) {
    .portfolio__grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 5: Wire into `src/pages/index.astro`**

- [ ] **Step 6: Rerun the assertion**

```bash
npm run build
grep -q "Тепличный бизнес" dist/index.html && grep -q "Конный клуб" dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/cases.ts src/components/Portfolio.astro src/pages/index.astro public/cases/
git commit -m "Add portfolio section with real Behance cases"
```

---

### Task 6: Process section

**Files:**
- Create: `src/components/Process.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section`, `.reveal` from `global.css`.
- Produces: `<section id="process">`.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "Разработка с промежуточными демо" dist/index.html && echo "PASS" || echo "FAIL: process missing"
```
Expected: FAIL.

- [ ] **Step 2: Create `src/components/Process.astro`**

```astro
---
const steps = [
  { n: '01', title: 'Заявка и созвон', text: 'Обсуждаем задачу бесплатно, без обязательств.' },
  { n: '02', title: 'Бриф и оценка', text: 'Фиксируем объём, сроки и стоимость.' },
  { n: '03', title: 'Разработка с промежуточными демо', text: 'Видите прогресс, а не тишину до сдачи.' },
  { n: '04', title: 'Запуск и поддержка', text: 'Передаю доступы и код, остаюсь на связи после запуска.' },
];
---
<section id="process" class="section process">
  <h2>Как проходит работа</h2>
  <ol class="process__list">
    {steps.map((step) => (
      <li class="process__step reveal">
        <span class="process__number">{step.n}</span>
        <div>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
      </li>
    ))}
  </ol>
</section>

<style>
  .process__list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; }
  .process__step {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    padding: 1.25rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
  }
  .process__step:last-child { border-bottom: none; }
  .process__number {
    font-family: var(--font-mono);
    color: var(--color-accent);
    font-size: 1.1rem;
    min-width: 2.5rem;
  }
  .process__step h3 { margin: 0 0 0.3rem; font-size: 1.1rem; }
  .process__step p { margin: 0; }
</style>
```

- [ ] **Step 3: Wire into `src/pages/index.astro`**

- [ ] **Step 4: Rerun the assertion** — expect PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Process.astro src/pages/index.astro
git commit -m "Add process section with 4 steps"
```

---

### Task 7: About section («О мне»)

**Files:**
- Create: `src/components/About.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section`, `.reveal` from `global.css`.
- Produces: `<section id="about">`.
- Produces: `public/irina-photo.jpg` (real photo, supplied by the user — not generated).

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "Claude Code" dist/index.html && echo "PASS" || echo "FAIL: about missing"
```
Expected: FAIL.

- [ ] **Step 2: Add the photo**

Save a real photo of Ирина as `public/irina-photo.jpg` (square or portrait crop, ~800×800px). This is a required manual step — there is no fallback graphic, since `brief.md` and the client-persona audit in `research.md` §4 both treat a real face as a primary trust signal for a solo specialist.

- [ ] **Step 3: Create `src/components/About.astro`**

```astro
---
const stack = ['Figma', 'Astro', 'Claude Code', 'Codex'];
---
<section id="about" class="section about">
  <div class="about__grid">
    <img src="/irina-photo.jpg" alt="Ирина Качкина" width="400" height="400" loading="lazy" class="about__photo reveal" />
    <div class="reveal">
      <h2>Кто делает проект</h2>
      <p class="about__lead">Ирина Качкина</p>
      <p>
        Я разрабатываю сайты, приложения, чат-ботов и AI-агентов. Мне интересен весь цикл — от идеи до
        работающего продукта, поэтому не ограничиваюсь одной технологией. Использую Figma для дизайна и
        современные AI-инструменты разработки — Claude Code и Codex — это позволяет держать высокий темп
        и качество даже в одиночку.
      </p>
      <p>
        Я не агентство — вы всегда общаетесь напрямую со мной, без посредников. Расту вместе с каждым
        проектом и подхожу к задаче так, будто это мой собственный бизнес.
      </p>
      <ul class="about__stack">
        {stack.map((tool) => (
          <li>{tool}</li>
        ))}
      </ul>
    </div>
  </div>
</section>

<style>
  .about__grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: clamp(2rem, 5vw, 3.5rem);
    align-items: start;
  }
  .about__photo { border-radius: var(--radius); object-fit: cover; }
  .about__lead { font-family: var(--font-heading); font-size: 1.2rem; color: var(--color-text); margin-bottom: 0.5rem; }
  .about__stack { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1rem; }
  .about__stack li {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: var(--color-bg-elevated);
    border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  }
  @media (max-width: 640px) {
    .about__grid { grid-template-columns: 1fr; }
    .about__photo { width: 160px; height: 160px; }
  }
</style>
```

- [ ] **Step 4: Wire into `src/pages/index.astro`**

- [ ] **Step 5: Rerun the assertion** — expect PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/About.astro src/pages/index.astro public/irina-photo.jpg
git commit -m "Add about section with real photo and stack"
```

---

### Task 8: Pricing section

**Files:**
- Create: `src/data/pricing.ts`
- Create: `src/components/Pricing.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section`, `.btn-secondary`, `.reveal` from `global.css`.
- Produces: `<section id="pricing">`; exports `pricingTiers` from `src/data/pricing.ts`, consumed only by `Pricing.astro`.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "Ориентировочные цены" dist/index.html && echo "PASS" || echo "FAIL: pricing missing"
```
Expected: FAIL.

- [ ] **Step 2: Create `src/data/pricing.ts`**

```ts
export interface PricingTier {
  title: string;
  price: string;
  features: string[];
}

// Ориентировочные вилки — ЗАМЕНИТЬ на реальные суммы перед публикацией.
export const pricingTiers: PricingTier[] = [
  { title: 'Сайт / лендинг', price: 'от 30 000 ₽', features: ['Дизайн в Figma', 'Адаптивная вёрстка', 'Форма заявки'] },
  { title: 'Чат-бот', price: 'от 40 000 ₽', features: ['Сценарий диалога', 'Интеграция с Telegram/WhatsApp', 'Базовая аналитика'] },
  { title: 'AI-агент / приложение', price: 'расчёт индивидуально', features: ['Сложность сильно варьируется', 'Оценка после брифа', 'Пилотная версия перед полным запуском'] },
];
```

- [ ] **Step 3: Create `src/components/Pricing.astro`**

```astro
---
import { pricingTiers } from '../data/pricing';
---
<section id="pricing" class="section pricing">
  <h2>Сколько это будет стоить</h2>
  <p class="pricing__disclaimer">Ориентировочные цены — точная стоимость обсуждается после брифа.</p>
  <div class="pricing__grid">
    {pricingTiers.map((tier) => (
      <article class="pricing__card reveal">
        <h3>{tier.title}</h3>
        <p class="pricing__price">{tier.price}</p>
        <ul>
          {tier.features.map((f) => (
            <li>{f}</li>
          ))}
        </ul>
      </article>
    ))}
  </div>
  <a href="#faq" class="btn btn-secondary pricing__cta">Не уверены, что выбрать — обсудим 15 минут бесплатно</a>
</section>

<style>
  .pricing__disclaimer { font-size: 0.9rem; }
  .pricing__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 1.5rem; }
  .pricing__card {
    background: var(--color-bg-elevated);
    border-radius: var(--radius);
    padding: 1.75rem;
    border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
  }
  .pricing__price { font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-accent); margin: 0.5rem 0 1rem; }
  .pricing__card ul { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: var(--color-text-muted); }
  .pricing__card li::before { content: '— '; }
  .pricing__cta { display: inline-flex; margin-top: 2rem; }
  @media (max-width: 780px) {
    .pricing__grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 4: Wire into `src/pages/index.astro`**

- [ ] **Step 5: Rerun the assertion** — expect PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/pricing.ts src/components/Pricing.astro src/pages/index.astro
git commit -m "Add pricing section with placeholder tiers"
```

---

### Task 9: FAQ + final CTA + Netlify form

**Files:**
- Create: `src/components/FaqCta.astro`
- Create: `src/pages/success.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `.section`, `.btn`, `.hidden-field`, `.reveal` from `global.css`.
- Produces: `<section id="faq">`; a Netlify-detectable static `<form name="contact-request">`.
- Produces: `/success` route the form redirects to on submit.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q 'data-netlify="true"' dist/index.html && echo "PASS" || echo "FAIL: form missing"
```
Expected: FAIL.

- [ ] **Step 2: Create `src/components/FaqCta.astro`**

```astro
---
const faqs = [
  { q: 'Как быстро вы отвечаете?', a: 'Обычно отвечаю в течение рабочего дня, часто быстрее. Если пишете вечером или в выходные — отвечу на следующий рабочий день.' },
  { q: 'Что если у меня нет технического ТЗ?', a: 'Это нормально — большинство клиентов приходят без ТЗ. На созвоне я задаю вопросы и сама фиксирую задачу в понятном виде, вам не нужно разбираться в технических терминах.' },
  { q: 'Что будет с сайтом/ботом после запуска — вы остаётесь на связи?', a: 'Да. После запуска я передаю вам все доступы и код, плюс остаюсь на связи по вопросам и небольшим доработкам.' },
  { q: 'Можно ли начать с малого и расширять проект позже?', a: 'Да, это частый и разумный подход — например, начать с лендинга, а чат-бота или AI-агента добавить позже, когда бизнес будет готов.' },
  { q: 'Как происходит оплата?', a: 'Обычно это предоплата на старт и остаток после сдачи работы; для больших проектов можно разбить на этапы — обсуждаем это на брифе.' },
];
---
<section id="faq" class="section faq">
  <h2>Частые вопросы</h2>
  <div class="faq__list">
    {faqs.map((item) => (
      <details class="faq__item reveal">
        <summary>{item.q}</summary>
        <p>{item.a}</p>
      </details>
    ))}
  </div>

  <div class="faq__cta reveal">
    <h2>Обсудим ваш проект?</h2>
    <div class="faq__contact-buttons">
      <a href="https://t.me/kachkina8" target="_blank" rel="noopener noreferrer" class="btn">Написать в Telegram</a>
      <a
        href="https://max.ru/u/f9LHodD0cOJvGC6bWqmbcDj65Lr9l3lmb98CLuwxqb_ehRvdc51EKcZf674"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-secondary"
      >
        Написать в MAX
      </a>
    </div>

    <form name="contact-request" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/success" class="faq__form">
      <input type="hidden" name="form-name" value="contact-request" />
      <p class="hidden-field">
        <label>Не заполняйте это поле: <input name="bot-field" /></label>
      </p>
      <label>
        Имя
        <input type="text" name="name" required />
      </label>
      <label>
        Контакт (email или Telegram)
        <input type="text" name="contact" required />
      </label>
      <label>
        Тип проекта
        <select name="project-type">
          <option>Сайт</option>
          <option>Приложение</option>
          <option>Чат-бот</option>
          <option>AI-агент</option>
          <option>Не знаю</option>
        </select>
      </label>
      <button type="submit" class="btn">Отправить заявку</button>
    </form>
  </div>
</section>

<style>
  .faq__list { display: flex; flex-direction: column; gap: 0.75rem; margin: 2rem 0 4rem; }
  .faq__item {
    background: var(--color-bg-elevated);
    border-radius: var(--radius);
    padding: 1rem 1.25rem;
    border: 1px solid color-mix(in srgb, var(--color-text) 8%, transparent);
  }
  .faq__item summary { cursor: pointer; font-weight: 600; }
  .faq__item p { margin: 0.75rem 0 0; }
  .faq__contact-buttons { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0 2rem; }
  .faq__form { display: flex; flex-direction: column; gap: 1rem; max-width: 480px; }
  .faq__form label { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem; color: var(--color-text-muted); }
  .faq__form input, .faq__form select {
    padding: 0.7rem 0.9rem;
    border-radius: calc(var(--radius) / 2);
    border: 1px solid color-mix(in srgb, var(--color-text) 18%, transparent);
    background: var(--color-bg-elevated);
    color: var(--color-text);
    font: inherit;
  }
  .faq__form button { align-self: flex-start; margin-top: 0.5rem; }
</style>
```

- [ ] **Step 3: Create `src/pages/success.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Заявка отправлена — Ирина Качкина" description="Спасибо за заявку, я отвечу в течение рабочего дня.">
  <main class="section" style="text-align: center; padding-top: 6rem;">
    <h1>Спасибо, заявка отправлена</h1>
    <p>Отвечу в течение рабочего дня. Пока можно написать напрямую в <a href="https://t.me/kachkina8" style="color: var(--color-accent);">Telegram</a>.</p>
    <a href="/" class="btn" style="margin-top: 1.5rem; display: inline-flex;">Вернуться на главную</a>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Wire into `src/pages/index.astro`**

- [ ] **Step 5: Rerun the assertion**

```bash
npm run build
grep -q 'data-netlify="true"' dist/index.html && grep -q 'name="bot-field"' dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/FaqCta.astro src/pages/success.astro src/pages/index.astro
git commit -m "Add FAQ, final CTA, and Netlify contact form"
```

---

### Task 10: Floating messenger widget

**Files:**
- Create: `src/components/MessengerWidget.astro`
- Modify: `src/pages/index.astro` (rendered once, outside `<main>`, so it stays fixed across scroll)

**Interfaces:**
- Consumes: `--color-accent`, `--radius` from `global.css`.
- Produces: a `position: fixed` element visible on every section — no `id`, not part of the Nav contract.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "messenger-widget" dist/index.html && echo "PASS" || echo "FAIL: widget missing"
```
Expected: FAIL.

- [ ] **Step 2: Create `src/components/MessengerWidget.astro`**

```astro
---
import { Send } from 'lucide-astro';
---
<div class="messenger-widget">
  <a href="https://t.me/kachkina8" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" class="messenger-widget__btn">
    <Send size={22} />
  </a>
</div>

<style>
  .messenger-widget {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 60;
  }
  .messenger-widget__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--color-accent);
    color: #08080C;
    box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--color-accent) 60%, transparent);
    transition: transform 0.2s ease;
  }
  .messenger-widget__btn:hover { transform: scale(1.08); }
  @media (prefers-reduced-motion: reduce) {
    .messenger-widget__btn:hover { transform: none; }
  }
</style>
```

(single-channel widget by design — Telegram only, since `brief.md` names it "the lowest-friction channel"; MAX stays a full button in the FAQ/CTA section from Task 9, not duplicated here, to avoid two floating buttons stacking on mobile)

- [ ] **Step 3: Wire into `src/pages/index.astro`** — import and render `<MessengerWidget />` as a sibling of `<main>`, inside `<BaseLayout>`.

- [ ] **Step 4: Rerun the assertion**

```bash
npm run build
grep -q "messenger-widget" dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/MessengerWidget.astro src/pages/index.astro
git commit -m "Add floating Telegram messenger widget"
```

---

### Task 11: Theme switcher (demo tool)

**Files:**
- Create: `src/components/ThemeSwitcher.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: the three `data-theme` values defined in `global.css` (Task 1): `"dark-ai"`, `"light-conversion"`, `"dark-editorial"`.
- Produces: sets `document.documentElement.dataset.theme` and persists to `localStorage.theme`, read by the inline script in `BaseLayout.astro` (Task 1, Step 8) on next load.

- [ ] **Step 1: Write the content assertion (expected to fail)**

```bash
npm run build
grep -q "theme-switcher" dist/index.html && echo "PASS" || echo "FAIL: switcher missing"
```
Expected: FAIL.

- [ ] **Step 2: Create `src/components/ThemeSwitcher.astro`**

```astro
---
const themes = [
  { value: 'dark-ai', label: 'Dark AI' },
  { value: 'light-conversion', label: 'Light' },
  { value: 'dark-editorial', label: 'Editorial' },
];
---
<div class="theme-switcher" role="radiogroup" aria-label="Выбор темы оформления (демо)">
  {themes.map((theme) => (
    <button type="button" data-theme-value={theme.value} class="theme-switcher__btn">{theme.label}</button>
  ))}
</div>

<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('.theme-switcher__btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.themeValue!;
      if (value === 'dark-ai') {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = value;
      }
      localStorage.setItem('theme', value);
    });
  });
</script>

<style>
  .theme-switcher {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 70;
    display: flex;
    gap: 0.4rem;
    background: var(--color-bg-elevated);
    padding: 0.4rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
  }
  .theme-switcher__btn {
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  .theme-switcher__btn:hover { color: var(--color-text); }
</style>
```

- [ ] **Step 3: Wire into `src/pages/index.astro`** — import and render `<ThemeSwitcher />` as a sibling of `<Nav />`, inside `<BaseLayout>`.

- [ ] **Step 4: Rerun the assertion**

```bash
npm run build
grep -q "theme-switcher" dist/index.html && echo "PASS" || echo "FAIL"
```
Expected: PASS.

- [ ] **Step 5: Manual check (cannot be grepped — visual)**

Run `npm run dev`, open the site, click all three theme buttons, confirm colors/fonts swap live and the choice survives a page reload (localStorage).

- [ ] **Step 6: Commit**

```bash
git add src/components/ThemeSwitcher.astro src/pages/index.astro
git commit -m "Add demo theme switcher for 3 style variants"
```

---

### Task 12: Magnetic buttons + accessibility pass

**Files:**
- Create: `src/scripts/magnetic-buttons.ts`
- Modify: `src/layouts/BaseLayout.astro` (import the script)

**Interfaces:**
- Consumes: the `.btn` class (applies to every CTA button created in Tasks 2–10) — no changes needed in those files, this task attaches behavior by class selector only.
- Produces: nothing other components depend on; this is a leaf enhancement.

- [ ] **Step 1: Create `src/scripts/magnetic-buttons.ts`**

```ts
const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initMagneticButtons() {
  if (!mediaQuery.matches || reducedMotion.matches) return;

  const buttons = document.querySelectorAll<HTMLElement>('.btn');
  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', initMagneticButtons);
```

- [ ] **Step 2: Import it in `src/layouts/BaseLayout.astro`**

Add inside `<head>`, after the existing inline theme script:
```astro
<script src="../scripts/magnetic-buttons.ts"></script>
```

- [ ] **Step 3: Verify the build still succeeds**

```bash
npm run build
echo "Build exit code: $?"
```
Expected: exit code 0, and a JS chunk referencing magnetic-buttons appears under `dist/_astro/`.

Verify: `ls dist/_astro/ | grep -i magnetic` → expect at least one match.

- [ ] **Step 4: Manual accessibility checklist (cannot be grepped — run through by hand once, in browser dev tools)**

- Tab through the whole page: every interactive element (nav links, CTA buttons, FAQ `<details>`, form fields, theme switcher, messenger widget) gets a visible focus ring.
- Enable "Emulate CSS prefers-reduced-motion: reduce" in DevTools → confirm hero orbs stop pulsing, reveal animations no longer animate, magnetic buttons stop moving.
- Run the browser's built-in contrast checker (or axe DevTools) on body text in all 3 themes → confirm ≥ 4.5:1.
- Resize to 375px width → confirm no horizontal scroll, nav links scroll horizontally without breaking layout, touch targets are comfortably tappable.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/magnetic-buttons.ts src/layouts/BaseLayout.astro
git commit -m "Add magnetic button effect with reduced-motion and touch guards"
```

---

### Task 13: Netlify deployment

**Files:**
- Modify: `astro.config.mjs` (replace the placeholder `site` URL once Netlify assigns a domain)
- No other files — this task is deployment configuration and verification, not code.

- [ ] **Step 1: Push the repository to GitHub** (already connected per prior session — `origin` at `https://github.com/nskvetlab-hash/my-lending-test.git`)

```bash
git push origin main
```

- [ ] **Step 2: Connect the repo in Netlify**

In the Netlify dashboard: "Add new site" → "Import an existing project" → select the GitHub repo → build command `npm run build`, publish directory `dist` (already declared in `netlify.toml`, Netlify will read it automatically) → Deploy.

- [ ] **Step 3: Update `astro.config.mjs` with the real Netlify URL**

Once Netlify assigns a domain (e.g. `https://kachkina-portfolio.netlify.app`), replace the placeholder:
```js
export default defineConfig({
  output: 'static',
  site: 'https://kachkina-portfolio.netlify.app', // real domain, not the placeholder
});
```

- [ ] **Step 4: Verify the deployed form end-to-end**

Open the live Netlify URL, fill out and submit the contact form. Confirm: redirect to `/success`, and the submission appears under Netlify dashboard → Forms → `contact-request`.

- [ ] **Step 5: Commit and push the config update**

```bash
git add astro.config.mjs
git commit -m "Set production site URL for Netlify deployment"
git push origin main
```

---

### Task 14: Post-demo cleanup (do this only after Ирина picks a final theme)

This task is intentionally deferred — it depends on a decision (which of the 3 style variants) that Task 11 exists to help make, and cannot be completed until that decision is made. Do not execute it as part of the initial build.

- [ ] Remove `src/components/ThemeSwitcher.astro` and its import/render in `src/pages/index.astro`.
- [ ] In `src/layouts/BaseLayout.astro`, keep only the `@fontsource` imports for the chosen theme's fonts (e.g., if "Dark AI" wins, delete the `@fontsource-variable/manrope`, `@fontsource-variable/fraunces`, and `@fontsource/ibm-plex-mono` imports, and uninstall those packages with `npm uninstall`).
- [ ] In `src/styles/global.css`, delete the two unused `:root[data-theme="..."]` blocks, keeping only the winning theme's values directly on `:root`.
- [ ] Delete the inline theme-restoring `<script>` in `BaseLayout.astro`'s `<head>` (Task 1, Step 8) — no longer needed with a single fixed theme.
- [ ] Rebuild (`npm run build`) and confirm the bundled CSS/JS shrank (fewer font files, smaller `dist/_astro/*.css`).
- [ ] Commit: `git commit -m "Finalize chosen theme, remove demo switcher and unused fonts"`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-16-landing-page-astro.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
