import { useThemeStore } from '../stores/themeStore';

export interface ChartThemeTokens {
  isDark: boolean;
  textColor: string;
  nameColor: string;
  axisLineColor: string;
  splitLineColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipSecondary: string;
  markLineColor: string;
}

export function useChartTheme(): ChartThemeTokens {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  if (isDark) {
    return {
      isDark: true,
      textColor: '#94A3B8', // Muted slate gray for axis labels
      nameColor: '#E2E8F0', // Soft off-white for axis titles
      axisLineColor: '#27354A', // Subtle border for dark slate cards
      splitLineColor: '#1E293B', // Calm dark charcoal dashed grid lines
      tooltipBg: '#162032', // Dark slate tooltip matching card background
      tooltipBorder: '#27354A',
      tooltipText: '#F1F5F9',
      tooltipSecondary: '#94A3B8',
      markLineColor: '#38BDF8',
    };
  }

  return {
    isDark: false,
    textColor: '#475467',
    nameColor: '#344054',
    axisLineColor: '#E6EAF0',
    splitLineColor: '#F1F5F9',
    tooltipBg: '#10213F',
    tooltipBorder: 'transparent',
    tooltipText: '#FFFFFF',
    tooltipSecondary: '#98A2B3',
    markLineColor: '#1677FF',
  };
}
