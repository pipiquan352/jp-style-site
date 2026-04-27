# JP Style Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a 3-page personal styling site for one specific friend (Zao), where he can browse 10 curated outfits + 15 essentials and click through to buy each item.

**Architecture:** Pure static site — three HTML files (`index.html` lookbook, `outfit.html` detail, `essentials.html` list), one `data.json` driving all content, one `styles.css`, one `app.js` for DOM rendering wired per page, one `lib.js` of pure functions covered by Vitest. Outfit detail uses URL hash (`outfit.html#weekday-01`) for ID — works on GitHub Pages with no SPA fallback. PWA manifest + service worker for offline.

**Tech Stack:** Vanilla HTML / CSS / JavaScript (no framework, no bundler). Vitest for unit tests of pure logic. GitHub Pages for hosting.

**Reference:** [Spec](../specs/2026-04-19-jp-style-site-design.md) — read sections 4 (style direction), 5 (IA), 6 (data model), 7 (page designs), 8 (visual system), 10 (image strategy) before starting.

**Conventions for the engineer:**
- This site is for one user (Zao). Don't add analytics, consent banners, SEO meta, or anything that would matter for a public product.
- No build step. Every file the browser loads is the file in the repo.
- DRY, YAGNI, frequent commits. One logical change per commit.
- Test pure logic in `lib.js` with Vitest. Verify DOM/visual changes by opening the HTML files directly in a browser (`open index.html`) — no test runner needed for those.
- Comments only when the WHY isn't obvious. Don't narrate the code.

---

## File Structure

```
/
├── index.html              # Lookbook page (route: /)
├── outfit.html             # Outfit detail (route: /outfit.html#<id>)
├── essentials.html         # Essentials list (route: /essentials.html)
├── data.json               # All content — outfits + essentials
├── lib.js                  # Pure functions (filter, route parse, reverse index)
├── app.js                  # Per-page DOM rendering + event wiring
├── styles.css              # All styles, CSS vars for tokens
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (cache-first for static assets)
├── package.json            # Vitest dev dep only
├── tests/
│   └── lib.test.js         # Vitest tests for lib.js
└── images/
    ├── outfits/
    ├── essentials/
    └── icons/              # PWA icons (192, 512)
```

**Why split `lib.js` from `app.js`:** Pure functions are easy to unit test in Node. DOM-touching code is verified by opening pages in a real browser. This keeps the test setup tiny.

**Data model additions vs spec §6:** Add `colors: ["#hex", ...]` (3-4 entries) to each outfit so the lookbook card can render the small color swatches mentioned in spec §7.1. This was implied but not in the schema.

---

## Phase 1 — Bootstrap & Test Setup

### Task 1: Initialize npm project + Vitest

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Initialize package.json**

```bash
cd /Users/picbook/Desktop/项目/jp-style-site
npm init -y
```

- [ ] **Step 2: Install Vitest as dev dep**

```bash
npm install -D vitest
```

- [ ] **Step 3: Add test script + type:module to package.json**

Edit `package.json` to add:
```json
{
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
.DS_Store
*.log
```

- [ ] **Step 5: Verify Vitest runs**

