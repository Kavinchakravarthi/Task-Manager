import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CircleDashed, ClipboardList, Clock3 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { TaskItem } from '../types/task';
import { DashboardSkeleton } from '../components/LoadingSkeleton';

type TaskRow = {
  id: string;
  title: string;
  code: string;
  status: string;
  priority: string;
  assignee: string;
  assignedBy: string;
  due: string;
  updated: string;
};

const formatDueDate = (value?: string | null) => {
  if (!value) return '—';

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<TaskItem['status'] | ''>('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks', { params: { limit: 1000 } });
        setTasks(response.data.data?.tasks || []);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((task) => task.status === 'Todo').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length;
  const completedTasks = tasks.filter((task) => task.status === 'Done').length;
  const assignedToUser = tasks.filter((task) => task.assignee?._id === user?._id).length;
  const currentUserId = user?.id || user?._id;

  const visibleTasks = selectedStatus ? tasks.filter((task) => task.status === selectedStatus) : tasks;
  const taskRows: TaskRow[] = visibleTasks.slice(0, 6).map((task) => ({
    id: task._id,
    title: task.title,
    code: `TF-${String(task._id || '').slice(-3).toUpperCase() || 'NEW'}`,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee?.name || 'Unassigned',
    assignedBy: task.creator?._id === currentUserId ? 'You' : task.creator?.name || 'Unknown',
    due: formatDueDate(task.dueDate),
    updated: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
  }));

  const cards = [
    { label: 'Total Tasks', value: totalTasks, change: `${totalTasks} currently tracked`, icon: ClipboardList, status: '' },
    { label: 'To Do', value: todoTasks, change: `${assignedToUser} assigned to you`, icon: CircleDashed, status: 'Todo' },
    { label: 'In Progress', value: inProgressTasks, change: `${inProgressTasks} currently active`, icon: Clock3, status: 'In Progress' },
    { label: 'Completed', value: completedTasks, change: `${completedTasks} marked done`, icon: CheckCircle2, status: 'Done' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#1d1d1f]">
      <div className="flex min-h-screen flex-1 flex-col">
          {loading ? <DashboardSkeleton /> : <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
            <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold sm:text-[32px]">{getGreeting()}, {user?.name?.split(' ')[0] || 'Alex'}</h1>
                <p className="mt-2 text-[16px] text-[#6b7280]">Here’s what’s happening with your tasks.</p>
              </div>
              <button onClick={() => navigate('/tasks/new')} className="rounded-xl bg-[#111111] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#1f2937]">+ Create Task</button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {cards.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => setSelectedStatus(card.status as TaskItem['status'] | '')}
                  className={`rounded-2xl border bg-[#f8f8f8] p-5 text-left transition hover:border-[#aeb6c2] hover:shadow-sm ${selectedStatus === card.status ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#d9d9d9]'}`}
                >
                  <div className="mb-2 flex items-center justify-between text-[14px] text-[#6b7280]">
                    <span>{card.label}</span>
                    <card.icon aria-hidden="true" className="h-5 w-5 text-[#4b5563]" strokeWidth={1.8} />
                  </div>
                  <div className="text-[40px] font-bold leading-none">{card.value}</div>
                  <div className={`mt-3 text-[14px] ${card.label === 'Total Tasks' ? 'text-[#16a34a]' : 'text-[#6b7280]'}`}>
                    {card.change}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-[#d9d9d9] bg-[#f8f8f8]">
              <div className="flex flex-col items-start gap-2 border-b border-[#d9d9d9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <h2 className="text-[18px] font-semibold">{selectedStatus ? `${selectedStatus} Tasks` : 'Recent Tasks'}</h2>
                <button onClick={() => navigate('/tasks')} className="text-[14px] font-medium text-[#2563eb] transition hover:underline">View my tasks →</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-[14px]">
                  <thead className="bg-[#f2f2f2] text-[#636363]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Task</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Priority</th>
                      <th className="px-5 py-3 font-medium">Assignee</th>
                      <th className="px-5 py-3 font-medium">Assigned By</th>
                      <th className="px-5 py-3 font-medium">Due Date</th>
                      <th className="px-5 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskRows.map((row, index) => (
                      <tr
                        key={`${row.id}-${index}`}
                        onClick={() => navigate(`/all-tasks/${row.id}`, { state: { from: '/dashboard' } })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/all-tasks/${row.id}`, { state: { from: '/dashboard' } });
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        className="cursor-pointer border-t border-[#d9d9d9] bg-white transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2563eb]"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#1d1d1f]">{row.title}</div>
                          <div className="text-[12px] text-[#6b7280]">{row.code}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium ${row.status === 'In Progress' ? 'border-[#93c5fd] bg-[#eff6ff] text-[#1d4ed8]' : row.status === 'In Review' ? 'border-[#facc15] bg-[#fefce8] text-[#a16207]' : row.status === 'Blocked' ? 'border-[#fca5a5] bg-[#fef2f2] text-[#b91c1c]' : 'border-[#d1d5db] bg-[#f3f4f6] text-[#374151]'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${row.priority === 'Urgent' ? 'bg-[#fee2e2] text-[#b91c1c]' : row.priority === 'High' ? 'bg-[#fef3c7] text-[#b45309]' : row.priority === 'Medium' ? 'bg-[#e0f2fe] text-[#1d4ed8]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5e7eb] text-[11px] font-semibold">{row.assignee.split(' ').map((word: string) => word[0]).slice(0, 2).join('')}</div>
                            <span>{row.assignee}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#4b5563]">{row.assignedBy}</td>
                        <td className="px-5 py-4 text-[#4b5563]">{row.due}</td>
                        <td className="px-5 py-4 text-[#4b5563]">{row.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          }
      </div>
    </div>
  );
}
