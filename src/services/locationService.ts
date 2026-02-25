/** Haversine formula: 2点間の距離をメートルで返す */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 現在地が既存の記録から thresholdMeters 以上離れている場合 true を返す
 * （新しい場所に来た判定）
 */
export function isNewLocation(
  lat: number,
  lon: number,
  saved: Array<{ lat: number; lon: number }>,
  thresholdMeters = 300
): boolean {
  if (saved.length === 0) return true;
  return saved.every(
    (s) => calculateDistance(lat, lon, s.lat, s.lon) > thresholdMeters
  );
}

/** 連続する地点間の距離の合計を km で返す */
export function totalDistanceKm(
  locations: Array<{ lat: number; lon: number }>
): number {
  let total = 0;
  for (let i = 1; i < locations.length; i++) {
    total += calculateDistance(
      locations[i - 1].lat,
      locations[i - 1].lon,
      locations[i].lat,
      locations[i].lon
    );
  }
  return Math.round(total / 1000);
}
