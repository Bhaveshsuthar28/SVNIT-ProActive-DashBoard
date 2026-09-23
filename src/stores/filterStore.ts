import { create } from 'zustand';
import { TrafficFilterState } from '../types';

export const ALL_VEHICLE_CLASSES = ['CAR', 'TRUCK', 'BUS', 'MOTORCYCLE', 'OTHER'] as const;

export interface FilterStoreState extends TrafficFilterState {
  // Computed helpers
  isFilteringActive: boolean;

  // Actions
  toggleVehicleClass: (cls: string) => void;
  setVehicleClasses: (classes: string[]) => void;
  setSpeedRange: (min: number | null, max: number | null) => void;
  setSelectedTrackId: (trackId: number | null) => void;
  setSearchQuery: (query: string) => void;
  setShowTrajectories: (show: boolean) => void;
  setShowVehicleIds: (show: boolean) => void;
  setShowSpeedLabels: (show: boolean) => void;
  setShowHeatmap: (show: boolean) => void;
  triggerFocusVehicle: () => void;
  resetFilters: () => void;

  // Filter panel visibility toggle
  isFilterPanelVisible: boolean;
  setIsFilterPanelVisible: (visible: boolean) => void;
  toggleFilterPanel: () => void;
}

const defaultState: TrafficFilterState = {
  selectedClasses: [...ALL_VEHICLE_CLASSES],
  minSpeedKmh: null,
  maxSpeedKmh: null,
  selectedTrackId: null,
  showTrajectories: true,
  showVehicleIds: true,
  showSpeedLabels: true,
  showHeatmap: false,
  searchQuery: '',
  focusTrigger: 0,
};

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  ...defaultState,
  isFilteringActive: false,
  isFilterPanelVisible: true,

  toggleVehicleClass: (cls: string) => {
    const current = get().selectedClasses;
    const upper = cls.toUpperCase();
    let updated: string[];

    if (current.includes(upper)) {
      // If clicking the only active class, reset to all
      if (current.length === 1) {
        updated = [...ALL_VEHICLE_CLASSES];
      } else {
        updated = current.filter((c) => c !== upper);
      }
    } else {
      updated = [...current, upper];
    }

    const isFilteringActive =
      updated.length < ALL_VEHICLE_CLASSES.length ||
      get().minSpeedKmh !== null ||
      get().maxSpeedKmh !== null;

    set({ selectedClasses: updated, isFilteringActive });
  },

  setVehicleClasses: (classes: string[]) => {
    const updated = classes.map((c) => c.toUpperCase());
    const isFilteringActive =
      updated.length < ALL_VEHICLE_CLASSES.length ||
      get().minSpeedKmh !== null ||
      get().maxSpeedKmh !== null;

    set({ selectedClasses: updated, isFilteringActive });
  },

  setSpeedRange: (min: number | null, max: number | null) => {
    const isFilteringActive =
      get().selectedClasses.length < ALL_VEHICLE_CLASSES.length ||
      min !== null ||
      max !== null;

    set({ minSpeedKmh: min, maxSpeedKmh: max, isFilteringActive });
  },

  setSelectedTrackId: (trackId: number | null) => {
    set({ selectedTrackId: trackId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setShowTrajectories: (show: boolean) => set({ showTrajectories: show }),
  setShowVehicleIds: (show: boolean) => set({ showVehicleIds: show }),
  setShowSpeedLabels: (show: boolean) => set({ showSpeedLabels: show }),
  setShowHeatmap: (show: boolean) => set({ showHeatmap: show }),

  triggerFocusVehicle: () => {
    set((state) => ({ focusTrigger: state.focusTrigger + 1 }));
  },

  resetFilters: () => {
    set({
      selectedClasses: [...ALL_VEHICLE_CLASSES],
      minSpeedKmh: null,
      maxSpeedKmh: null,
      selectedTrackId: null,
      searchQuery: '',
      isFilteringActive: false,
    });
  },

  setIsFilterPanelVisible: (isFilterPanelVisible: boolean) => set({ isFilterPanelVisible }),
  toggleFilterPanel: () => set((state) => ({ isFilterPanelVisible: !state.isFilterPanelVisible })),
}));
