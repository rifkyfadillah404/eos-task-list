import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableTaskCard } from './DraggableTaskCard';

const accentMap = {
  plan: {
    base: 'bg-orange-50/70 border border-orange-100',
    over: 'bg-orange-100/90 ring-2 ring-orange-400 shadow-lg',
    active: 'bg-orange-50 ring-1 ring-orange-300',
    header: 'bg-orange-100 border border-orange-200',
    badge: 'bg-orange-600/10 text-orange-700',
  },
  in_progress: {
    base: 'bg-sky-50/60 border border-sky-100',
    over: 'bg-sky-100/90 ring-2 ring-sky-400 shadow-lg',
    active: 'bg-sky-50 ring-1 ring-sky-300',
    header: 'bg-sky-100 border border-sky-200',
    badge: 'bg-sky-600/10 text-sky-700',
  },
  completed: {
    base: 'bg-emerald-50/60 border border-emerald-100',
    over: 'bg-emerald-100/90 ring-2 ring-emerald-400 shadow-lg',
    active: 'bg-emerald-50 ring-1 ring-emerald-300',
    header: 'bg-emerald-100 border border-emerald-200',
    badge: 'bg-emerald-600/10 text-emerald-700',
  },
};

export const DroppableColumn = ({ column, tasks, onTaskClick, onAddTask, activeStatus }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
    },
  });

  const accent = accentMap[column.id] || {};
  const isActive = activeStatus === column.id;

  const containerClass = [
    'flex-shrink-0 w-96 max-w-full rounded-2xl p-4 min-h-96 transition-all duration-300 backdrop-blur-sm',
    accent.base,
    isOver ? accent.over || 'bg-slate-100 ring-2 ring-indigo-200 shadow-lg' : '',
    !isOver && isActive ? accent.active || 'bg-slate-100 ring-1 ring-indigo-200' : '',
    !isOver && !isActive ? '' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const headerClass = [
    'rounded-2xl p-4 mb-4 transition-all duration-300 border border-transparent',
    isOver || isActive ? accent.header || column.color : column.color,
    isOver ? 'shadow-md scale-[1.02]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeClass = [
    'text-sm font-medium px-2 py-1 rounded transition-all duration-300',
    isOver || isActive
      ? accent.badge || 'bg-white text-slate-700'
      : 'text-gray-600 bg-white',
    isOver ? 'scale-110' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={setNodeRef} className={containerClass}>
      {/* Column Header */}
      <div className={headerClass}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {column.label}
          </h3>
          <span className={badgeClass}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        className={`
          space-y-3 min-h-96 transition-opacity duration-300
          ${isOver ? 'opacity-80' : 'opacity-100'}
        `}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
          />
        ))}

        {/* Add Task Button */}
        {typeof onAddTask === 'function' && (
          <button
            onClick={onAddTask}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-lg
              border-2 border-dashed transition-all duration-300
              hover:scale-105
              ${isOver
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'border-gray-300 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 hover:border-indigo-300'
              }
              mt-4
            `}
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add task</span>
          </button>
        )}
      </div>
    </div>
  );
};
