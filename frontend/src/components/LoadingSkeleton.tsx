type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100 p-6" role="status" aria-label="Loading">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard">
      <div className="space-y-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36" />)}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export function TaskBoardSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading tasks">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-12" />)}
        </div>
        <Skeleton className="mb-5 ml-auto h-12 w-full sm:w-56" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-48" />)}
        </div>
      </div>
    </div>
  );
}

export function TaskDetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading task">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-80" />
      <Skeleton className="h-72" />
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading team">
      <div className="space-y-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-24" />
      <Skeleton className="h-96" />
    </div>
  );
}

export function TaskFormSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading form">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
