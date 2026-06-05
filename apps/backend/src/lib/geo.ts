/**
 * Calculate a bounding box around a geographic point given a radius in km.
 *
 * Formula:
 *   1° latitude  ≈ 111.32 km
 *   1° longitude ≈ 111.32 km × cos(latitude in radians)
 *
 * Returns the min/max latitude and longitude for the bounding box.
 * No clamping is applied — callers should clamp to valid ranges.
 *
 * @param lat  Latitude in degrees (-90 to 90)
 * @param lng  Longitude in degrees (-180 to 180)
 * @param radiusKm  Radius in kilometers (must be >= 0)
 * @throws If radiusKm is negative
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number,
): { latMin: number; latMax: number; lngMin: number; lngMax: number } {
  if (radiusKm < 0) {
    throw new Error('Radius must be non-negative');
  }

  const kmPerLatDegree = 111.32;
  const latDelta = radiusKm / kmPerLatDegree;
  const latRadians = (lat * Math.PI) / 180;
  const kmPerLngDegree = kmPerLatDegree * Math.cos(latRadians);

  // Avoid division by zero at the poles (cos(90°) = 0)
  const lngDelta = kmPerLngDegree > 0
    ? radiusKm / kmPerLngDegree
    : 0;

  return {
    latMin: lat - latDelta,
    latMax: lat + latDelta,
    lngMin: lng - lngDelta,
    lngMax: lng + lngDelta,
  };
}
