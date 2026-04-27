import { describe, it, expect } from 'vitest';
import { filterOutfitsByScenes, parseOutfitIdFromHash, buildEssentialsReverseIndex } from '../lib.js';

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
