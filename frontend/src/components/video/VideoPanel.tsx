import React, { useRef } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { VideoPlayer } from './VideoPlayer';
import { VideoControls } from './VideoControls';

export const VideoPanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFullscreen = useTimelineStore((s) => s.isFullscreen);

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#162032] shadow-[0_1px_3px_0_rgba(16,33,63,0.04)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-colors duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none border-none'
          : 'rounded-xl border border-[#E6EAF0] dark:border-[#27354A] h-[400px]'
      }`}
    >
      {/* Video Display Viewport with Enhancement and Timestamp Overlays */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden">
        <VideoPlayer src="/NFD_Junction_annotated_5min.mp4" />
      </div>

      {/* Native-Driven Video Control Bar */}
      <VideoControls containerRef={containerRef} />
    </div>
  );
};

export default VideoPanel;
