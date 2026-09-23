import { create } from 'zustand';

export interface VideoEnhancementState {
  brightness: number;   // -50 to 50 (default 0)
  contrast: number;     // -50 to 50 (default 0)
  saturation: number;   // -50 to 50 (default 0)
  sharpness: number;    // 0 to 50 (default 0)
  exposure: number;     // -50 to 50 (default 0)
  grayscale: boolean;   // default false
  denoise: boolean;     // default false
  highContrast: boolean;// default false
  isPanelVisible: boolean; // default false

  setBrightness: (val: number) => void;
  setContrast: (val: number) => void;
  setSaturation: (val: number) => void;
  setSharpness: (val: number) => void;
  setExposure: (val: number) => void;
  setGrayscale: (val: boolean) => void;
  setDenoise: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setIsPanelVisible: (val: boolean) => void;
  togglePanelVisible: () => void;
  reset: () => void;
}

const defaultValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  exposure: 0,
  grayscale: false,
  denoise: false,
  highContrast: false,
  isPanelVisible: false,
};

export const useEnhancementStore = create<VideoEnhancementState>((set) => ({
  ...defaultValues,

  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  setSaturation: (saturation) => set({ saturation }),
  setSharpness: (sharpness) => set({ sharpness }),
  setExposure: (exposure) => set({ exposure }),
  setGrayscale: (grayscale) => set({ grayscale }),
  setDenoise: (denoise) => set({ denoise }),
  setHighContrast: (highContrast) => set({ highContrast }),
  setIsPanelVisible: (isPanelVisible) => set({ isPanelVisible }),
  togglePanelVisible: () => set((state) => ({ isPanelVisible: !state.isPanelVisible })),

  reset: () => set((state) => ({ ...defaultValues, isPanelVisible: state.isPanelVisible })),
}));

/**
 * Computes the CSS filter string from the current enhancement settings.
 */
export function getCssFilterString(state: {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  grayscale: boolean;
  highContrast: boolean;
}): string {
  // Exposure maps to additional brightness
  const effectiveBrightness = 100 + state.brightness + state.exposure;
  const effectiveContrast = state.highContrast ? 160 : 100 + state.contrast;
  const effectiveSaturation = 100 + state.saturation;
  const effectiveGrayscale = state.grayscale ? 100 : 0;

  return `brightness(${effectiveBrightness}%) contrast(${effectiveContrast}%) saturate(${effectiveSaturation}%) grayscale(${effectiveGrayscale}%)`;
}
