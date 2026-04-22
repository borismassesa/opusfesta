import { Bell, CloudDownload, HelpCircle, Search, ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between py-6 px-8 bg-gray-50/50 relative z-10 w-full shrink-0">
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h1>

      <div className="flex items-center gap-6">
        <div className="relative group flex items-center">
          <Search className="w-5 h-5 text-gray-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl w-72 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
          />
          <div className="absolute right-3 flex items-center justify-center border border-gray-100 rounded px-1.5 py-0.5 bg-gray-50">
            <span className="text-[10px] text-gray-400 font-medium">⌘K</span>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          <CloudDownload className="w-4 h-4" />
          Export
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 border-2 border-gray-50 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 ml-2 cursor-pointer group">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Adam Taylor"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-gray-900">Adam Taylor</span>
            <span className="text-xs text-gray-500">ataylor@mail.com</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-2 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
