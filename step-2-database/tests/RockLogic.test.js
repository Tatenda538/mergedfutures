import { describe, it, expect } from 'vitest';
import { RockLogic } from '../js/RockLogic.js';

describe('RockLogic', () => {
  describe('splitRock', () => {
    it('splits a large rock into 2 medium rocks', () => {
      const parent = { radius: 50 };
      const children = RockLogic.splitRock(parent);
      expect(children).toHaveLength(2);
      children.forEach(c => {
        expect(c.radius).toBe(30);
      });
    });

    it('splits a medium rock into 2 small rocks', () => {
      const parent = { radius: 30 };
      const children = RockLogic.splitRock(parent);
      expect(children).toHaveLength(2);
      children.forEach(c => {
        expect(c.radius).toBe(12);
      });
    });

    it('returns empty array for small rock (destroyed)', () => {
      const parent = { radius: 12 };
      expect(RockLogic.splitRock(parent)).toEqual([]);
    });

    it('gives children random velocity offsets', () => {
      const parent = { radius: 50, vx: 100, vy: 50 };
      const children = RockLogic.splitRock(parent);
      expect(children).toHaveLength(2);
      children.forEach(c => {
        expect(typeof c.vx).toBe('number');
        expect(typeof c.vy).toBe('number');
      });
    });
  });

  describe('generateRocks', () => {
    it('generates the requested number of rocks', () => {
      const params = { rockCount: 5, minSpeed: 60, maxSpeed: 100, minRadius: 30, maxRadius: 50 };
      const rocks = RockLogic.generateRocks(params, 800, 600);
      expect(rocks).toHaveLength(5);
    });

    it('each rock has required properties', () => {
      const params = { rockCount: 1, minSpeed: 60, maxSpeed: 100, minRadius: 30, maxRadius: 50 };
      const rocks = RockLogic.generateRocks(params, 800, 600);
      const rock = rocks[0];
      expect(rock).toHaveProperty('x');
      expect(rock).toHaveProperty('y');
      expect(rock).toHaveProperty('vx');
      expect(rock).toHaveProperty('vy');
      expect(rock).toHaveProperty('radius');
      expect(rock.radius).toBeGreaterThanOrEqual(30);
      expect(rock.radius).toBeLessThanOrEqual(50);
    });

    it('keeps rocks away from the center spawn area', () => {
      const params = { rockCount: 20, minSpeed: 60, maxSpeed: 100, minRadius: 30, maxRadius: 50 };
      const rocks = RockLogic.generateRocks(params, 800, 600);
      rocks.forEach(r => {
        const dist = Math.hypot(r.x - 400, r.y - 300);
        expect(dist).toBeGreaterThan(150);
      });
    });
  });
});
