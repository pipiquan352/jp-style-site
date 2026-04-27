import { filterOutfitsByScenes, parseOutfitIdFromHash, lookupById, buildEssentialsReverseIndex } from './lib.js';

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

const SCENE_LABELS = {
  weekday: '工作日',
  weekend: '周末',
  date: '约会',
  'semi-formal': '略正式',
};

const CATEGORY_LABELS = {
  top: '上衣',
  bottom: '下装',
  outer: '外套',
  shoe: '鞋',
  accessory: '配件',
};
const CATEGORY_ORDER = ['top', 'bottom', 'outer', 'shoe', 'accessory'];

function renderChips(scenes, activeScenes) {
  return scenes
    .map(s => {
      const active = activeScenes.has(s) ? 'is-active' : '';
      return `<button class="chip ${active}" data-scene="${s}">${SCENE_LABELS[s] || s}</button>`;
    })
    .join('');
}

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

    document.getElementById('outfit').innerHTML = `
      <figure class="hero" style="background-image:url('${outfit.heroImage}')"></figure>
      <header class="outfit-header">
        <span class="outfit-header__scene">${outfit.sceneLabel}</span>
        <h1 class="outfit-header__title">${outfit.title}</h1>
        <p class="outfit-header__tagline">${outfit.tagline}</p>
      </header>
      <section class="items">${itemCards}</section>
      ${relatedHtml}
    `;
  }
  window.addEventListener('hashchange', render);
  render();
}

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
}

if (PAGE === 'lookbook') initLookbook();
if (PAGE === 'outfit') initOutfit();
if (PAGE === 'essentials') initEssentials();
