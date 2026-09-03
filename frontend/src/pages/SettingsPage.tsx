import { useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#1d1d1f]">
      <div className="flex min-h-screen flex-1 flex-col">
          <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
            <h1 className="text-2xl font-bold sm:text-[32px]">Settings</h1>
            <p className="mt-2 text-[15px] text-[#6b7280]">Manage your account and session.</p>

            <div className="mt-8 max-w-3xl space-y-6">
              <section className="rounded-2xl border border-[#d9d9d9] bg-[#f8f8f8] p-5">
                <div className="flex items-center gap-3 border-b border-[#e0e0e0] pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe8ff] text-[#1d4ed8]">
                    <UserRound aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold">Account</h2>
                    <p className="text-[13px] text-[#6b7280]">Your account details used by TaskFlow.</p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[13px] font-medium text-[#6b7280]">Name</dt>
                    <dd className="mt-1 text-[15px] font-medium">{user?.name || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] font-medium text-[#6b7280]">Email</dt>
                    <dd className="mt-1 text-[15px] font-medium">{user?.email || 'Not available'}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] font-medium text-[#6b7280]">Role</dt>
                    <dd className="mt-1 text-[15px] font-medium">{user?.role === 'admin' ? 'Admin' : 'Member'}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-[#d9d9d9] bg-[#f8f8f8] p-5">
                <h2 className="text-[18px] font-semibold">Session</h2>
                <p className="mt-1 text-[13px] text-[#6b7280]">Your session uses a token for authenticated requests.</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d9d9d9] bg-white px-4 py-2.5 text-[14px] font-medium transition hover:bg-[#f3f4f6]"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  Sign out
                </button>
              </section>

              <button type="button" onClick={() => navigate('/dashboard')} className="text-[14px] font-medium text-[#2563eb] hover:underline">
                Back to dashboard
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