```bash
npx vitest run --passWithNoTests
```
Expected: exits 0, "No test files found" message.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: bootstrap npm project with vitest"
```

---

### Task 2: Create placeholder data.json

**Files:**
- Create: `data.json`

- [ ] **Step 1: Write minimal placeholder data**

Just enough for development — 2 outfits and 4 essentials with cross-references. Real content (10 outfits / 15 essentials) lands separately in spec Phase 0.

```json
{
  "essentials": [
    {
      "id": "white-oxford-shirt",
      "name": "白色牛津衬衫",
      "nameEn": "White Oxford Shirt",
      "category": "top",
      "brand": "UNIQLO",
      "productName": "宽松版牛津扣领衬衫",
      "price": "¥199",
      "image": "images/essentials/white-oxford.jpg",
      "buyUrl": "https://www.uniqlo.cn/",
      "note": "一件挡十件。能上班能约会，袖口卷一下就是周末。"
    },
    {
      "id": "khaki-chino",
      "name": "卡其直筒裤",
      "nameEn": "Khaki Chino",
      "category": "bottom",
      "brand": "UNIQLO",
      "productName": "Smart Ankle Pants",
      "price": "¥299",
      "image": "images/essentials/khaki-chino.jpg",
      "buyUrl": "https://www.uniqlo.cn/",
      "note": "比西裤随性，比休闲裤利落。"
    },
    {
      "id": "brown-loafer",
      "name": "棕色乐福鞋",
      "nameEn": "Brown Loafer",
      "category": "shoe",
      "brand": "无印良品",
      "productName": "牛皮乐福鞋",
      "price": "¥899",
      "image": "images/essentials/brown-loafer.jpg",
      "buyUrl": "https://www.muji.com.cn/",
      "note": "一双鞋撑起整套搭配的成熟感。"
    },
    {
      "id": "simple-belt",
      "name": "简约皮带",
      "nameEn": "Leather Belt",
      "category": "accessory",
      "brand": "无印良品",
      "productName": "牛皮窄版皮带",
      "price": "¥249",
      "image": "images/essentials/belt.jpg",
      "buyUrl": "https://www.muji.com.cn/",
      "note": "颜色跟鞋呼应就不会出错。"
    }
  ],
  "outfits": [
    {
      "id": "weekday-01",
      "title": "Oxford, Chino, Loafer.",
      "subtitle": "白衬衫 + 卡其裤 + 乐福鞋",
      "scene": "weekday",
      "sceneLabel": "工作日 · 周一晨会",
      "heroImage": "images/outfits/weekday-01.jpg",
      "tagline": "最稳的一套。颜色不超过三个，剪裁干净就够了。",
      "itemIds": ["white-oxford-shirt", "khaki-chino", "brown-loafer", "simple-belt"],
      "colors": ["#f7f3ea", "#b89968", "#3a2a20"],
      "relatedOutfitIds": ["weekend-01"]
    },
    {
      "id": "weekend-01",
      "title": "Off-duty Linen.",
      "subtitle": "亚麻衬衫 + 卡其裤 + 运动鞋",
      "scene": "weekend",
      "sceneLabel": "周末 · 出门吃饭",
      "heroImage": "images/outfits/weekend-01.jpg",
      "tagline": "不正式不邋遢，刚好够拍照。",
      "itemIds": ["white-oxford-shirt", "khaki-chino"],
      "colors": ["#ffffff", "#b89968", "#7a7468"],
      "relatedOutfitIds": ["weekday-01"]
    }
  ]
}
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('data.json','utf8')).outfits.length)"
```
Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add data.json
git commit -m "feat: add placeholder data.json with 2 outfits + 4 essentials"
```

---

## Phase 2 — Pure Logic in `lib.js` (TDD)

Each task here writes a failing test first, then the implementation.

### Task 3: `filterOutfitsByScenes` — multi-select OR filter

**Files:**
- Create: `lib.js`
- Create: `tests/lib.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/lib.test.js
import { describe, it, expect } from 'vitest';
import { filterOutfitsByScenes } from '../lib.js';

const sample = [
  { id: 'a', scene: 'weekday' },
  { id: 'b', scene: 'weekend' },
  { id: 'c', scene: 'date' },
];

describe('filterOutfitsByScenes', () => {
  it('returns all outfits when no scenes selected', () => {
    expect(filterOutfitsByScenes(sample, [])).toEqual(sample);
  });

  it('filters by a single scene', () => {
    expect(filterOutfitsByScenes(sample, ['weekday'])).toEqual([sample[0]]);
  });

  it('multi-select is OR — returns outfits matching ANY scene', () => {
    const result = filterOutfitsByScenes(sample, ['weekday', 'date']);
    expect(result.map(o => o.id)).toEqual(['a', 'c']);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test
```
Expected: FAIL — `lib.js` doesn't exist or function not exported.

- [ ] **Step 3: Implement**

```javascript
// lib.js
export function filterOutfitsByScenes(outfits, scenes) {
  if (scenes.length === 0) return outfits;
  return outfits.filter(o => scenes.includes(o.scene));
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib.js tests/lib.test.js
git commit -m "feat(lib): add filterOutfitsByScenes with OR semantics"
```

---

### Task 4: `parseOutfitIdFromHash` — hash route parsing

**Files:**
- Modify: `lib.js`
- Modify: `tests/lib.test.js`

- [ ] **Step 1: Write failing tests**

Append to `tests/lib.test.js`:

