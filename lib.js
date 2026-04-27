export function filterOutfitsByScenes(outfits, scenes) {
  if (scenes.length === 0) return outfits;
  return outfits.filter(o => scenes.includes(o.scene));
}
