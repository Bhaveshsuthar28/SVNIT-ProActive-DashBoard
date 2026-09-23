import { TrajectoryPoint } from '../types';
import {
  CurrentKPIs,
  AnalyticsThresholds,
  TrafficStatus,
  DatasetAnalyticsStats,
  TimeSeriesBin,
  VehicleClassDistributionItem,
  SpeedDistributionData,
} from '../types/analytics';

export const DEFAULT_THRESHOLDS: AnalyticsThresholds = {
  stoppedSpeedKmh: 5,           // <= 5 km/h considered stopped/idling
  accelerationDeadbandMs2: 0.15,// ignore < 0.15 m/s² noise
  chartBinSeconds: 5,           // 5-second aggregation bins for 300s charts
  trafficThresholds: {
    lowMaxVehicles: 15,
    moderateMaxVehicles: 28,
    highMaxVehicles: 38,
  },
};

export class AnalyticsService {
  private thresholds: AnalyticsThresholds = { ...DEFAULT_THRESHOLDS };
  private stats: DatasetAnalyticsStats | null = null;
  private trackFirstSeen: Map<number, number> | null = null;
  private trackClasses: Map<number, string> | null = null;
  private trackAvgSpeeds: Map<number, number> | null = null;
  private sortedTrackStarts: number[] = [];
  private binCumulativeCounts: number[] = [];

  getThresholds(): AnalyticsThresholds {
    return { ...this.thresholds };
  }

