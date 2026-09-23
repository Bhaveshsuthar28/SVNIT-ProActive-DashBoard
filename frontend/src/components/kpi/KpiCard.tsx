import React from 'react';
import {
  LuCar,
  LuGauge,
  LuRocket,
  LuUsers,
  LuOctagonAlert,
  LuChartColumn,
  LuArrowUp,
  LuArrowDown,
} from 'react-icons/lu';
import { KpiSparkline } from './KpiSparkline';
import { useThemeStore } from '../../stores/themeStore';

export interface KpiCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isUp: boolean;
    isPositive: boolean;
  };
  valueColor?: string;
  iconName: 'car' | 'gauge' | 'rocket' | 'users' | 'octagon' | 'chart';
  accentColor: string;
  lightBg: string;
  sparklineColor: string;
  sparklineData: number[];
}

const renderIcon = (name: KpiCardProps['iconName']) => {
  const iconProps = { className: 'w-6 h-6 stroke-[2.5]' };
  switch (name) {
    case 'car':
      return <LuCar {...iconProps} />;
    case 'gauge':
      return <LuGauge {...iconProps} />;
    case 'rocket':
      return <LuRocket {...iconProps} />;
    case 'users':
      return <LuUsers {...iconProps} />;
    case 'octagon':
      return <LuOctagonAlert {...iconProps} />;
    case 'chart':
      return <LuChartColumn {...iconProps} />;
    default:
      return <LuCar {...iconProps} />;
  }
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  valueColor,
  iconName,
  accentColor,
  lightBg,
  sparklineColor,
  sparklineData,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered
          ? sparklineColor
          : isDark
          ? '#27354A'
          : '#E6EAF0',
        boxShadow: isHovered
          ? `0 3px 10px 0 ${sparklineColor}2e, 0 0 0 1px ${sparklineColor}66`
          : undefined,
      }}
      className="bg-white dark:bg-[#162032] rounded-xl border p-3 flex flex-col justify-between h-[112px] shadow-[0_1px_3px_0_rgba(16,33,63,0.04)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] transition-all duration-200 cursor-default select-none"
    >
      <div className="flex items-start gap-2.5">
        {/* Bold Icon Badge */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
          style={{
            backgroundColor: isDark ? `${accentColor}26` : lightBg,
            color: accentColor,
          }}
        >
          {renderIcon(iconName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#344054] dark:text-[#94A3B8] truncate leading-tight tracking-tight">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-[23px] font-black tracking-tight leading-none text-[#10213F] dark:text-[#F1F5F9]"
              style={valueColor ? { color: valueColor } : undefined}
            >
              {value}
            </span>

            {/* Trend Indicator */}
            {trend && (
              <span
                className={`inline-flex items-center text-[11px] font-bold ${
                  trend.isPositive ? 'text-[#18B979]' : 'text-[#FF4D5A]'
                }`}
              >
                {trend.isUp ? (
                  <LuArrowUp className="w-3 h-3 mr-0.5 stroke-[3]" />
                ) : (
                  <LuArrowDown className="w-3 h-3 mr-0.5 stroke-[3]" />
                )}
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="w-full mt-auto pt-1">
        <KpiSparkline data={sparklineData} color={sparklineColor} height={20} />
      </div>
    </div>
  );
};

export default KpiCard;
