import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

export default function ExerciseHistoryChart({ data, height = 250 }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-[#f0f]" /> Exercises per Session
      </h2>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#999" />
          <YAxis stroke="#999" allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
            formatter={v => [v, 'Exercises']}
          />
          <Legend />
          <defs>
            <linearGradient id="exerciseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f0f" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f0f" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="count"
            name="Exercises"
            stroke="#f0f"
            fill="url(#exerciseFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
