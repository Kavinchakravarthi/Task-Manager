import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleDashed, Clock3 } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TaskBoardSkeleton } from '../components/LoadingSkeleton';

const pageSize = 6;

export default function TaskBoardPage({ showAllTasks = false }: { showAllTasks?: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(() => searchParams.get('status') || '');
  const [priority, setPriority] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const userId = user?.id || user?._id;

  const fetchTasks = async () => {
    setLoading(true);
    setError('');

    if (!userId) {
      setTasks([]);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/tasks', {
        params: {
          ...(showAllTasks ? {} : { assignee: userId }),
          search,
          status,
          priority,
          sortField,
          sortOrder,
          page,
          limit: pageSize
        }
      });

      const values = response.data.data?.tasks || [];
      setTasks(values);
      setTotalPages(response.data.data?.pagination?.totalPages || 1);
      setTotalTasks(response.data.data?.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to fetch tasks');
      setTasks([]);
      setTotalTasks(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId, showAllTasks, search, status, priority, sortField, sortOrder, page]);

  const summary = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === 'Todo').length,
      inProgress: tasks.filter((task) => task.status === 'In Progress').length,
      done: tasks.filter((task) => task.status === 'Done').length
    };
  }, [tasks]);

  const summaryCards = [
    { label: 'Todo', value: summary.todo, icon: CircleDashed },
    { label: 'In Progress', value: summary.inProgress, icon: Clock3 },
    { label: 'Done', value: summary.done, icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-[#edf1f4] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {loading ? <TaskBoardSkeleton /> : <>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-[#dfe4ea] bg-[#f8f9fb] p-4 shadow-sm">
              <div className="flex items-center justify-between text-[15px] text-slate-500">
                <p>{card.label}</p>
                <card.icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <p className="mt-2 text-[42px] font-bold leading-none text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#dfe4ea] bg-[#f8f9fb] p-4 shadow-sm">
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="h-12 rounded-xl border border-[#d1d9e2] bg-white px-3 text-[15px] text-slate-700 outline-none focus:border-blue-500"
              placeholder="Search tasks"
            />

            <select
              value={status}
              onChange={(e) => { setPage(1); setStatus(e.target.value); }}
              className="h-12 rounded-xl border border-[#d1d9e2] bg-white px-3 text-[15px] text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">All statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select
              value={priority}
              onChange={(e) => { setPage(1); setPriority(e.target.value); }}
              className="h-12 rounded-xl border border-[#d1d9e2] bg-white px-3 text-[15px] text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">All priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="mb-5 flex justify-stretch sm:justify-end">
            <select
              value={`${sortField}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(':');
                setSortField(field);
                setSortOrder(order);
              }}
              className="h-12 w-full rounded-xl border border-[#d1d9e2] bg-white px-3 text-[15px] text-slate-700 outline-none focus:border-blue-500 sm:w-[220px]"
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="priority:desc">Priority high to low</option>
            </select>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              No tasks found for the current filters.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onSelect={(id) => navigate(`${showAllTasks ? '/all-tasks' : '/tasks'}/${id}`, { state: { from: showAllTasks ? '/all-tasks' : '/tasks' } })}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="order-first w-full text-center text-sm text-slate-600 sm:order-none sm:w-auto">Page {page} of {totalPages} · {totalTasks} task{totalTasks === 1 ? '' : 's'}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        </>}
      </div>
    </div>
  );
}
