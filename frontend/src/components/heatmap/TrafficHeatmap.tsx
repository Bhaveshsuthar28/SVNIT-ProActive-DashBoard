import React, { useState, useEffect } from 'react';
import { LuImageOff } from 'react-icons/lu';

export interface TrafficHeatmapProps {
  imageSrc?: string;
  alt?: string;
  className?: string;
}

/**
 * TrafficHeatmap component:
 * Displays a static accident heatmap image as a spatial visual reference.
 * Fully responsive, maintains aspect ratio without distortion.
 * Provides explicit loading, loaded, and unconfigured placeholder states.
 */
export const TrafficHeatmap: React.FC<TrafficHeatmapProps> = ({
  imageSrc = '/Conflict_Heatmaps.jpg.jpeg',
  alt = 'Accident Heatmap',
  className = '',
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!imageSrc || imageSrc.trim() === '') {
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      setLoadState('loaded');
    };

    img.onerror = () => {
      setLoadState('error');
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  return (
    <div
      className={`bg-white dark:bg-[#162032] shadow-[0_1px_3px_0_rgba(16,33,63,0.04)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col rounded-xl border border-[#E6EAF0] dark:border-[#27354A] h-[400px] select-none transition-colors duration-200 ${className}`}
    >
      {/* Heatmap Image Viewport */}
      <div className="relative flex-1 bg-[#0B132B] flex items-center justify-center overflow-hidden p-2">
        {/* 1. Loading State */}
        {loadState === 'loading' && (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2.5">
            <div className="w-7 h-7 border-2 border-slate-600 border-t-[#1677FF] rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Loading heatmap...
            </span>
          </div>
        )}

        {/* 2. Unconfigured / Error State */}
        {loadState === 'error' && (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400">
              <LuImageOff className="w-6 h-6 stroke-[1.75]" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1">Accident Heatmap</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Heatmap image not configured
            </p>
          </div>
        )}

        {/* 3. Loaded Heatmap Image */}
        {loadState === 'loaded' && (
          <img
            src={imageSrc}
            alt={alt}
            className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none select-none"
          />
        )}
      </div>

      {/* Bottom Label */}
      <div className="px-4 py-2 border-t border-[#E6EAF0] dark:border-[#27354A] bg-white dark:bg-[#162032] flex items-center justify-center shrink-0 transition-colors duration-200">
        <h3 className="text-[13px] font-bold tracking-wider text-[#10213F] dark:text-[#F1F5F9] uppercase">
          Accident Heatmap
        </h3>
      </div>
    </div>
  );
};

export default TrafficHeatmap;
