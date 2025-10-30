import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BoardView } from '../components/board/BoardView';
import { TaskForm } from '../components/tasks/TaskForm';

// Mock data
const mockTasks = [
  {
    id: 1,
    title: 'Design homepage mockup',
    description: 'Create a responsive homepage design',
    priority: 'high',
    category: 'Design',
    dueDate: '2025-11-05',
    assignee: 'Sarah',
    status: 'in_progress',
    comments: 3,
    attachments: 2,
  },
  {
    id: 2,
    title: 'Set up database schema',
    description: 'Design and implement PostgreSQL schema',
    priority: 'high',
    category: 'Backend',
    dueDate: '2025-11-01',
    assignee: 'John',
    status: 'todo',
    comments: 1,
    attachments: 0,
  },
  {
    id: 3,
    title: 'Integrate payment gateway',
    description: 'Add Stripe integration',
    priority: 'medium',
    category: 'Backend',
    dueDate: '2025-11-10',
    assignee: 'Mike',
    status: 'todo',
    comments: 0,
    attachments: 1,
  },
  {
    id: 4,
    title: 'Fix login bug',
    description: 'Users cannot login with email',
    priority: 'high',
    category: 'Bug',
    dueDate: '2025-10-30',
    assignee: 'John',
    status: 'in_progress',
    comments: 5,
    attachments: 0,
  },
  {
    id: 5,
    title: 'Write API documentation',
    description: 'Document all API endpoints',
    priority: 'low',
    category: 'Documentation',
    dueDate: '2025-11-15',
    assignee: 'Sarah',
    status: 'completed',
    comments: 2,
    attachments: 1,
  },
  {
    id: 6,
    title: 'Optimize image loading',
    description: 'Implement lazy loading for images',
    priority: 'medium',
    category: 'Frontend',
    dueDate: '2025-11-08',
    assignee: 'Mike',
    status: 'completed',
    comments: 0,
    attachments: 0,
  },
];

export const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('boards');
  const [tasks, setTasks] = useState(mockTasks);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddTask = (status) => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleSubmitTask = (formData) => {
    if (selectedTask) {
      // Update existing task
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...formData, id: t.id } : t));
    } else {
      // Add new task
      const newTask = {
        ...formData,
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        comments: 0,
        attachments: 0,
      };
      setTasks([...tasks, newTask]);
    }
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  };

  const handleTaskMove = (taskId, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Dashboard View */}
            {activeMenu === 'dashboard' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="card p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
                    <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
                    <div className="text-xs text-gray-500 mt-2">All tasks</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-sm text-gray-600 mb-1">In Progress</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {tasks.filter(t => t.status === 'in_progress').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Active tasks</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-sm text-gray-600 mb-1">Completed</div>
                    <div className="text-3xl font-bold text-green-600">
                      {tasks.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Done</div>
                  </div>
                  <div className="card p-6">
                    <div className="text-sm text-gray-600 mb-1">High Priority</div>
                    <div className="text-3xl font-bold text-red-600">
                      {tasks.filter(t => t.priority === 'high').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Urgent</div>
                  </div>
                </div>
              </div>
            )}

            {/* Board View */}
            {activeMenu === 'boards' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Project Board</h2>
                  <button className="btn-primary">
                    New Project
                  </button>
                </div>
                <BoardView
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                  onTaskMove={handleTaskMove}
                />
              </div>
            )}

            {/* Tasks List View */}
            {activeMenu === 'tasks' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">All Tasks</h2>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics View */}
            {activeMenu === 'analytics' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Task Completion Rate</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}% complete
                    </p>
                  </div>

                  <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="text-sm font-medium">{tasks.filter(t => t.priority === 'high').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Medium Priority</span>
                        <span className="text-sm font-medium">{tasks.filter(t => t.priority === 'medium').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Low Priority</span>
                        <span className="text-sm font-medium">{tasks.filter(t => t.priority === 'low').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team View */}
            {activeMenu === 'team' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Team Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['Sarah', 'John', 'Mike'].map((member) => (
                    <div key={member} className="card p-6 text-center">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-medium mx-auto mb-3">
                        {member.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-gray-900">{member}</h3>
                      <p className="text-sm text-gray-600">
                        {tasks.filter(t => t.assignee === member).length} tasks
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmitTask}
        task={selectedTask}
      />
    </div>
  );
};
