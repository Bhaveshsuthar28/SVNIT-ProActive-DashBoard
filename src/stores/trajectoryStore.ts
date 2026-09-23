import { create } from 'zustand';
import { TrajectoryDatasetStats, CoordinateReferenceConfig } from '../types';
import { trajectoryService } from '../services/trajectory/trajectoryService';

export type TrajectoryDataStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TrajectoryStoreState {
  status: TrajectoryDataStatus;
  error: string | null;
  stats: TrajectoryDatasetStats | null;
  coordinateConfig: CoordinateReferenceConfig;

  // Actions
  loadDataset: (url?: string) => Promise<void>;
}

export const useTrajectoryStore = create<TrajectoryStoreState>((set) => ({
  status: 'idle',
  error: null,
  stats: null,
  coordinateConfig: trajectoryService.getCoordinateConfig(),

  loadDataset: async (url = '/data/trajectories.csv') => {
    set({ status: 'loading', error: null });
    try {
      const stats = await trajectoryService.initialize(url);
      set({
        status: 'ready',
        stats,
        coordinateConfig: trajectoryService.getCoordinateConfig(),
      });
    } catch (err: any) {
      console.error('Trajectory dataset loading error:', err);
      set({
        status: 'error',
        error: err?.message || 'Failed to load trajectory dataset',
      });
    }
  },
}));
