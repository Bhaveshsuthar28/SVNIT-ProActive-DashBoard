import React, { useEffect, useState } from 'react';
import { VideoPanel } from './components/video/VideoPanel';
import { TrafficHeatmap } from './components/heatmap/TrafficHeatmap';
import { KpiGrid } from './components/kpi/KpiGrid';
import { AnalyticsGrid } from './components/analytics/AnalyticsGrid';
import { TrafficDataExplorer } from './components/explorer/TrafficDataExplorer';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { LuLayoutDashboard, LuChartColumn, LuMapPin, LuChevronDown } from 'react-icons/lu';

import { useTrajectoryStore } from './stores/trajectoryStore';
import { useAnalyticsSync } from './hooks/useAnalyticsSync';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [selectedJunction, setSelectedJunction] = useState('Junction 67');
  const loadDataset = useTrajectoryStore((s) => s.loadDataset);

  // Initialize analytics synchronization with video timeline and trajectory engine
  useAnalyticsSync();

  // Enable keyboard shortcuts (Space, ArrowLeft, ArrowRight, Escape)
  useKeyboardShortcuts();

  // Initialize trajectory CSV loading in background on mount
  useEffect(() => {
    loadDataset('/data/trajectories.csv');
  }, [loadDataset]);

  // Ensure charts and canvases readjust instantly when returning to the dashboard view
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B111E] text-[#10213F] dark:text-[#F1F5F9] px-5 py-3 max-w-[1920px] mx-auto select-none font-sans transition-colors duration-200">
      {/* Top Header: Left Title & Right Navigation + Big Rectangular Junction Selector + Theme Toggle */}
      <header className="flex items-center justify-between py-2.5 mb-3 border-b border-[#E6EAF0]/80 dark:border-[#27354A]/80">
        {/* Left Corner: Clean Title Only */}
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-black tracking-[0.16em] text-[#10213F] dark:text-[#F1F5F9] uppercase leading-none whitespace-nowrap transition-colors duration-200">
            ProActive Dashboard
          </h1>
        </div>

        {/* Right Corner: Navigation Items + Big Rectangle Junction Selector + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Navigation Items (Dashboard & Analytics) */}
          <nav className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'dashboard'
                  ? 'bg-[#1677FF] text-white border-[#1677FF] shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LuLayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'analytics'
                  ? 'bg-[#1677FF] text-white border-[#1677FF] shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LuChartColumn className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </nav>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Big & Proper Rectangle Junction Selector */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-[#162032] border border-slate-300 dark:border-slate-600 rounded-none shadow-xs text-xs font-semibold text-[#10213F] dark:text-[#F1F5F9] transition-colors duration-200">
            <LuMapPin className="w-4 h-4 text-[#1677FF] dark:text-[#38BDF8] shrink-0" />
            <span className="text-xs font-semibold text-[#667085] dark:text-[#94A3B8] uppercase tracking-wider hidden md:inline">
              Junction:
            </span>
            <div className="relative flex items-center">
              <select
                value={selectedJunction}
                onChange={(e) => setSelectedJunction(e.target.value)}
                className="appearance-none bg-transparent pl-1 pr-6 py-0.5 text-xs font-semibold text-[#10213F] dark:text-[#F1F5F9] outline-none cursor-pointer"
              >
                <option value="Junction 67" className="bg-white dark:bg-[#162032] text-[#10213F] dark:text-[#F1F5F9] py-2 px-3 font-semibold">
                  Junction 67
                </option>
              </select>
              <LuChevronDown className="absolute right-0 w-3.5 h-3.5 text-[#667085] dark:text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Layout Based on Active Nav Item (Both preserved in DOM so video plays continuously in background) */}
      <main
        className={
          activeTab === 'dashboard'
            ? 'space-y-3.5 block'
            : 'invisible h-0 overflow-hidden absolute pointer-events-none -z-50'
        }
      >
        {/* Row 1: Video Player (Left) & Static Traffic Heatmap (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <VideoPanel />
          <TrafficHeatmap />
        </section>

        {/* Row 2: 6 Dynamic Trajectory KPI Cards with Mini Sparklines */}
        <KpiGrid />

        {/* Rows 3 & 4: Live Trajectory Analytics Charts */}
        <AnalyticsGrid />
      </main>

      <main
        className={
          activeTab === 'analytics'
            ? 'block'
            : 'invisible h-0 overflow-hidden absolute pointer-events-none -z-50'
        }
      >
        {/* Second Page: Detailed Table Analytics + Frame/Time Search */}
        <TrafficDataExplorer />
      </main>
    </div>
  );
};

export default App;
