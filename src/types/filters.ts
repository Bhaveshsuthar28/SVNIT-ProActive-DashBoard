export interface VehicleInspectionInfo {
  trackId: number;
  vehicleClass: string;
  sourceClass: string;
  currentSpeedKmh: number;
  headingDeg: number;
  confidence: number;
  easting: number;
  northing: number;
  lng: number;
  lat: number;
  accelerationTangentialMs2: number;
  isActive: boolean;
  firstSeenSec: number;
  lastSeenSec: number;
  durationSec: number;
  totalPoints: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
}

export interface TrafficFilterState {
  selectedClasses: string[];
  minSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  selectedTrackId: number | null;
  showTrajectories: boolean;
  showVehicleIds: boolean;
  showSpeedLabels: boolean;
  showHeatmap: boolean;
  searchQuery: string;
  focusTrigger: number;
}
