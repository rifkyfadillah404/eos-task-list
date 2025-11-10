import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from 'recharts';

export const CompletionRadial = ({ completionRate, completed, remaining }) => {
  const data = [{ name: 'Completion', value: completionRate, fill: '#34d399' }];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Completion Index</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">{completionRate}%</h3>
            <p className="mt-1 text-xs text-slate-500">{completed} done · {remaining} remaining</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
            Updated live
          </div>
        </div>
      </div>
      <div className="relative -mt-4 h-64 pb-6">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="55%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              minAngle={15}
              dataKey="value"
              cornerRadius={24}
              fill="#34d399"
              clockWise
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Completion']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-semibold text-slate-900">{completionRate}%</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};
