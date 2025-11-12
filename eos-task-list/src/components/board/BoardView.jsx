import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
  defaultDropAnimation,
  MouseSensor,
  TouchSensor,
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
import { CommentModal } from '../comments';

export const BoardView = ({ tasks, onTaskClick, onAddTask, onTaskMove, enableDrag = true, onRefreshTasks }) => {
  const [activeId, setActiveId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
      }
    };
    fetchJobs();
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 10,
      },
    })
  );

  const dropAnimation = {
    ...defaultDropAnimation,
    duration: 320,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

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

    const rawId = active.id;
    let taskId = rawId;
    if (typeof rawId === 'string') {
      const parsed = Number(rawId);
      taskId = Number.isNaN(parsed) ? rawId : parsed;
    }
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
      const overTask = tasks.find(t => String(t.id) === over.id);
      if (overTask) {
        onTaskMove?.(taskId, overTask.status);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeTask = tasks.find(task => String(task.id) === activeId);
  const activeStatus = activeTask?.status;

  if (!enableDrag) {
    return (
      <>
        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-6 px-2 sm:px-0 -mx-2 sm:mx-0">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-[280px] sm:w-80 md:w-96 rounded-lg p-3 sm:p-4 min-h-96 bg-transparent"
              >
                <div className={`${column.color} rounded-lg p-3 sm:p-4 mb-3 sm:mb-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">{column.label}</h3>
                    <span className="text-xs sm:text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 min-h-96">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskClick={onTaskClick}
                      isDragging={false}
                      statusVariant={task.status}
                      jobs={jobs}
                      onOpenComments={(task) => {
                        setSelectedTask(task);
                        setCommentModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment Modal - Must be outside DndContext */}
        <CommentModal
          isOpen={commentModalOpen}
          onClose={() => {
            setCommentModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onCommentAdded={() => {
            // Always refresh tasks to get updated comment count from server
            if (onRefreshTasks) {
              onRefreshTasks();
            }
          }}
        />
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      autoScroll={{
        enabled: true,
        acceleration: 0.08,
        interval: 12,
        threshold: { x: 0.15, y: 0.1 },
      }}
    >
      <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-6 px-2 sm:px-0 -mx-2 sm:mx-0">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const taskIds = columnTasks.map(task => String(task.id));

          return (
            <SortableContext
              key={column.id}
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn
                column={column}
                tasks={columnTasks}
                onTaskClick={onTaskClick}
                onAddTask={typeof onAddTask === 'function' ? () => onAddTask(column.id) : undefined}
                activeStatus={activeStatus}
                jobs={jobs}
                onOpenComments={(task) => {
                  setSelectedTask(task);
                  setCommentModalOpen(true);
                }}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="w-[280px] sm:w-80 md:w-96 shadow-2xl rounded-lg overflow-hidden opacity-90">
            <TaskCard task={activeTask} onTaskClick={() => {}} isDragging={true} statusVariant={activeTask.status} jobs={jobs} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onCommentAdded={(newCount) => {
          // Always refresh tasks to get updated comment count from server
          if (onRefreshTasks) {
            onRefreshTasks();
          }
        }}
      />
    </DndContext>
  );
};
