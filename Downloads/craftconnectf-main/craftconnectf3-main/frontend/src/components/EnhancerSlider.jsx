import React, { useState, useMemo } from "react";

const EnhancerSlider = ({ originalUrl, enhancedUrl }) => {
  const [position, setPosition] = useState(50);
  const styleVars = useMemo(() => ({ "--position": `${position}%` }), [position]);

  return (
    <div className="w-full relative bg-white dark:bg-[#221810]/50 rounded-xl shadow-lg overflow-hidden border border-[#f4f2f0] dark:border-[#221810]/50 group image-comparison-slider" style={styleVars}>
      <div className="relative aspect-[16/9] select-none">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${enhancedUrl})` }} />
        <div className="absolute inset-0 bg-cover bg-center image-original" style={{ backgroundImage: `url(${originalUrl})` }} />
        <div className="absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase backdrop-blur-sm bg-white/70 dark:bg-[#221810]/70 text-[#333333] dark:text-[#f8f7f6] z-10">Original</div>
        <div className="absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase backdrop-blur-sm bg-white/70 dark:bg-[#221810]/70 text-[#333333] dark:text-[#f8f7f6] z-10">AI Enhanced</div>
        <div className="slider-handle absolute inset-y-0 -ml-px flex cursor-col-resize items-center justify-center">
          <div className="relative h-full w-1 bg-white/50 backdrop-invert dark:bg-black/50">
            <button className="absolute top-1/2 -left-3.5 -mt-4 size-8 rounded-full bg-white dark:bg-black flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2">
              <span className="material-symbols-outlined !text-base text-[#333333] dark:text-[#f8f7f6] rotate-90">unfold_more</span>
            </button>
          </div>
        </div>
      </div>
      <input
        aria-label="Percentage of before photo shown"
        className="absolute inset-0 w-full h-full cursor-col-resize appearance-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-full [&::-webkit-slider-thumb]:w-1/4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-full [&::-moz-range-thumb]:w-1/4"
        type="range" min={0} max={100} value={position} onChange={(e)=>setPosition(Number(e.target.value))}
      />
    </div>
  );
};

export default EnhancerSlider;
