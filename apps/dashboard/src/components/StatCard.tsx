import { cn } from "../lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive?: boolean;
}

export function StatCard({ title, value, trend, isPositive = true }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between w-full h-full min-h-[140px]">
      <h3 className="text-[15px] font-medium text-gray-900 mb-6">{title}</h3>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold text-gray-900 tracking-tight">{value}</span>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}
        >
          {trend}
        </span>
        <span className="text-xs text-gray-400 font-medium tracking-wide">vs last month</span>
      </div>
    </div>
  );
}
