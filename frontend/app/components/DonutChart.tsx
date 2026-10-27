"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

type DonutChartProps = {
  used: number;
  total: number;
  avail: number;
  unit?: string;
  label?: string;
};

export default function DonutChart({
  used,
  avail,
  unit,
  total,
  label = "Memory Usage",
}: DonutChartProps) {
  const safeTotal = Math.max(0, total);
  const safeAvail = Math.max(0, avail);
  const safeUsed = Math.min(Math.max(0, used), safeTotal);

  const percentage = safeTotal > 0 ? (safeUsed / safeTotal) * 100 : 0;
  

  const data = [
    { name: "Used", value: safeUsed },
    { name: "Available", value: safeTotal - safeUsed },
  ];

  const colors = ["#a855f7", "#1e293b"];

  return (
    <div className="w-full  rounded-2xl border border-slate-800 bg-slate-950 p-6">
      <h3 className="text-lg font-semibold text-white">
        {label}
      </h3>

      <div className="relative aspect-[4/3] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold text-white">
            {percentage.toFixed(1)}%
          </span>
          <span className="mt-1 text-xs text-slate-400">
            Used
          </span>
        </div>
      </div>

      <div className="flex justify-between text-sm text-slate-400">
        <span className="text-amber-400/80">{Math.trunc(safeUsed)} {unit} used</span>
        <span className="text-emerald-400">{Math.trunc(safeAvail)} {unit} available</span>
        <span>{Math.trunc(safeTotal)} {unit} total</span>
      </div>
    </div>
  );
}
