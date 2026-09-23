export type TrafficStatus = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'UNKNOWN';

export interface CurrentKPIs {
  totalVehicles: number;
  currentVehicles: number;
  averageSpeedKmh: number;
  maximumSpeedKmh: number;
  stoppedVehicles: number;
  trafficStatus: TrafficStatus;
  speedTrendPercent: number;
  countTrendPercent: number;
  maxSpeedTrendPercent: number;
  stoppedTrendPercent: number;
  isFiltered?: boolean;
  filteredTotalVehicles?: number;
  cumulativeVehicles?: number;
}

export interface AnalyticsThresholds {
  stoppedSpeedKmh: number;        // Default: 5 km/h
  accelerationDeadbandMs2: number;// Default: 0.15 m/s²
  chartBinSeconds: number;        // Default: 5 seconds (60 bins across 300s)
  trafficThresholds: {
    lowMaxVehicles: number;       // <= 15
    moderateMaxVehicles: number;  // <= 28
    highMaxVehicles: number;      // <= 38
  };
}

export interface TimeSeriesBin {
  timeSec: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  vehicleCount: number;
  stoppedCount: number;
  accelerationMs2: number;
  brakingMs2: number;
}

export interface VehicleClassDistributionItem {
  name: string;
  count: number;
  percentage: string;
  color: string;
}

export interface SpeedDistributionData {
  bins: string[];
  frequencies: number[];
}

export interface DatasetAnalyticsStats {
  totalUniqueVehicles: number;
  durationSeconds: number;
  classDistribution: VehicleClassDistributionItem[];
  speedDistribution: SpeedDistributionData;
  timeSeries: TimeSeriesBin[];
  globalMaxSpeedKmh: number;
  globalAvgSpeedKmh: number;
}