  setThresholds(newThresholds: Partial<AnalyticsThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Precomputes static dataset-wide analytics and time-series bins once.
   */
  computeDatasetAnalytics(points: TrajectoryPoint[], duration = 300): DatasetAnalyticsStats {
    const trackMajorityMap = new Map<number, string>();
    const trackSpeedSum = new Map<number, number>();
    const trackPointCount = new Map<number, number>();
    const trackFirstSeenMap = new Map<number, number>();
    let globalMaxSpeed = 0;
    let globalSpeedSum = 0;

    const binSize = this.thresholds.chartBinSeconds;
    const totalBins = Math.ceil(duration / binSize);

    const binTracks = Array.from({ length: totalBins }, () => new Set<number>());
    const binStoppedTracks = Array.from({ length: totalBins }, () => new Set<number>());
    const binMaxSpeed = new Array(totalBins).fill(0);
    const binSpeedSum = new Array(totalBins).fill(0);
    const binSpeedCount = new Array(totalBins).fill(0);
    const binAccelPosSum = new Array(totalBins).fill(0);
    const binAccelPosCount = new Array(totalBins).fill(0);
    const binAccelNegSum = new Array(totalBins).fill(0);
    const binAccelNegCount = new Array(totalBins).fill(0);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      // Track majority class
      if (!trackMajorityMap.has(p.trackId)) {
        trackMajorityMap.set(p.trackId, p.majorityClass || p.vehicleClass);
      }

      // Track first seen timestamp
      const firstSeen = trackFirstSeenMap.get(p.trackId);
      if (firstSeen === undefined || p.timeSec < firstSeen) {
        trackFirstSeenMap.set(p.trackId, p.timeSec);
      }

      // Speeds
      const spd = p.speedKmh;
      if (spd > globalMaxSpeed) globalMaxSpeed = spd;
      globalSpeedSum += spd;

      // Accumulate for per-vehicle average speed
      trackSpeedSum.set(p.trackId, (trackSpeedSum.get(p.trackId) || 0) + spd);
      trackPointCount.set(p.trackId, (trackPointCount.get(p.trackId) || 0) + 1);

      // Time-series binning
      const t = p.timeSec;
      if (t >= 0 && t <= duration) {
        const b = Math.min(totalBins - 1, Math.floor(t / binSize));
        binTracks[b].add(p.trackId);
        binSpeedSum[b] += spd;
        binSpeedCount[b]++;
        if (spd > binMaxSpeed[b]) binMaxSpeed[b] = spd;
        if (spd <= this.thresholds.stoppedSpeedKmh) {
          binStoppedTracks[b].add(p.trackId);
        }

        const acc = p.accelerationTangentialMs2;
        if (acc > this.thresholds.accelerationDeadbandMs2) {
          binAccelPosSum[b] += acc;
          binAccelPosCount[b]++;
        } else if (acc < -this.thresholds.accelerationDeadbandMs2) {
          binAccelNegSum[b] += acc;
          binAccelNegCount[b]++;
        }
      }
    }

    // Class Distribution
    const classCountMap: Record<string, number> = {
      Car: 0,
      Truck: 0,
      Bus: 0,
      Motorcycle: 0,
      Other: 0,
    };

    for (const vClass of trackMajorityMap.values()) {
      const upper = vClass.toUpperCase();
      if (upper === 'CAR' || upper === 'AUTOMOBILE') classCountMap.Car++;
      else if (upper === 'TRUCK' || upper === 'LCV' || upper === 'HCV' || upper === 'LORRY') classCountMap.Truck++;
      else if (upper === 'BUS') classCountMap.Bus++;
      else if (upper === 'MOTORCYCLE' || upper === 'TWO-WHEELER' || upper === 'TWO_WHEELER' || upper === 'BIKE') classCountMap.Motorcycle++;
      else classCountMap.Other++;
    }

    const totalTracks = trackMajorityMap.size || 1;
    const classColors: Record<string, string> = {
      Car: '#1677FF',
      Truck: '#FF4D5A',
      Bus: '#18B979',
      Motorcycle: '#F79009',
      Other: '#7A5AF8',
    };

    const classDistribution: VehicleClassDistributionItem[] = Object.keys(classCountMap).map(
      (name) => {
        const count = classCountMap[name];
        const pct = Math.round((count / totalTracks) * 100);
        return {
          name,
          count,
          percentage: `${pct}%`,
          color: classColors[name],
        };
      }
    );

    // Speed Distribution Bins (0-5, 5-10, ... 95-100) per vehicle
    const speedBinsCount = new Array(20).fill(0);
    for (const [trackId, count] of trackPointCount.entries()) {
      const avgTrackSpeed = (trackSpeedSum.get(trackId) || 0) / (count || 1);
      const binIdx = Math.min(19, Math.floor(avgTrackSpeed / 5));
      speedBinsCount[binIdx]++;
    }

    const binLabels = Array.from({ length: 20 }, (_, i) => `${i * 5}-${(i + 1) * 5}`);
    const speedDistribution: SpeedDistributionData = {
      bins: binLabels,
      frequencies: speedBinsCount,
    };

    // Time-Series Bins
    const timeSeries: TimeSeriesBin[] = [];
    for (let b = 0; b < totalBins; b++) {
      const avgSpd = binSpeedCount[b] > 0 ? Number((binSpeedSum[b] / binSpeedCount[b]).toFixed(1)) : 0;
      const count = binTracks[b].size;
      const avgPosAcc =
        binAccelPosCount[b] > 0
          ? Number((binAccelPosSum[b] / binAccelPosCount[b]).toFixed(2))
          : 0;
      const avgNegAcc =
        binAccelNegCount[b] > 0
          ? Number((binAccelNegSum[b] / binAccelNegCount[b]).toFixed(2))
          : 0;

      timeSeries.push({
        timeSec: b * binSize,
        averageSpeedKmh: avgSpd,
        maxSpeedKmh: Number(binMaxSpeed[b].toFixed(1)),
        vehicleCount: count,
        stoppedCount: binStoppedTracks[b].size,
        accelerationMs2: avgPosAcc,
        brakingMs2: avgNegAcc,
      });
    }

    // Cumulative tracks per bin for sparkline
    const seenTracksSoFar = new Set<number>();
    const binCumulativeCounts = new Array(totalBins).fill(0);
    for (let b = 0; b < totalBins; b++) {
      for (const trk of binTracks[b]) {
        seenTracksSoFar.add(trk);
      }
      binCumulativeCounts[b] = seenTracksSoFar.size;
    }

    const trackAvgSpeedMap = new Map<number, number>();
    for (const [tId, sum] of trackSpeedSum.entries()) {
      const cnt = trackPointCount.get(tId) || 1;
      trackAvgSpeedMap.set(tId, sum / cnt);
    }

    this.trackFirstSeen = trackFirstSeenMap;
    this.trackClasses = trackMajorityMap;
    this.trackAvgSpeeds = trackAvgSpeedMap;
    this.sortedTrackStarts = Array.from(trackFirstSeenMap.values()).sort((a, b) => a - b);
    this.binCumulativeCounts = binCumulativeCounts;

    this.stats = {
      totalUniqueVehicles: trackMajorityMap.size,
      durationSeconds: duration,
      classDistribution,
      speedDistribution,
      timeSeries,
      globalMaxSpeedKmh: Number(globalMaxSpeed.toFixed(1)),
      globalAvgSpeedKmh: points.length > 0 ? Number((globalSpeedSum / points.length).toFixed(1)) : 0,
    };

    return this.stats;
  }

