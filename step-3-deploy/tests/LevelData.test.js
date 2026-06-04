import { describe, it, expect } from 'vitest';
import { LevelData } from '../js/LevelData.js';

describe('LevelData', () => {
  it('returns params for level 1', () => {
    const p = LevelData.getLevelParams(1);
    expect(p.rockCount).toBe(3);
    expect(p.minSpeed).toBe(60);
    expect(p.maxSpeed).toBe(100);
    expect(p.minRadius).toBe(40);
    expect(p.maxRadius).toBe(60);
  });

  it('returns params for level 50', () => {
    const p = LevelData.getLevelParams(50);
    expect(p.rockCount).toBe(10);
    expect(p.minSpeed).toBe(158);
    expect(p.minRadius).toBe(25);
  });

  it('returns params for level 100', () => {
    const p = LevelData.getLevelParams(100);
    expect(p.rockCount).toBe(18);
    expect(p.minSpeed).toBe(258);
    expect(p.minRadius).toBe(10);
    expect(p.maxRadius).toBe(20);
  });

  it('clamps radius minimum to 10', () => {
    const p = LevelData.getLevelParams(999);
    expect(p.minRadius).toBe(10);
    expect(p.maxRadius).toBe(20);
  });
});
