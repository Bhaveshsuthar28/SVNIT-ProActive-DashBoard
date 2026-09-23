import { useEffect, useRef } from 'react';
import { useTrajectoryStore } from '../stores/trajectoryStore';
import { useTimelineStore } from '../stores/timelineStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useFilterStore } from '../stores/filterStore';
import { trajectoryService } from '../services/trajectory/trajectoryService';

/**
 * Custom hook to synchronize real-time analytics, KPIs, and sparklines
 * with the HTML5 video currentTime, native seeking/seeked events, active filters,
 * and the indexed trajectory data engine.
 *
 * Implements discontinuity handling for video seeking:
 * - Direct timestamp querying without iterating intermediate frames
 * - Invalidation of stale state via request/version tracking
 * - Immediate calculation on seek, avoiding throttle delays
 */
export function useAnalyticsSync() {
  const dataStatus = useTrajectoryStore((s) => s.status);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const isSeeking = useTimelineStore((s) => s.isSeeking);
  const seekVersion = useTimelineStore((s) => s.seekVersion);

  const isReady = useAnalyticsStore((s) => s.isReady);
  const initializeAnalytics = useAnalyticsStore((s) => s.initializeAnalytics);
  const updateForTime = useAnalyticsStore((s) => s.updateForTime);

  // Filter criteria
  const selectedClasses = useFilterStore((s) => s.selectedClasses);
  const minSpeedKmh = useFilterStore((s) => s.minSpeedKmh);
  const maxSpeedKmh = useFilterStore((s) => s.maxSpeedKmh);

  const lastUpdateRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(-1);
  const lastSeekVersionRef = useRef<number>(0);
  const requestIdRef = useRef<number>(0);

  // 1. Initialize dataset analytics once trajectory dataset is parsed and indexed
  useEffect(() => {
    if (dataStatus === 'ready' && !isReady && trajectoryService.isReady()) {
      const points = trajectoryService.getAllPoints();
      const initialActive = trajectoryService.getActiveVehicles(currentTime, {
        vehicleClasses: selectedClasses,
        minSpeedKmh: minSpeedKmh ?? undefined,
        maxSpeedKmh: maxSpeedKmh ?? undefined,
      });
      initializeAnalytics(points, 300, initialActive);
    }
  }, [
    dataStatus,
    isReady,
    initializeAnalytics,
    currentTime,
    selectedClasses,
    minSpeedKmh,
    maxSpeedKmh,
  ]);

  // 2. Synchronize KPIs, sparklines, and charts to currentTime, seeking, and filters
  useEffect(() => {
    if (!isReady || !trajectoryService.isReady()) return;

    const now = performance.now();
    const isSeekEvent =
      seekVersion !== lastSeekVersionRef.current ||
      Math.abs(currentTime - lastTimeRef.current) >= 0.25 ||
      isSeeking;

    // Throttle during continuous smooth playback (~16 Hz / 60ms) for high efficiency;
    // but update IMMEDIATELY on seek, pause, filter change, or timestamp discontinuity
    const shouldUpdate =
      isSeekEvent ||
      !isPlaying ||
      now - lastUpdateRef.current >= 60;

    if (shouldUpdate) {
      const currentReqId = ++requestIdRef.current;
      lastUpdateRef.current = now;
      lastTimeRef.current = currentTime;
      lastSeekVersionRef.current = seekVersion;

      // Direct indexed trajectory query at target currentTime (O(1) lookups)
      const activeVehicles = trajectoryService.getActiveVehicles(currentTime, {
        vehicleClasses: selectedClasses,
        minSpeedKmh: minSpeedKmh ?? undefined,
        maxSpeedKmh: maxSpeedKmh ?? undefined,
      });

      // Ensure that only the latest request commits to the store (latest seek wins)
      if (currentReqId === requestIdRef.current) {
        updateForTime(currentTime, activeVehicles, {
          vehicleClasses: selectedClasses,
          minSpeedKmh,
          maxSpeedKmh,
        });
      }
    }
  }, [
    currentTime,
    isPlaying,
    isSeeking,
    seekVersion,
    isReady,
    updateForTime,
    selectedClasses,
    minSpeedKmh,
    maxSpeedKmh,
  ]);
}
