import React, { useMemo } from 'react';
import { EChartsWrapper } from '../common/EChartsWrapper';
import { LuChartColumnIncreasing } from 'react-icons/lu';
import { SectionCard } from '../common/SectionCard';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useChartTheme } from '../../hooks/useChartTheme';

interface SpeedDistributionChartProps {
  bins?: string[];
  frequencies?: number[];
}

const defaultBins = [
  '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
  '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
  '80-85', '85-90', '90-95', '95-100',
];

export const SpeedDistributionChart: React.FC<SpeedDistributionChartProps> = ({
  bins: propBins,
  frequencies: propFrequencies,
}) => {
  const chartTheme = useChartTheme();
  const stats = useAnalyticsStore((s) => s.stats);
  const realtimeSpeedDist = useAnalyticsStore((s) => s.realtimeSpeedDistribution);

  const bins = useMemo(() => {
    if (propBins) return propBins;
    if (stats) return stats.speedDistribution.bins;
    return defaultBins;
  }, [propBins, stats]);

  const frequencies = useMemo(() => {
    if (propFrequencies) return propFrequencies;
    if (realtimeSpeedDist) {
      return realtimeSpeedDist.frequencies;
    }
    if (stats) return stats.speedDistribution.frequencies;
    return new Array(20).fill(0);
  }, [propFrequencies, realtimeSpeedDist, stats]);

  const yMax = useMemo(() => {
    const maxVal = Math.max(...frequencies, 0);
    if (maxVal <= 0) return 20;
    return Math.max(20, Math.ceil((maxVal * 1.15) / 10) * 10);
  }, [frequencies]);

  const totalSampled = useMemo(() => frequencies.reduce((a, b) => a + b, 0), [frequencies]);

  const chartOption = useMemo(() => {
    return {
      animationDurationUpdate: 200,
      animationEasingUpdate: 'cubicOut',
      grid: {
        top: 25,
        right: 15,
        bottom: 44,
        left: 58,
      },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: chartTheme.isDark ? 1 : 0,
        borderRadius: 6,
        padding: [6, 10],
        textStyle: { color: chartTheme.tooltipText, fontSize: 11, fontFamily: 'Inter' },
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          if (!item) return '';
          return `<div style="font-weight:700;">${item.name} km/h</div><div style="font-size:10px; color:${chartTheme.tooltipSecondary};">${item.data} vehicles</div>`;
        },
      },
      xAxis: {
        type: 'category',
        data: bins,
        name: 'Speed (km/h)',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          color: chartTheme.nameColor,
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'Inter',
        },
        axisLine: { lineStyle: { color: chartTheme.axisLineColor } },
        axisTick: { show: false },
        axisLabel: {
          color: chartTheme.textColor,
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'Inter',
          interval: (index: number) => index % 4 === 0,
          formatter: (_: string, index: number) => {
            return (index * 5).toString();
          },
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        splitNumber: 4,
        name: 'Vehicles',
        nameLocation: 'middle',
        nameGap: 42,
        nameTextStyle: {
          color: chartTheme.nameColor,
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'Inter',
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: chartTheme.textColor,
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'Inter',
        },
        splitLine: {
          lineStyle: {
            color: chartTheme.splitLineColor,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Vehicles',
          type: 'bar',
          barWidth: '82%',
          data: frequencies,
          itemStyle: {
            color: '#4096FF',
            borderRadius: [2, 2, 0, 0],
          },
        },
      ],
    };
  }, [bins, frequencies, yMax, chartTheme]);

  const liveBadge = (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold select-none transition-colors duration-200">
      <span className="w-1.5 h-1.5 rounded-full bg-[#4096FF] animate-pulse" />
      <span>{totalSampled} active</span>
    </div>
  );

  return (
    <SectionCard
      title="Speed Distribution"
      icon={<LuChartColumnIncreasing className="w-3.5 h-3.5" />}
      headerRight={liveBadge}
      className="h-[210px]"
    >
      <div className="w-full h-[165px]">
        <EChartsWrapper option={chartOption} />
      </div>
    </SectionCard>
  );
};

export default SpeedDistributionChart;
