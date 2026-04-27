export function filterOutfitsByScenes(outfits, scenes) {
  if (scenes.length === 0) return outfits;
  return outfits.filter(o => scenes.includes(o.scene));
}

export function parseOutfitIdFromHash(hash) {
  const id = hash.replace(/^#/, '').trim();
  return id.length > 0 ? id : null;
}