  getDatasetAnalytics(): DatasetAnalyticsStats | null {
    return this.stats;
  }

  /**
   * Calculates live vehicle class distribution for tracks seen up to currentTime.
   */
  getRealtimeClassDistribution(
    currentTime: number,
    filterCriteria?: { vehicleClasses?: string[] }
  ): { distribution: VehicleClassDistributionItem[]; total: number } {
    if (!this.trackFirstSeen || !this.trackClasses) {
      return { distribution: this.stats?.classDistribution || [], total: this.stats?.totalUniqueVehicles || 0 };
    }

    const allowed = filterCriteria?.vehicleClasses && filterCriteria.vehicleClasses.length < 5
      ? new Set(filterCriteria.vehicleClasses.map((c) => c.toUpperCase()))
      : null;

    const classCounts: Record<string, number> = {
      Car: 0,
      Truck: 0,
      Bus: 0,
      Motorcycle: 0,
      Other: 0,
    };
    let total = 0;

    for (const [trackId, firstSeen] of this.trackFirstSeen.entries()) {
      if (firstSeen <= currentTime) {
        const cls = this.trackClasses.get(trackId);
        if (!cls) continue;
        const upper = cls.toUpperCase();
        if (allowed && !allowed.has(upper)) continue;

        if (upper === 'CAR' || upper === 'AUTOMOBILE') {
          classCounts.Car++;
        } else if (upper === 'TRUCK') {
          classCounts.Truck++;
        } else if (upper === 'BUS') {
          classCounts.Bus++;
        } else if (upper === 'MOTORCYCLE' || upper === 'BIKE') {
          classCounts.Motorcycle++;
        } else {
          classCounts.Other++;
        }
        total++;
      }
    }

    const classColors: Record<string, string> = {
      Car: '#1677FF',
      Motorcycle: '#F79009',
      Other: '#7A5AF8',
      Truck: '#FF4D5A',
      Bus: '#18B979',
    };

    const distribution: VehicleClassDistributionItem[] = (['Car', 'Motorcycle', 'Other', 'Truck', 'Bus'] as const).map((key) => {
      const count = classCounts[key] || 0;
      const pct = total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
      return {
        name: key,
        count,
        percentage: pct,
        color: classColors[key],
      };
    });

    return { distribution, total };
  }

  /**
   * Calculates live speed distribution histogram for active vehicles at currentTime.
   */
  getRealtimeSpeedDistribution(
    currentTime: number,
    filterCriteria?: { vehicleClasses?: string[]; minSpeedKmh?: number | null; maxSpeedKmh?: number | null },
    activeVehicles?: TrajectoryPoint[]
  ): SpeedDistributionData {
    const bins = [
      '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
      '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
      '80-85', '85-90', '90-95', '95-100',
    ];
    const frequencies = new Array(20).fill(0);

    const minSpd = filterCriteria?.minSpeedKmh ?? 0;
    const maxSpd = filterCriteria?.maxSpeedKmh ?? Infinity;

    // 1. If activeVehicles is provided, bin the instantaneous speeds of vehicles currently on screen
    if (activeVehicles !== undefined) {
      for (let i = 0; i < activeVehicles.length; i++) {
        const spd = activeVehicles[i].speedKmh;
        if (spd < minSpd || spd > maxSpd) continue;
        const binIdx = Math.min(19, Math.max(0, Math.floor(spd / 5)));
        frequencies[binIdx]++;
      }
      return { bins, frequencies };
    }

    // 2. Fallback: historical vehicles up to currentTime
    if (!this.trackFirstSeen || !this.trackAvgSpeeds) {
      return { bins, frequencies };
    }

    const allowed = filterCriteria?.vehicleClasses && filterCriteria.vehicleClasses.length < 5
      ? new Set(filterCriteria.vehicleClasses.map((c) => c.toUpperCase()))
      : null;

    for (const [trackId, firstSeen] of this.trackFirstSeen.entries()) {
      if (firstSeen <= currentTime) {
        if (allowed && this.trackClasses) {
          const cls = this.trackClasses.get(trackId);
          if (cls && !allowed.has(cls.toUpperCase())) continue;
        }

        const avgSpd = this.trackAvgSpeeds.get(trackId) ?? 0;
        if (avgSpd < minSpd || avgSpd > maxSpd) continue;

        const binIdx = Math.min(19, Math.max(0, Math.floor(avgSpd / 5)));
        frequencies[binIdx]++;
      }
    }

    return { bins, frequencies };
  }

