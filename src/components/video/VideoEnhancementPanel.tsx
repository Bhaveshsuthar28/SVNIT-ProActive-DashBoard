import React from 'react';
import {
  LuSunMedium,
  LuCircleDot,
  LuDroplets,
  LuTriangle,
  LuAperture,
  LuSplit,
  LuSparkles,
  LuSunDim,
  LuX,
} from 'react-icons/lu';
import { useEnhancementStore } from '../../stores/enhancementStore';
import { useTimelineStore } from '../../stores/timelineStore';

export const VideoEnhancementPanel: React.FC = () => {
  const isPanelVisible = useEnhancementStore((s) => s.isPanelVisible);
  const setIsPanelVisible = useEnhancementStore((s) => s.setIsPanelVisible);
  const isFullscreen = useTimelineStore((s) => s.isFullscreen);

  const brightness = useEnhancementStore((s) => s.brightness);
  const contrast = useEnhancementStore((s) => s.contrast);
  const saturation = useEnhancementStore((s) => s.saturation);
  const sharpness = useEnhancementStore((s) => s.sharpness);
  const exposure = useEnhancementStore((s) => s.exposure);
  const grayscale = useEnhancementStore((s) => s.grayscale);
  const denoise = useEnhancementStore((s) => s.denoise);
  const highContrast = useEnhancementStore((s) => s.highContrast);

  const setBrightness = useEnhancementStore((s) => s.setBrightness);
  const setContrast = useEnhancementStore((s) => s.setContrast);
  const setSaturation = useEnhancementStore((s) => s.setSaturation);
  const setSharpness = useEnhancementStore((s) => s.setSharpness);
  const setExposure = useEnhancementStore((s) => s.setExposure);
  const setGrayscale = useEnhancementStore((s) => s.setGrayscale);
  const setDenoise = useEnhancementStore((s) => s.setDenoise);
  const setHighContrast = useEnhancementStore((s) => s.setHighContrast);
  const reset = useEnhancementStore((s) => s.reset);

  if (!isPanelVisible) return null;

  return (
    <div
      className={`absolute z-30 bg-white dark:bg-black rounded-none shadow-2xl border-2 border-black dark:border-white select-none animate-in fade-in zoom-in-95 duration-150 flex flex-col ${
        isFullscreen
          ? 'top-8 right-8 w-[320px] p-6 text-xs'
          : 'top-2 right-2 w-[265px] p-3 text-[11px] max-h-[calc(100%-16px)] overflow-y-auto'
      }`}
    >
      {/* Header with Proper Padding */}
      <div
        className={`flex items-center justify-between border-b border-black/15 dark:border-white/15 ${
          isFullscreen ? 'pb-3 mb-4' : 'pb-1.5 mb-2'
        }`}
      >
        <span
          className={`font-black uppercase tracking-wider text-black dark:text-white ${
            isFullscreen ? 'text-xs' : 'text-[11px]'
          }`}
        >
          Video Enhancement
        </span>
        <button
          type="button"
          onClick={() => setIsPanelVisible(false)}
          className={`flex items-center justify-center rounded-none border border-black/30 dark:border-white/30 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer ${
            isFullscreen ? 'w-6 h-6' : 'w-5 h-5'
          }`}
          title="Close enhancement panel"
        >
          <LuX className={isFullscreen ? 'w-3.5 h-3.5 stroke-[2.5]' : 'w-3 h-3 stroke-[2.5]'} />
        </button>
      </div>

      {/* Sliders */}
      <div className={isFullscreen ? 'space-y-3' : 'space-y-1.5'}>
        {/* Brightness */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-1.5 shrink-0 text-neutral-800 dark:text-neutral-200 ${
              isFullscreen ? 'w-[85px]' : 'w-[75px]'
            }`}
          >
            <LuSunMedium className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white shrink-0" />
            <span className="font-bold">Brightness</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="mono-rect-slider flex-1 cursor-pointer appearance-none"
          />
          <span className="w-6 text-right font-black text-black dark:text-white tabular-nums font-mono text-[11px]">
            {brightness}
          </span>
        </div>

        {/* Contrast */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-1.5 shrink-0 text-neutral-800 dark:text-neutral-200 ${
              isFullscreen ? 'w-[85px]' : 'w-[75px]'
            }`}
          >
            <LuCircleDot className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white shrink-0" />
            <span className="font-bold">Contrast</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="mono-rect-slider flex-1 cursor-pointer appearance-none"
          />
          <span className="w-6 text-right font-black text-black dark:text-white tabular-nums font-mono text-[11px]">
            {contrast}
          </span>
        </div>

        {/* Saturation */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-1.5 shrink-0 text-neutral-800 dark:text-neutral-200 ${
              isFullscreen ? 'w-[85px]' : 'w-[75px]'
            }`}
          >
            <LuDroplets className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white shrink-0" />
            <span className="font-bold">Saturation</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="mono-rect-slider flex-1 cursor-pointer appearance-none"
          />
          <span className="w-6 text-right font-black text-black dark:text-white tabular-nums font-mono text-[11px]">
            {saturation}
          </span>
        </div>

        {/* Sharpness */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-1.5 shrink-0 text-neutral-800 dark:text-neutral-200 ${
              isFullscreen ? 'w-[85px]' : 'w-[75px]'
            }`}
          >
            <LuTriangle className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white shrink-0" />
            <span className="font-bold">Sharpness</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={sharpness}
            onChange={(e) => setSharpness(Number(e.target.value))}
            className="mono-rect-slider flex-1 cursor-pointer appearance-none"
          />
          <span className="w-6 text-right font-black text-black dark:text-white tabular-nums font-mono text-[11px]">
            {sharpness}
          </span>
        </div>

        {/* Exposure */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex items-center gap-1.5 shrink-0 text-neutral-800 dark:text-neutral-200 ${
              isFullscreen ? 'w-[85px]' : 'w-[75px]'
            }`}
          >
            <LuAperture className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white shrink-0" />
            <span className="font-bold">Exposure</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={exposure}
            onChange={(e) => setExposure(Number(e.target.value))}
            className="mono-rect-slider flex-1 cursor-pointer appearance-none"
          />
          <span className="w-6 text-right font-black text-black dark:text-white tabular-nums font-mono text-[11px]">
            {exposure}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        className={`border-t border-black/15 dark:border-white/15 ${
          isFullscreen ? 'my-3.5' : 'my-2'
        }`}
      />

      {/* Modern Black & White Rectangular Toggle switches */}
      <div className={isFullscreen ? 'space-y-3' : 'space-y-1.5'}>
        {/* Grayscale */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <LuSplit className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white" />
            <span className="font-bold">Grayscale</span>
          </div>
          <button
            type="button"
            onClick={() => setGrayscale(!grayscale)}
            className={`flex items-center rounded-none border p-0.5 transition-all duration-150 cursor-pointer ${
              isFullscreen ? 'w-9 h-5' : 'w-8 h-4.5'
            } ${
              grayscale
                ? 'bg-black dark:bg-white border-black dark:border-white'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
            }`}
            title={grayscale ? 'Enabled' : 'Disabled'}
          >
            <div
              className={`rounded-none transition-transform duration-150 ease-in-out ${
                isFullscreen ? 'w-3.5 h-3.5' : 'w-3 h-3'
              } ${
                grayscale
                  ? `bg-white dark:bg-black ${isFullscreen ? 'translate-x-4' : 'translate-x-3.5'}`
                  : 'bg-neutral-400 dark:bg-neutral-600 translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Denoise */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <LuSparkles className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white" />
            <span className="font-bold">Denoise</span>
          </div>
          <button
            type="button"
            onClick={() => setDenoise(!denoise)}
            className={`flex items-center rounded-none border p-0.5 transition-all duration-150 cursor-pointer ${
              isFullscreen ? 'w-9 h-5' : 'w-8 h-4.5'
            } ${
              denoise
                ? 'bg-black dark:bg-white border-black dark:border-white'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
            }`}
            title={denoise ? 'Enabled' : 'Disabled'}
          >
            <div
              className={`rounded-none transition-transform duration-150 ease-in-out ${
                isFullscreen ? 'w-3.5 h-3.5' : 'w-3 h-3'
              } ${
                denoise
                  ? `bg-white dark:bg-black ${isFullscreen ? 'translate-x-4' : 'translate-x-3.5'}`
                  : 'bg-neutral-400 dark:bg-neutral-600 translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <LuSunDim className="w-3.5 h-3.5 stroke-[2.2] text-black dark:text-white" />
            <span className="font-bold">High Contrast</span>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center rounded-none border p-0.5 transition-all duration-150 cursor-pointer ${
              isFullscreen ? 'w-9 h-5' : 'w-8 h-4.5'
            } ${
              highContrast
                ? 'bg-black dark:bg-white border-black dark:border-white'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
            }`}
            title={highContrast ? 'Enabled' : 'Disabled'}
          >
            <div
              className={`rounded-none transition-transform duration-150 ease-in-out ${
                isFullscreen ? 'w-3.5 h-3.5' : 'w-3 h-3'
              } ${
                highContrast
                  ? `bg-white dark:bg-black ${isFullscreen ? 'translate-x-4' : 'translate-x-3.5'}`
                  : 'bg-neutral-400 dark:bg-neutral-600 translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div
        className={`border-t border-black/15 dark:border-white/15 flex justify-end ${
          isFullscreen ? 'mt-4 pt-3' : 'mt-2 pt-1.5'
        }`}
      >
        <button
          type="button"
          onClick={reset}
          className={`font-black uppercase tracking-wider rounded-none border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs ${
            isFullscreen ? 'px-4 py-2 text-xs' : 'px-3 py-1 text-[10px]'
          }`}
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default VideoEnhancementPanel;
