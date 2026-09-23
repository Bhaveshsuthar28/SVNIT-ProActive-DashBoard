import React, { useState, useMemo } from 'react';
import { useFilterStore, ALL_VEHICLE_CLASSES } from '../../stores/filterStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { trajectoryService } from '../../services/trajectory/trajectoryService';
import { LuSearch, LuRotateCcw, LuFilter, LuGauge } from 'react-icons/lu';

export const FilterBar: React.FC = () => {
  const selectedClasses = useFilterStore((s) => s.selectedClasses);
  const toggleVehicleClass = useFilterStore((s) => s.toggleVehicleClass);
  const setVehicleClasses = useFilterStore((s) => s.setVehicleClasses);
  const minSpeedKmh = useFilterStore((s) => s.minSpeedKmh);
  const maxSpeedKmh = useFilterStore((s) => s.maxSpeedKmh);
  const setSpeedRange = useFilterStore((s) => s.setSpeedRange);
  const setSelectedTrackId = useFilterStore((s) => s.setSelectedTrackId);
  const isFilteringActive = useFilterStore((s) => s.isFilteringActive);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const stats = useAnalyticsStore((s) => s.stats);

  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState(false);

  const vehicleClassMeta = useMemo(() => {
    const counts: Record<string, number> = {};
    if (stats?.classDistribution) {
      stats.classDistribution.forEach((d) => {
        counts[d.name] = d.count;
      });
    }
    return [
      { id: 'Car', label: 'Cars', color: '#1677FF', count: counts['Car'] ?? 0 },
      { id: 'Bus', label: 'Buses', color: '#18B979', count: counts['Bus'] ?? 0 },
      { id: 'Three Wheeler', label: 'Three Wheelers', color: '#F79009', count: counts['Three Wheeler'] ?? 0 },
      { id: 'Two Wheeler', label: 'Two Wheelers', color: '#7A5AF8', count: counts['Two Wheeler'] ?? 0 },
      { id: 'HCV', label: 'HCV', color: '#FF4D5A', count: counts['HCV'] ?? 0 },
      { id: 'LCV', label: 'LCV', color: '#06AED4', count: counts['LCV'] ?? 0 },
      { id: 'Pedestrian', label: 'Pedestrians', color: '#EC4899', count: counts['Pedestrian'] ?? 0 },
    ];
  }, [stats]);

  const speedPresets = [
    { label: 'All Speeds', min: null, max: null },
    { label: '< 20 km/h (Slow)', min: 0, max: 20 },
    { label: '20–50 km/h', min: 20, max: 50 },
    { label: '> 50 km/h (Fast)', min: 50, max: 200 },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trackId = parseInt(searchInput.trim(), 10);
    if (!isNaN(trackId) && trajectoryService.trackExists(trackId)) {
      setSelectedTrackId(trackId);
      setSearchError(false);
    } else {
      setSearchError(true);
      setTimeout(() => setSearchError(false), 2000);
    }
  };

  const isAllClasses = selectedClasses.length === ALL_VEHICLE_CLASSES.length;

  return (
    <div className="bg-white dark:bg-[#162032] rounded-xl border border-[#E6EAF0] dark:border-[#27354A] p-2.5 shadow-[0_1px_3px_0_rgba(16,33,63,0.04)] flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-colors duration-200">
      {/* Left: Class Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-[#667085] dark:text-[#94A3B8] flex items-center gap-1 mr-1">
          <LuFilter className="w-3.5 h-3.5 text-[#1677FF] dark:text-[#38BDF8]" />
          <span>Filter:</span>
        </span>

        {/* All Button */}
        <button
          type="button"
          onClick={() => setVehicleClasses([...ALL_VEHICLE_CLASSES])}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
            isAllClasses
              ? 'bg-[#10213F] dark:bg-[#38BDF8] text-white dark:text-[#0B111E] font-bold shadow-xs'
              : 'bg-[#F7F9FC] dark:bg-[#1E293B] text-[#667085] dark:text-[#94A3B8] hover:text-[#10213F] dark:hover:text-white border border-slate-200/60 dark:border-slate-700'
          }`}
        >
          All ({stats ? stats.totalUniqueVehicles : 608})
        </button>

        {/* Class Chips */}
        {vehicleClassMeta.map((item) => {
          const isSelected = selectedClasses.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleVehicleClass(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                isSelected
                  ? 'border-transparent text-white shadow-xs'
                  : 'border-slate-200/60 dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1E293B] text-[#98A2B3] dark:text-slate-400 hover:text-[#667085] dark:hover:text-slate-200'
              }`}
              style={{
                backgroundColor: isSelected ? item.color : undefined,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isSelected ? '#FFFFFF' : item.color,
                }}
              />
              <span>{item.label}</span>
              <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#98A2B3] dark:text-slate-500'}`}>
                ({item.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Center / Right: Speed Preset Selector & Track Search */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Speed Filter Selector */}
        <div className="flex items-center gap-1 bg-[#F7F9FC] dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700 rounded-lg p-0.5">
          <LuGauge className="w-3 h-3 text-[#667085] dark:text-[#94A3B8] ml-1.5" />
          {speedPresets.map((preset) => {
            const isCurrent =
              minSpeedKmh === preset.min && maxSpeedKmh === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setSpeedRange(preset.min, preset.max)}
                className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-white dark:bg-[#0B111E] text-[#10213F] dark:text-white font-semibold shadow-xs border border-slate-200/50 dark:border-slate-700'
                    : 'text-[#667085] dark:text-[#94A3B8] hover:text-[#10213F] dark:hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Track ID Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Track ID..."
            className={`w-36 px-2.5 py-1 pr-7 text-[11px] bg-[#F7F9FC] dark:bg-[#1E293B] border rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#0B111E] transition-all text-[#10213F] dark:text-white placeholder:text-[#98A2B3] dark:placeholder:text-slate-500 ${
              searchError
                ? 'border-[#FF4D5A] ring-1 ring-[#FF4D5A]'
                : 'border-slate-200/80 dark:border-slate-700 focus:border-[#1677FF] dark:focus:border-[#38BDF8]'
            }`}
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1 text-[#667085] dark:text-[#94A3B8] hover:text-[#1677FF] dark:hover:text-[#38BDF8] cursor-pointer"
            title="Search Vehicle"
          >
            <LuSearch className="w-3 h-3" />
          </button>
        </form>

        {/* Reset Filters Button */}
        {isFilteringActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FFF0F1] dark:bg-rose-950/40 hover:bg-[#FFE4E6] dark:hover:bg-rose-900/50 text-[#FF4D5A] dark:text-rose-300 border border-[#FF4D5A]/30 dark:border-rose-800/60 transition-colors cursor-pointer"
            title="Reset All Filters"
          >
            <LuRotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
