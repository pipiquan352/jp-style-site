import { filterOutfitsByScenes, parseOutfitIdFromHash, lookupById } from './lib.js';

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

if (PAGE === 'lookbook') initLookbook();
if (PAGE === 'outfit') initOutfit();
