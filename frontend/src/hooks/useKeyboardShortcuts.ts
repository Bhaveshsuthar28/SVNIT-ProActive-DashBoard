import { useEffect } from 'react';
import { useTimelineStore } from '../stores/timelineStore';
import { useFilterStore } from '../stores/filterStore';

export function useKeyboardShortcuts() {
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const play = useTimelineStore((s) => s.play);
  const pause = useTimelineStore((s) => s.pause);
  const skip = useTimelineStore((s) => s.skip);
  const setSelectedTrackId = useFilterStore((s) => s.setSelectedTrackId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          skip(-5);
          break;

        case 'ArrowRight':
          e.preventDefault();
          skip(5);
          break;

        case 'Escape':
          e.preventDefault();
          setSelectedTrackId(null);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, play, pause, skip, setSelectedTrackId]);
}
