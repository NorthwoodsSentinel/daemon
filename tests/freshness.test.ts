/**
 * T-100 regression tests — freshness + provenance + emptiness guard.
 *
 * These FAIL without the fix (the pure freshness module did not exist and canonical
 * answers carried no provenance / stale flag / unpopulated status) and PASS with it.
 */
import { test, expect } from 'bun:test';
import {
  FRESHNESS_BUDGET_DAYS,
  ageInDays,
  isUnpopulated,
  computeProvenance,
  buildSectionResult,
} from '../src/freshness';

const FIXED_NOW = new Date('2026-07-06T00:00:00.000Z');

// (a) a getter response includes provenance / last_updated alongside the text.
test('section result carries provenance with last_updated and the content text', () => {
  const result = buildSectionResult('I build the things that prove you are you.', 'mission', '2026-07-05', '2026-07-05T22:44:12.751Z', FIXED_NOW);

  expect(result.content[0].text).toBe('I build the things that prove you are you.');
  expect(result.provenance).toBeDefined();
  expect(result.provenance.last_updated).toBe('2026-07-05');
  expect(result.provenance.generated_at).toBe('2026-07-05T22:44:12.751Z');
  expect(result.provenance.budget_days).toBe(FRESHNESS_BUDGET_DAYS);
  // one day old, well within budget
  expect(result.stale).toBe(false);
  expect(result.status).toBeUndefined();
});

// (b) with last_updated far in the past, the response carries stale: true.
test('far-past last_updated flags stale (loud warning, not a refusal)', () => {
  const result = buildSectionResult('An old memoir title.', 'what_im_building', '2024-01-01', null, FIXED_NOW);

  expect(result.stale).toBe(true);
  expect(result.provenance.stale).toBe(true);
  expect(result.provenance.age_days).toBeGreaterThan(FRESHNESS_BUDGET_DAYS);
  expect(result.warning).toContain('STALE');
  // still returns the content — warn loudly, never hard-refuse
  expect(result.content[0].text).toBe('An old memoir title.');
});

// (c) an empty section returns unpopulated, not "".
test('empty section returns status: unpopulated, never a blank valid answer', () => {
  const result = buildSectionResult('', 'whoIAm', '2026-07-05', null, FIXED_NOW);

  expect(result.status).toBe('unpopulated');
  expect(result.content[0].text).not.toBe('');
  expect(result.content[0].text).toContain('unpopulated');
});

test('whitespace-only section is also unpopulated', () => {
  expect(isUnpopulated('   \n\t ')).toBe(true);
  expect(isUnpopulated('')).toBe(true);
  expect(isUnpopulated(undefined)).toBe(true);
  expect(isUnpopulated('real content')).toBe(false);

  const result = buildSectionResult('   \n ', 'youtube', '2026-07-05', null, FIXED_NOW);
  expect(result.status).toBe('unpopulated');
});

test('computeProvenance: fresh content within budget is not stale', () => {
  const p = computeProvenance('2026-07-01', null, FIXED_NOW);
  expect(p.age_days).toBe(5);
  expect(p.stale).toBe(false);
});

test('computeProvenance: exactly at budget is not stale; one day over is', () => {
  const atBudget = computeProvenance('2026-06-22', null, FIXED_NOW); // 14 days
  expect(atBudget.age_days).toBe(FRESHNESS_BUDGET_DAYS);
  expect(atBudget.stale).toBe(false);

  const overBudget = computeProvenance('2026-06-21', null, FIXED_NOW); // 15 days
  expect(overBudget.age_days).toBe(FRESHNESS_BUDGET_DAYS + 1);
  expect(overBudget.stale).toBe(true);
});

test('ageInDays returns null for an unparseable date and does not falsely flag stale', () => {
  expect(ageInDays('not-a-date', FIXED_NOW)).toBeNull();
  const p = computeProvenance('not-a-date', null, FIXED_NOW);
  expect(p.age_days).toBeNull();
  expect(p.stale).toBe(false);
});
