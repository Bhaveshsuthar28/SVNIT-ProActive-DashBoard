import React from 'react';
import { LuGauge } from 'react-icons/lu';
import { useTimelineStore } from '../../stores/timelineStore';

export const PlaybackSpeedControl: React.FC = () => {
  const playbackRate = useTimelineStore((state) => state.playbackRate);
  const isSpeedPanelVisible = useTimelineStore((state) => state.isSpeedPanelVisible);
  const toggleSpeedPanel = useTimelineStore((state) => state.toggleSpeedPanel);
  const isFullscreen = useTimelineStore((state) => state.isFullscreen);

  const formattedRate = `${playbackRate.toFixed(playbackRate % 1 === 0 ? 1 : 2)}x`;

  return (
    <button
      type="button"
      onClick={toggleSpeedPanel}
      className={`flex items-center rounded-none border transition-colors select-none cursor-pointer ${
        isFullscreen ? 'gap-2 px-2.5 py-1.5' : 'gap-1.5 px-2 py-1'
      } ${
        isSpeedPanelVisible
          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-extrabold'
          : 'bg-white dark:bg-black text-black dark:text-white border-slate-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-slate-100 dark:hover:bg-neutral-900 font-bold'
      }`}
      title={isSpeedPanelVisible ? 'Hide Playback Speed' : 'Show Playback Speed'}
    >
      <LuGauge className={isFullscreen ? 'w-5 h-5 stroke-[2.5]' : 'w-4 h-4 stroke-[2.2]'} />
      <span className={`tabular-nums ${isFullscreen ? 'text-xs' : 'text-[11px]'}`}>
        {formattedRate}
      </span>
    </button>
  );
};

export default PlaybackSpeedControl;
