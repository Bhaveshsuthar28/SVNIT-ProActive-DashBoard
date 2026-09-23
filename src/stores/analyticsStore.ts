import { create } from 'zustand';
import { TrajectoryPoint } from '../types';
import {
  CurrentKPIs,
  AnalyticsThresholds,
  DatasetAnalyticsStats,
  VehicleClassDistributionItem,
  SpeedDistributionData,
} from '../types/analytics';
import { analyticsService, DEFAULT_THRESHOLDS } from '../services/analyticsService';

export interface AnalyticsStoreState {
  isReady: boolean;
  currentKPIs: CurrentKPIs;
  thresholds: AnalyticsThresholds;
  stats: DatasetAnalyticsStats | null;
  sparklineData: {
    speedSparkline: number[];
    countSparkline: number[];
    maxSpeedSparkline: number[];
    currentSparkline: number[];
    stoppedSparkline: number[];
    trafficSparkline: number[];
  };
  realtimeDistribution: {
    distribution: VehicleClassDistributionItem[];
    total: number;
  };
  realtimeSpeedDistribution: SpeedDistributionData;

  // Actions
  initializeAnalytics: (
    points: TrajectoryPoint[],
    duration?: number,
    initialActiveVehicles?: TrajectoryPoint[]
  ) => void;
  updateForTime: (
    currentTime: number,
    activeVehicles: TrajectoryPoint[],
    filterCriteria?: {
      vehicleClasses?: string[];
      minSpeedKmh?: number | null;
      maxSpeedKmh?: number | null;
    }
  ) => void;
  setThresholds: (thresholds: Partial<AnalyticsThresholds>) => void;
}

const defaultKPIs: CurrentKPIs = {
  totalVehicles: 0,
  currentVehicles: 0,
  averageSpeedKmh: 0,
  maximumSpeedKmh: 0,
  stoppedVehicles: 0,
  trafficStatus: 'LOW',
  speedTrendPercent: 0,
  countTrendPercent: 0,
  maxSpeedTrendPercent: 0,
  stoppedTrendPercent: 0,
  cumulativeVehicles: 0,
};

const defaultSparklines = {
  speedSparkline: [0, 0],
  countSparkline: [0, 0],
  maxSpeedSparkline: [0, 0],
  currentSparkline: [0, 0],
  stoppedSparkline: [0, 0],
  trafficSparkline: [0, 0],
};

const defaultDistribution: { distribution: VehicleClassDistributionItem[]; total: number } = {
  distribution: [
    { name: 'Car', count: 0, percentage: '0%', color: '#1677FF' },
    { name: 'Motorcycle', count: 0, percentage: '0%', color: '#F79009' },
    { name: 'Other', count: 0, percentage: '0%', color: '#7A5AF8' },
    { name: 'Truck', count: 0, percentage: '0%', color: '#FF4D5A' },
    { name: 'Bus', count: 0, percentage: '0%', color: '#18B979' },
  ],
  total: 0,
};

const defaultSpeedDist: SpeedDistributionData = {
  bins: [
    '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
    '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
    '80-85', '85-90', '90-95', '95-100',
  ],
  frequencies: new Array(20).fill(0),
};

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  isReady: false,
  currentKPIs: defaultKPIs,
  thresholds: DEFAULT_THRESHOLDS,
  stats: null,
  sparklineData: defaultSparklines,
  realtimeDistribution: defaultDistribution,
  realtimeSpeedDistribution: defaultSpeedDist,

  initializeAnalytics: (
    points: TrajectoryPoint[],
    duration = 300,
    initialActiveVehicles: TrajectoryPoint[] = []
  ) => {
    const stats = analyticsService.computeDatasetAnalytics(points, duration);
    const initialKpis = analyticsService.calculateCurrentKPIs(0, initialActiveVehicles);
    const initialSparklines = analyticsService.getSparklineData(0);
    const realtimeDistribution = analyticsService.getRealtimeClassDistribution(0);
    const realtimeSpeedDistribution = analyticsService.getRealtimeSpeedDistribution(
      0,
      undefined,
      initialActiveVehicles
    );

    set({
      isReady: true,
      stats,
      currentKPIs: initialKpis,
      sparklineData: initialSparklines,
      realtimeDistribution,
      realtimeSpeedDistribution,
    });
  },

  updateForTime: (
    currentTime: number,
    activeVehicles: TrajectoryPoint[],
    filterCriteria?: {
      vehicleClasses?: string[];
      minSpeedKmh?: number | null;
      maxSpeedKmh?: number | null;
    }
  ) => {
    const currentKPIs = analyticsService.calculateCurrentKPIs(
      currentTime,
      activeVehicles,
      filterCriteria
    );
    const sparklineData = analyticsService.getSparklineData(currentTime);
    const realtimeDistribution = analyticsService.getRealtimeClassDistribution(
      currentTime,
      filterCriteria
    );
    const realtimeSpeedDistribution = analyticsService.getRealtimeSpeedDistribution(
      currentTime,
      filterCriteria,
      activeVehicles
    );

    set({
      currentKPIs,
      sparklineData,
      realtimeDistribution,
      realtimeSpeedDistribution,
    });
  },

  setThresholds: (newThresholds) => {
    analyticsService.setThresholds(newThresholds);
    set({ thresholds: analyticsService.getThresholds() });
  },
}));
