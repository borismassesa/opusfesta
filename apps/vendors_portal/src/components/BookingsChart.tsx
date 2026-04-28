'use client'

import { TrendingUp } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BookingsRevenuePoint } from '@/lib/mock-data'

export function BookingsChart({ data }: { data: BookingsRevenuePoint[] }) {
  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-medium text-gray-900 mb-3">Bookings & revenue</h3>
          <div className="flex items-baseline gap-4">
            <div>
              <p className="text-2xl font-semibold text-gray-900 tracking-tight tabular-nums">
                {totalBookings}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">
                Bookings
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 tracking-tight tabular-nums">
                TSh {totalRevenue}M
              </p>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">
                Revenue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            +24% vs prior 6 months
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C9A0DC]" />
            Bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7E5896]" />
            Revenue (TSh M)
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
              width={28}
              tickFormatter={(v) => `${v}M`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                fontSize: 12,
              }}
              formatter={(value, name) =>
                name === 'revenue' ? [`TSh ${value}M`, 'Revenue'] : [value, 'Bookings']
              }
            />
            <Bar
              yAxisId="left"
              dataKey="bookings"
              fill="#C9A0DC"
              radius={[6, 6, 0, 0]}
              barSize={22}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#7E5896"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#7E5896', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
