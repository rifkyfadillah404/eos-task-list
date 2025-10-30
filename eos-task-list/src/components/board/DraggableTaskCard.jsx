import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from '../tasks/TaskCard';

export const DraggableTaskCard = ({ task, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        transition-all duration-200 ease-out
        ${isDragging
          ? 'cursor-grabbing shadow-2xl z-50'
          : 'cursor-grab hover:shadow-lg hover:-translate-y-1'
        }
        ${isOver ? 'ring-2 ring-indigo-500' : ''}
      `}
    >
      <TaskCard
        task={task}
        onTaskClick={onTaskClick}
        isDragging={isDragging}
      />
    </div>
  );
};
