import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LuSearch,
  LuFilter,
  LuRotateCcw,
  LuVideo,
  LuArrowUpDown,
  LuArrowUp,
  LuArrowDown,
  LuClock,
  LuHash,
  LuDatabase,
  LuCar,
  LuLayers,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuLoader,
  LuCircleAlert,
  LuX,
} from 'react-icons/lu';

import { TrajectoryPoint } from '../../types';
import { trajectoryService } from '../../services/trajectory/trajectoryService';
import { useTrajectoryStore } from '../../stores/trajectoryStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { FrameInspectorModal } from './FrameInspectorModal';

type SortColumn =
  | 'frame'
  | 'timeSec'
  | 'trackId'
  | 'vehicleClass'
  | 'confidence'
  | 'speedKmh'
  | 'headingDeg'
  | 'velocityKmh'
  | 'accelerationTangentialMs2'
  | 'accelerationLateralMs2'
  | 'easting'
  | 'northing';

type SortDirection = 'asc' | 'desc';

interface ActiveFilterItem {
  id: string;
  label: string;
  onRemove: () => void;
}

const CLASS_BADGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  CAR: {
    bg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-200 font-bold',
    dot: 'bg-[#1677FF]',
  },
  TRUCK: {
    bg: 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700',
    text: 'text-rose-900 dark:text-rose-200 font-bold',
    dot: 'bg-[#FF4D5A]',
  },
  BUS: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-900 dark:text-emerald-200 font-bold',
    dot: 'bg-[#18B979]',
  },
  MOTORCYCLE: {
    bg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700',
    text: 'text-amber-900 dark:text-amber-200 font-bold',
    dot: 'bg-[#F79009]',
  },
  OTHER: {
    bg: 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700',
    text: 'text-purple-900 dark:text-purple-200 font-bold',
    dot: 'bg-[#7A5AF8]',
  },
};

