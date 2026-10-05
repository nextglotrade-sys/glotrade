'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiDelete, apiGet, apiPost, apiPut } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/common/Modal';
import {
  Users,
  Plus,
  Shield,
  KeyRound,
  Trash2,
  Edit,
  Mail,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager' | 'bazaar_manager';

interface ManagerAccount {
  _id: string;
  email: string;
  username: string;
  role: ManagerRole;
  assignedRoles?: ManagerRole[];
  firstName?: string;
  lastName?: string;
  isBlocked: boolean;
  lastSeen?: string;
  createdAt: string;
  createdBy?: {
    email: string;
    username: string;
  };
}

const roleLabel: Record<ManagerRole, string> = {
  product_manager: 'Product Manager',
  order_manager: 'Order Manager',
  insured_partners_manager: 'Insured Partners Manager',
  bazaar_manager: 'Trade Fair Manager',
};

const roleOptions: Array<{ value: ManagerRole; label: string; description: string }> = [
  { value: 'product_manager', label: 'Product Manager', description: 'Can access product management features.' },
  { value: 'order_manager', label: 'Order Manager', description: 'Can access order management features.' },
  { value: 'insured_partners_manager', label: 'Insured Partners Manager', description: 'Can access Insured Partners management features.' },
  { value: 'bazaar_manager', label: 'Trade Fair Manager', description: 'Can access the GloTrade International Trade Fair portal, stall bookings, promoter commissions and payout management.' },
];

const managerRoles: ManagerRole[] = ['product_manager', 'order_manager', 'insured_partners_manager', 'bazaar_manager'];

const roleBadgeClass: Record<ManagerRole, string> = {
  product_manager: 'bg-blue-100 text-blue-800 border border-blue-200',
  order_manager: 'bg-amber-100 text-amber-800 border border-amber-200',
  insured_partners_manager: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  bazaar_manager: 'bg-purple-100 text-purple-800 border border-purple-200',
};

export default function ManagerAccountsPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<ManagerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | ManagerRole>('all');
  const [deleteTarget, setDeleteTarget] = useState<ManagerAccount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletedEmail, setDeletedEmail] = useState('');

  // Edit roles modal state
  const [editTarget, setEditTarget] = useState<ManagerAccount | null>(null);
  const [editRoles, setEditRoles] = useState<ManagerRole[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    setRoleFilter(managerRoles.includes(role as ManagerRole) ? (role as ManagerRole) : 'all');
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await apiGet<{ data: ManagerAccount[] }>('/api/v1/admin/managers');
      setManagers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch manager accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (manager: ManagerAccount) => {
    setEditTarget(manager);
    const currentRoles = manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role];
    setEditRoles(currentRoles);
  };

  const toggleEditRole = (role: ManagerRole) => {
    if (editRoles.includes(role)) {
      if (editRoles.length === 1) return; // Keep at least 1 role
      setEditRoles(editRoles.filter((r) => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!editTarget || editRoles.length === 0) return;
    setEditLoading(true);

    try {
      await apiPut(`/api/v1/admin/managers/${editTarget._id}`, {
        assignedRoles: editRoles,
      });
      setEditTarget(null);
      fetchManagers();
    } catch (err: any) {
      alert(err.message || 'Failed to update manager roles');
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (id: string, email: string) => {
    if (!confirm(`Reset password for ${email}? A new password will be sent to their email.`)) {
      return;
    }

    try {
      await apiPost(`/api/v1/admin/managers/${id}/reset-password`);
      alert('Password reset successfully! New credentials sent to email.');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiDelete(`/api/v1/admin/managers/${deleteTarget._id}`);
      setDeletedEmail(deleteTarget.email);
      setDeleteTarget(null);
      fetchManagers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete manager account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const filteredManagers =
    roleFilter === 'all'
      ? managers
      : managers.filter((manager) => {
          const roles = manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role];
          return roles.includes(roleFilter);
        });

  const handleRoleFilterChange = (value: 'all' | ManagerRole) => {
    setRoleFilter(value);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (value === 'all') {
      params.delete('role');
    } else {
      params.set('role', value);
    }
    const query = params.toString();
    router.replace(query ? `/admin/managers?${query}` : '/admin/managers');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading Manager Accounts...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" size={28} /> Manager Accounts
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create and manage Product, Order, Insured Partners, and Trade Fair Managers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value as 'all' | ManagerRole)}
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">All Manager Roles</option>
              <option value="product_manager">Product Managers</option>
              <option value="order_manager">Order Managers</option>
              <option value="insured_partners_manager">Insured Partners Managers</option>
              <option value="bazaar_manager">Trade Fair Managers</option>
            </select>
            <Link
              href={roleFilter === 'all' ? '/admin/managers/new' : `/admin/managers/new?role=${roleFilter}`}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> New Manager Account
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs sm:text-sm">
            {error}
          </div>
        )}

        {filteredManagers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">No Manager Accounts Found</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Get started by creating a Product, Order, Insured Partners, or Trade Fair Manager account.
            </p>
            <Link
              href={roleFilter === 'all' ? '/admin/managers/new' : `/admin/managers/new?role=${roleFilter}`}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Create Manager Account
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3.5">User Info</th>
                    <th className="px-6 py-3.5">Assigned Roles</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Last Seen</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredManagers.map((manager) => (
                    <tr key={manager._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                            <span className="text-blue-700 font-bold text-sm">
                              {manager.firstName?.[0]?.toUpperCase() || manager.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {manager.firstName && manager.lastName ? `${manager.firstName} ${manager.lastName}` : manager.username}
                            </p>
                            <p className="text-xs text-gray-500">@{manager.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role]).map((r) => (
                            <span
                              key={r}
                              className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${roleBadgeClass[r] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {roleLabel[r] || r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                        {manager.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager.isBlocked ? (
                          <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatLastSeen(manager.lastSeen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(manager.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(manager)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-colors"
                          title="Edit Manager Roles"
                        >
                          Edit Roles
                        </button>
                        <button
                          onClick={() => handleResetPassword(manager._id, manager.email)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                          title="Reset Password"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => setDeleteTarget(manager)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors"
                          title="Delete Account"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredManagers.map((manager) => {
                const assigned = manager.assignedRoles && manager.assignedRoles.length > 0 ? manager.assignedRoles : [manager.role];
                return (
                  <div
                    key={manager._id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                          <span className="text-blue-700 font-bold text-sm">
                            {manager.firstName?.[0]?.toUpperCase() || manager.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {manager.firstName && manager.lastName ? `${manager.firstName} ${manager.lastName}` : manager.username}
                          </p>
                          <p className="text-xs text-gray-500">@{manager.username}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          manager.isBlocked
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {manager.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>

                    {/* Roles Badges */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        Assigned Management Roles
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map((r) => (
                          <span
                            key={r}
                            className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${roleBadgeClass[r] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {roleLabel[r] || r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Email & Dates */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Email:</span>
                        <a href={`mailto:${manager.email}`} className="font-semibold text-blue-600 truncate block">
                          {manager.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Last Seen:</span>
                        <span className="font-medium text-gray-800">{formatLastSeen(manager.lastSeen)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-gray-100">
                      <button
                        onClick={() => handleOpenEditModal(manager)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Edit size={12} /> Edit Roles
                      </button>
                      <button
                        onClick={() => handleResetPassword(manager._id, manager.email)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <KeyRound size={12} /> Reset Password
                      </button>
                      <button
                        onClick={() => setDeleteTarget(manager)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Multi-role helper card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
          <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
            <strong>Multi-Role Manager Support:</strong> Admins can assign multiple management roles to any existing manager account by clicking <strong>Edit Roles</strong>. Managers will see all assigned workspaces in their navigation sidebar.
          </p>
        </div>
      </div>

      {/* Edit Roles Modal */}
      <Modal
        open={Boolean(editTarget)}
        onClose={() => !editLoading && setEditTarget(null)}
        title={<span className="inline-flex items-center gap-2 text-purple-700 font-bold">Edit Manager Roles</span>}
        size="md"
        footer={(
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setEditTarget(null)}
              disabled={editLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRoles}
              disabled={editLoading || editRoles.length === 0}
              className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {editLoading ? 'Saving...' : 'Save Roles'}
            </button>
          </div>
        )}
      >
        <div className="space-y-4 p-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Select one or multiple roles to assign to <strong>{editTarget?.firstName || editTarget?.username}</strong> ({editTarget?.email}):
          </p>
          <div className="space-y-2.5 border border-gray-200 rounded-xl p-3 sm:p-4 bg-gray-50/50">
            {roleOptions.map((option) => {
              const isChecked = editRoles.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked ? 'bg-purple-50 border-purple-500/50 text-purple-950 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleEditRole(option.value)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-gray-900">{option.label}</span>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        title={<span className="inline-flex items-center gap-2 text-rose-600 font-bold">Delete Manager Account</span>}
        size="md"
        footer={(
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Manager'}
            </button>
          </div>
        )}
      >
        <div className="space-y-4 p-2">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs sm:text-sm font-bold text-rose-900">
              Delete Manager <span className="break-all">{deleteTarget?.email}</span>?
            </p>
            <p className="mt-1 text-xs text-rose-700">
              This action cannot be undone. The account will be removed from the Manager Accounts list.
            </p>
          </div>
        </div>
      </Modal>

      {/* Success Delete Modal */}
      <Modal
        open={Boolean(deletedEmail)}
        onClose={() => setDeletedEmail('')}
        title={<span className="inline-flex items-center gap-2 text-emerald-600 font-bold">Manager Deleted</span>}
        size="md"
        footer={(
          <button
            onClick={() => setDeletedEmail('')}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
          >
            Close
          </button>
        )}
      >
        <div className="space-y-4 p-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs sm:text-sm font-bold text-emerald-900">
              Manager account <span className="break-all">{deletedEmail}</span> was deleted successfully.
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              The account has been removed and the user has been notified by email.
            </p>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
