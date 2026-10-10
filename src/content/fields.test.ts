import { describe, expect, it } from 'vitest';
import { FIELDS, SPECIAL_FIELDS } from './fields';
import { ORDERS } from './orders';

describe('field labels', () => {
  it('every field an order offers has a label or its own control', () => {
    for (const o of ORDERS) {
      for (const s of o.steps) {
        for (const p of s.parts) {
          for (const f of p.fields ?? []) expect(FIELDS[f] || SPECIAL_FIELDS.has(f), f).toBeTruthy();
        }
      }
    }
  });
});
