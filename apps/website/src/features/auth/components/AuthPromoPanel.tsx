"use client";

export function AuthPromoPanel() {
  return (
    <div className="w-full max-w-xl px-8 py-12 text-white flex flex-col items-center lg:items-start space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🗓️</span>
        <h2 className="text-3xl font-bold tracking-tight">
          Have you used Our Planner?
        </h2>
      </div>

      {/* Stylized Calendar Card */}
      <div className="relative w-full bg-[#f8f6ff] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[300px]">
        {/* Mockup Left Side (Tasks) */}
        <div className="flex-1 p-6 space-y-4 text-gray-800">
          <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 border border-blue-100">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">
              31
            </div>
            <div>
              <div className="text-xs font-bold">Morning Briefing</div>
              <div className="text-[10px] text-gray-500">
                9:00am - 9:30am
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-lg flex items-center justify-between border border-red-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-400 rounded-full" />
              <div className="text-xs font-semibold">Vendor Selection</div>
            </div>
            <div className="text-[10px] bg-red-100/50 px-2 py-0.5 rounded text-red-600 flex items-center gap-1 font-bold">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              1h
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg flex items-center justify-between border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-400 rounded-full" />
              <div className="text-xs font-semibold">Venue Tour</div>
            </div>
            <div className="text-[10px] bg-purple-100/50 px-2 py-0.5 rounded text-purple-600 flex items-center gap-1 font-bold">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              2h
            </div>
          </div>

          <div className="bg-[#f0f4ff] p-4 rounded-xl relative overflow-hidden">
            <div className="w-1 h-full bg-[#4f6cf6] absolute left-0 top-0" />
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <span className="text-xs font-bold uppercase">
                Final Party Setup
              </span>
            </div>
            <div className="text-[11px] font-bold text-gray-700">
              2:15pm - 5:15pm
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <span className="text-purple-400 text-xs animate-pulse">✦</span>
              <span className="text-purple-400 text-sm ml-2">✦</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-[#2d5cf6] text-white py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-[#1d4ce6] transition-all mt-2 pointer-events-none"
            tabIndex={-1}
            aria-hidden
          >
            <span className="text-xl">+</span> Add celebration block
          </button>
        </div>

        <div className="flex-1 relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
            alt="Celebration Planning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f8f6ff] via-transparent to-transparent" />
        </div>
      </div>

      <div className="space-y-6 text-center lg:text-left">
        <p className="text-lg opacity-90 font-light leading-relaxed">
          Take the stress out of planning and prioritizing your events.
        </p>

        <ul className="space-y-3 opacity-90">
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
            <span>Get one clear view of your events and guest lists</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
            <span>
              Use time blocks to plan your day and log vendor interactions
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
            <span>Easily sync your calendar for more visibility</span>
          </li>
        </ul>

        <p className="text-sm font-medium opacity-80 pt-4">
          Log in and click the{" "}
          <span className="underline decoration-purple-400 decoration-2 underline-offset-4">
            Event Calendar
          </span>{" "}
          tab to check it out now!
        </p>
      </div>
    </div>
  );
}
