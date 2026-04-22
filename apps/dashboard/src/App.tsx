/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { StatCard } from "./components/StatCard";
import { KPIChart } from "./components/KPIChart";
import { SchedulePanel } from "./components/SchedulePanel";
import { TimeWorkedChart } from "./components/TimeWorkedChart";
import { EmploymentStatus } from "./components/EmploymentStatus";
import { DepartmentPieChart } from "./components/DepartmentPieChart";
import { SkillRadarChart } from "./components/SkillRadarChart";
import { SalaryBarChart } from "./components/SalaryBarChart";

export default function App() {
  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans antialiased text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 pb-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
            
            {/* Top row Stats */}
            <div className="col-span-1 lg:col-span-3">
              <StatCard title="Total Employee" value="218" trend="+6%" />
            </div>
            <div className="col-span-1 lg:col-span-3">
              <StatCard title="New Employee" value="48" trend="+6%" />
            </div>
            <div className="col-span-1 lg:col-span-3">
              <StatCard title="Resigned Employee" value="16" trend="+2%" />
            </div>

            {/* Schedule (Spans 2 rows) */}
            <div className="col-span-1 lg:col-span-3 lg:row-span-2 flex min-h-[500px]">
              <SchedulePanel />
            </div>

            {/* KPI Performance */}
            <div className="col-span-1 lg:col-span-9 flex min-h-[380px]">
              <div className="flex-1 w-full">
                <KPIChart />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="col-span-1 lg:col-span-6 flex min-h-[300px]">
              <TimeWorkedChart />
            </div>
            <div className="col-span-1 lg:col-span-6 flex min-h-[300px]">
              <EmploymentStatus />
            </div>
            
            {/* Third Row (New Charts) */}
            <div className="col-span-1 lg:col-span-4 flex min-h-[350px]">
              <DepartmentPieChart />
            </div>
            <div className="col-span-1 lg:col-span-4 flex min-h-[350px]">
              <SalaryBarChart />
            </div>
            <div className="col-span-1 lg:col-span-4 flex min-h-[350px]">
              <SkillRadarChart />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
