import React, { useMemo } from 'react';
import { EChartsWrapper } from '../common/EChartsWrapper';
import { LuGauge } from 'react-icons/lu';
import { SectionCard } from '../common/SectionCard';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useChartTheme } from '../../hooks/useChartTheme';

interface AverageSpeedChartProps {
  times?: number[];
  speeds?: number[];
  currentTime?: number;
  currentSpeed?: number;
}

export const AverageSpeedChart: React.FC<AverageSpeedChartProps> = ({
  times: propTimes,
  speeds: propSpeeds,
  currentTime: propCurrentTime,
  currentSpeed: propCurrentSpeed,
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

  const speeds = useMemo(() => {
    if (propSpeeds) return propSpeeds;
    if (stats && stats.timeSeries.length > 0) {
      return stats.timeSeries.map((b) => b.averageSpeedKmh);
    }
    return [0, 0, 0, 0, 0, 0];
  }, [propSpeeds, stats]);

  const activeTime = propCurrentTime !== undefined ? propCurrentTime : storeCurrentTime;
  const activeSpeed = propCurrentSpeed !== undefined ? propCurrentSpeed : currentKPIs.averageSpeedKmh;

  const closestTime = useMemo(() => {
    if (!times || times.length === 0) return 0;
    return times.reduce((prev, curr) =>
      Math.abs(curr - activeTime) < Math.abs(prev - activeTime) ? curr : prev,
      times[0]
    );
  }, [times, activeTime]);

  const liveSpeeds = useMemo(() => {
    return speeds.map((speed, i) => {
      const t = times[i];
      if (t <= activeTime) {
        return speed;
      }
      return null;
    });
  }, [speeds, times, activeTime]);

  const activeIndex = useMemo(() => {
    if (!times || times.length === 0) return 0;
    const idx = times.indexOf(closestTime);
    return idx >= 0 ? idx : 0;
  }, [times, closestTime]);

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
          const totalSec = Number(item.axisValue ?? item.name);
          const m = Math.floor(totalSec / 60);
          const s = (totalSec % 60).toString().padStart(2, '0');
          return `<div style="text-align:center; font-weight:700;">${item.data} km/h</div><div style="font-size:10px; color:${chartTheme.tooltipSecondary}; text-align:center;">0${m}:${s}</div>`;
        },
      },
      xAxis: {
        type: 'category',
        data: times,
        boundaryGap: false,
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
        max: 80,
        interval: 20,
        name: 'Speed (km/h)',
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
          name: 'Speed',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: liveSpeeds,
          lineStyle: {
            color: '#1677FF',
            width: 2.2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22, 119, 255, 0.22)' },
                { offset: 1, color: 'rgba(22, 119, 255, 0.01)' },
              ],
            },
          },
          markPoint: activeIndex >= 0 ? {
            symbol: 'circle',
            symbolSize: 8,
            silent: true,
            itemStyle: {
              color: '#1677FF',
              borderWidth: 2,
              borderColor: chartTheme.isDark ? '#162032' : '#FFFFFF',
              shadowBlur: 6,
              shadowColor: 'rgba(22, 119, 255, 0.5)',
            },
            data: [
              {
                coord: [activeIndex, activeSpeed],
              },
            ],
          } : undefined,
          markLine: {
            symbol: ['none', 'none'],
            silent: true,
            animation: false,
            data: [
              {
                xAxis: activeIndex >= 0 ? activeIndex : 0,
                lineStyle: {
                  color: chartTheme.markLineColor,
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
  }, [times, liveSpeeds, activeIndex, activeSpeed, activeTime, chartTheme]);

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
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold select-none transition-colors duration-200">
      <span className="w-1.5 h-1.5 rounded-full bg-[#1677FF] animate-pulse" />
      <span>{activeSpeed} km/h</span>
      <span className="text-slate-400 dark:text-slate-400 font-normal">0{mins}:{secs}</span>
    </div>
  );

  return (
    <SectionCard
      title="Average Speed Over Time"
      icon={<LuGauge className="w-3.5 h-3.5" />}
      headerRight={liveBadge}
      className="h-[210px]"
    >
      <div className="w-full h-[165px]">
        <EChartsWrapper option={chartOption} onChartClick={handleChartClick} />
      </div>
    </SectionCard>
  );
};

export default AverageSpeedChart;
