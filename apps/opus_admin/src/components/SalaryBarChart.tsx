import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", Base: 4000, Bonus: 2400 },
  { name: "Feb", Base: 3000, Bonus: 1398 },
  { name: "Mar", Base: 2000, Bonus: 9800 },
  { name: "Apr", Base: 2780, Bonus: 3908 },
  { name: "May", Base: 1890, Bonus: 4800 },
  { name: "Jun", Base: 2390, Bonus: 3800 },
];

export function SalaryBarChart() {
  return (
    <div className="bg-white p-6 justify-between flex flex-col rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full min-h-[300px]">
      <div className="mb-4 text-[15px] font-medium text-gray-900">Payroll Trends</div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Base" stackId="a" fill="#C9A0DC" radius={[0, 0, 4, 4]} barSize={16} />
            <Bar dataKey="Bonus" stackId="a" fill="#E8D5EE" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
