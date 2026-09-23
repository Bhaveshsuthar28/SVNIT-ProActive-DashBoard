// Vehicle types matching reference image
export type VehicleClass = 'CAR' | 'TRUCK' | 'BUS' | 'MOTORCYCLE' | 'OTHER' | string;

export interface RawTrajectoryRow {
  frame: number;
  time_sec: number;
  track_id: number;
  grouped_class: string;
  source_class: string;
  confidence: number;
  bbox: string;
  cx: number;
  cy: number;
  utm_easting: number;
  utm_northing: number;
  speed_kmh: number;
  heading_angle: number;
  smoothed_easting: number;
  smoothed_northing: number;
  velocity_smoothed_ms: number;
  velocity_smoothed_kmh: number;
  accel_tangential_ms2: number;
  accel_lateral_ms2: number;
  Track_Majority_Class: string;
  Track_Majority_Share: number;
}

export interface TrajectoryPoint {
  frame: number;
  timeSec: number;
  trackId: number;
  vehicleClass: string;
  sourceClass: string;
  confidence: number;
  bbox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] or [x1, y1, x2, y2]
  pixelX: number;
  pixelY: number;
  easting: number;
  northing: number;
  speedKmh: number;
  headingDeg: number;
  velocityMs: number;
  velocityKmh: number;
  accelerationTangentialMs2: number;
  accelerationLateralMs2: number;
  majorityClass: string;
  majorityShare: number;
}

export interface CoordinateReferenceConfig {
  sourceType: 'utm' | 'local_bev' | 'unknown';
  epsg?: string;
  utmZone?: number;
  hemisphere?: 'north' | 'south';
  datum?: string;
  verified: boolean;
}

export interface TrajectoryDatasetStats {
  totalRows: number;
  uniqueTracks: number;
  minTimeSec: number;
  maxTimeSec: number;
  minFrame: number;
  maxFrame: number;
  vehicleClasses: string[];
  averageSpeedKmh: number;
  maximumSpeedKmh: number;
}

export interface TrajectoryFilters {
  vehicleClasses?: string[];
  minConfidence?: number;
  minSpeedKmh?: number;
  maxSpeedKmh?: number;
}

export interface VideoEnhancementSettings {
  brightness: number;   // -50 to 50
  contrast: number;     // -50 to 50
  saturation: number;   // -50 to 50
  sharpness: number;    // 0 to 50
  exposure: number;     // -50 to 50
  grayscale: boolean;
  denoise: boolean;
  highContrast: boolean;
}
export * from './filters';
