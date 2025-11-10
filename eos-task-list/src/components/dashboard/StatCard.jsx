export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'text-indigo-500 bg-indigo-100',
    sky: 'text-sky-500 bg-sky-100',
    emerald: 'text-emerald-500 bg-emerald-100',
    rose: 'text-rose-500 bg-rose-100',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${color === 'indigo' ? 'text-indigo-500' : color === 'sky' ? 'text-sky-500' : color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};
