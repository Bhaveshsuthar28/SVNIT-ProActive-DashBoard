import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { useEnhancementStore, getCssFilterString } from '../../stores/enhancementStore';
import { VideoEnhancementPanel } from './VideoEnhancementPanel';
import { PlaybackSpeedPanel } from './PlaybackSpeedPanel';
import { LuCircleAlert, LuLoader } from 'react-icons/lu';

interface VideoPlayerProps {
  src?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src = '/NFD_Junction_annotated_5min.mp4',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const setCurrentTime = useTimelineStore((s) => s.setCurrentTime);
  const setDuration = useTimelineStore((s) => s.setDuration);
  const setIsPlaying = useTimelineStore((s) => s.setIsPlaying);
  const setPlaybackRate = useTimelineStore((s) => s.setPlaybackRate);
  const setVideoRef = useTimelineStore((s) => s.setVideoRef);
  const setIsSeeking = useTimelineStore((s) => s.setIsSeeking);

  // Enhancement values for CSS filters
  const brightness = useEnhancementStore((s) => s.brightness);
  const contrast = useEnhancementStore((s) => s.contrast);
  const saturation = useEnhancementStore((s) => s.saturation);
  const exposure = useEnhancementStore((s) => s.exposure);
  const grayscale = useEnhancementStore((s) => s.grayscale);
  const highContrast = useEnhancementStore((s) => s.highContrast);

  const filterStyle = getCssFilterString({
    brightness,
    contrast,
    saturation,
    exposure,
    grayscale,
    highContrast,
  });

  // Register videoRef in timeline store
  useEffect(() => {
    setVideoRef(videoRef);
    return () => {
      setVideoRef(null);
    };
  }, [setVideoRef]);

  // High-frequency requestAnimationFrame update loop when video is playing
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (videoRef.current && !videoRef.current.paused) {
        // Do not overwrite currentTime while video is seeking to prevent stale pre-seek jumps
        if (!useTimelineStore.getState().isSeeking) {
          setCurrentTime(videoRef.current.currentTime);
        }
        animId = requestAnimationFrame(tick);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      animId = requestAnimationFrame(tick);
    };

    const handlePause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animId);
      if (videoRef.current && !useTimelineStore.getState().isSeeking) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animId);
    };

    const handleSeeking = () => {
      setIsSeeking(true);
    };

    const handleSeeked = () => {
      setIsSeeking(false);
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current && !useTimelineStore.getState().isSeeking) {
        setCurrentTime(videoRef.current.currentTime);
        if (!videoRef.current.paused) {
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(tick);
        }
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('seeking', handleSeeking);
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      cancelAnimationFrame(animId);
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('seeking', handleSeeking);
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [setCurrentTime, setIsPlaying, setIsSeeking]);

  // Native video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
      setIsLoading(false);
      setHasError(false);
    }
  }, [setDuration]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !useTimelineStore.getState().isSeeking) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [setCurrentTime]);

  const handleRateChange = useCallback(() => {
    if (videoRef.current) {
      setPlaybackRate(videoRef.current.playbackRate);
    }
  }, [setPlaybackRate]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div className={`relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center ${className}`}>
      {/* Native HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onRateChange={handleRateChange}
        onError={handleError}
        style={{ filter: filterStyle }}
        className="w-full h-full object-cover select-none"
      />

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white z-10">
          <div className="flex items-center gap-2 text-xs font-medium">
            <LuLoader className="w-4 h-4 animate-spin text-[#1677FF]" />
            <span>Loading traffic video...</span>
          </div>
        </div>
      )}

      {/* Professional Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-4 z-10 text-center">
          <LuCircleAlert className="w-8 h-8 text-[#FF4D5A] mb-2" />
          <h4 className="text-sm font-semibold mb-1">Unable to load video</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-3">
            Check the configured video source ({src}). Ensure the file exists and is supported by the browser.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="px-3 py-1.5 bg-[#1677FF] hover:bg-[#0958D9] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Top-Left Timestamp Badge Matching Reference */}
      <div className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-mono z-20 shadow-sm border border-white/10 pointer-events-none">
        2025-01-15 10:24:36
      </div>

      {/* Top-Right Video Enhancement Floating Card */}
      <VideoEnhancementPanel />

      {/* Floating Playback Speed Card (Toggled from Control Bar) */}
      <PlaybackSpeedPanel />
    </div>
  );
};

export default VideoPlayer;
