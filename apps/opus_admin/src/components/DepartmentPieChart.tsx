import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Engineering", value: 400 },
  { name: "Sales", value: 300 },
  { name: "Marketing", value: 300 },
  { name: "HR", value: 200 },
  { name: "Design", value: 150 },
];

const COLORS = ["#C9A0DC", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e"];

export function DepartmentPieChart() {
  return (
    <div className="bg-white p-6 justify-between flex flex-col rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full min-h-[300px]">
      <div className="mb-4 text-[15px] font-medium text-gray-900">Department Distribution</div>
      <div className="flex-1 w-full min-h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