```javascript
import { parseOutfitIdFromHash } from '../lib.js';

describe('parseOutfitIdFromHash', () => {
  it('extracts id from hash with # prefix', () => {
    expect(parseOutfitIdFromHash('#weekday-01')).toBe('weekday-01');
  });

  it('extracts id from hash without # prefix', () => {
    expect(parseOutfitIdFromHash('weekday-01')).toBe('weekday-01');
  });

  it('returns null for empty hash', () => {
    expect(parseOutfitIdFromHash('')).toBeNull();
    expect(parseOutfitIdFromHash('#')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify FAIL**

```bash
npm test
```

- [ ] **Step 3: Implement**

Append to `lib.js`:

```javascript
export function parseOutfitIdFromHash(hash) {
  const id = hash.replace(/^#/, '').trim();
  return id.length > 0 ? id : null;
}
```

- [ ] **Step 4: Run to verify PASS**

- [ ] **Step 5: Commit**

```bash
git add lib.js tests/lib.test.js
git commit -m "feat(lib): add parseOutfitIdFromHash"
```

---

### Task 5: `buildEssentialsReverseIndex` — essentials → outfit IDs

**Files:**
- Modify: `lib.js`
- Modify: `tests/lib.test.js`

- [ ] **Step 1: Write failing tests**

```javascript
import { buildEssentialsReverseIndex } from '../lib.js';

describe('buildEssentialsReverseIndex', () => {
  it('maps each essential id to outfit ids that include it', () => {
    const outfits = [
      { id: 'o1', itemIds: ['a', 'b'] },
      { id: 'o2', itemIds: ['b', 'c'] },
    ];
    const index = buildEssentialsReverseIndex(outfits);
    expect(index.get('a')).toEqual(['o1']);
    expect(index.get('b')).toEqual(['o1', 'o2']);
    expect(index.get('c')).toEqual(['o2']);
  });

  it('returns an empty Map for empty outfits', () => {
    expect(buildEssentialsReverseIndex([]).size).toBe(0);
  });
});
```

- [ ] **Step 2: Run FAIL**

- [ ] **Step 3: Implement**

```javascript
export function buildEssentialsReverseIndex(outfits) {
  const index = new Map();
  for (const outfit of outfits) {
    for (const itemId of outfit.itemIds) {
      if (!index.has(itemId)) index.set(itemId, []);
      index.get(itemId).push(outfit.id);
    }
  }
  return index;
}
```

- [ ] **Step 4: Run PASS**

- [ ] **Step 5: Commit**

```bash
git add lib.js tests/lib.test.js
git commit -m "feat(lib): add buildEssentialsReverseIndex"
```

---

### Task 6: `lookupById` helper for outfits/essentials

**Files:**
- Modify: `lib.js`
- Modify: `tests/lib.test.js`

- [ ] **Step 1: Write failing tests**

```javascript
import { lookupById } from '../lib.js';

describe('lookupById', () => {
  const items = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }];

  it('finds item by id', () => {
    expect(lookupById(items, 'a').name).toBe('A');
  });

  it('returns undefined when not found', () => {
    expect(lookupById(items, 'x')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run FAIL**

- [ ] **Step 3: Implement**

```javascript
export function lookupById(items, id) {
  return items.find(item => item.id === id);
}
```

- [ ] **Step 4: Run PASS**

- [ ] **Step 5: Commit**

```bash
git add lib.js tests/lib.test.js
git commit -m "feat(lib): add lookupById helper"
```

---

## Phase 3 — Lookbook Page (`index.html`)

### Task 7: Static skeleton with placeholders

**Files:**
- Create: `index.html`
- Create: `app.js`
- Create: `styles.css` (empty for now)

- [ ] **Step 1: Write `index.html` skeleton**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Lookbook</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="manifest" href="manifest.json">
</head>
<body data-page="lookbook">
  <header class="site-header">
    <a href="index.html" class="site-title">Lookbook</a>
    <nav>
      <a href="essentials.html">Essentials</a>
    </nav>
  </header>

  <section class="chips" id="chips" aria-label="场景筛选"></section>

  <main class="grid" id="grid"></main>

  <footer class="site-footer">
    <p class="site-footer__intro"><em>A personal style reference. Not a tutorial.</em></p>
    <p class="site-footer__credit">Made for Zao · 2026</p>
    <p class="site-footer__legal">图片版权归各品牌所有，本站仅用于个人穿搭参考。</p>
  </footer>

  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create empty `app.js` and `styles.css`**

```bash
touch app.js styles.css
```

- [ ] **Step 3: Verify it loads in browser**

```bash
open index.html
```
Expected: header + footer visible, no JS errors in console.

- [ ] **Step 4: Commit**

```bash
git add index.html app.js styles.css
git commit -m "feat(lookbook): add static skeleton"
```

---

### Task 8: Render outfit cards from `data.json`

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Implement card rendering**

Add to `app.js`:

```javascript
import { } from './lib.js'; // grow as needed

const PAGE = document.body.dataset.page;

async function loadData() {
  const res = await fetch('data.json');
  return res.json();
}

function renderOutfitCard(outfit) {
  const swatches = outfit.colors
    .map(c => `<span class="swatch" style="background:${c}"></span>`)
    .join('');
  return `
    <a class="card" href="outfit.html#${outfit.id}">
      <div class="card__image" style="background-image:url('${outfit.heroImage}')"></div>
      <div class="card__meta">
        <span class="card__no">No. ${outfit.id.toUpperCase()}</span>
        <span class="card__scene">${outfit.sceneLabel}</span>
      </div>
      <h2 class="card__title">${outfit.title}</h2>
      <p class="card__subtitle">${outfit.subtitle}</p>
      <div class="card__swatches">${swatches}</div>
    </a>
  `;
}

async function initLookbook() {
  const data = await loadData();
  document.getElementById('grid').innerHTML =
    data.outfits.map(renderOutfitCard).join('');
}

if (PAGE === 'lookbook') initLookbook();
```

- [ ] **Step 2: Verify in browser**

```bash
open index.html
```
Expected: 2 cards visible (broken image OK — placeholder paths).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat(lookbook): render outfit cards from data.json"
```

---

### Task 9: Scene chips + filter wiring

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Implement chips render + filter**

Add to `app.js` (above `initLookbook`):

```javascript
import { filterOutfitsByScenes } from './lib.js';

const SCENE_LABELS = {
  weekday: '工作日',
  weekend: '周末',
  date: '约会',
  'semi-formal': '略正式',
};

function renderChips(scenes, activeScenes) {
  return scenes
    .map(s => {
      const active = activeScenes.has(s) ? 'is-active' : '';
      return `<button class="chip ${active}" data-scene="${s}">${SCENE_LABELS[s] || s}</button>`;
    })
    .join('');
}
```

Then update `initLookbook`:

```javascript
async function initLookbook() {
  const data = await loadData();
  const scenes = [...new Set(data.outfits.map(o => o.scene))];
  const activeScenes = new Set();

  function rerender() {
    document.getElementById('chips').innerHTML = renderChips(scenes, activeScenes);
    const filtered = filterOutfitsByScenes(data.outfits, [...activeScenes]);
    document.getElementById('grid').innerHTML =
      filtered.map(renderOutfitCard).join('');
  }

  document.getElementById('chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const s = btn.dataset.scene;
    if (activeScenes.has(s)) activeScenes.delete(s);
    else activeScenes.add(s);
    rerender();
  });

  rerender();
}
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. Click chips: clicking a chip filters; clicking again deselects; multi-select shows union (OR).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat(lookbook): scene chips with multi-select OR filter"
```

---

## Phase 4 — Outfit Detail (`outfit.html`)

### Task 10: Skeleton + load by hash

**Files:**
- Create: `outfit.html`
- Modify: `app.js`

- [ ] **Step 1: Create `outfit.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Outfit</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="manifest" href="manifest.json">
</head>
<body data-page="outfit">
  <header class="site-header">
    <a href="index.html" class="site-title">← Lookbook</a>
    <nav><a href="essentials.html">Essentials</a></nav>
  </header>

  <main id="outfit"></main>

  <footer class="site-footer">
    <p class="site-footer__credit">Made for Zao · 2026</p>
  </footer>

  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add `initOutfit` in `app.js`**

```javascript
import { parseOutfitIdFromHash, lookupById } from './lib.js';

async function initOutfit() {
  const data = await loadData();
  function render() {
    const id = parseOutfitIdFromHash(location.hash);
    const outfit = id && lookupById(data.outfits, id);
    if (!outfit) {
      document.getElementById('outfit').innerHTML =
        '<p class="empty">Outfit not found. <a href="index.html">Back to Lookbook</a></p>';
      return;
    }
    // Full render in next task — for now, just title
    document.getElementById('outfit').innerHTML =
      `<h1>${outfit.title}</h1><p>${outfit.tagline}</p>`;
  }
  window.addEventListener('hashchange', render);
  render();
}

if (PAGE === 'outfit') initOutfit();
```

- [ ] **Step 3: Verify**

```bash
open outfit.html#weekday-01
```
Expected: title + tagline render. Try `#unknown` → "not found" message.

- [ ] **Step 4: Commit**

```bash
git add outfit.html app.js
git commit -m "feat(outfit): skeleton + hash-based lookup"
```

---

### Task 11: Hero, tagline, items grid with external links

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Implement full outfit render**

Replace the `render()` body in `initOutfit`:

```javascript
function render() {
  const id = parseOutfitIdFromHash(location.hash);
  const outfit = id && lookupById(data.outfits, id);
  if (!outfit) {
    document.getElementById('outfit').innerHTML =
      '<p class="empty">Outfit not found. <a href="index.html">Back to Lookbook</a></p>';
    return;
  }

  const items = outfit.itemIds
    .map(itemId => lookupById(data.essentials, itemId))
    .filter(Boolean);

  const itemCards = items.map(item => `
    <a class="item" href="${item.buyUrl}" target="_blank" rel="noopener">
      <div class="item__image" style="background-image:url('${item.image}')"></div>
      <div class="item__brand">${item.brand}</div>
      <div class="item__name">${item.name}</div>
      <div class="item__price">${item.price}</div>
    </a>
  `).join('');

  document.getElementById('outfit').innerHTML = `
    <figure class="hero" style="background-image:url('${outfit.heroImage}')"></figure>
    <header class="outfit-header">
      <span class="outfit-header__scene">${outfit.sceneLabel}</span>
      <h1 class="outfit-header__title">${outfit.title}</h1>
      <p class="outfit-header__tagline">${outfit.tagline}</p>
    </header>
    <section class="items">${itemCards}</section>
  `;
}
```

- [ ] **Step 2: Verify in browser**

Open `outfit.html#weekday-01`. Confirm items render and clicking opens new tab.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat(outfit): render hero, header, items grid with new-window links"
```

---

### Task 12: Related outfits at bottom

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Append related outfits to render**

After `<section class="items">${itemCards}</section>` in the template:

```javascript
const related = (outfit.relatedOutfitIds || [])
  .map(rid => lookupById(data.outfits, rid))
  .filter(Boolean);

const relatedHtml = related.length
  ? `<section class="related">
      <h3 class="related__heading">Related</h3>
      <div class="related__grid">
        ${related.map(renderOutfitCard).join('')}
      </div>
    </section>`
  : '';
```

Then append `${relatedHtml}` after the items section in the template literal.

- [ ] **Step 2: Verify**

Open `outfit.html#weekday-01`. Confirm related card appears and clicking it navigates to that outfit (URL hash updates, render re-runs via `hashchange`).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat(outfit): show related outfits at bottom"
```

---

## Phase 5 — Essentials Page

### Task 13: Skeleton + grouped list

**Files:**
- Create: `essentials.html`
- Modify: `app.js`

- [ ] **Step 1: Create `essentials.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Essentials</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="manifest" href="manifest.json">
</head>
<body data-page="essentials">
  <header class="site-header">
    <a href="index.html" class="site-title">← Lookbook</a>
  </header>

  <section class="essentials-intro">
    <p>先有这 15 件，再谈搭配。</p>
  </section>

  <main id="essentials"></main>

  <footer class="site-footer">
    <p class="site-footer__credit">Made for Zao · 2026</p>
  </footer>

  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Implement `initEssentials`**

```javascript
import { buildEssentialsReverseIndex } from './lib.js';

const CATEGORY_LABELS = {
  top: '上衣',
  bottom: '下装',
  outer: '外套',
  shoe: '鞋',
  accessory: '配件',
};
const CATEGORY_ORDER = ['top', 'bottom', 'outer', 'shoe', 'accessory'];

async function initEssentials() {
  const data = await loadData();
  const reverse = buildEssentialsReverseIndex(data.outfits);

  const groups = CATEGORY_ORDER.map(cat => {
    const items = data.essentials.filter(e => e.category === cat);
    if (items.length === 0) return '';
    const cards = items.map(item => {
      const usedIn = (reverse.get(item.id) || []).length;
      const usedLink = usedIn > 0
        ? `<a class="essential__usedin" href="outfit.html#${reverse.get(item.id)[0]}">出现在 ${usedIn} 套搭配里</a>`
        : '';
      return `
        <article class="essential">
          <div class="essential__image" style="background-image:url('${item.image}')"></div>
          <div class="essential__name">${item.name}</div>
          <div class="essential__brand">${item.brand}</div>
          <div class="essential__price">${item.price}</div>
          <a class="essential__buy" href="${item.buyUrl}" target="_blank" rel="noopener">购买</a>
          ${usedLink}
        </article>
      `;
    }).join('');
    return `
      <section class="essentials-group">
        <h2 class="essentials-group__heading">${CATEGORY_LABELS[cat]}</h2>
        <div class="essentials-group__grid">${cards}</div>
      </section>
    `;
  }).join('');

  document.getElementById('essentials').innerHTML = groups;
}

if (PAGE === 'essentials') initEssentials();
```

- [ ] **Step 3: Verify**

```bash
open essentials.html
```
Expected: 4 items grouped by category, "出现在 N 套" links present.

- [ ] **Step 4: Commit**

```bash
git add essentials.html app.js
git commit -m "feat(essentials): grouped list with reverse index links"
```

---

### Task 14: Copy shopping list to clipboard

**Files:**
- Modify: `essentials.html`
- Modify: `app.js`

- [ ] **Step 1: Add button to `essentials.html`**

Inside `.essentials-intro`:

```html
<button id="copy-list" class="link-button">复制购买清单</button>
```

- [ ] **Step 2: Wire up clipboard write**

In `initEssentials`, after rendering:

```javascript
document.getElementById('copy-list').addEventListener('click', async () => {
  const lines = data.essentials.map(e =>
    `- ${e.name}（${e.brand} · ${e.price}）${e.buyUrl}`
  ).join('\n');
  await navigator.clipboard.writeText(lines);
  const btn = document.getElementById('copy-list');
  const original = btn.textContent;
  btn.textContent = '已复制 ✓';
  setTimeout(() => { btn.textContent = original; }, 1500);
});
```

- [ ] **Step 3: Verify**

Click button. Paste somewhere — should be a multi-line list.

- [ ] **Step 4: Commit**

```bash
git add essentials.html app.js
git commit -m "feat(essentials): copy shopping list to clipboard"
```

---

## Phase 6 — Visual Design System

All visual tasks verified by opening pages in the browser. No Vitest. Reference spec §8 for the full token table.

### Task 15: Typography — fonts and base text styles

**Files:**
- Modify: `styles.css`
- Modify: `index.html`, `outfit.html`, `essentials.html` (font links)

- [ ] **Step 1: Add Google Fonts link to all 3 HTML files**

Inside each `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Add base typography to `styles.css`**

```css
:root {
  --font-serif: 'EB Garamond', 'Source Han Serif SC', 'Songti SC', serif;
  --font-sans: 'Inter', 'PingFang SC', system-ui, sans-serif;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.55;
  color: #1a1a1a;
  background: #ffffff;
}

h1, h2, h3 {
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: 0.02em;
  margin: 0;
}

a { color: inherit; text-decoration: none; }
```

- [ ] **Step 3: Verify in browser**

Reload all 3 pages. Headings should be serif, body sans, no FOUT chaos.

- [ ] **Step 4: Commit**

```bash
git add styles.css index.html outfit.html essentials.html
git commit -m "style: typography tokens — EB Garamond + Inter"
```

---

### Task 16: Color tokens, spacing, header/footer layout

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add color tokens and global layout**

Append to `styles.css`:

```css
:root {
  --color-bg: #ffffff;
  --color-bg-warm: #f7f3ea;
  --color-text: #1a1a1a;
  --color-text-muted: #7a7468;
  --color-border: #e8e6e1;
  --color-accent: #8b6a3c;

  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 40px;
  --space-5: 64px;
  --space-6: 96px;

  --max-width: 1200px;
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-serif);
  font-size: 18px;
}

.site-footer {
  text-align: center;
  padding: var(--space-5) var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-6);
  color: var(--color-text-muted);
  font-size: 13px;
}

.site-footer__intro {
  font-family: var(--font-serif);
  font-size: 16px;
  margin: 0 0 var(--space-2);
  color: var(--color-text);
}

.site-footer__legal {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: var(--space-2) 0 0;
}
```

- [ ] **Step 2: Verify**

Reload pages. Header/footer should look editorial, with serif site title and warm tone.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style: color tokens, spacing scale, header/footer layout"
```

---

### Task 17: Lookbook — chips, grid, card styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add chips + grid + card styles**

```css
.chips {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4) 0;
  flex-wrap: wrap;
}

.chip {
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 6px 14px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 999px;
  transition: all .15s ease;
}

.chip.is-active {
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  padding: var(--space-4);
  max-width: var(--max-width);
  margin: 0 auto;
}

.card { display: block; }

.card__image {
  aspect-ratio: 3 / 4;
  background-size: cover;
  background-position: center;
  background-color: var(--color-bg-warm);
  margin-bottom: var(--space-2);
}

.card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

.card__title {
  font-size: 22px;
  margin-bottom: 4px;
}

.card__subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-2);
}

.card__swatches { display: flex; gap: 4px; }
.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: inline-block;
}
```

- [ ] **Step 2: Verify**

Open `index.html`. Should see clean 3-column grid (or 1-col on narrow), serif titles, small color swatches under each card.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style(lookbook): chips, grid, card layout"
```

---

### Task 18: Outfit detail layout

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add outfit detail styles**

```css
.hero {
  aspect-ratio: 16 / 10;
  background-size: cover;
  background-position: center;
  background-color: var(--color-bg-warm);
  margin: 0;
}

.outfit-header {
  max-width: 720px;
  margin: var(--space-5) auto var(--space-4);
  padding: 0 var(--space-4);
  text-align: center;
}

.outfit-header__scene {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.outfit-header__title {
  font-size: 36px;
  margin: var(--space-2) 0;
}

.outfit-header__tagline {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 18px;
  color: var(--color-text-muted);
  margin: 0;
}

.items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  max-width: var(--max-width);
  margin: var(--space-5) auto;
  padding: 0 var(--space-4);
}

.item__image {
  aspect-ratio: 1 / 1;
  background-size: cover;
  background-position: center;
  background-color: var(--color-bg-warm);
  margin-bottom: var(--space-1);
}

.item__brand {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.item__name { font-size: 14px; }
.item__price { font-size: 13px; color: var(--color-text-muted); }

.related {
  max-width: var(--max-width);
  margin: var(--space-6) auto;
  padding: 0 var(--space-4);
}

.related__heading {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.related__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}
```

- [ ] **Step 2: Verify**

Open `outfit.html#weekday-01`. Hero spans full width, items in 4-col grid, related at bottom in 2-col.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style(outfit): hero, header, items grid, related section"
```

---

### Task 19: Essentials page layout

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add essentials styles**

```css
.essentials-intro {
  max-width: 720px;
  margin: var(--space-5) auto var(--space-4);
  padding: 0 var(--space-4);
  text-align: center;
  font-family: var(--font-serif);
  font-size: 20px;
}

.link-button {
  background: none;
  border: 1px solid var(--color-text);
  padding: 8px 18px;
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  margin-top: var(--space-2);
}

.essentials-group {
  max-width: var(--max-width);
  margin: var(--space-5) auto;
  padding: 0 var(--space-4);
}

.essentials-group__heading {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.essentials-group__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.essential {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.essential__image {
  aspect-ratio: 1 / 1;
  background-size: cover;
  background-position: center;
  background-color: var(--color-bg-warm);
  margin-bottom: var(--space-1);
}

.essential__name { font-size: 14px; }
.essential__brand {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.essential__price { font-size: 13px; color: var(--color-text-muted); }
.essential__buy {
  display: inline-block;
  margin-top: var(--space-1);
  font-size: 13px;
  border-bottom: 1px solid var(--color-text);
  align-self: flex-start;
}
.essential__usedin {
  font-size: 12px;
  color: var(--color-accent);
  margin-top: 4px;
}
```

- [ ] **Step 2: Verify**

Open `essentials.html`. Should be 3-col grid grouped by category, copy button styled.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style(essentials): grouped list layout"
```

---

### Task 20: Mobile responsive

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append media queries**

```css
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
  .items { grid-template-columns: repeat(3, 1fr); }
  .essentials-group__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .site-header { padding: var(--space-2) var(--space-3); font-size: 16px; }
  .grid { grid-template-columns: 1fr; padding: var(--space-3); gap: var(--space-3); }
  .chips { padding: var(--space-2) var(--space-3) 0; }
  .items { grid-template-columns: repeat(2, 1fr); padding: 0 var(--space-3); }
  .essentials-group__grid { grid-template-columns: repeat(2, 1fr); }
  .related__grid { grid-template-columns: 1fr; }
  .outfit-header__title { font-size: 28px; }
}
```

- [ ] **Step 2: Verify**

Open all 3 pages. Resize browser to phone width (375px). Confirm 1-col on narrow, 2-col tablet, 3-col desktop.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style: responsive breakpoints (900px, 600px)"
```

---

## Phase 7 — PWA

### Task 21: Manifest + icons

**Files:**
- Create: `manifest.json`
- Add: `images/icons/icon-192.png`, `images/icons/icon-512.png`

- [ ] **Step 1: Create `manifest.json`**

```json
{
  "name": "Lookbook for Zao",
  "short_name": "Lookbook",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a1a",
  "icons": [
    { "src": "images/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "images/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Place icon files**

Pi to provide 192×192 and 512×512 PNG icons in `images/icons/`. For dev placeholder, generate solid-color squares:

```bash
# macOS one-liner using sips (or just supply real icons later)
mkdir -p images/icons
# Drop real icons in or use any 192x192 / 512x512 PNG for now
```

- [ ] **Step 3: Verify**

Open `index.html` in Chrome → DevTools → Application → Manifest. Should load with no errors.

- [ ] **Step 4: Commit**

```bash
git add manifest.json images/icons/
git commit -m "feat(pwa): add manifest and icons"
```

---

### Task 22: Service worker

**Files:**
- Create: `sw.js`
- Modify: `app.js`

- [ ] **Step 1: Create `sw.js`**

```javascript
const CACHE = 'jp-style-v1';
const ASSETS = [
  './',
  './index.html',
  './outfit.html',
  './essentials.html',
  './styles.css',
  './app.js',
  './lib.js',
  './data.json',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
```

- [ ] **Step 2: Register in `app.js`**

At the top of `app.js`:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
```

- [ ] **Step 3: Verify**

Open Chrome DevTools → Application → Service Workers. Should see `sw.js` activated. Reload offline (Network → Offline) — pages still load.

- [ ] **Step 4: Commit**

```bash
git add sw.js app.js
git commit -m "feat(pwa): cache-first service worker"
```

---

## Phase 8 — Deploy

### Task 23: Push to GitHub

**Files:** none

- [ ] **Step 1: Confirm `pipiquan352` remote**

```bash
git remote -v
```

If no remote yet:

```bash
gh repo create pipiquan352/jp-style-site --public --source=. --remote=origin --push
```

If remote exists, push current branch:

```bash
git push -u origin main
```

- [ ] **Step 2: Verify repo on GitHub**

```bash
gh repo view --web
```

---

### Task 24: Enable GitHub Pages + verify on phone

**Files:** none

- [ ] **Step 1: Enable Pages from `main` branch root**

```bash
gh api -X POST repos/pipiquan352/jp-style-site/pages \
  -f source[branch]=main -f source[path]=/
```

(Or via GitHub UI: Settings → Pages → Source: `main` / root.)

- [ ] **Step 2: Wait ~1 min, then verify URL**

```bash
gh api repos/pipiquan352/jp-style-site/pages | grep html_url
```

Open the URL. Then open it on phone (Safari → Share → Add to Home Screen) to confirm PWA install works.

- [ ] **Step 3: Final smoke test on phone**

- [ ] Lookbook loads, chips filter
- [ ] Tap a card → outfit detail loads with hash
- [ ] Tap an item → opens brand site in new tab
- [ ] Essentials page loads, "复制购买清单" works (clipboard requires HTTPS — Pages provides it)
- [ ] Add to Home Screen → app icon appears, opens standalone

- [ ] **Step 4: Commit any deploy-time fixes if needed**

---

## Out of scope (do not add)

Do not add any of the following without spec change:
- Analytics, consent banners, SEO meta tags
- Account / login / favorites
- Search / filter beyond scene chips
- Season switcher / monthly auto-update
- Multilingual UI (English title accents are OK — full i18n is not)
- Build step (Vite, Webpack, etc.)

## Phase 0 — Content (Pi, parallel)

This plan ships a working site with placeholder data (2 outfits / 4 essentials). The spec's full 10 outfits / 15 essentials get edited into `data.json` during Phase 0 by Pi — that's a content task, not an engineering task. The plan above doesn't depend on the real content existing.