export const TrafficDataExplorer: React.FC = () => {
  const dataStatus = useTrajectoryStore((s) => s.status);
  const dataError = useTrajectoryStore((s) => s.error);
  const loadDataset = useTrajectoryStore((s) => s.loadDataset);

  const seek = useTimelineStore((s) => s.seek);

  // 1. Raw Dataset Access
  const [allPoints, setAllPoints] = useState<TrajectoryPoint[]>([]);

  useEffect(() => {
    if (dataStatus === 'ready') {
      setAllPoints(trajectoryService.getAllPoints());
    }
  }, [dataStatus]);

  // 2. Search States
  const [frameSearchInput, setFrameSearchInput] = useState('');
  const [activeFrameSearch, setActiveFrameSearch] = useState<number | null>(null);

  const [timeSearchInput, setTimeSearchInput] = useState('');
  const [activeTimeSearch, setActiveTimeSearch] = useState<number | null>(null);

  const [globalSearchInput, setGlobalSearchInput] = useState('');
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState('');

  // 3. Filter States
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [trackIdFilter, setTrackIdFilter] = useState<string>('');
  const [minSpeed, setMinSpeed] = useState<string>('');
  const [maxSpeed, setMaxSpeed] = useState<string>('');
  const [minConfidence, setMinConfidence] = useState<string>('');
  const [maxConfidence, setMaxConfidence] = useState<string>('');
  const [startFrame, setStartFrame] = useState<string>('');
  const [endFrame, setEndFrame] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // 4. Sort State
  const [sortColumn, setSortColumn] = useState<SortColumn>('frame');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // 5. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // 6. Selected Row & Inspected Frame
  const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
  const [inspectedPoint, setInspectedPoint] = useState<TrajectoryPoint | null>(null);

  // Debounce global search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [globalSearchInput]);

  // Handle Jump to Video and Inspect Frame
  const handleJumpToVideo = useCallback(
    (point: TrajectoryPoint, openInspector = true) => {
      seek(point.timeSec);
      setSelectedRowKey(`${point.trackId}_${point.frame}`);
      if (openInspector) {
        setInspectedPoint(point);
      }
    },
    [seek]
  );

  // Handle Unified Video Position (Frame + Time) Search Submit
  // Handle Frame Search Submit
  const handleFrameSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(frameSearchInput.trim(), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setActiveFrameSearch(parsed);
      setCurrentPage(1);

      // Locate first matching record and jump video
      const matched = allPoints.find((p) => p.frame === parsed);
      if (matched) {
        handleJumpToVideo(matched);
      }
    } else {
      setActiveFrameSearch(null);
    }
  };

  // Handle Time Search Submit
  const handleTimeSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(timeSearchInput.trim());
    if (!isNaN(parsed) && parsed >= 0) {
      setActiveTimeSearch(parsed);
      setCurrentPage(1);

      // Locate closest record within tolerance and jump video
      let closest: TrajectoryPoint | null = null;
      let minDiff = Infinity;
      for (let i = 0; i < allPoints.length; i++) {
        const diff = Math.abs(allPoints[i].timeSec - parsed);
        if (diff < minDiff) {
          minDiff = diff;
          closest = allPoints[i];
          if (diff <= 0.04) break;
        }
      }
      if (closest) {
        handleJumpToVideo(closest);
      }
    } else {
      setActiveTimeSearch(null);
    }
  };


  // Reset all filters and searches
  const handleResetAll = useCallback(() => {
    setFrameSearchInput('');
    setActiveFrameSearch(null);
    setTimeSearchInput('');
    setActiveTimeSearch(null);
    setGlobalSearchInput('');
    setDebouncedGlobalSearch('');
    setSelectedClass('ALL');
    setTrackIdFilter('');
    setMinSpeed('');
    setMaxSpeed('');
    setMinConfidence('');
    setMaxConfidence('');
    setStartFrame('');
    setEndFrame('');
    setStartTime('');
    setEndTime('');
    setCurrentPage(1);
  }, []);

  // Filter & Search Pipeline
  const filteredPoints = useMemo(() => {
    if (!allPoints || allPoints.length === 0) return [];

    const numMinSpeed = minSpeed !== '' ? parseFloat(minSpeed) : null;
    const numMaxSpeed = maxSpeed !== '' ? parseFloat(maxSpeed) : null;
    const numMinConf = minConfidence !== '' ? parseFloat(minConfidence) / 100 : null;
    const numMaxConf = maxConfidence !== '' ? parseFloat(maxConfidence) / 100 : null;
    const numStartFrame = startFrame !== '' ? parseInt(startFrame, 10) : null;
    const numEndFrame = endFrame !== '' ? parseInt(endFrame, 10) : null;
    const numStartTime = startTime !== '' ? parseFloat(startTime) : null;
    const numEndTime = endTime !== '' ? parseFloat(endTime) : null;
    const numTrackId = trackIdFilter !== '' ? parseInt(trackIdFilter, 10) : null;

    const gQuery = debouncedGlobalSearch;

    return allPoints.filter((p) => {
      // 1. Frame search exact match
      if (activeFrameSearch !== null && p.frame !== activeFrameSearch) {
        return false;
      }

      // 2. Time search with sample tolerance (within +/- 0.08s)
      if (activeTimeSearch !== null && Math.abs(p.timeSec - activeTimeSearch) > 0.08) {
        return false;
      }

      // 3. Vehicle class filter
      if (selectedClass !== 'ALL' && p.vehicleClass.toUpperCase() !== selectedClass) {
        return false;
      }

      // 4. Track ID filter
      if (numTrackId !== null && p.trackId !== numTrackId) {
        return false;
      }

      // 5. Speed range
      if (numMinSpeed !== null && p.speedKmh < numMinSpeed) return false;
      if (numMaxSpeed !== null && p.speedKmh > numMaxSpeed) return false;

      // 6. Confidence range
      if (numMinConf !== null && p.confidence < numMinConf) return false;
      if (numMaxConf !== null && p.confidence > numMaxConf) return false;

      // 7. Frame range
      if (numStartFrame !== null && p.frame < numStartFrame) return false;
      if (numEndFrame !== null && p.frame > numEndFrame) return false;

      // 8. Time range
      if (numStartTime !== null && p.timeSec < numStartTime) return false;
      if (numEndTime !== null && p.timeSec > numEndTime) return false;

      // 9. Global query search
      if (gQuery) {
        const matches =
          p.trackId.toString().includes(gQuery) ||
          p.frame.toString().includes(gQuery) ||
          p.timeSec.toString().includes(gQuery) ||
          p.vehicleClass.toLowerCase().includes(gQuery) ||
          p.sourceClass.toLowerCase().includes(gQuery) ||
          p.speedKmh.toFixed(1).includes(gQuery);
        if (!matches) return false;
      }

      return true;
    });
  }, [
    allPoints,
    activeFrameSearch,
    activeTimeSearch,
    selectedClass,
    trackIdFilter,
    minSpeed,
    maxSpeed,
    minConfidence,
    maxConfidence,
    startFrame,
    endFrame,
    startTime,
    endTime,
    debouncedGlobalSearch,
  ]);

  // Sorting Pipeline (Numerical / Native values)
  const sortedPoints = useMemo(() => {
    if (!filteredPoints || filteredPoints.length === 0) return [];

    const list = [...filteredPoints];
    const dir = sortDirection === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (typeof valA === 'string') {
        return dir * valA.localeCompare(valB);
      }
      return dir * (valA - valB);
    });

    return list;
  }, [filteredPoints, sortColumn, sortDirection]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(sortedPoints.length / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedPoints = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedPoints.slice(start, start + pageSize);
  }, [sortedPoints, validCurrentPage, pageSize]);

  // Data Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalRecords = allPoints.length;
    const visibleRecords = filteredPoints.length;

    if (visibleRecords === 0) {
      return {
        totalRecords,
        visibleRecords: 0,
        uniqueVehicles: 0,
        frameMin: 0,
        frameMax: 0,
        timeMin: 0,
        timeMax: 0,
      };
    }

    const trackIds = new Set<number>();
    let frameMin = Infinity;
    let frameMax = -Infinity;
    let timeMin = Infinity;
    let timeMax = -Infinity;

    for (let i = 0; i < filteredPoints.length; i++) {
      const p = filteredPoints[i];
      trackIds.add(p.trackId);
      if (p.frame < frameMin) frameMin = p.frame;
      if (p.frame > frameMax) frameMax = p.frame;
      if (p.timeSec < timeMin) timeMin = p.timeSec;
      if (p.timeSec > timeMax) timeMax = p.timeSec;
    }

    return {
      totalRecords,
      visibleRecords,
      uniqueVehicles: trackIds.size,
      frameMin,
      frameMax,
      timeMin,
      timeMax,
    };
  }, [allPoints.length, filteredPoints]);

  // Active Filters Array for removable badges
  const activeFilters = useMemo(() => {
    const list: ActiveFilterItem[] = [];

    if (activeFrameSearch !== null) {
      list.push({
        id: 'frame_search',
        label: `Frame: ${activeFrameSearch}`,
        onRemove: () => {
          setFrameSearchInput('');
          setActiveFrameSearch(null);
        },
      });
    }

    if (activeTimeSearch !== null) {
      list.push({
        id: 'time_search',
        label: `Time: ${activeTimeSearch.toFixed(2)}s`,
        onRemove: () => {
          setTimeSearchInput('');
          setActiveTimeSearch(null);
        },
      });
    }

    if (debouncedGlobalSearch) {
      list.push({
        id: 'global_search',
        label: `Keyword: "${debouncedGlobalSearch}"`,
        onRemove: () => {
          setGlobalSearchInput('');
          setDebouncedGlobalSearch('');
        },
      });
    }

    if (selectedClass !== 'ALL') {
      list.push({
        id: 'class',
        label: `Class: ${selectedClass}`,
        onRemove: () => setSelectedClass('ALL'),
      });
    }

    if (trackIdFilter) {
      list.push({
        id: 'track',
        label: `Track ID: ${trackIdFilter}`,
        onRemove: () => setTrackIdFilter(''),
      });
    }

    if (minSpeed !== '' || maxSpeed !== '') {
      const minText = minSpeed !== '' ? `${minSpeed}` : '0';
      const maxText = maxSpeed !== '' ? `${maxSpeed}` : 'max';
      list.push({
        id: 'speed',
        label: `Speed: ${minText}–${maxText} km/h`,
        onRemove: () => {
          setMinSpeed('');
          setMaxSpeed('');
        },
      });
    }

    if (minConfidence !== '' || maxConfidence !== '') {
      const minText = minConfidence !== '' ? `${minConfidence}%` : '0%';
      const maxText = maxConfidence !== '' ? `${maxConfidence}%` : '100%';
      list.push({
        id: 'confidence',
        label: `Conf: ${minText}–${maxText}`,
        onRemove: () => {
          setMinConfidence('');
          setMaxConfidence('');
        },
      });
    }

    if (startFrame !== '' || endFrame !== '') {
      const startText = startFrame !== '' ? `${startFrame}` : '0';
      const endText = endFrame !== '' ? `${endFrame}` : 'max';
      list.push({
        id: 'frame_range',
        label: `Frames: ${startText}–${endText}`,
        onRemove: () => {
          setStartFrame('');
          setEndFrame('');
        },
      });
    }

    if (startTime !== '' || endTime !== '') {
      const startText = startTime !== '' ? `${startTime}s` : '0s';
      const endText = endTime !== '' ? `${endTime}s` : 'max';
      list.push({
        id: 'time_range',
        label: `Time: ${startText}–${endText}`,
        onRemove: () => {
          setStartTime('');
          setEndTime('');
        },
      });
    }

    return list;
  }, [
    activeFrameSearch,
    activeTimeSearch,
    debouncedGlobalSearch,
    selectedClass,
    trackIdFilter,
    minSpeed,
    maxSpeed,
    minConfidence,
    maxConfidence,
    startFrame,
    endFrame,
    startTime,
    endTime,
  ]);

  // Handle Column Header Sort Click
  const handleSortClick = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (col: SortColumn) => {
    if (sortColumn !== col) {
      return <LuArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <LuArrowUp className="w-3 h-3 text-[#1677FF] dark:text-[#38BDF8] ml-1 font-bold" />
    ) : (
      <LuArrowDown className="w-3 h-3 text-[#1677FF] dark:text-[#38BDF8] ml-1 font-bold" />
    );
  };

  // Loading State
  if (dataStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-12 text-center shadow-xs">
        <LuLoader className="w-10 h-10 text-[#1677FF] animate-spin mb-4" />
        <h3 className="text-base font-bold text-[#10213F] dark:text-[#F1F5F9] mb-1">
          Loading Trajectory Dataset...
        </h3>
        <p className="text-xs text-[#667085] dark:text-[#94A3B8] max-w-md">
          Parsing and indexing CSV trajectory points for high-performance frame search and analytics.
        </p>
      </div>
    );
  }

  // Error State
  if (dataStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] bg-white dark:bg-[#162032] border border-rose-200 dark:border-rose-900/50 rounded-2xl p-12 text-center shadow-xs">
        <LuCircleAlert className="w-10 h-10 text-[#FF4D5A] mb-4" />
        <h3 className="text-base font-bold text-[#10213F] dark:text-[#F1F5F9] mb-1">
          Unable to Load Trajectory Data
        </h3>
        <p className="text-xs text-[#667085] dark:text-[#94A3B8] max-w-md mb-5">
          {dataError || 'The dataset file could not be parsed. Please check if /data/trajectories.csv is available.'}
        </p>
        <button
          type="button"
          onClick={() => loadDataset()}
          className="px-4 py-2 bg-[#1677FF] hover:bg-[#0958D9] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          Retry Loading Dataset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Page Header */}
      <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] transition-colors duration-200">
        <h2 className="text-[20px] font-black tracking-tight text-[#10213F] dark:text-[#F1F5F9]">
          Traffic Data Explorer
        </h2>
        <p className="text-xs text-[#667085] dark:text-[#94A3B8] mt-0.5">
          Explore, filter and analyze vehicle trajectory data across video frames and timestamps.
        </p>
      </div>

      {/* 2. Search & Analysis Control Area */}
      <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-5 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] space-y-4 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* A. Search Frame */}
          <form onSubmit={handleFrameSearchSubmit} className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#344054] dark:text-[#E2E8F0]">
              <LuHash className="w-3.5 h-3.5 text-[#1677FF] dark:text-[#38BDF8]" />
              <span>Search Frame</span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={frameSearchInput}
                onChange={(e) => setFrameSearchInput(e.target.value)}
                placeholder="e.g. 681, 704, 1200..."
                className="flex-1 h-10 px-3.5 text-sm font-semibold bg-[#F7F9FC] dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] dark:focus:border-[#38BDF8] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
              <button
                type="submit"
                className="h-10 px-5 bg-[#1677FF] hover:bg-[#0958D9] text-white text-sm font-semibold rounded-none border border-[#1677FF] hover:border-[#0958D9] transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* B. Search Video Time */}
          <form onSubmit={handleTimeSearchSubmit} className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#344054] dark:text-[#E2E8F0]">
              <LuClock className="w-3.5 h-3.5 text-[#18B979] dark:text-[#34D399]" />
              <span>Search Video Time (sec)</span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                step="0.01"
                value={timeSearchInput}
                onChange={(e) => setTimeSearchInput(e.target.value)}
                placeholder="e.g. 27.24, 45.0, 120..."
                className="flex-1 h-10 px-3.5 text-sm font-semibold bg-[#F7F9FC] dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#18B979] dark:focus:border-[#34D399] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
              <button
                type="submit"
                className="h-10 px-5 bg-[#18B979] hover:bg-[#139a64] text-white text-sm font-semibold rounded-none border border-[#18B979] hover:border-[#139a64] transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* C. Global Text Search */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#344054] dark:text-[#E2E8F0]">
              <LuSearch className="w-3.5 h-3.5 text-[#F79009]" />
              <span>Global Search</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={globalSearchInput}
                onChange={(e) => setGlobalSearchInput(e.target.value)}
                placeholder="Search vehicle, class, frame, time..."
                className="w-full h-10 px-3.5 pr-9 text-sm font-semibold bg-[#F7F9FC] dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] dark:focus:border-[#38BDF8] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
              {globalSearchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearchInput('');
                    setDebouncedGlobalSearch('');
                  }}
                  className="absolute right-2.5 h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <LuX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LuFilter className="w-3.5 h-3.5 text-[#1677FF] dark:text-[#38BDF8]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8]">
                Vehicle Class Filter:
              </span>
            </div>

            {/* Reset All Filters Button */}
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#FF4D5A] dark:hover:text-[#FF4D5A] bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-none border border-slate-300 dark:border-slate-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer shadow-xs"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

          {/* Vehicle Class Rectangular Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'CAR', 'TRUCK', 'BUS', 'MOTORCYCLE', 'OTHER'].map((cls) => {
              const isSelected = selectedClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setSelectedClass(cls);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#10213F] dark:bg-[#38BDF8] text-white dark:text-[#0B111E] border-[#10213F] dark:border-[#38BDF8] shadow-xs'
                      : 'bg-white dark:bg-[#0B111E] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cls === 'ALL' ? 'All Classes' : cls.charAt(0) + cls.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Granular Parametric Filter Rectangular Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-[#344054] dark:text-[#E2E8F0] uppercase tracking-wider">
                Track ID
              </label>
              <input
                type="number"
                value={trackIdFilter}
                onChange={(e) => {
                  setTrackIdFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 42"
                className="w-full mt-1.5 h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#344054] dark:text-[#E2E8F0] uppercase tracking-wider">
                Min Speed (km/h)
              </label>
              <input
                type="number"
                value={minSpeed}
                onChange={(e) => {
                  setMinSpeed(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="0"
                className="w-full mt-1.5 h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#344054] dark:text-[#E2E8F0] uppercase tracking-wider">
                Max Speed (km/h)
              </label>
              <input
                type="number"
                value={maxSpeed}
                onChange={(e) => {
                  setMaxSpeed(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="80"
                className="w-full mt-1.5 h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#344054] dark:text-[#E2E8F0] uppercase tracking-wider">
                Min Conf (%)
              </label>
              <input
                type="number"
                value={minConfidence}
                onChange={(e) => {
                  setMinConfidence(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="80"
                className="w-full mt-1.5 h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#344054] dark:text-[#E2E8F0] uppercase tracking-wider">
                Start Frame
              </label>
              <input
                type="number"
                value={startFrame}
                onChange={(e) => {
                  setStartFrame(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="0"
                className="w-full mt-1.5 h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#344054] dark:text-[#E2E8F0] uppercase tracking-wider">
                End Frame
              </label>
              <input
                type="number"
                value={endFrame}
                onChange={(e) => {
                  setEndFrame(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="7500"
                className="w-full mt-1.5 h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none focus:outline-none focus:border-[#1677FF] text-[#10213F] dark:text-[#F1F5F9] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-[#667085] dark:text-[#94A3B8]">
            Active Filters:
          </span>
          {activeFilters.length === 0 ? (
            <span className="text-xs italic text-slate-400 dark:text-slate-500">
              No active filters
            </span>
          ) : (
            activeFilters.map((af) => (
              <span
                key={af.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs"
              >
                <span>{af.label}</span>
                <button
                  type="button"
                  onClick={af.onRemove}
                  className="hover:text-blue-900 dark:hover:text-white cursor-pointer"
                  title="Remove filter"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 3. Data Summary Cards (5 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] transition-colors duration-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8]">
              Total Records
            </span>
            <LuDatabase className="w-4 h-4 text-[#1677FF] dark:text-[#38BDF8]" />
          </div>
          <div className="text-[22px] font-black text-[#10213F] dark:text-[#F1F5F9] tabular-nums">
            {summaryMetrics.totalRecords.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] transition-colors duration-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8]">
              Visible Records
            </span>
            <LuLayers className="w-4 h-4 text-[#18B979] dark:text-[#34D399]" />
          </div>
          <div className="text-[22px] font-black text-[#10213F] dark:text-[#F1F5F9] tabular-nums">
            {summaryMetrics.visibleRecords.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] transition-colors duration-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8]">
              Unique Vehicles
            </span>
            <LuCar className="w-4 h-4 text-[#F79009]" />
          </div>
          <div className="text-[22px] font-black text-[#10213F] dark:text-[#F1F5F9] tabular-nums">
            {summaryMetrics.uniqueVehicles.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] transition-colors duration-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8]">
              Frame Range
            </span>
            <LuHash className="w-4 h-4 text-[#7A5AF8]" />
          </div>
          <div className="text-[17px] font-black text-[#10213F] dark:text-[#F1F5F9] tabular-nums truncate">
            {summaryMetrics.visibleRecords > 0
              ? `${summaryMetrics.frameMin} → ${summaryMetrics.frameMax}`
              : '—'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl p-4 shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] transition-colors duration-200 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#94A3B8]">
              Time Range
            </span>
            <LuClock className="w-4 h-4 text-[#FF4D5A]" />
          </div>
          <div className="text-[17px] font-black text-[#10213F] dark:text-[#F1F5F9] tabular-nums truncate">
            {summaryMetrics.visibleRecords > 0
              ? `${summaryMetrics.timeMin.toFixed(1)}s → ${summaryMetrics.timeMax.toFixed(1)}s`
              : '—'}
          </div>
        </div>
      </div>

      {/* 4. Large Data Table Component */}
      <div className="bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] rounded-2xl shadow-[0_1px_3px_0_rgba(16,33,63,0.03)] overflow-hidden transition-colors duration-200">
        {/* Table Controls Header: Row Summary & Page Size */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Showing{' '}
            <span className="text-[#1677FF] dark:text-[#38BDF8]">
              {sortedPoints.length > 0 ? (validCurrentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="text-[#1677FF] dark:text-[#38BDF8]">
              {Math.min(validCurrentPage * pageSize, sortedPoints.length)}
            </span>{' '}
            of{' '}
            <span className="text-slate-950 dark:text-white font-black">
              {sortedPoints.length.toLocaleString()}
            </span>{' '}
            matching trajectory records
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Page Size:
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 px-3 text-xs font-semibold bg-white dark:bg-[#0B111E] border border-slate-300 dark:border-slate-600 rounded-none text-[#10213F] dark:text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead className="sticky top-0 bg-slate-100 dark:bg-[#0B111E] border-b-2 border-slate-300 dark:border-slate-700 z-10 shadow-xs">
              <tr>
                <th
                  onClick={() => handleSortClick('frame')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Frame</span>
                    {renderSortIcon('frame')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('timeSec')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Time (s)</span>
                    {renderSortIcon('timeSec')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('trackId')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Track ID</span>
                    {renderSortIcon('trackId')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('vehicleClass')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Vehicle Class</span>
                    {renderSortIcon('vehicleClass')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('confidence')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Confidence</span>
                    {renderSortIcon('confidence')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('speedKmh')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Speed</span>
                    {renderSortIcon('speedKmh')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('headingDeg')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Heading</span>
                    {renderSortIcon('headingDeg')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('velocityKmh')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Velocity</span>
                    {renderSortIcon('velocityKmh')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('accelerationTangentialMs2')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Accel (m/s²)</span>
                    {renderSortIcon('accelerationTangentialMs2')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('accelerationLateralMs2')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Lat Accel</span>
                    {renderSortIcon('accelerationLateralMs2')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('easting')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Easting</span>
                    {renderSortIcon('easting')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortClick('northing')}
                  className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <span>Northing</span>
                    {renderSortIcon('northing')}
                  </div>
                </th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 whitespace-nowrap text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80 font-medium">
              {paginatedPoints.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <LuSearch className="w-8 h-8 mb-2 opacity-40" />
                      <p className="font-bold text-sm text-[#344054] dark:text-[#E2E8F0]">
                        No matching records
                      </p>
                      <p className="text-xs text-[#667085] dark:text-[#94A3B8] mt-0.5">
                        Try clearing or changing your search or filter criteria.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-[#1677FF] dark:text-[#38BDF8] text-xs font-semibold rounded-none border border-blue-300 dark:border-blue-700 cursor-pointer shadow-xs"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPoints.map((point) => {
                  const rowKey = `${point.trackId}_${point.frame}`;
                  const isSelected = selectedRowKey === rowKey;
                  const upperClass = point.vehicleClass.toUpperCase();
                  const badge = CLASS_BADGE_STYLES[upperClass] || CLASS_BADGE_STYLES.OTHER;

                  return (
                    <tr
                      key={rowKey}
                      onClick={() => handleJumpToVideo(point)}
                      className={`transition-colors cursor-pointer border-b border-slate-200 dark:border-slate-800 ${
                        isSelected
                          ? 'bg-blue-100/90 dark:bg-blue-900/50'
                          : 'odd:bg-white even:bg-slate-50/70 dark:odd:bg-[#162032] dark:even:bg-[#0E1726] hover:bg-blue-50/80 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-sm text-slate-950 dark:text-white tabular-nums whitespace-nowrap">
                        {point.frame}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-sm text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {point.timeSec.toFixed(2)}s
                      </td>
                      <td className="px-4 py-3 font-bold text-sm text-[#1677FF] dark:text-[#38BDF8] tabular-nums whitespace-nowrap">
                        #{point.trackId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-xs font-bold border ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-none ${badge.dot}`} />
                          <span>{point.vehicleClass}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {(point.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-bold text-sm text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                        {point.speedKmh.toFixed(1)}{' '}
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">km/h</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {point.headingDeg.toFixed(1)}°
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {point.velocityKmh.toFixed(1)}{' '}
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">km/h</span>
                      </td>
                      <td
                        className={`px-4 py-3 font-bold text-sm tabular-nums whitespace-nowrap ${
                          point.accelerationTangentialMs2 > 0.1
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : point.accelerationTangentialMs2 < -0.1
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {point.accelerationTangentialMs2 > 0 ? '+' : ''}
                        {point.accelerationTangentialMs2.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {point.accelerationLateralMs2.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-xs text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {point.easting.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-xs text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {point.northing.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpToVideo(point);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border border-[#1677FF] bg-[#1677FF]/10 hover:bg-[#1677FF] text-[#1677FF] hover:text-white dark:border-[#38BDF8] dark:text-[#38BDF8] dark:hover:text-[#0B111E] dark:hover:bg-[#38BDF8] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title="View exact frame snapshot and stats"
                        >
                          <LuVideo className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-[#F7F9FC] dark:bg-[#0F172A]">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Page <span className="font-bold text-slate-950 dark:text-white">{validCurrentPage}</span> of{' '}
            <span className="font-bold text-slate-950 dark:text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="h-9 w-9 flex items-center justify-center rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
              title="First Page"
            >
              <LuChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 w-9 flex items-center justify-center rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
              title="Previous Page"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number indicators */}
            <div className="flex items-center justify-center px-3 h-9 border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#162032]">
              <span className="text-xs font-semibold text-[#1677FF] dark:text-[#38BDF8]">
                {validCurrentPage}
              </span>
            </div>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 w-9 flex items-center justify-center rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
              title="Next Page"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="h-9 w-9 flex items-center justify-center rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#162032] text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
              title="Last Page"
            >
              <LuChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Movable / Draggable Frame & Stats Inspector (Canva/PPT Style) */}
      {inspectedPoint && (
        <FrameInspectorModal
          point={inspectedPoint}
          onClose={() => setInspectedPoint(null)}
        />
      )}
    </div>
  );
};

export default TrafficDataExplorer;
