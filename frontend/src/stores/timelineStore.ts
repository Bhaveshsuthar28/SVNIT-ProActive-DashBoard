import { create } from 'zustand';
import React from 'react';

export interface TimelineState {
  currentTime: number;
  duration: number;
  currentFrame: number;
  isPlaying: boolean;
  playbackRate: number;
  fps: number;
  videoRef: React.RefObject<HTMLVideoElement> | null;

  // Explicit seek tracking
  isSeeking: boolean;
  seekVersion: number;
  setIsSeeking: (isSeeking: boolean) => void;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setFps: (fps: number) => void;
  setVideoRef: (ref: React.RefObject<HTMLVideoElement> | null) => void;

  // Direct video actions
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  changePlaybackRate: (rate: number) => void;

  // Speed panel UI state
  isSpeedPanelVisible: boolean;
  setIsSpeedPanelVisible: (visible: boolean) => void;
  toggleSpeedPanel: () => void;

  // Fullscreen state
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

let seekTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useTimelineStore = create<TimelineState>((set, get) => ({
  currentTime: 0,
  duration: 300, // Default 5 minutes (will be updated by video metadata)
  currentFrame: 0,
  isPlaying: false,
  playbackRate: 1.0,
  fps: 25, // CSV interval is 0.04s => 25 fps
  videoRef: null,
  isSeeking: false,
  seekVersion: 0,
  isSpeedPanelVisible: false,
  isFullscreen: false,

  setIsSeeking: (isSeeking: boolean) => set({ isSeeking }),

  setCurrentTime: (time: number) => {
    const fps = get().fps;
    const currentFrame = Math.floor(time * fps);
    set({ currentTime: time, currentFrame });
  },

  setDuration: (duration: number) => set({ duration }),
  setCurrentFrame: (frame: number) => set({ currentFrame: frame }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setPlaybackRate: (playbackRate: number) => set({ playbackRate }),
  setFps: (fps: number) => set({ fps }),
  setVideoRef: (videoRef) => set({ videoRef }),

  play: async () => {
    const { videoRef } = get();
    if (videoRef?.current) {
      try {
        await videoRef.current.play();
        set({ isPlaying: true });
      } catch (err) {
        console.warn('Playback error or user gesture required:', err);
      }
    }
  },

  pause: () => {
    const { videoRef } = get();
    if (videoRef?.current) {
      videoRef.current.pause();
      set({ isPlaying: false });
    }
  },

  stop: () => {
    const { videoRef } = get();
    if (videoRef?.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      set({ isPlaying: false, currentTime: 0, currentFrame: 0 });
    }
  },

  seek: (seconds: number) => {
    const { videoRef, duration } = get();
    const clamped = Math.max(0, Math.min(seconds, duration));
    const fps = get().fps;
    const nextVersion = get().seekVersion + 1;

    // Immediately update temporal state with seekVersion increment & isSeeking flag
    set({
      currentTime: clamped,
      currentFrame: Math.floor(clamped * fps),
      isSeeking: true,
      seekVersion: nextVersion,
    });

    if (seekTimeoutId) {
      clearTimeout(seekTimeoutId);
    }
    seekTimeoutId = setTimeout(() => {
      set({ isSeeking: false });
    }, 250);

    if (videoRef?.current) {
      videoRef.current.currentTime = clamped;
    }
  },

  skip: (seconds: number) => {
    const { duration, currentTime } = get();
    const next = Math.max(0, Math.min(currentTime + seconds, duration));
    get().seek(next);
  },

  changePlaybackRate: (rate: number) => {
    const { videoRef } = get();
    if (videoRef?.current) {
      videoRef.current.playbackRate = rate;
    }
    set({ playbackRate: rate });
  },

  setIsSpeedPanelVisible: (isSpeedPanelVisible: boolean) => set({ isSpeedPanelVisible }),
  toggleSpeedPanel: () => set((state) => ({ isSpeedPanelVisible: !state.isSpeedPanelVisible })),

  setIsFullscreen: (isFullscreen: boolean) => set({ isFullscreen }),
}));
