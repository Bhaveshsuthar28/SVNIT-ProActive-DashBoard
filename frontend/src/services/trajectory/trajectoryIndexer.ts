import { TrajectoryPoint, TrajectoryDatasetStats } from '../../types';

export class TrajectoryIndex {
  // Lookup by trackId -> sorted points
  readonly trackMap = new Map<number, TrajectoryPoint[]>();

  // Lookup by quantized frame bucket (timeSec * 25) -> active vehicle points in that timestep
  readonly timeBucketMap = new Map<number, TrajectoryPoint[]>();

  // Precomputed stats
  readonly stats: TrajectoryDatasetStats;
  readonly points: TrajectoryPoint[];

  constructor(points: TrajectoryPoint[]) {
    this.points = points;
    let minTime = Infinity;
    let maxTime = -Infinity;
    let minFrame = Infinity;
    let maxFrame = -Infinity;
    let maxSpeed = 0;
    let speedSum = 0;
    const vehicleClassesSet = new Set<string>();

    // 1. Group points by track and by time bucket
    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      // Track Index
      let trackList = this.trackMap.get(p.trackId);
      if (!trackList) {
        trackList = [];
        this.trackMap.set(p.trackId, trackList);
      }
      trackList.push(p);

      // Time Bucket Index (quantized to 25 fps = 0.04s)
      const timeKey = Math.round(p.timeSec * 25);
      let timeList = this.timeBucketMap.get(timeKey);
      if (!timeList) {
        timeList = [];
        this.timeBucketMap.set(timeKey, timeList);
      }
      timeList.push(p);

      // Track statistics
      if (p.timeSec < minTime) minTime = p.timeSec;
      if (p.timeSec > maxTime) maxTime = p.timeSec;
      if (p.frame < minFrame) minFrame = p.frame;
      if (p.frame > maxFrame) maxFrame = p.frame;
      if (p.speedKmh > maxSpeed) maxSpeed = p.speedKmh;
      speedSum += p.speedKmh;
      if (p.vehicleClass) vehicleClassesSet.add(p.vehicleClass);
    }

    // 2. Ensure each track's points are strictly sorted by timeSec ascending
    for (const trackList of this.trackMap.values()) {
      trackList.sort((a, b) => a.timeSec - b.timeSec);
    }

    const totalRows = points.length;
    this.stats = {
      totalRows,
      uniqueTracks: this.trackMap.size,
      minTimeSec: isFinite(minTime) ? minTime : 0,
      maxTimeSec: isFinite(maxTime) ? maxTime : 0,
      minFrame: isFinite(minFrame) ? minFrame : 0,
      maxFrame: isFinite(maxFrame) ? maxFrame : 0,
      vehicleClasses: Array.from(vehicleClassesSet).sort(),
      averageSpeedKmh: totalRows > 0 ? Number((speedSum / totalRows).toFixed(1)) : 0,
      maximumSpeedKmh: Number(maxSpeed.toFixed(1)),
    };
  }

  /**
   * Fast O(1) lookup of active vehicle points around given timestamp.
   */
  getActiveVehicles(timeSec: number): TrajectoryPoint[] {
    const key = Math.round(timeSec * 25);
    return this.timeBucketMap.get(key) || [];
  }

  /**
   * Returns all points for a single track.
   */
  getTrack(trackId: number): TrajectoryPoint[] {
    return this.trackMap.get(trackId) || [];
  }
}
