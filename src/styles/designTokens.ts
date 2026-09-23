/**
 * ASTRA Centralized Design System Tokens
 * Source of Truth: Phase 2 Reference UI Specification & Visual Reference Image
 */

export const colors = {
  // Layout Backgrounds
  pageBackground: "#F7F9FC",
  cardBackground: "#FFFFFF",
  cardBorder: "#E6EAF0",
  divider: "#F1F5F9",

  // Typography
  textPrimary: "#10213F",     // Dark Navy
  textSecondary: "#667085",   // Medium Slate
  textMuted: "#98A2B3",       // Light Muted Slate
  textWhite: "#FFFFFF",

  // Core Accent Palette & Light Variants
  blue: {
    main: "#1677FF",
    light: "#EAF3FF",
    border: "#BAE0FF",
    text: "#0958D9",
  },
  green: {
    main: "#18B979",
    light: "#EAFBF4",
    border: "#A3F0CD",
    text: "#0E8A57",
  },
  red: {
    main: "#FF4D5A",
    light: "#FFF0F1",
    border: "#FFCCD0",
    text: "#CF1322",
  },
  orange: {
    main: "#F79009",
    light: "#FFF6E8",
    border: "#FEDF89",
    text: "#B54708",
  },
  purple: {
    main: "#7A5AF8",
    light: "#F3F0FF",
    border: "#D8CEFD",
    text: "#5925DC",
  },
  cyan: {
    main: "#13B8C8",
    light: "#ECFBFD",
    border: "#A1EEF6",
    text: "#0E8794",
  },

  // Semantic vehicle class mapping
  vehicles: {
    CAR: "#1677FF",
    TRUCK: "#FF4D5A",
    BUS: "#18B979",
    MOTORCYCLE: "#F79009",
    OTHER: "#7A5AF8",
  }
} as const;

export const shadows = {
  card: "0 1px 3px 0 rgba(16, 33, 63, 0.04), 0 1px 2px -1px rgba(16, 33, 63, 0.04)",
  panel: "0 4px 6px -1px rgba(16, 33, 63, 0.06), 0 2px 4px -2px rgba(16, 33, 63, 0.04)",
  overlay: "0 10px 15px -3px rgba(16, 33, 63, 0.08), 0 4px 6px -4px rgba(16, 33, 63, 0.04)",
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;
