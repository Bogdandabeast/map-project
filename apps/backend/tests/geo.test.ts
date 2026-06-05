import { describe, expect, it } from 'bun:test';
import { getBoundingBox } from '../src/lib/geo';

describe('getBoundingBox', () => {
  describe('valid inputs', () => {
    it('should return correct bounding box for Madrid center at 5 km radius', () => {
      const result = getBoundingBox(40.4168, -3.7038, 5);

      // 1° latitude ≈ 111.32 km
      // 5 km → 5 / 111.32 ≈ 0.0449° latitude delta
      // 1° longitude ≈ 111.32 * cos(40.4168°) ≈ 111.32 * 0.7617 ≈ 84.79 km
      // 5 km → 5 / 84.79 ≈ 0.0590° longitude delta

      expect(result.latMin).toBeCloseTo(40.4168 - 0.0449, 3);
      expect(result.latMax).toBeCloseTo(40.4168 + 0.0449, 3);
      expect(result.lngMin).toBeCloseTo(-3.7038 - 0.0590, 3);
      expect(result.lngMax).toBeCloseTo(-3.7038 + 0.0590, 3);

      // Structural: latMin < latMax, lngMin < lngMax
      expect(result.latMin).toBeLessThan(result.latMax);
      expect(result.lngMin).toBeLessThan(result.lngMax);
    });

    it('should return symmetric bounds around the center for radius 0', () => {
      const result = getBoundingBox(0, 0, 0);

      expect(result.latMin).toBe(0);
      expect(result.latMax).toBe(0);
      expect(result.lngMin).toBe(0);
      expect(result.lngMax).toBe(0);
    });

    it('should handle a large radius (100 km) correctly', () => {
      const result = getBoundingBox(51.5074, -0.1278, 100);

      // 1° latitude ≈ 111.32 km → 100 km = 0.898°
      // cos(51.5074°) ≈ 0.6229 → lngDegree ≈ 111.32 * 0.6229 ≈ 69.35 km
      // 100 km / 69.35 ≈ 1.442°

      expect(result.latMin).toBeCloseTo(51.5074 - 0.898, 0);
      expect(result.latMax).toBeCloseTo(51.5074 + 0.898, 0);
      expect(result.lngMin).toBeLessThan(result.lngMax);
      // Just verify the box covers the expected area
      expect(result.latMin).toBeLessThan(51.5074);
      expect(result.latMax).toBeGreaterThan(51.5074);
    });
  });

  describe('edge cases', () => {
    it('should throw an error for negative radius', () => {
      expect(() => getBoundingBox(0, 0, -1)).toThrow('Radius must be non-negative');
    });

    it('should handle coordinates near the North Pole gracefully', () => {
      // latMax > 90 is clamped or allowed to propagate
      // We don't clamp in getBoundingBox — that's a caller concern
      const result = getBoundingBox(89.5, 0, 100);
      // latMax will exceed 90, but that's fine — the function is mathematical
      expect(result.latMin).toBeLessThan(89.5);
      expect(result.latMax).toBeGreaterThan(90); // May exceed 90
    });

    it('should produce equal latMin and latMax when radius is 0 at equator', () => {
      const result = getBoundingBox(0, 0, 0);
      expect(result.latMin).toBe(result.latMax);
      expect(result.lngMin).toBe(result.lngMax);
    });

    it('should handle coordinates at the prime meridian and equator', () => {
      const result = getBoundingBox(0, 0, 1);

      expect(result.latMin).toBeCloseTo(-0.00898, 4);
      expect(result.latMax).toBeCloseTo(0.00898, 4);
      expect(result.lngMin).toBeCloseTo(-0.00898, 4);
      expect(result.lngMax).toBeCloseTo(0.00898, 4);
    });
  });
});
