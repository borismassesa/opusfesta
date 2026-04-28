import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { subject: "Communication", Q3: 120, Q4: 110, fullMark: 150 },
  { subject: "Technical", Q3: 98, Q4: 130, fullMark: 150 },
  { subject: "Leadership", Q3: 86, Q4: 130, fullMark: 150 },
  { subject: "Teamwork", Q3: 99, Q4: 100, fullMark: 150 },
  { subject: "Problems", Q3: 85, Q4: 90, fullMark: 150 },
  { subject: "Creativity", Q3: 65, Q4: 85, fullMark: 150 },
];

export function SkillRadarChart() {
  return (
    <div className="bg-white p-6 justify-between flex flex-col rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full min-h-[300px]">
      <div className="mb-4 text-[15px] font-medium text-gray-900">Team Capabilities</div>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
            <Radar name="Q3 Team A" dataKey="Q3" stroke="#C9A0DC" fill="#C9A0DC" fillOpacity={0.4} />
            <Radar name="Q4 Team B" dataKey="Q4" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Tooltip
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
