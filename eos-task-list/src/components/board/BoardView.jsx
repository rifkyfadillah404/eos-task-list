import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from '../tasks/TaskCard';
import { DroppableColumn } from './DroppableColumn';
import { DraggableTaskCard } from './DraggableTaskCard';

export const BoardView = ({ tasks, onTaskClick, onAddTask, onTaskMove }) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 5,
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const columns = [
    { id: 'plan', label: 'Plan', color: 'bg-gray-100' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
    { id: 'completed', label: 'Completed', color: 'bg-green-100' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const overData = over.data.current;

    // Check if dropped on a column
    if (overData?.type === 'Column') {
      const newStatus = over.id;
      if (['plan', 'in_progress', 'completed'].includes(newStatus)) {
        onTaskMove?.(taskId, newStatus);
      }
    }
    // Check if dropped on another task in a different column
    else if (overData?.type === 'Task') {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        onTaskMove?.(taskId, overTask.status);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeTask = tasks.find(task => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const taskIds = columnTasks.map(task => task.id);

          return (
            <SortableContext
              key={column.id}
              items={[column.id, ...taskIds]}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn
                column={column}
                tasks={columnTasks}
                onTaskClick={onTaskClick}
                onAddTask={() => onAddTask?.(column.id)}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-96 shadow-2xl rounded-lg overflow-hidden opacity-90">
            <TaskCard task={activeTask} onTaskClick={() => {}} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
