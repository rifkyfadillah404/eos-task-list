import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableTaskCard } from './DraggableTaskCard';

export const DroppableColumn = ({ column, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-96 rounded-lg p-4 min-h-96
        transition-all duration-300
        ${isOver
          ? 'bg-indigo-100 scale-105 shadow-lg'
          : 'bg-transparent hover:bg-gray-50'
        }
      `}
    >
      {/* Column Header */}
      <div
        className={`
          ${column.color} rounded-lg p-4 mb-4
          transition-all duration-300
          ${isOver ? 'bg-indigo-200 ring-2 ring-indigo-400' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {column.label}
          </h3>
          <span
            className={`
              text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded
              transition-all duration-300
              ${isOver ? 'scale-110' : ''}
            `}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        className={`
          space-y-3 min-h-96
          transition-opacity duration-300
          ${isOver ? 'opacity-75' : 'opacity-100'}
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
