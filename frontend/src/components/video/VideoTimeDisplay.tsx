import React from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { formatVideoTime } from '../../utils/formatTime';

export const VideoTimeDisplay: React.FC = () => {
  const currentTime = useTimelineStore((state) => state.currentTime);
  const duration = useTimelineStore((state) => state.duration);
  const isFullscreen = useTimelineStore((state) => state.isFullscreen);

  return (
    <div
      className={`font-mono text-[#475467] dark:text-[#94A3B8] whitespace-nowrap select-none ${
        isFullscreen ? 'text-sm font-bold' : 'text-[11px] font-medium'
      }`}
    >
      {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
    </div>
  );
};

export default VideoTimeDisplay;
