import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/validation';
import { TaskDetailSkeleton } from '../components/LoadingSkeleton';

export default function TaskDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const tasksPath = location.state?.from === '/dashboard' ? '/dashboard' : '/tasks';
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  const loadTask = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const submitComment = async () => {
    setCommentError('');
    if (!commentText.trim()) {
      setCommentError('Comment text is required');
      return;
    }
    if (commentText.trim().length > 2000) {
      setCommentError('Comment cannot exceed 2000 characters');
      return;
    }

    try {
      const response = await api.post(`/tasks/${id}/comments`, { text: commentText });
      setTask(response.data.data);
      setCommentText('');
    } catch (err: any) {
      setCommentError(getApiErrorMessage(err, 'Unable to add comment'));
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/tasks/${id}/edit`, { state: { from: tasksPath } });
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);
      navigate(tasksPath);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to delete task');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 p-4 sm:p-6"><div className="mx-auto max-w-4xl"><TaskDetailSkeleton /></div></div>;
  }

  if (error || !task) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Task unavailable</h2>
          <p className="mt-2 text-slate-500">{error || 'The task could not be loaded.'}</p>
          <button onClick={() => navigate(tasksPath)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white">Back to tasks</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <button onClick={() => navigate(tasksPath)} className="text-sm font-medium text-blue-600">← Back to board</button>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">{task.title}</h1>
              <p className="mt-2 text-slate-500">Created {new Date(task.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleEdit} className="rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">Edit</button>
              <button onClick={handleDelete} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 transition hover:bg-red-100">Delete</button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 font-semibold text-slate-900">{task.status}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Priority</p>
              <p className="mt-1 font-semibold text-slate-900">{task.priority}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Assignee</p>
              <p className="mt-1 font-semibold text-slate-900">{task.assignee?.name || 'Unassigned'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Creator</p>
              <p className="mt-1 font-semibold text-slate-900">{task.creator?.name || 'Unknown'}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">{task.description}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Comments</h2>

          <div className="mt-4 space-y-3">
            {(task.comments || []).length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              task.comments.map((comment: any, index: number) => (
                <div key={comment._id || index} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{comment.author?.name || 'User'}</p>
                  <p className="mt-1 text-sm text-slate-600">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); submitComment(); }} noValidate className="mt-5 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Add a comment"
              maxLength={2000}
              aria-invalid={Boolean(commentError)}
            />
            {commentError && <p className="text-sm text-red-600">{commentError}</p>}
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white">
              Add Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
