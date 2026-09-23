import {
  TrajectoryPoint,
  TrajectoryDatasetStats,
  TrajectoryFilters,
  CoordinateReferenceConfig,
  VehicleInspectionInfo,
} from '../../types';
import { loadTrajectoryCsv } from './trajectoryLoader';
import { parseTrajectoryCsv } from './trajectoryParser';
import { TrajectoryIndex } from './trajectoryIndexer';
import { interpolateTrajectoryPoint } from '../../utils/interpolation';
import { coordinateService } from '../map/coordinateService';

export class TrajectoryService {
  private index: TrajectoryIndex | null = null;
  private coordinateConfig: CoordinateReferenceConfig = {
    sourceType: 'utm',
    verified: false, // CRITICAL: Explicitly unverified in Phase 4
  };

  /**
   * Loads and indexes the trajectory dataset.
   */
  async initialize(csvUrl = '/data/trajectories.csv'): Promise<TrajectoryDatasetStats> {
    const csvContent = await loadTrajectoryCsv(csvUrl);
    const { points } = await parseTrajectoryCsv(csvContent);
    this.index = new TrajectoryIndex(points);
    return this.index.stats;
  }

  isReady(): boolean {
    return this.index !== null;
  }

  getCoordinateConfig(): CoordinateReferenceConfig {
    return { ...this.coordinateConfig };
  }

  setCoordinateConfig(config: Partial<CoordinateReferenceConfig>): void {
    this.coordinateConfig = { ...this.coordinateConfig, ...config };
  }

  getDatasetStats(): TrajectoryDatasetStats | null {
    return this.index ? this.index.stats : null;
  }

  getAllPoints(): TrajectoryPoint[] {
    return this.index ? this.index.points : [];
  }

  getAllTracks(): number[] {
    if (!this.index) return [];
    return Array.from(this.index.trackMap.keys()).sort((a, b) => a - b);
  }

  getTrack(trackId: number): TrajectoryPoint[] {
    if (!this.index) return [];
    return this.index.getTrack(trackId);
  }

  /**
   * Retrieves active vehicles around timeSec with optional filtering.
   */
  getActiveVehicles(timeSec: number, filters?: TrajectoryFilters): TrajectoryPoint[] {
    if (!this.index) return [];
    let vehicles = this.index.getActiveVehicles(timeSec);

    if (filters) {
      if (filters.vehicleClasses && filters.vehicleClasses.length > 0) {
        const allowed = new Set(filters.vehicleClasses.map((c) => c.toUpperCase()));
        vehicles = vehicles.filter((v) => allowed.has(v.vehicleClass.toUpperCase()));
      }
      if (filters.minConfidence !== undefined) {
        vehicles = vehicles.filter((v) => v.confidence >= (filters.minConfidence ?? 0));
      }
      if (filters.minSpeedKmh !== undefined) {
        vehicles = vehicles.filter((v) => v.speedKmh >= (filters.minSpeedKmh ?? 0));
      }
      if (filters.maxSpeedKmh !== undefined) {
        vehicles = vehicles.filter((v) => v.speedKmh <= (filters.maxSpeedKmh ?? Infinity));
      }
    }

    return vehicles;
  }

  /**
   * Finds the closest trajectory point for a track at a specific time, with interpolation if between points.
   */
  getPointAtTime(trackId: number, timeSec: number): TrajectoryPoint | null {
    const points = this.getTrack(trackId);
    if (!points || points.length === 0) return null;

    // Boundary cases
    if (timeSec <= points[0].timeSec) {
      return Math.abs(timeSec - points[0].timeSec) < 0.2 ? points[0] : null;
    }
    const last = points[points.length - 1];
    if (timeSec >= last.timeSec) {
      return Math.abs(timeSec - last.timeSec) < 0.2 ? last : null;
    }

    // Binary search for surrounding points
    let low = 0;
    let high = points.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (points[mid].timeSec === timeSec) {
        return points[mid];
      }
      if (points[mid].timeSec < timeSec) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const prev = points[high];
    const next = points[low];

    if (prev && next) {
      return interpolateTrajectoryPoint(prev, next, timeSec);
    }

    return null;
  }

  getTrajectoryWindow(startTime: number, endTime: number): TrajectoryPoint[] {
    if (!this.index) return [];
    const results: TrajectoryPoint[] = [];
    const startKey = Math.round(startTime * 25);
    const endKey = Math.round(endTime * 25);

    for (let k = startKey; k <= endKey; k++) {
      const list = this.index.timeBucketMap.get(k);
      if (list) {
        results.push(...list);
      }
    }

    return results;
  }

  trackExists(trackId: number): boolean {
    if (!this.index) return false;
    return this.index.trackMap.has(trackId);
  }

  getVehicleInspection(trackId: number, currentTime: number): VehicleInspectionInfo | null {
    const points = this.getTrack(trackId);
    if (!points || points.length === 0) return null;

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const durationSec = Number((lastPt.timeSec - firstPt.timeSec).toFixed(1));

    let speedSum = 0;
    let maxSpeed = 0;
    for (let i = 0; i < points.length; i++) {
      const s = points[i].speedKmh;
      speedSum += s;
      if (s > maxSpeed) maxSpeed = s;
    }
    const avgSpeedKmh = Number((speedSum / points.length).toFixed(1));

    const activePt = this.getPointAtTime(trackId, currentTime);
    const displayPt = activePt || (currentTime < firstPt.timeSec ? firstPt : lastPt);
    const coords = coordinateService.transform(displayPt.easting, displayPt.northing);
    const lng = coords ? coords[0] : 0;
    const lat = coords ? coords[1] : 0;

    return {
      trackId,
      vehicleClass: displayPt.vehicleClass,
      sourceClass: displayPt.sourceClass,
      currentSpeedKmh: activePt ? Number(activePt.speedKmh.toFixed(1)) : 0,
      headingDeg: Number(displayPt.headingDeg.toFixed(1)),
      confidence: Number((displayPt.confidence * 100).toFixed(1)),
      easting: Number(displayPt.easting.toFixed(2)),
      northing: Number(displayPt.northing.toFixed(2)),
      lng,
      lat,
      accelerationTangentialMs2: activePt ? Number(activePt.accelerationTangentialMs2.toFixed(2)) : 0,
      isActive: activePt !== null,
      firstSeenSec: Number(firstPt.timeSec.toFixed(1)),
      lastSeenSec: Number(lastPt.timeSec.toFixed(1)),
      durationSec,
      totalPoints: points.length,
      avgSpeedKmh,
      maxSpeedKmh: Number(maxSpeed.toFixed(1)),
    };
  }
}

// Global singleton instance for application use
export const trajectoryService = new TrajectoryService();
