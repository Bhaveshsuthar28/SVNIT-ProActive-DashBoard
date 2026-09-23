import { TrajectoryPoint } from '../types';

/**
 * Linearly interpolates numeric values between two trajectory points based on targetTime.
 */
export function interpolateTrajectoryPoint(
  prev: TrajectoryPoint,
  next: TrajectoryPoint,
  targetTime: number
): TrajectoryPoint {
  if (prev.timeSec === next.timeSec) {
    return { ...prev };
  }

  // Fraction t between 0 and 1
  const t = Math.max(0, Math.min(1, (targetTime - prev.timeSec) / (next.timeSec - prev.timeSec)));

  const interp = (a: number, b: number) => a + (b - a) * t;

  return {
    ...prev,
    timeSec: targetTime,
    frame: Math.round(interp(prev.frame, next.frame)),
    pixelX: interp(prev.pixelX, next.pixelX),
    pixelY: interp(prev.pixelY, next.pixelY),
    easting: interp(prev.easting, next.easting),
    northing: interp(prev.northing, next.northing),
    speedKmh: interp(prev.speedKmh, next.speedKmh),
    headingDeg: interp(prev.headingDeg, next.headingDeg),
    velocityMs: interp(prev.velocityMs, next.velocityMs),
    velocityKmh: interp(prev.velocityKmh, next.velocityKmh),
    accelerationTangentialMs2: interp(
      prev.accelerationTangentialMs2,
      next.accelerationTangentialMs2
    ),
    accelerationLateralMs2: interp(prev.accelerationLateralMs2, next.accelerationLateralMs2),
  };
}
