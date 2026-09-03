import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, ListChecks, Settings, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', path: '/tasks', icon: ListChecks },
  { label: 'Tasks', path: '/all-tasks', icon: ClipboardList },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    if (!showLogoutConfirmation) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLogoutConfirmation(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirmation]);
  const pageName = location.pathname === '/dashboard'
    ? 'Dashboard'
    : location.pathname === '/tasks'
      ? 'My Tasks'
      : location.pathname === '/all-tasks'
        ? 'Tasks'
      : location.pathname === '/tasks/new'
        ? 'Create Task'
        : location.pathname === '/all-tasks/new'
          ? 'Create Task'
        : location.pathname.endsWith('/edit')
          ? 'Edit Task'
          : location.pathname.startsWith('/tasks/') || location.pathname.startsWith('/all-tasks/')
            ? 'Task Details'
            : location.pathname === '/team'
              ? 'Team'
              : 'Settings';

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#1d1d1f]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-[#dcdcdc] bg-[#f6f6f6] p-3 sm:p-4 lg:min-h-screen lg:w-[260px] lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-3 px-2 lg:mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#111111] text-[12px] font-bold text-white">T</div>
            <span className="text-[15px] font-bold">TaskFlow</span>
          </div>

          <div className="mb-2 hidden px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7a7a] lg:mb-6 lg:block">Workspace</div>
          <nav className="grid grid-cols-2 gap-1 text-[14px] text-[#4a4a4a] sm:grid-cols-3 lg:block lg:space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition ${isActive ? 'bg-[#e9e9e9] font-medium text-[#1d1d1f]' : 'text-[#4a4a4a] hover:bg-[#efefef]'} `
                }
              >
                <item.icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 hidden border-t border-[#d9d9d9] pt-4 lg:mt-auto lg:block">
            <div className="flex items-center gap-3 px-2 py-2 text-[14px]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c7d2fe] text-[12px] font-semibold text-[#1f2937]">
                {(user?.name || 'AM').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user?.name || 'Alex Morgan'}</div>
                <div className="text-[12px] text-[#6b7280]">{user?.email || 'alex@taskflow.io'}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9d9d9] bg-[#f5f5f5] px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2 text-[13px] text-[#6b7280]">
              <span>TaskFlow</span>
              <span>›</span>
              <span className="truncate text-[#1f2937]">{pageName}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLogoutConfirmation(true)} aria-label="Open logout confirmation" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f172a] text-[12px] font-semibold text-white">
                {(user?.name || 'AM').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </button>
            </div>
          </header>
          {children}
        </main>
      </div>

      {showLogoutConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirmation(false);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#d9d9d9] bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
          >
            <h2 id="logout-dialog-title" className="text-[20px] font-semibold text-[#1d1d1f]">Log out?</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">Are you sure you want to log out of TaskFlow?</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmation(false)}
                className="rounded-xl border border-[#d9d9d9] bg-white px-4 py-2.5 text-[14px] font-medium transition hover:bg-[#f3f4f6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl bg-[#111111] px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#1f2937]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
