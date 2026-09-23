import React, { useMemo } from 'react';
import { EChartsWrapper } from '../common/EChartsWrapper';
import { LuChartPie } from 'react-icons/lu';
import { SectionCard } from '../common/SectionCard';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { useChartTheme } from '../../hooks/useChartTheme';

export interface VehicleTypeItem {
  name: string;
  value: number;
  percentage: string;
  color: string;
}

interface VehicleTypeChartProps {
  distribution?: VehicleTypeItem[];
  total?: number;
}

const defaultDistribution: VehicleTypeItem[] = [
  { name: 'Car', value: 325, percentage: '45%', color: '#1677FF' },
  { name: 'Bus', value: 15, percentage: '2%', color: '#18B979' },
  { name: 'Three Wheeler', value: 80, percentage: '11%', color: '#F79009' },
  { name: 'Two Wheeler', value: 200, percentage: '28%', color: '#7A5AF8' },
  { name: 'HCV', value: 25, percentage: '3%', color: '#FF4D5A' },
  { name: 'LCV', value: 45, percentage: '6%', color: '#06AED4' },
  { name: 'Pedestrian', value: 35, percentage: '5%', color: '#EC4899' },
];

export const VehicleTypeChart: React.FC<VehicleTypeChartProps> = ({
  distribution: propDistribution,
  total: propTotal,
}) => {
  const chartTheme = useChartTheme();
  const stats = useAnalyticsStore((s) => s.stats);
  const realtimeDistribution = useAnalyticsStore((s) => s.realtimeDistribution);
  const currentKPIs = useAnalyticsStore((s) => s.currentKPIs);

  const distribution = useMemo(() => {
    if (propDistribution) return propDistribution;
    if (realtimeDistribution && realtimeDistribution.distribution.length > 0) {
      return realtimeDistribution.distribution.map((item) => ({
        name: item.name,
        value: item.count,
        percentage: item.percentage,
        color: item.color,
      }));
    }
    if (stats && stats.classDistribution.length > 0) {
      return stats.classDistribution.map((item) => ({
        name: item.name,
        value: item.count,
        percentage: item.percentage,
        color: item.color,
      }));
    }
    return defaultDistribution;
  }, [propDistribution, realtimeDistribution, stats]);

  const total = useMemo(() => {
    if (propTotal !== undefined) return propTotal;
    if (currentKPIs && currentKPIs.cumulativeVehicles !== undefined && currentKPIs.cumulativeVehicles > 0) {
      return currentKPIs.cumulativeVehicles;
    }
    if (realtimeDistribution && realtimeDistribution.total > 0) return realtimeDistribution.total;
    if (stats) return stats.totalUniqueVehicles;
    return 608;
  }, [propTotal, currentKPIs, realtimeDistribution, stats]);

  const chartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: chartTheme.isDark ? 1 : 0,
        borderRadius: 8,
        padding: [8, 12],
        textStyle: { color: chartTheme.tooltipText, fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter' },
        formatter: '{b}: <span style="font-weight:700;">{c}</span> ({d}%)',
      },
      series: [
        {
          name: 'Vehicle Type',
          type: 'pie',
          radius: ['58%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          emphasis: {
            scale: true,
            scaleSize: 4,
          },
          data: distribution.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color },
          })),
        },
      ],
    };
  }, [distribution, chartTheme]);

  return (
    <SectionCard
      title="Vehicle Type Distribution"
      icon={<LuChartPie className="w-3.5 h-3.5" />}
      className="h-[210px]"
    >
      <div className="flex items-center h-[165px] px-3">
        {/* Donut Chart with Center Label */}
        <div className="relative w-[130px] h-[130px] shrink-0">
          <EChartsWrapper option={chartOption} />
          {/* Centered Total Vehicles Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-[19px] font-black text-[#10213F] dark:text-[#F1F5F9] leading-tight">
              {total}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8] leading-tight">
              Vehicles
            </span>
          </div>
        </div>

        {/* Legend List on Right */}
        <div className="flex-1 ml-3 space-y-1.5">
          {distribution.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-[11.5px] leading-tight select-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-[#344054] dark:text-[#E2E8F0] truncate">{item.name}</span>
              </div>
              <span className="font-bold text-[#10213F] dark:text-[#F1F5F9] tabular-nums ml-2">
                {item.value} <span className="text-[#667085] dark:text-[#94A3B8] text-[11px] font-semibold">({item.percentage})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
};

export default VehicleTypeChart;
