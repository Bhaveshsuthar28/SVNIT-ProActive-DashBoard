import { RawTrajectoryRow, TrajectoryPoint } from '../../types';

/**
 * Normalizes vehicle class while preserving unknown classes.
 */
export function normalizeVehicleClass(groupedClass: string, sourceClass: string): string {
  const cls = (groupedClass || sourceClass || 'OTHER').trim().toUpperCase();
  if (cls === 'CAR' || cls === 'AUTOMOBILE') return 'CAR';
  if (cls === 'TRUCK' || cls === 'LORRY' || cls === 'LCV' || cls === 'HCV') return 'TRUCK';
  if (cls === 'BUS') return 'BUS';
  if (cls === 'MOTORCYCLE' || cls === 'BIKE' || cls === 'TWO-WHEELER' || cls === 'TWO_WHEELER') return 'MOTORCYCLE';
  if (cls === 'THREE-WHEELER' || cls === 'THREE_WHEELER' || cls === 'AUTO' || cls === 'OTHER' || cls === 'PEDESTRIAN') return 'OTHER';
  return cls; // Preserve unknown classes without discarding
}

/**
 * Safely parses bbox JSON array string "[ymin, xmin, ymax, xmax]".
 */
export function parseBbox(bboxStr: string | undefined): [number, number, number, number] | undefined {
  if (!bboxStr || typeof bboxStr !== 'string') return undefined;
  try {
    const parsed = JSON.parse(bboxStr);
    if (Array.isArray(parsed) && parsed.length === 4) {
      return [Number(parsed[0]), Number(parsed[1]), Number(parsed[2]), Number(parsed[3])];
    }
  } catch {
    // If not JSON, ignore malformed bbox without crashing
  }
  return undefined;
}

/**
 * Validates and converts a raw CSV row into a normalized TrajectoryPoint.
 * Returns null if essential fields are invalid.
 */
export function normalizeTrajectoryRow(row: RawTrajectoryRow): TrajectoryPoint | null {
  const frame = Number(row.frame);
  const timeSec = Number(row.time_sec);
  const trackId = Number(row.track_id);

  // Validate essential fields
  if (
    isNaN(frame) ||
    isNaN(timeSec) ||
    isNaN(trackId) ||
    !isFinite(frame) ||
    !isFinite(timeSec) ||
    !isFinite(trackId)
  ) {
    return null;
  }

  const confidence = isNaN(Number(row.confidence)) ? 0 : Number(row.confidence);
  const speedKmh = isNaN(Number(row.speed_kmh)) ? 0 : Number(row.speed_kmh);
  const headingAngle = isNaN(Number(row.heading_angle)) ? 0 : Number(row.heading_angle);

  // Use smoothed coordinates if available, fallback to raw utm
  const easting = !isNaN(Number(row.smoothed_easting))
    ? Number(row.smoothed_easting)
    : Number(row.utm_easting) || 0;
  const northing = !isNaN(Number(row.smoothed_northing))
    ? Number(row.smoothed_northing)
    : Number(row.utm_northing) || 0;

  const velocitySmoothedMs = isNaN(Number(row.velocity_smoothed_ms))
    ? 0
    : Number(row.velocity_smoothed_ms);
  const velocitySmoothedKmh = isNaN(Number(row.velocity_smoothed_kmh))
    ? speedKmh
    : Number(row.velocity_smoothed_kmh);

  const accelTangential = isNaN(Number(row.accel_tangential_ms2))
    ? 0
    : Number(row.accel_tangential_ms2);
  const accelLateral = isNaN(Number(row.accel_lateral_ms2))
    ? 0
    : Number(row.accel_lateral_ms2);

  return {
    frame,
    timeSec,
    trackId,
    vehicleClass: normalizeVehicleClass(row.grouped_class, row.source_class),
    sourceClass: row.source_class || '',
    confidence,
    bbox: parseBbox(row.bbox),
    pixelX: Number(row.cx) || 0,
    pixelY: Number(row.cy) || 0,
    easting,
    northing,
    speedKmh,
    headingDeg: headingAngle,
    velocityMs: velocitySmoothedMs,
    velocityKmh: velocitySmoothedKmh,
    accelerationTangentialMs2: accelTangential,
    accelerationLateralMs2: accelLateral,
    majorityClass: row.Track_Majority_Class || '',
    majorityShare: Number(row.Track_Majority_Share) || 1,
  };
}
