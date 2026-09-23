import React, { useMemo } from 'react';
import { KpiCard, KpiCardProps } from './KpiCard';
import { useAnalyticsStore } from '../../stores/analyticsStore';

interface KpiGridProps {
  items?: KpiCardProps[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ items: propItems }) => {
  const currentKPIs = useAnalyticsStore((s) => s.currentKPIs);
  const sparklineData = useAnalyticsStore((s) => s.sparklineData);
  const stats = useAnalyticsStore((s) => s.stats);
  const isReady = useAnalyticsStore((s) => s.isReady);

  const formatStatus = (status: string) => {
    if (!status) return 'Low';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOW':
        return '#18B979';
      case 'MODERATE':
        return '#F79009';
      case 'HIGH':
        return '#FF4D5A';
      case 'SEVERE':
        return '#B42318';
      default:
        return '#18B979';
    }
  };

  const dynamicCards: KpiCardProps[] = useMemo(() => {
    const totalVehiclesCount = stats ? stats.totalUniqueVehicles : 608;
    const isFiltered = currentKPIs.isFiltered;
    const maxScope = isFiltered ? (currentKPIs.filteredTotalVehicles ?? totalVehiclesCount) : totalVehiclesCount;
    const liveCumulative = currentKPIs.cumulativeVehicles ?? (isReady ? 6 : 0);
    const hasActiveVehicles = currentKPIs.currentVehicles > 0;
    const completionPercent = maxScope > 0 ? Math.round((liveCumulative / maxScope) * 100) : 0;

    return [
      {
        title: isFiltered ? 'Filtered Vehicles' : 'Total Vehicles',
        value: isReady ? `${liveCumulative}` : '608',
        trend: {
          value: isReady ? `${completionPercent}%` : '12%',
          isUp: true,
          isPositive: true,
        },
        iconName: 'car',
        accentColor: '#1677FF',
        lightBg: '#EAF3FF',
        sparklineColor: '#1677FF',
        sparklineData: sparklineData.countSparkline,
      },
      {
        title: 'Average Speed',
        value: hasActiveVehicles ? `${currentKPIs.averageSpeedKmh} km/h` : '—',
        trend: {
          value: `${Math.abs(currentKPIs.speedTrendPercent)}%`,
          isUp: currentKPIs.speedTrendPercent >= 0,
          isPositive: currentKPIs.speedTrendPercent >= 0,
        },
        iconName: 'gauge',
        accentColor: '#18B979',
        lightBg: '#EAFBF4',
        sparklineColor: '#18B979',
        sparklineData: sparklineData.speedSparkline,
      },
      {
        title: 'Maximum Speed',
        value: hasActiveVehicles ? `${currentKPIs.maximumSpeedKmh} km/h` : '—',
        trend: {
          value: `${Math.abs(currentKPIs.maxSpeedTrendPercent)}%`,
          isUp: currentKPIs.maxSpeedTrendPercent >= 0,
          isPositive: true,
        },
        iconName: 'rocket',
        accentColor: '#FF4D5A',
        lightBg: '#FFF0F1',
        sparklineColor: '#FF4D5A',
        sparklineData: sparklineData.maxSpeedSparkline,
      },
      {
        title: 'Current Vehicles',
        value: `${currentKPIs.currentVehicles}`,
        trend: {
          value: `${Math.abs(currentKPIs.countTrendPercent)}%`,
          isUp: currentKPIs.countTrendPercent >= 0,
          isPositive: true,
        },
        iconName: 'users',
        accentColor: '#7A5AF8',
        lightBg: '#F3F0FF',
        sparklineColor: '#7A5AF8',
        sparklineData: sparklineData.currentSparkline,
      },
      {
        title: 'Stopped Vehicles',
        value: `${currentKPIs.stoppedVehicles}`,
        trend: {
          value: `${Math.abs(currentKPIs.stoppedTrendPercent)}%`,
          isUp: currentKPIs.stoppedTrendPercent > 0,
          isPositive: currentKPIs.stoppedTrendPercent <= 0,
        },
        iconName: 'octagon',
        accentColor: '#F79009',
        lightBg: '#FFF6E8',
        sparklineColor: '#F79009',
        sparklineData: sparklineData.stoppedSparkline,
      },
      {
        title: 'Traffic Status',
        value: formatStatus(currentKPIs.trafficStatus),
        valueColor: getStatusColor(currentKPIs.trafficStatus),
        trend: {
          value: `${currentKPIs.currentVehicles} act`,
          isUp: currentKPIs.countTrendPercent >= 0,
          isPositive:
            currentKPIs.trafficStatus === 'LOW' ||
            currentKPIs.trafficStatus === 'MODERATE',
        },
        iconName: 'chart',
        accentColor: '#13B8C8',
        lightBg: '#ECFBFD',
        sparklineColor: '#13B8C8',
        sparklineData: sparklineData.trafficSparkline,
      },
    ];
  }, [currentKPIs, sparklineData, stats, isReady]);

  const cardsToRender = propItems || dynamicCards;

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cardsToRender.map((item, index) => (
        <KpiCard key={index} {...item} />
      ))}
    </section>
  );
};

export default KpiGrid;
