import React from 'react';
import { LuGauge, LuX } from 'react-icons/lu';
import { useTimelineStore } from '../../stores/timelineStore';

const speedPresets = [0.5, 1.0, 1.5, 2.0];

export const PlaybackSpeedPanel: React.FC = () => {
  const isSpeedPanelVisible = useTimelineStore((s) => s.isSpeedPanelVisible);
  const setIsSpeedPanelVisible = useTimelineStore((s) => s.setIsSpeedPanelVisible);
  const playbackRate = useTimelineStore((s) => s.playbackRate);
  const changePlaybackRate = useTimelineStore((s) => s.changePlaybackRate);
  const isFullscreen = useTimelineStore((s) => s.isFullscreen);

  if (!isSpeedPanelVisible) return null;

  const getSpeedLabel = (rate: number) => {
    if (rate === 1.0) return 'Normal';
    if (rate < 1.0) return 'Slow Motion';
    return 'Fast Motion';
  };

  return (
    <div
      className={`absolute z-30 bg-white dark:bg-black rounded-none shadow-2xl border-2 border-black dark:border-white select-none animate-in fade-in zoom-in-95 duration-150 ${
        isFullscreen
          ? 'bottom-8 right-8 w-[320px] p-6 text-xs'
          : 'bottom-3 right-3 w-[250px] p-3.5 text-xs'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b border-black/15 dark:border-white/15 ${
          isFullscreen ? 'pb-3 mb-4' : 'pb-2 mb-3'
        }`}
      >
        <div className="flex items-center gap-2">
          <LuGauge className="w-4.5 h-4.5 text-black dark:text-white stroke-[2.5]" />
          <span className="font-extrabold text-xs uppercase tracking-wider text-black dark:text-white">
            Playback Speed
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsSpeedPanelVisible(false)}
          className={`flex items-center justify-center rounded-none border border-black/30 dark:border-white/30 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer ${
            isFullscreen ? 'w-7 h-7' : 'w-6 h-6'
          }`}
          title="Close speed panel"
        >
          <LuX className={isFullscreen ? 'w-4 h-4 stroke-[2.5]' : 'w-3.5 h-3.5 stroke-[2.5]'} />
        </button>
      </div>

      {/* Speed Value & Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-black text-black dark:text-white tracking-tight tabular-nums">
          {playbackRate.toFixed(playbackRate % 1 === 0 ? 1 : 2)}x
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-none border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
          {getSpeedLabel(playbackRate)}
        </span>
      </div>

      {/* Modern Black & White Rectangular Slider */}
      <div className="space-y-1 mb-3.5">
        <input
          type="range"
          min="0.25"
          max="2.0"
          step="0.05"
          value={playbackRate}
          onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
          className="mono-rect-slider w-full appearance-none"
          title={`Speed: ${playbackRate.toFixed(2)}x`}
        />
        <div className="flex justify-between text-[10px] font-bold text-neutral-500 dark:text-neutral-400 px-0.5">
          <span>0.25x</span>
          <span className="text-black dark:text-white font-extrabold">1.0x</span>
          <span>2.0x</span>
        </div>
      </div>

      {/* Quick Speed Preset Rectangular Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-black/15 dark:border-white/15">
        {speedPresets.map((rate) => {
          const isActive = Math.abs(playbackRate - rate) < 0.02;
          return (
            <button
              key={rate}
              type="button"
              onClick={() => changePlaybackRate(rate)}
              className={`py-1.5 rounded-none text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-extrabold shadow-xs'
                  : 'bg-white dark:bg-black text-black dark:text-white border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              {rate.toFixed(1)}x
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlaybackSpeedPanel;
