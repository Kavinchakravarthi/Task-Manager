import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { FieldErrors, getApiErrorMessage, getApiFieldErrors, inputErrorClass } from '../utils/validation';
import { TaskFormSkeleton } from '../components/LoadingSkeleton';

const initialState = {
  title: '',
  description: '',
  status: 'Todo',
  priority: 'Medium',
  startDate: '',
  dueDate: '',
  assignee: ''
};

const dateInputValue = (value?: string | null) => value ? new Date(value).toISOString().slice(0, 10) : '';
const todayInputValue = () => new Date().toISOString().slice(0, 10);

export default function TaskFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const returnPath = location.state?.from === '/dashboard' ? '/dashboard' : '/tasks';
  const [form, setForm] = useState(initialState);
  const [users, setUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const today = todayInputValue();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data.data || []);
      } catch {
        setUsers([]);
      }
    };

    loadUsers();

    if (isEdit) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/tasks/${id}`);
          setForm({
            title: response.data.data.title,
            description: response.data.data.description,
            status: response.data.data.status,
            priority: response.data.data.priority,
            startDate: dateInputValue(response.data.data.startDate),
            dueDate: dateInputValue(response.data.data.dueDate),
            assignee: response.data.data.assignee?._id || ''
          });
        } catch (err: any) {
          setError(err?.response?.data?.message || 'Unable to load task');
        } finally {
          setDataLoading(false);
        }
      };

      fetchTask();
    }
  }, [id, isEdit]);

  if (dataLoading) {
    return <div className="min-h-screen bg-slate-100 p-4 sm:p-6"><div className="mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-sm sm:p-6"><TaskFormSkeleton /></div></div>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    const nextErrors: FieldErrors = {};
    if (form.title.trim().length < 2) nextErrors.title = 'Title must be at least 2 characters';
    if (form.description.trim().length < 3) nextErrors.description = 'Description must be at least 3 characters';
    if (form.startDate && Number.isNaN(Date.parse(form.startDate))) nextErrors.startDate = 'Please provide a valid start date';
    if (form.dueDate && Number.isNaN(Date.parse(form.dueDate))) nextErrors.dueDate = 'Please provide a valid due date';
    if (form.dueDate && form.dueDate < today) nextErrors.dueDate = 'Due date cannot be in the past';
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) nextErrors.dueDate = 'Due date cannot be before the start date';
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        assignee: form.assignee || null
      };

      if (isEdit) {
        await api.put(`/tasks/${id}`, payload);
        navigate(`/tasks/${id}`, { state: { from: returnPath } });
      } else {
        await api.post('/tasks', payload);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Unable to save task'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Task' : 'Create Task'}</h1>
          <button onClick={() => navigate(returnPath)} className="text-sm font-medium text-slate-500">Cancel</button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputErrorClass(Boolean(fieldErrors.title))}
              aria-invalid={Boolean(fieldErrors.title)}
              maxLength={200}
            />
            {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              className={inputErrorClass(Boolean(fieldErrors.description))}
              aria-invalid={Boolean(fieldErrors.description)}
              maxLength={4000}
            />
            {fieldErrors.description && <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Start date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputErrorClass(Boolean(fieldErrors.startDate))}
                aria-invalid={Boolean(fieldErrors.startDate)}
              />
              {fieldErrors.startDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.startDate}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                min={form.startDate && form.startDate > today ? form.startDate : today}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={inputErrorClass(Boolean(fieldErrors.dueDate))}
                aria-invalid={Boolean(fieldErrors.dueDate)}
              />
              {fieldErrors.dueDate && <p className="mt-1 text-sm text-red-600">{fieldErrors.dueDate}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Assignee</label>
            <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500">
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
