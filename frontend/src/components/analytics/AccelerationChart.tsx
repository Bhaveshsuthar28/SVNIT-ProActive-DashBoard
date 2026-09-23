import React, { useMemo } from 'react';
import { EChartsWrapper } from '../common/EChartsWrapper';
import { LuActivity } from 'react-icons/lu';
import { SectionCard } from '../common/SectionCard';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useChartTheme } from '../../hooks/useChartTheme';

interface AccelerationChartProps {
  times?: number[];
  acceleration?: number[];
  braking?: number[];
}

const defaultTimes = [
  0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225,
  240, 255, 270, 285, 300,
];

export const AccelerationChart: React.FC<AccelerationChartProps> = ({
  times: propTimes,
  acceleration: propAcceleration,
  braking: propBraking,
}) => {
  const chartTheme = useChartTheme();
  const stats = useAnalyticsStore((s) => s.stats);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const seek = useTimelineStore((s) => s.seek);

  const times = useMemo(() => {
    if (propTimes) return propTimes;
    if (stats && stats.timeSeries.length > 0) {
      return stats.timeSeries.map((b) => b.timeSec);
    }
    return defaultTimes;
  }, [propTimes, stats]);

  const acceleration = useMemo(() => {
    if (propAcceleration) return propAcceleration;
    if (stats && stats.timeSeries.length > 0) {
      return stats.timeSeries.map((b) => b.accelerationMs2);
    }
    return new Array(times.length).fill(0);
  }, [propAcceleration, stats, times.length]);

  const braking = useMemo(() => {
    if (propBraking) return propBraking;
    if (stats && stats.timeSeries.length > 0) {
      return stats.timeSeries.map((b) => b.brakingMs2);
    }
    return new Array(times.length).fill(0);
  }, [propBraking, stats, times.length]);

  const liveAcceleration = useMemo(() => {
    return acceleration.map((acc, i) => {
      return times[i] <= currentTime ? acc : null;
    });
  }, [acceleration, times, currentTime]);

  const liveBraking = useMemo(() => {
    return braking.map((brk, i) => {
      return times[i] <= currentTime ? brk : null;
    });
  }, [braking, times, currentTime]);

  const closestTime = useMemo(() => {
    if (!times || times.length === 0) return 0;
    return times.reduce((prev, curr) =>
      Math.abs(curr - currentTime) < Math.abs(prev - currentTime) ? curr : prev,
      times[0]
    );
  }, [times, currentTime]);

  const yBound = useMemo(() => {
    let maxVal = 0;
    acceleration.forEach((v) => {
      if (v !== null && isFinite(v) && Math.abs(v) > maxVal) maxVal = Math.abs(v);
    });
    braking.forEach((v) => {
      if (v !== null && isFinite(v) && Math.abs(v) > maxVal) maxVal = Math.abs(v);
    });
    const bound = Math.max(6, Math.ceil((maxVal + 1.5) / 2) * 2);
    return Math.min(bound, 12);
  }, [acceleration, braking]);

  const yInterval = useMemo(() => {
    return yBound <= 6 ? 2 : yBound <= 10 ? 2 : 3;
  }, [yBound]);

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
        top: 25,
        right: 20,
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
          const validParams = params.filter((p: any) => p.data !== null && p.data !== undefined);
          if (validParams.length === 0) return '';
          let html = `<div style="font-size:10px; color:${chartTheme.tooltipSecondary}; margin-bottom:4px;">Time: ${params[0].name}s</div>`;
          validParams.forEach((item: any) => {
            html += `<div style="display:flex; justify-content:space-between; gap:12px; font-size:11px;">
              <span style="color:${item.color}; font-weight:600;">${item.seriesName}:</span>
              <span style="font-weight:700;">${item.value} m/s²</span>
            </div>`;
          });
          return html;
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
        min: -yBound,
        max: yBound,
        interval: yInterval,
        name: 'm/s²',
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
          name: 'Acceleration',
          type: 'line',
          smooth: 0.35,
          clip: false,
          showSymbol: false,
          data: liveAcceleration,
          lineStyle: {
            color: '#18B979',
            width: 2.4,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 185, 121, 0.22)' },
                { offset: 1, color: 'rgba(24, 185, 121, 0.01)' },
              ],
            },
          },
          markPoint: activeIndex >= 0 && liveAcceleration[activeIndex] !== null ? {
            symbol: 'circle',
            symbolSize: 8,
            silent: true,
            itemStyle: {
              color: '#18B979',
              borderWidth: 2,
              borderColor: chartTheme.isDark ? '#162032' : '#FFFFFF',
              shadowBlur: 6,
              shadowColor: 'rgba(24, 185, 121, 0.5)',
            },
            data: [
              {
                coord: [activeIndex, liveAcceleration[activeIndex]],
              },
            ],
          } : undefined,
          markLine: {
            symbol: ['none', 'none'],
            silent: true,
            animation: false,
            data: [
              {
                yAxis: 0,
                lineStyle: {
                  color: chartTheme.isDark ? '#334155' : '#CBD5E1',
                  type: 'solid',
                  width: 1.5,
                },
                label: { show: false },
              },
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
        {
          name: 'Braking',
          type: 'line',
          smooth: 0.35,
          clip: false,
          showSymbol: false,
          data: liveBraking,
          lineStyle: {
            color: '#FF4D5A',
            width: 2.4,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 77, 90, 0.01)' },
                { offset: 1, color: 'rgba(255, 77, 90, 0.22)' },
              ],
            },
          },
          markPoint: activeIndex >= 0 && liveBraking[activeIndex] !== null ? {
            symbol: 'circle',
            symbolSize: 8,
            silent: true,
            itemStyle: {
              color: '#FF4D5A',
              borderWidth: 2,
              borderColor: chartTheme.isDark ? '#162032' : '#FFFFFF',
              shadowBlur: 6,
              shadowColor: 'rgba(255, 77, 90, 0.5)',
            },
            data: [
              {
                coord: [activeIndex, liveBraking[activeIndex]],
              },
            ],
          } : undefined,
        },
      ],
    };
  }, [times, liveAcceleration, liveBraking, activeIndex, yBound, yInterval, chartTheme]);

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

  const mins = Math.floor(currentTime / 60);
  const secs = Math.floor(currentTime % 60).toString().padStart(2, '0');
  const activeIdx = times.indexOf(closestTime);
  const curAcc = activeIdx >= 0 && liveAcceleration[activeIdx] !== null ? Number(liveAcceleration[activeIdx]).toFixed(1) : '0.0';
  const curBrk = activeIdx >= 0 && liveBraking[activeIdx] !== null ? Number(liveBraking[activeIdx]).toFixed(1) : '0.0';

  const legendHeader = (
    <div className="flex items-center gap-3 mr-2 select-none">
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors duration-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1677FF] animate-pulse" />
        <span className="text-[#18B979]">+{curAcc}</span>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-[#FF4D5A]">{curBrk}</span>
        <span className="text-slate-400 dark:text-slate-400 font-normal">m/s²</span>
        <span className="text-slate-400 dark:text-slate-400 font-normal">0{mins}:{secs}</span>
      </div>
      <div className="flex items-center gap-3 text-[11.5px] font-bold">
        <div className="flex items-center gap-1.5 text-[#18B979]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#18B979] shadow-xs" />
          <span>Acceleration</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#FF4D5A]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5A] shadow-xs" />
          <span>Braking</span>
        </div>
      </div>
    </div>
  );

  return (
    <SectionCard
      title="Acceleration / Braking Activity"
      icon={<LuActivity className="w-3.5 h-3.5" />}
      headerRight={legendHeader}
      className="h-[250px]"
    >
      <div className="w-full h-[200px]">
        <EChartsWrapper option={chartOption} onChartClick={handleChartClick} />
      </div>
    </SectionCard>
  );
};

export default AccelerationChart;
