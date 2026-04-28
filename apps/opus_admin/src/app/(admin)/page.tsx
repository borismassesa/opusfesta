'use client'

import dynamic from 'next/dynamic'
import { StatCard } from '@/components/StatCard'
import { SchedulePanel } from '@/components/SchedulePanel'

const KPIChart = dynamic(() => import('@/components/KPIChart').then(m => m.KPIChart), { ssr: false })
const TimeWorkedChart = dynamic(() => import('@/components/TimeWorkedChart').then(m => m.TimeWorkedChart), { ssr: false })
const EmploymentStatus = dynamic(() => import('@/components/EmploymentStatus').then(m => m.EmploymentStatus), { ssr: false })
const DepartmentPieChart = dynamic(() => import('@/components/DepartmentPieChart').then(m => m.DepartmentPieChart), { ssr: false })
const SkillRadarChart = dynamic(() => import('@/components/SkillRadarChart').then(m => m.SkillRadarChart), { ssr: false })
const SalaryBarChart = dynamic(() => import('@/components/SalaryBarChart').then(m => m.SalaryBarChart), { ssr: false })

export default function DashboardPage() {
  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
        <div className="col-span-1 lg:col-span-3">
          <StatCard title="Total Employee" value="218" trend="+6%" />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <StatCard title="New Employee" value="48" trend="+6%" />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <StatCard title="Resigned Employee" value="16" trend="+2%" />
        </div>

        <div className="col-span-1 lg:col-span-3 lg:row-span-2 flex min-h-[500px]">
          <SchedulePanel />
        </div>

        <div className="col-span-1 lg:col-span-9 flex min-h-[380px]">
          <div className="flex-1 w-full">
            <KPIChart />
          </div>
        </div>

        <div className="col-span-1 lg:col-span-6 flex min-h-[300px]">
          <TimeWorkedChart />
        </div>
        <div className="col-span-1 lg:col-span-6 flex min-h-[300px]">
          <EmploymentStatus />
        </div>

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
    </div>
  )
}
