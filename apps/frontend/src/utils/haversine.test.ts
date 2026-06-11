import { describe, expect, it } from 'bun:test'
import { haversine } from './haversine'

describe('haversine', () => {
  it('returns 0 for the same point', () => {
    expect(haversine(0, 0, 0, 0)).toBe(0)
  })

  it('returns 0 for the same non-zero point', () => {
    expect(haversine(-34.6037, -58.3816, -34.6037, -58.3816)).toBe(0)
  })

  it('returns a positive distance between two different points', () => {
    const distance = haversine(0, 0, 1, 1)
    expect(distance).toBeGreaterThan(0)
  })

  it('calculates Buenos Aires to La Plata (~60 km)', () => {
    // Buenos Aires (approx center)
    const baLat = -34.6037
    const baLng = -58.3816
    // La Plata (approx center)
    const lpLat = -34.9215
    const lpLng = -57.9545

    const distance = haversine(baLat, baLng, lpLat, lpLng)

    // The known distance is approximately 60 km (±5 km tolerance for centre coords)
    expect(distance).toBeGreaterThan(50)
    expect(distance).toBeLessThan(70)
  })

  it('distance is symmetric (A→B equals B→A)', () => {
    const d1 = haversine(40.4168, -3.7038, 48.8566, 2.3522)
    const d2 = haversine(48.8566, 2.3522, 40.4168, -3.7038)

    expect(d1).toBe(d2)
  })

  it('North Pole to South Pole is ~20000 km (half circumference)', () => {
    const distance = haversine(90, 0, -90, 0)

    // Half the Earth's circumference: π * 6371 ≈ 20015 km
    expect(distance).toBeGreaterThan(19500)
    expect(distance).toBeLessThan(20500)
  })
})
