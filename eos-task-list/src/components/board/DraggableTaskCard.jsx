import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from '../tasks/TaskCard';

export const DraggableTaskCard = ({ task, onTaskClick }) => {
  const animateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({
      ...args,
      wasDragging: true,
    });

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
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      'transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 120ms ease',
    opacity: isDragging ? 0.5 : 1,
    willChange: 'transform',
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
