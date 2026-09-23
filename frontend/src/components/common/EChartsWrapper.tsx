import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';

export interface EChartsWrapperProps {
  option: any;
  style?: React.CSSProperties;
  className?: string;
  onChartClick?: (params: any) => void;
  notMerge?: boolean;
}

export const EChartsWrapper: React.FC<EChartsWrapperProps> = ({
  option,
  style,
  className = '',
  onChartClick,
  notMerge = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const onChartClickRef = useRef(onChartClick);
  onChartClickRef.current = onChartClick;

  const isHoveringRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastDataIndexRef = useRef<{ seriesIndex: number; dataIndex: number } | null>(null);

  // Enhance tooltip options to ensure it stays visible and updates cleanly during real-time video playback
  const enhancedOption = useMemo(() => {
    if (!option) return option;
    if (!option.tooltip) return option;
    return {
      ...option,
      tooltip: {
        confine: true,
        transitionDuration: 0,
        ...option.tooltip,
      },
    };
  }, [option]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });

      chartInstanceRef.current.on('click', (params: any) => {
        onChartClickRef.current?.(params);
      });

      chartInstanceRef.current.on('showTip', (params: any) => {
        if (params && params.dataIndex !== undefined) {
          lastDataIndexRef.current = {
            seriesIndex: params.seriesIndex ?? 0,
            dataIndex: params.dataIndex,
          };
        }
      });
    }

    // Use notMerge: false so existing tooltip & canvas state is not destroyed on every video frame
    chartInstanceRef.current.setOption(enhancedOption, notMerge, false);

    // If the user's cursor is currently hovering over the chart while video runs,
    // re-assert the tooltip so it NEVER disappears or flickers!
    if (isHoveringRef.current) {
      if (lastPointRef.current) {
        chartInstanceRef.current.dispatchAction({
          type: 'showTip',
          x: lastPointRef.current.x,
          y: lastPointRef.current.y,
        });
      } else if (lastDataIndexRef.current) {
        chartInstanceRef.current.dispatchAction({
          type: 'showTip',
          seriesIndex: lastDataIndexRef.current.seriesIndex,
          dataIndex: lastDataIndexRef.current.dataIndex,
        });
      }
    }
  }, [enhancedOption, notMerge]);

  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      chartInstanceRef.current?.resize();
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    isHoveringRef.current = true;
    lastPointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    isHoveringRef.current = true;
    lastPointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    lastPointRef.current = null;
    lastDataIndexRef.current = null;
    chartInstanceRef.current?.dispatchAction({
      type: 'hideTip',
    });
  };

  return (
    <div
      ref={chartRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height: '100%', ...style }}
      className={className}
    />
  );
};

export default EChartsWrapper;
