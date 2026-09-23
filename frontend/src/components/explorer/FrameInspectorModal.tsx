import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LuX, LuMove } from 'react-icons/lu';
import { TrajectoryPoint } from '../../types';

interface FrameInspectorModalProps {
  point: TrajectoryPoint;
  onClose: () => void;
  videoSrc?: string;
}

const CLASS_BADGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  CAR: {
    bg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-200 font-bold',
    dot: 'bg-[#1677FF]',
  },
  BUS: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-900 dark:text-emerald-200 font-bold',
    dot: 'bg-[#18B979]',
  },
  THREE_WHEELER: {
    bg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700',
    text: 'text-amber-900 dark:text-amber-200 font-bold',
    dot: 'bg-[#F79009]',
  },
  TWO_WHEELER: {
    bg: 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700',
    text: 'text-purple-900 dark:text-purple-200 font-bold',
    dot: 'bg-[#7A5AF8]',
  },
  HCV: {
    bg: 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700',
    text: 'text-rose-900 dark:text-rose-200 font-bold',
    dot: 'bg-[#FF4D5A]',
  },
  LCV: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-300 dark:border-cyan-700',
    text: 'text-cyan-900 dark:text-cyan-200 font-bold',
    dot: 'bg-[#06AED4]',
  },
  PEDESTRIAN: {
    bg: 'bg-pink-50 dark:bg-pink-950/70 border-pink-300 dark:border-pink-700',
    text: 'text-pink-900 dark:text-pink-200 font-bold',
    dot: 'bg-[#EC4899]',
  },
};

const getVehicleBadgeStyle = (cls: string) => {
  const norm = (cls || '').toUpperCase().replace(/[\s\-_]/g, '');
  if (norm.includes('THREE')) return CLASS_BADGE_STYLES.THREE_WHEELER;
  if (norm.includes('TWO') || norm.includes('BIKE') || norm.includes('MOTORCYCLE')) return CLASS_BADGE_STYLES.TWO_WHEELER;
  if (norm.includes('HCV') || norm.includes('TRUCK')) return CLASS_BADGE_STYLES.HCV;
  if (norm.includes('LCV') || norm.includes('VAN')) return CLASS_BADGE_STYLES.LCV;
  if (norm.includes('PEDESTRIAN') || norm.includes('PERSON')) return CLASS_BADGE_STYLES.PEDESTRIAN;
  if (norm.includes('BUS')) return CLASS_BADGE_STYLES.BUS;
  return CLASS_BADGE_STYLES.CAR;
};

// Global frame image cache to ensure instant loading of previously captured frames
const frameImageCache = new Map<number, string>();

