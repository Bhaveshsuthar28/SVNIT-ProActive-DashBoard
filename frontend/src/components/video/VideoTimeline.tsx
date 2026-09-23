import React, { useRef } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

export const VideoTimeline: React.FC = () => {
  const currentTime = useTimelineStore((state) => state.currentTime);
  const duration = useTimelineStore((state) => state.duration);
  const seek = useTimelineStore((state) => state.seek);
  const trackRef = useRef<HTMLDivElement>(null);

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const calculateTime = (clientX: number) => {
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return fraction * duration;
    };

    seek(calculateTime(e.clientX));

    const onPointerMove = (moveEvent: PointerEvent) => {
      seek(calculateTime(moveEvent.clientX));
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const isFullscreen = useTimelineStore((state) => state.isFullscreen);

  return (
    <div className={`flex-1 flex items-center select-none py-1 ${isFullscreen ? 'mx-4' : 'mx-2'}`}>
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        className={`relative w-full bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer group transition-all ${
          isFullscreen ? 'h-2.5' : 'h-1.5'
        }`}
      >
        {/* Active Progress */}
        <div
          className="h-full bg-[#1677FF] rounded-full relative pointer-events-none"
          style={{ width: `${percent}%` }}
        >
          {/* Scrubber Thumb */}
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white dark:bg-slate-200 border-2 border-[#1677FF] rounded-full shadow-md group-hover:scale-125 transition-transform ${
              isFullscreen ? 'w-4 h-4' : 'w-3.5 h-3.5'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoTimeline;
