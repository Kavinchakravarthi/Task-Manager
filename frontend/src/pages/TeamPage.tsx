import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { emailPattern, FieldErrors, getApiErrorMessage, getApiFieldErrors, inputErrorClass } from '../utils/validation';
import { TeamSkeleton } from '../components/LoadingSkeleton';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  jobRole?: string;
};

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [inviteForm, setInviteForm] = useState({ email: '', jobRole: 'Developer' });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isAdmin = user?.role === 'admin' || user?.email?.trim().toLowerCase() === 'kavinnivak2934@gmail.com';

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/users');
      setMembers(Array.isArray(response.data.data) ? response.data.data : []);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#f3f3f3] p-4 text-[#1d1d1f] sm:p-6"><div className="mx-auto max-w-6xl"><TeamSkeleton /></div></div>;
  }

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    setFieldErrors({});
    const nextErrors: FieldErrors = {};
    if (!emailPattern.test(inviteForm.email.trim())) nextErrors.email = 'Please provide a valid email address';
    if (!['Developer', 'Designer', 'Manager', 'QA'].includes(inviteForm.jobRole)) nextErrors.jobRole = 'Please select a valid team role';
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/auth/invite', inviteForm);
      setInviteForm({ email: '', jobRole: 'Developer' });
      setSuccessMessage(`Invitation sent successfully to ${inviteForm.email.trim()}.`);
      await loadMembers();
    } catch (err: any) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Unable to invite team member'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] p-4 text-[#1d1d1f] sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-[32px] font-bold tracking-[-0.04em]">Team</h1>
            <p className="mt-2 text-[15px] text-[#6b7280]">People working on your projects.</p>
          </div>
        </div>

        {isAdmin && <div className="mb-6 rounded-2xl border border-[#d9d9d9] bg-[#f8f8f8] p-5">
          <h2 className="text-lg font-semibold text-slate-900">Invite a team member</h2>
          <form onSubmit={handleInvite} noValidate className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <div>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                className={inputErrorClass(Boolean(fieldErrors.email))}
                placeholder="Email address"
                maxLength={254}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
            </div>
            <div>
              <select
                value={inviteForm.jobRole}
                onChange={(event) => setInviteForm((current) => ({ ...current, jobRole: event.target.value }))}
                className={inputErrorClass(Boolean(fieldErrors.jobRole))}
                aria-invalid={Boolean(fieldErrors.jobRole)}
              >
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Manager">Manager</option>
                <option value="QA">QA</option>
              </select>
              {fieldErrors.jobRole && <p className="mt-1 text-sm text-red-600">{fieldErrors.jobRole}</p>}
            </div>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> Sending...</> : '+ Invite'}
            </button>
          </form>
        </div>}

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        {successMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" role="presentation">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true" aria-labelledby="invite-success-title">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h2 id="invite-success-title" className="text-lg font-semibold text-slate-900">Invitation sent</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{successMessage}</p>
                </div>
                <button type="button" onClick={() => setSuccessMessage('')} aria-label="Close invitation success message" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <button type="button" onClick={() => setSuccessMessage('')} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Done</button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#d9d9d9] bg-[#f8f8f8]">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="bg-[#f1f1f1] text-[#5e5e5e]">
              <tr>
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">No team members yet.</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member._id} className="border-t border-[#d9d9d9] bg-white text-[#1d1d1f]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5e7eb] text-[12px] font-semibold">
                          {member.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#4b5563]">{member.email}</td>
                    <td className="px-5 py-4">
                        <span className="rounded-md border border-[#d9d9d9] bg-[#f3f4f6] px-2 py-1 text-[12px]">{member.role === 'admin' ? 'Admin' : member.jobRole || 'Developer'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-1 text-[12px] font-medium ${String(member._id) === String(user?.id || user?._id) ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                        {String(member._id) === String(user?.id || user?._id) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
