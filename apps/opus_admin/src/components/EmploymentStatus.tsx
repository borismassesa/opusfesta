import { useMemo } from "react";
import { cn } from "../lib/utils";

export function EmploymentStatus() {
  const bars = 100;
  
  // Custom function to generate a symmetrical "wave" or "pill" shape heights
  const generateHeights = (count: number, isWavy: boolean = true) => {
    return Array.from({ length: count }).map((_, i) => {
      const normalized = i / (count - 1); // 0 to 1
      if (isWavy) {
        // A shape that bulges on edges and pinches in middle, like the image
        // Use a cosine wave: 0.5 + 0.5 * cos(2 * PI * normalized) -> 1 at edges, 0 at middle
        const pinch = 0.4 + 0.6 * Math.cos(2 * Math.PI * normalized);
        return 16 + (pinch * 16); // height between 16px and 32px
      }
      return 32;
    });
  };

  const permanentHeights = useMemo(() => generateHeights(35, true), []);
  const contractHeights = useMemo(() => generateHeights(40, true), []);
  const probationHeights = useMemo(() => generateHeights(20, true), []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between w-full h-full">
      <h3 className="text-[15px] font-medium text-gray-900 mb-6">Employment Status</h3>
      
      <div className="mb-8">
        <div className="flex items-center gap-2 h-10 w-full mb-2 overflow-hidden">
          <div className="flex gap-[1px] items-center h-full w-[20%]">
             {probationHeights.map((h, i) => (
                <div key={i} className="flex-1 bg-red-500 rounded-full" style={{ height: `${h}px` }} />
             ))}
          </div>
          <div className="flex gap-[1px] items-center h-full w-[32%]">
             {contractHeights.map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500 rounded-full" style={{ height: `${h}px` }} />
             ))}
          </div>
          <div className="flex gap-[1px] items-center h-full w-[48%]">
             {permanentHeights.map((h, i) => (
                <div key={i} className="flex-1 bg-[#C9A0DC] rounded-full" style={{ height: `${h}px` }} />
             ))}
          </div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-600 px-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-md bg-[#C9A0DC]"></div>
            <span className="text-sm font-medium text-gray-700">Permanent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">324</span>
            <span className="text-xs font-semibold text-gray-400">48%</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-md bg-emerald-500"></div>
            <span className="text-sm font-medium text-gray-700">Contract</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-2xl font-semibold text-gray-900">121</span>
             <span className="text-xs font-semibold text-gray-400">32%</span>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-md bg-red-500"></div>
            <span className="text-sm font-medium text-gray-700">Probation</span>
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-2xl font-semibold text-gray-900">72</span>
             <span className="text-xs font-semibold text-gray-400">20%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
