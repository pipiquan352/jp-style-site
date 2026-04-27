export function filterOutfitsByScenes(outfits, scenes) {
  if (scenes.length === 0) return outfits;
  return outfits.filter(o => scenes.includes(o.scene));
}

export function parseOutfitIdFromHash(hash) {
  const id = hash.replace(/^#/, '').trim();
  return id.length > 0 ? id : null;
}

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
