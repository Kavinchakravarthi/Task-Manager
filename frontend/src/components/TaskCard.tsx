type TaskCardProps = {
  task: any;
  onSelect?: (id: string) => void;
};

const statusStyles: Record<string, string> = {
  Todo: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Done: 'bg-emerald-100 text-emerald-700'
};

const priorityStyles: Record<string, string> = {
  Low: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700'
};

export default function TaskCard({ task, onSelect }: TaskCardProps) {
  const formatDate = (value?: string | null) => value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '-';

  return (
    <div
      className="min-w-0 cursor-pointer rounded-2xl border border-[#dfe4ea] bg-[#f8f9fb] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onSelect?.(task._id)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 break-words text-[18px] font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere]">{task.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${priorityStyles[task.priority] || 'bg-slate-100 text-slate-700'}`}>
          {task.priority}
        </span>
      </div>

      <p className="mt-3 min-h-[52px] break-words text-[15px] leading-6 text-slate-500 [overflow-wrap:anywhere]">{task.description}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
        <span>Start: {formatDate(task.startDate)}</span>
        <span>Due: {formatDate(task.dueDate)}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[task.status] || 'bg-slate-100 text-slate-700'}`}>
          {task.status}
        </span>
        <span className="break-words text-slate-500 [overflow-wrap:anywhere]">Assignee: {task.assignee?.name || 'Unassigned'}</span>
      </div>
    </div>
  );
}
