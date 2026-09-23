import React, { useId } from 'react';

interface KpiSparklineProps {
  data: number[];
  color: string;
  height?: number;
  width?: number | string;
  showFill?: boolean;
}

export const KpiSparkline: React.FC<KpiSparklineProps> = ({
  data,
  color,
  height = 24,
  width = '100%',
  showFill = true,
}) => {
  const gradientId = useId();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const svgWidth = 100;
  const svgHeight = 28;
  const paddingY = 4;
  const availableHeight = svgHeight - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * svgWidth;
    // Invert y because SVG y=0 is top
    const y = svgHeight - paddingY - ((val - min) / range) * availableHeight;
    return { x, y };
  });

  // Generate smooth cubic Bézier curve path
  let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX.toFixed(1)} ${current.y.toFixed(1)}, ${controlX.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  const fillD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="w-full flex items-center overflow-hidden" style={{ height }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        style={{ width }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {showFill && <path d={fillD} fill={`url(#${gradientId})`} />}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default KpiSparkline;
