import React, { useMemo } from 'react';
import { EChartsWrapper } from '../common/EChartsWrapper';
import { LuChartColumn } from 'react-icons/lu';
import { SectionCard } from '../common/SectionCard';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useChartTheme } from '../../hooks/useChartTheme';

interface VehicleCountChartProps {
  times?: number[];
  counts?: number[];
  currentTime?: number;
  currentCount?: number;
}

export const VehicleCountChart: React.FC<VehicleCountChartProps> = ({
  times: propTimes,
  counts: propCounts,
  currentTime: propCurrentTime,
  currentCount: propCurrentCount,
}) => {
  const chartTheme = useChartTheme();
  const stats = useAnalyticsStore((s) => s.stats);
  const currentKPIs = useAnalyticsStore((s) => s.currentKPIs);
  const storeCurrentTime = useTimelineStore((s) => s.currentTime);

  const times = useMemo(() => {
    if (propTimes) return propTimes;
    if (stats && stats.timeSeries.length > 0) {
      return stats.timeSeries.map((b) => b.timeSec);
    }
    return [0, 60, 120, 180, 240, 300];
  }, [propTimes, stats]);

  const counts = useMemo(() => {
    if (propCounts) return propCounts;
    if (stats && stats.timeSeries.length > 0) {
      return stats.timeSeries.map((b) => b.vehicleCount);
    }
    return [0, 0, 0, 0, 0, 0];
  }, [propCounts, stats]);

  const activeTime = propCurrentTime !== undefined ? propCurrentTime : storeCurrentTime;
  const activeCount = propCurrentCount !== undefined ? propCurrentCount : currentKPIs.currentVehicles;

  const closestTime = useMemo(() => {
    if (!times || times.length === 0) return 0;
    return times.reduce((prev, curr) =>
      Math.abs(curr - activeTime) < Math.abs(prev - activeTime) ? curr : prev,
      times[0]
    );
  }, [times, activeTime]);

  const activeIndex = useMemo(() => {
    if (!times || times.length === 0) return 0;
    const idx = times.indexOf(closestTime);
    return idx >= 0 ? idx : 0;
  }, [times, closestTime]);

  const liveCounts = useMemo(() => {
    return counts.map((count, i) => {
      const t = times[i];
      if (t < closestTime) {
        return {
          value: count,
          itemStyle: {
            color: '#18B979',
            opacity: 0.85,
            borderRadius: [2, 2, 0, 0],
          },
        };
      }
      if (i === activeIndex) {
        return {
          value: activeCount !== undefined ? activeCount : count,
          itemStyle: {
            color: '#10B981',
            opacity: 1,
            borderRadius: [3, 3, 0, 0],
            shadowBlur: 6,
            shadowColor: 'rgba(16, 185, 129, 0.6)',
          },
        };
      }
      return null;
    });
  }, [counts, times, closestTime, activeIndex, activeCount]);

  const yMax = useMemo(() => {
    const maxVal = Math.max(...counts, 0);
    return Math.max(30, Math.ceil((maxVal + 2) / 10) * 10);
  }, [counts]);

  const chartOption = useMemo(() => {
    return {
      animationDurationUpdate: 200,
      animationEasingUpdate: 'cubicOut',
      grid: {
        top: 20,
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
          if (!item || item.data === null || item.data === undefined) return '';
          const val = typeof item.data === 'object' && item.data !== null ? item.data.value : item.data;
          const totalSec = Number(item.axisValue ?? item.name);
          const m = Math.floor(totalSec / 60);
          const s = (totalSec % 60).toString().padStart(2, '0');
          return `<div style="text-align:center; font-weight:700;">${val} vehicles</div><div style="font-size:10px; color:${chartTheme.tooltipSecondary}; text-align:center;">0${m}:${s}</div>`;
        },
      },
      xAxis: {
        type: 'category',
        data: times,
        name: 'Time (s)',
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
          interval: (index: number) => times[index] % 60 === 0,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yMax,
        interval: 10,
        name: 'Vehicle Count',
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
          barWidth: '55%',
          data: liveCounts,
          markLine: {
            symbol: ['none', 'none'],
            silent: true,
            animation: false,
            data: [
              {
                xAxis: activeIndex,
                lineStyle: {
                  color: '#10B981',
                  type: 'dashed',
                  width: 1.5,
                },
                label: {
                  show: false,
                },
              },
            ],
          },
        },
      ],
    };
  }, [times, liveCounts, activeIndex, chartTheme, yMax]);

  const seek = useTimelineStore((s) => s.seek);

  const handleChartClick = (params: any) => {
    let clickedSec: number | null = null;
    if (params.name !== undefined && !isNaN(Number(params.name))) {
      clickedSec = Number(params.name);
    } else if (params.dataIndex !== undefined && times[params.dataIndex] !== undefined) {
      clickedSec = times[params.dataIndex];
    }
    if (clickedSec !== null && isFinite(clickedSec)) {
      seek(clickedSec);
    }
  };

  const mins = Math.floor(activeTime / 60);
  const secs = Math.floor(activeTime % 60).toString().padStart(2, '0');
  const liveBadge = (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold select-none transition-colors duration-200">
      <span className="w-1.5 h-1.5 rounded-full bg-[#18B979] animate-pulse" />
      <span>{activeCount} active</span>
      <span className="text-slate-400 dark:text-slate-400 font-normal">0{mins}:{secs}</span>
    </div>
  );

  return (
    <SectionCard
      title="Vehicle Count Over Time"
      icon={<LuChartColumn className="w-3.5 h-3.5" />}
      headerRight={liveBadge}
      className="h-[210px]"
    >
      <div className="w-full h-[165px]">
        <EChartsWrapper option={chartOption} onChartClick={handleChartClick} />
      </div>
    </SectionCard>
  );
};

export default VehicleCountChart;