export const FrameInspectorModal: React.FC<FrameInspectorModalProps> = ({
  point,
  onClose,
  videoSrc = '/NFD_Junction_annotated_5min.mp4',
}) => {
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const [frameImageUrl, setFrameImageUrl] = useState<string | null>(() => {
    return frameImageCache.get(point.frame) || null;
  });
  const [isExtracting, setIsExtracting] = useState<boolean>(!frameImageCache.has(point.frame));

  // Movable / Draggable positioning state (Canva / PowerPoint style)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const initialX = Math.max(20, (window.innerWidth - 480) / 2 + 100);
    const initialY = Math.max(40, window.innerHeight * 0.1);
    return { x: initialX, y: initialY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Extract the exact frame image from the video into an image data URL
  const extractFrame = useCallback(() => {
    const video = hiddenVideoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        frameImageCache.set(point.frame, dataUrl);
        setFrameImageUrl(dataUrl);
        setIsExtracting(false);
      }
    } catch (err) {
      console.error('Failed to extract frame image:', err);
      setIsExtracting(false);
    }
  }, [point.frame]);

  // When point changes, seek hidden video to the frame's exact timestamp
  useEffect(() => {
    const cached = frameImageCache.get(point.frame);
    if (cached) {
      setFrameImageUrl(cached);
      setIsExtracting(false);
      return;
    }

    setIsExtracting(true);
    const video = hiddenVideoRef.current;
    if (video) {
      if (Math.abs(video.currentTime - point.timeSec) < 0.01 && video.readyState >= 2) {
        extractFrame();
      } else {
        video.currentTime = point.timeSec;
      }
    }
  }, [point.frame, point.timeSec, extractFrame]);

  // Pointer dragging handlers for Canva/PPT free movement
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.initX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.initY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const mins = Math.floor(point.timeSec / 60);
  const secs = (point.timeSec % 60).toFixed(2).padStart(5, '0');
  const badge = getVehicleBadgeStyle(point.vehicleClass);

  return (
    <>
      {/* Hidden background video element used strictly for frame snapshot extraction */}
      <video
        ref={hiddenVideoRef}
        src={videoSrc}
        preload="auto"
        muted
        playsInline
        className="hidden"
        onLoadedMetadata={() => {
          if (hiddenVideoRef.current) {
            hiddenVideoRef.current.currentTime = point.timeSec;
          }
        }}
        onSeeked={extractFrame}
      />

      {/* Movable / Draggable Modal Window - Proper Rectangle with Generous Padding */}
      <div
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        className="fixed z-50 w-[520px] max-w-[96vw] bg-white dark:bg-[#111C2E] border-2 border-slate-400 dark:border-slate-600 rounded-none shadow-2xl overflow-hidden select-none flex flex-col"
      >
        {/* Header */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-[#0D1522] border-b border-slate-300 dark:border-slate-700 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LuMove className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wide">
                  Frame #{point.frame}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-bold border ${badge.bg} ${badge.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-none ${badge.dot}`} />
                  <span>{point.vehicleClass}</span>
                </span>
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Time: {String(mins).padStart(2, '0')}:{secs} ({point.timeSec.toFixed(2)}s)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 rounded-none cursor-pointer transition-colors"
            title="Close"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Snapshot Image */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center border-b border-slate-300 dark:border-slate-700">
          {frameImageUrl && !isExtracting ? (
            <img
              src={frameImageUrl}
              alt={`Frame ${point.frame}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 gap-1.5">
              <span className="font-semibold">Loading frame image...</span>
            </div>
          )}
        </div>

        {/* 2-Row Stats Grid with Proper Padding & Rectangular Layout */}
        <div className="bg-white dark:bg-[#111C2E] text-xs">
          {/* Row 1: 4 Key Metrics */}
          <div className="grid grid-cols-4 border-b border-slate-300 dark:border-slate-700 divide-x divide-slate-300 dark:divide-slate-700">
            <div className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Track ID</div>
              <div className="font-extrabold text-base text-[#1677FF] dark:text-[#38BDF8] mt-1">#{point.trackId}</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Speed</div>
              <div className="font-extrabold text-base text-[#10213F] dark:text-white mt-1">
                {point.speedKmh.toFixed(1)} <span className="text-xs font-semibold text-slate-400">km/h</span>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Heading</div>
              <div className="font-extrabold text-base text-[#10213F] dark:text-white mt-1">{point.headingDeg.toFixed(1)}°</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Confidence</div>
              <div className="font-extrabold text-base text-[#10213F] dark:text-white mt-1">{(point.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Row 2: Acceleration & UTM Coordinates with Generous Width */}
          <div className="grid grid-cols-12 divide-x divide-slate-300 dark:divide-slate-700">
            <div className="col-span-3 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Accel</div>
              <div className={`font-extrabold text-sm mt-1 ${point.accelerationTangentialMs2 > 0.05 ? 'text-emerald-600 dark:text-emerald-400' : point.accelerationTangentialMs2 < -0.05 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {point.accelerationTangentialMs2 > 0 ? '+' : ''}{point.accelerationTangentialMs2.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">m/s²</span>
              </div>
            </div>
            <div className="col-span-3 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Lat Accel</div>
              <div className="font-extrabold text-sm text-[#10213F] dark:text-white mt-1">
                {point.accelerationLateralMs2.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">m/s²</span>
              </div>
            </div>
            <div className="col-span-6 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">UTM (Easting, Northing)</div>
              <div className="font-bold text-xs text-[#10213F] dark:text-slate-100 mt-1 font-mono tracking-tight">
                {point.easting.toFixed(2)}, {point.northing.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FrameInspectorModal;
