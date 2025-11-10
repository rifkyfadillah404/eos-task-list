export const FilterButtons = ({ options, selected, onSelect, color = 'indigo' }) => {
  const getColorClasses = (isSelected) => {
    if (isSelected) {
      return color === 'purple' 
        ? 'bg-purple-600 text-white shadow-md'
        : color === 'cyan'
        ? 'bg-cyan-600 text-white shadow-md'
        : 'bg-indigo-600 text-white shadow-md';
    }
    return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${getColorClasses(selected === option.value)}`}
        >
          {option.icon && <span className="mr-1">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};
