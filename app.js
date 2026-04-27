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