  /**
   * Deterministically calculates current KPI values and trends at currentTime,
   * accounting for active filter criteria.
   */
  calculateCurrentKPIs(
    currentTime: number,
    activeVehicles: TrajectoryPoint[],
    filterCriteria?: {
      vehicleClasses?: string[];
      minSpeedKmh?: number | null;
      maxSpeedKmh?: number | null;
    }
  ): CurrentKPIs {
    const totalVehicles = this.stats ? this.stats.totalUniqueVehicles : 0;
    const currentVehicles = activeVehicles.length;

    const isClassFiltered =
      filterCriteria?.vehicleClasses !== undefined &&
      filterCriteria.vehicleClasses.length < 5;
    const isSpeedFiltered =
      (filterCriteria?.minSpeedKmh !== undefined && filterCriteria.minSpeedKmh !== null) ||
      (filterCriteria?.maxSpeedKmh !== undefined && filterCriteria.maxSpeedKmh !== null);
    const isFiltered = Boolean(isClassFiltered || isSpeedFiltered);

    let filteredTotalVehicles = totalVehicles;
    if (isClassFiltered && this.stats) {
      const allowed = new Set(filterCriteria!.vehicleClasses!.map((c) => c.toUpperCase()));
      filteredTotalVehicles = this.stats.classDistribution
        .filter((item) => allowed.has(item.name.toUpperCase()))
        .reduce((sum, item) => sum + item.count, 0);
    }

    let speedSum = 0;
    let maxSpeed = 0;
    let stoppedCount = 0;

    for (let i = 0; i < activeVehicles.length; i++) {
      const v = activeVehicles[i];
      const spd = v.speedKmh;
      speedSum += spd;
      if (spd > maxSpeed) maxSpeed = spd;
      if (spd <= this.thresholds.stoppedSpeedKmh) {
        stoppedCount++;
      }
    }

    const averageSpeedKmh =
      currentVehicles > 0 ? Number((speedSum / currentVehicles).toFixed(1)) : 0;
    const maximumSpeedKmh = Number(maxSpeed.toFixed(1));

    // Traffic Status determination based on density
    let trafficStatus: TrafficStatus = 'LOW';
    const { lowMaxVehicles, moderateMaxVehicles, highMaxVehicles } =
      this.thresholds.trafficThresholds;

    if (currentVehicles === 0) {
      trafficStatus = 'LOW';
    } else if (currentVehicles <= lowMaxVehicles) {
      trafficStatus = 'LOW';
    } else if (currentVehicles <= moderateMaxVehicles) {
      trafficStatus = 'MODERATE';
    } else if (currentVehicles <= highMaxVehicles) {
      trafficStatus = 'HIGH';
    } else {
      trafficStatus = 'SEVERE';
    }

    // Trends: compare with precomputed bin near currentTime vs prior bin
    let speedTrendPercent = 0;
    let countTrendPercent = 0;
    let maxSpeedTrendPercent = 0;
    let stoppedTrendPercent = 0;

    if (this.stats && this.stats.timeSeries.length > 2) {
      const binIdx = Math.min(
        this.stats.timeSeries.length - 1,
        Math.floor(currentTime / this.thresholds.chartBinSeconds)
      );
      const prevIdx = Math.max(0, binIdx - 1);
      const curBin = this.stats.timeSeries[binIdx];
      const prevBin = this.stats.timeSeries[prevIdx];

      if (prevBin.averageSpeedKmh > 0) {
        speedTrendPercent = Math.round(
          ((curBin.averageSpeedKmh - prevBin.averageSpeedKmh) / prevBin.averageSpeedKmh) * 100
        );
      }
      if (prevBin.vehicleCount > 0) {
        countTrendPercent = Math.round(
          ((curBin.vehicleCount - prevBin.vehicleCount) / prevBin.vehicleCount) * 100
        );
      }
    }

    // Calculate real-time cumulative vehicles detected/passed up to currentTime
    let cumulativeVehicles = 0;
    if (this.sortedTrackStarts && this.sortedTrackStarts.length > 0) {
      if (isClassFiltered && this.trackFirstSeen && this.trackClasses) {
        const allowed = new Set(filterCriteria!.vehicleClasses!.map((c) => c.toUpperCase()));
        let count = 0;
        for (const [trackId, firstSeen] of this.trackFirstSeen.entries()) {
          if (firstSeen <= currentTime) {
            const cls = this.trackClasses.get(trackId);
            if (cls && allowed.has(cls.toUpperCase())) {
              count++;
            }
          }
        }
        cumulativeVehicles = count;
      } else {
        // Binary search in sortedTrackStarts for tracks with startTime <= currentTime
        let low = 0;
        let high = this.sortedTrackStarts.length - 1;
        let idx = -1;
        while (low <= high) {
          const mid = (low + high) >> 1;
          if (this.sortedTrackStarts[mid] <= currentTime) {
            idx = mid;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        cumulativeVehicles = idx + 1;
      }
    }

    return {
      totalVehicles,
      currentVehicles,
      averageSpeedKmh,
      maximumSpeedKmh,
      stoppedVehicles: stoppedCount,
      trafficStatus,
      speedTrendPercent: isFinite(speedTrendPercent) ? speedTrendPercent : 0,
      countTrendPercent: isFinite(countTrendPercent) ? countTrendPercent : 0,
      maxSpeedTrendPercent: isFinite(maxSpeedTrendPercent) ? maxSpeedTrendPercent : 0,
      stoppedTrendPercent: isFinite(stoppedTrendPercent) ? stoppedTrendPercent : 0,
      isFiltered,
      filteredTotalVehicles,
      cumulativeVehicles,
    };
  }

  /**
   * Generates real sparkline arrays up to currentTime.
   */
  getSparklineData(currentTime: number): {
    speedSparkline: number[];
    countSparkline: number[];
    maxSpeedSparkline: number[];
    currentSparkline: number[];
    stoppedSparkline: number[];
    trafficSparkline: number[];
  } {
    if (!this.stats || this.stats.timeSeries.length === 0) {
      return {
        speedSparkline: [0, 0],
        countSparkline: [0, 0],
        maxSpeedSparkline: [0, 0],
        currentSparkline: [0, 0],
        stoppedSparkline: [0, 0],
        trafficSparkline: [0, 0],
      };
    }

    const currentBin = Math.min(
      this.stats.timeSeries.length - 1,
      Math.floor(currentTime / this.thresholds.chartBinSeconds)
    );

    // Sliding window of 14 bins up to current time (or past 14 bins)
    const windowLength = 14;
    const startIdx = Math.max(0, currentBin - windowLength + 1);
    const slice = this.stats.timeSeries.slice(startIdx, currentBin + 1);

    // Pad if fewer than 2 points
    const padded = slice.length >= 2 ? slice : this.stats.timeSeries.slice(0, 14);

    const cumSlice = this.binCumulativeCounts ? this.binCumulativeCounts.slice(startIdx, currentBin + 1) : [];
    const paddedCum = cumSlice.length >= 2 ? cumSlice : (this.binCumulativeCounts ? this.binCumulativeCounts.slice(0, 14) : []);

    return {
      speedSparkline: padded.map((b) => b.averageSpeedKmh),
      countSparkline: paddedCum.length > 0 ? paddedCum : padded.map((b) => b.vehicleCount),
      maxSpeedSparkline: padded.map((b) => b.maxSpeedKmh),
      currentSparkline: padded.map((b) => b.vehicleCount),
      stoppedSparkline: padded.map((b) => b.stoppedCount),
      trafficSparkline: padded.map((b) => b.vehicleCount),
    };
  }
}

export const analyticsService = new AnalyticsService();
