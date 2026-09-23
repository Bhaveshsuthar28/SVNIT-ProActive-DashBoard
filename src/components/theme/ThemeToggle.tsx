import React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useThemeStore } from '../../stores/themeStore';

export const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="p-2 rounded-lg text-[#667085] hover:text-[#10213F] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] bg-white dark:bg-[#162032] border border-[#E6EAF0] dark:border-[#27354A] shadow-[0_1px_2px_0_rgba(16,33,63,0.05)] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
    >
      {isDark ? (
        <LuSun className="w-4 h-4 stroke-[2.2] text-[#F79009] animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <LuMoon className="w-4 h-4 stroke-[2.2] text-[#667085] animate-in fade-in zoom-in-75 duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;
