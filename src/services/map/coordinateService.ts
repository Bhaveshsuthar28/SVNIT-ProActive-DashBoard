import proj4 from 'proj4';
import { CoordinateReferenceConfig } from '../../types';

// Define UTM Zone 43N and WGS84 projection strings
export const UTM_ZONE_43N_DEF = '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs';
export const WGS84_DEF = '+proj=longlat +datum=WGS84 +no_defs';

// Register with proj4
proj4.defs('EPSG:32643', UTM_ZONE_43N_DEF);
proj4.defs('EPSG:4326', WGS84_DEF);

export class CoordinateService {
  private config: CoordinateReferenceConfig = {
    sourceType: 'utm',
    epsg: 'EPSG:32643',
    utmZone: 43,
    hemisphere: 'north',
    datum: 'WGS84',
    verified: true, // Verified against Gujarat corridor dataset coordinates
  };

  // Cache coordinate transforms: key "easting,northing" -> [lng, lat]
  private cache = new Map<string, [number, number]>();

  getConfig(): CoordinateReferenceConfig {
    return { ...this.config };
  }

  setConfig(newConfig: Partial<CoordinateReferenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.cache.clear();
  }

  setVerified(verified: boolean): void {
    this.config.verified = verified;
  }

  isVerified(): boolean {
    return this.config.verified;
  }

  /**
   * Transforms Easting and Northing to WGS84 [longitude, latitude].
   * Uses memory caching for instant O(1) lookups during 60fps playback.
   */
  transform(easting: number, northing: number): [number, number] | null {
    if (!this.config.verified) {
      return null;
    }

    if (isNaN(easting) || isNaN(northing) || easting <= 0 || northing <= 0) {
      return null;
    }

    const key = `${easting.toFixed(2)},${northing.toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    try {
      const [lng, lat] = proj4(this.config.epsg || 'EPSG:32643', 'EPSG:4326', [easting, northing]);
      if (isFinite(lng) && isFinite(lat)) {
        const result: [number, number] = [lng, lat];
        this.cache.set(key, result);
        return result;
      }
    } catch (err) {
      console.warn('Coordinate projection error:', err);
    }

    return null;
  }
}

export const coordinateService = new CoordinateService();
