import React, { useState } from 'react';
import {
  LuSunMedium,
  LuCircleDot,
  LuDroplets,
  LuTriangle,
  LuAperture,
  LuSplit,
  LuSparkles,
  LuSunDim,
} from 'react-icons/lu';

export interface VideoEnhancementProps {
  onReset?: () => void;
}

export const VideoEnhancement: React.FC<VideoEnhancementProps> = ({ onReset }) => {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [exposure, setExposure] = useState(0);

  const [grayscale, setGrayscale] = useState(false);
  const [denoise, setDenoise] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSharpness(0);
    setExposure(0);
    setGrayscale(false);
    setDenoise(false);
    setHighContrast(false);
    onReset?.();
  };

  return (
    <div className="absolute top-3 right-3 w-[210px] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200/80 z-20 text-[11px] select-none">
      <div className="font-semibold text-[#10213F] mb-2.5">
        Video Enhancement
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        {/* Brightness */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 w-[76px] text-[#667085] shrink-0">
            <LuSunMedium className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[10px]">Brightness</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
          />
          <span className="w-3 text-right text-[10px] text-[#667085] tabular-nums font-mono">
            {brightness}
          </span>
        </div>

        {/* Contrast */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 w-[76px] text-[#667085] shrink-0">
            <LuCircleDot className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[10px]">Contrast</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
          />
          <span className="w-3 text-right text-[10px] text-[#667085] tabular-nums font-mono">
            {contrast}
          </span>
        </div>

        {/* Saturation */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 w-[76px] text-[#667085] shrink-0">
            <LuDroplets className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[10px]">Saturation</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
          />
          <span className="w-3 text-right text-[10px] text-[#667085] tabular-nums font-mono">
            {saturation}
          </span>
        </div>

        {/* Sharpness */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 w-[76px] text-[#667085] shrink-0">
            <LuTriangle className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[10px]">Sharpness</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={sharpness}
            onChange={(e) => setSharpness(Number(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
          />
          <span className="w-3 text-right text-[10px] text-[#667085] tabular-nums font-mono">
            {sharpness}
          </span>
        </div>

        {/* Exposure */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 w-[76px] text-[#667085] shrink-0">
            <LuAperture className="w-3.5 h-3.5 text-[#667085]" />
            <span className="text-[10px]">Exposure</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={exposure}
            onChange={(e) => setExposure(Number(e.target.value))}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
          />
          <span className="w-3 text-right text-[10px] text-[#667085] tabular-nums font-mono">
            {exposure}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-2.5 border-t border-slate-100" />

      {/* Toggle switches */}
      <div className="space-y-2">
        {/* Grayscale */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#667085]">
            <LuSplit className="w-3.5 h-3.5" />
            <span className="text-[10px]">Grayscale</span>
          </div>
          <button
            type="button"
            onClick={() => setGrayscale(!grayscale)}
            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              grayscale ? 'bg-[#1677FF]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                grayscale ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Denoise */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#667085]">
            <LuSparkles className="w-3.5 h-3.5" />
            <span className="text-[10px]">Denoise</span>
          </div>
          <button
            type="button"
            onClick={() => setDenoise(!denoise)}
            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              denoise ? 'bg-[#1677FF]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                denoise ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#667085]">
            <LuSunDim className="w-3.5 h-3.5" />
            <span className="text-[10px]">High Contrast</span>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              highContrast ? 'bg-[#1677FF]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                highContrast ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-2.5 pt-1 text-right">
        <button
          type="button"
          onClick={handleReset}
          className="text-[#1677FF] hover:text-[#0958D9] text-[10px] font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default VideoEnhancement;
