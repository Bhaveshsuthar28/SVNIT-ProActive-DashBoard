import React, { useEffect } from 'react';
import {
  LuPlay,
  LuPause,
  LuSquare,
  LuRotateCcw,
  LuRotateCw,
  LuSlidersHorizontal,
  LuMaximize,
  LuMinimize,
} from 'react-icons/lu';
import { useTimelineStore } from '../../stores/timelineStore';
import { useEnhancementStore } from '../../stores/enhancementStore';
import { VideoTimeline } from './VideoTimeline';
import { VideoTimeDisplay } from './VideoTimeDisplay';
import { PlaybackSpeedControl } from './PlaybackSpeedControl';

interface VideoControlsProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const VideoControls: React.FC<VideoControlsProps> = ({ containerRef }) => {
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const play = useTimelineStore((s) => s.play);
  const pause = useTimelineStore((s) => s.pause);
  const stop = useTimelineStore((s) => s.stop);
  const skip = useTimelineStore((s) => s.skip);
  const videoRef = useTimelineStore((s) => s.videoRef);

  const isPanelVisible = useEnhancementStore((s) => s.isPanelVisible);
  const togglePanelVisible = useEnhancementStore((s) => s.togglePanelVisible);

  const isFullscreen = useTimelineStore((s) => s.isFullscreen);
  const setIsFullscreen = useTimelineStore((s) => s.setIsFullscreen);

  // Synchronize fullscreen state with document changes (e.g. Escape key or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleFullscreen = async () => {
    const target = containerRef?.current || videoRef?.current;
    if (!target) return;

    try {
      if (!document.fullscreenElement) {
        await target.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const iconClass = isFullscreen ? 'w-6 h-6 stroke-[2.8]' : 'w-5 h-5 stroke-[2.5]';
  const btnPad = isFullscreen ? 'p-1.5' : 'p-1';

  return (
    <div
      className={`bg-white dark:bg-[#162032] border-t border-[#E6EAF0] dark:border-[#27354A] flex items-center justify-between text-[#10213F] dark:text-[#F1F5F9] select-none shrink-0 transition-colors duration-200 ${
        isFullscreen ? 'px-8 py-3.5 gap-5' : 'px-3.5 py-2 gap-3'
      }`}
    >
      {/* Left Playback & Jump Controls */}
      <div className={`flex items-center shrink-0 ${isFullscreen ? 'gap-4' : 'gap-2.5'}`}>
        {/* Play/Pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          className={`text-[#10213F] dark:text-[#F1F5F9] hover:text-[#1677FF] dark:hover:text-[#38BDF8] transition-colors ${btnPad}`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <LuPause className={`${iconClass} fill-current`} />
          ) : (
            <LuPlay className={`${iconClass} fill-current ml-0.5`} />
          )}
        </button>

        {/* Stop Button */}
        <button
          type="button"
          onClick={stop}
          className={`text-[#667085] dark:text-[#94A3B8] hover:text-[#FF4D5A] transition-colors ${btnPad}`}
          title="Stop & Reset"
        >
          <LuSquare className={`${iconClass} fill-current`} />
        </button>

        {/* Rewind 10s (Big & Bold Icon-only) */}
        <button
          type="button"
          onClick={() => skip(-10)}
          className={`text-[#10213F] dark:text-[#F1F5F9] hover:text-[#1677FF] dark:hover:text-[#38BDF8] transition-colors ${btnPad}`}
          title="Rewind 10 seconds"
        >
          <LuRotateCcw className={iconClass} />
        </button>

        {/* Forward 10s (Big & Bold Icon-only) */}
        <button
          type="button"
          onClick={() => skip(10)}
          className={`text-[#10213F] dark:text-[#F1F5F9] hover:text-[#1677FF] dark:hover:text-[#38BDF8] transition-colors ${btnPad}`}
          title="Forward 10 seconds"
        >
          <LuRotateCw className={iconClass} />
        </button>
      </div>

      {/* Center Timeline Scrubber */}
      <VideoTimeline />

      {/* Right Controls */}
      <div className={`flex items-center shrink-0 ${isFullscreen ? 'gap-5' : 'gap-3'}`}>
        {/* Formatted Time Display */}
        <VideoTimeDisplay />

        {/* Playback Speed Toggle Button */}
        <PlaybackSpeedControl />

        {/* Video Enhancement Toggle (Replaces Picture-in-Picture) */}
        <button
          type="button"
          onClick={togglePanelVisible}
          className={`rounded-none border transition-colors cursor-pointer ${btnPad} ${
            isPanelVisible
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-extrabold'
              : 'bg-white dark:bg-black text-black dark:text-white border-slate-300 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-slate-100 dark:hover:bg-neutral-900 font-bold'
          }`}
          title={isPanelVisible ? 'Hide Video Enhancement' : 'Show Video Enhancement'}
        >
          <LuSlidersHorizontal className={iconClass} />
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`text-[#667085] dark:text-[#94A3B8] hover:text-[#10213F] dark:hover:text-[#F1F5F9] transition-colors ${btnPad}`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <LuMinimize className={iconClass} />
          ) : (
            <LuMaximize className={iconClass} />
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
