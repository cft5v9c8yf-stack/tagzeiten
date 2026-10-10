import { describe, expect, it } from 'vitest';
import { contentDocs } from '../content/searchIndex';
import { fold, prepare, search } from './fulltext';

const index = prepare(contentDocs('2026-09-30'));
const titles = (q: string) => search(index, q).map((h) => h.doc.title);

describe('full-text search', () => {
  it('folds old and new spelling onto one form', () => {
    expect(fold('Theil')).toBe(fold('Teil'));
    expect(fold('Sacrament')).toBe(fold('Sakrament'));
    expect(fold('daß')).toBe(fold('dass'));
    expect(fold('Ueber')).toBe(fold('über'));
    expect(fold('Concilium')).toBe(fold('Konzilium'));
  });

  it('finds the article of the Augsburg Confession by today’s spelling', () => {
    const hits = search(index, 'Rechtfertigung');
    expect(hits[0]!.doc.title).toBe('Der IV. Artikel. Von der Rechtfertigung.');
    expect(hits[0]!.doc.to).toBe('/katechismus/augsburgische-konfession');
    expect(titles('Sakrament Gestalt')).toContain('Der XXII. Artikel. Von beider Gestalt des Sacraments.');
    expect(titles('Bischöfe Gewalt')).toContain('Der XXVIII. Artikel. Von der Bischöfe Gewalt.');
    expect(titles('Hauptartikel Lamm Gottes')).toContain('Das andere Theil. Der I. und Hauptartikel.');
  });

  it('needs every word, forgives one slip and marks what it found', () => {
    expect(titles('Athanasianum')[0]).toBe('Das Athanasianische Glaubensbekenntnis');
    expect(titles('selig werden Dingen')).toContain('Das Athanasianische Glaubensbekenntnis');
    expect(titles('Rechtfertigunk')).toContain('Der IV. Artikel. Von der Rechtfertigung.');
    expect(search(index, 'Rechtfertigung Xylophon')).toEqual([]);
    const hit = search(index, 'Krippe')[0]!;
    expect(hit.snippet.some((p) => p.mark && fold(p.text).startsWith('krip'))).toBe(true);
  });

  it('links a Sunday and its lesson to the next date of that Sunday', () => {
    const hit = search(index, 'aufzustehen vom Schlafe')[0]!;
    expect(hit.doc.title).toBe('Am ersten Sonntage des Advents.');
    expect(hit.doc.to).toBe('/sonntag?s=2026-11-29');
  });
});
