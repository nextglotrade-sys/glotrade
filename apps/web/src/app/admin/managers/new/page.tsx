'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Modal from '@/components/common/Modal';
import { ArrowLeft, UserPlus, Shield, CheckCircle2 } from 'lucide-react';

type ManagerRole = 'product_manager' | 'order_manager' | 'insured_partners_manager' | 'bazaar_manager';

const roleOptions: Array<{ value: ManagerRole; label: string; description: string }> = [
  {
    value: 'product_manager',
    label: 'Product Manager',
    description: 'Can access product management features.',
  },
  {
    value: 'order_manager',
    label: 'Order Manager',
    description: 'Can access order management features.',
  },
  {
    value: 'insured_partners_manager',
    label: 'Insured Partners Manager',
    description: 'Can access Insured Partners management features.',
  },
  {
    value: 'bazaar_manager',
    label: 'Trade Fair Manager',
    description: 'Can access the GloTrade International Trade Fair portal, stall bookings, promoter commissions and payout management.',
  },
];

export default function CreateManagerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');
  const [wasPromoted, setWasPromoted] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<ManagerRole[]>(['product_manager']);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const requestedRole = params.get('role') as ManagerRole | null;
    if (requestedRole && roleOptions.some((option) => option.value === requestedRole)) {
      setSelectedRoles([requestedRole]);
    }
  }, []);

  const toggleRole = (role: ManagerRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return; // Must keep at least one role
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setError('Please select at least one manager role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        role: selectedRoles[0],
        assignedRoles: selectedRoles,
      };
      const res = await apiPost<{ data: { promoted?: boolean } }>('/api/v1/admin/managers', payload);
      setCreatedEmail(formData.email);
      setWasPromoted(res?.data?.promoted === true);
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto p-3 sm:p-6 space-y-6">
        <div>
          <Link
            href="/admin/managers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Manager Accounts
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={24} /> Create Manager Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 leading-relaxed">
            Create a manager account and assign one or multiple management roles. Login credentials will be sent via email.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-amber-800 mb-6 leading-relaxed">
            <strong>💡 Tip:</strong> If the person already has an account on GloTrade (e.g. a buyer or seller), simply enter their registered email below — their account will be <strong>promoted</strong> to a manager role. Their existing login and password will remain unchanged.
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs sm:text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Manager Roles <span className="text-red-500">*</span>{' '}
                <span className="text-[11px] sm:text-xs text-gray-500 font-normal">
                  (Select all roles this manager can access)
                </span>
              </label>
              <div className="space-y-2.5 border border-gray-200 rounded-xl p-3 sm:p-4 bg-gray-50/50">
                {roleOptions.map((option) => {
                  const isChecked = selectedRoles.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isChecked
                          ? 'bg-blue-50 border-blue-500/50 text-blue-950 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRole(option.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="manager@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+234 803 123 4567"
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3.5 rounded-xl">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                <strong>Multi-Role Access:</strong> This manager will see all selected workspaces in their sidebar menu and can switch between assigned workspaces seamlessly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/admin/managers')}
                className="flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-xs sm:text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-xs sm:text-sm transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Manager Account'}
              </button>
            </div>
          </form>
        </div>

        <Modal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={
            <span className="inline-flex items-center gap-2 font-bold" style={{ color: wasPromoted ? '#059669' : '#059669' }}>
              {wasPromoted ? '⬆️ User Promoted to Manager' : 'Manager Account Created'}
            </span>
          }
          size="md"
          footer={(
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setFormData({ email: '', firstName: '', lastName: '', phone: '' });
                  setWasPromoted(false);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-xs font-bold transition-colors"
              >
                {wasPromoted ? 'Promote Another' : 'Create Another'}
              </button>
              <button
                onClick={() => router.push('/admin/managers')}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-bold transition-colors"
              >
                View All
              </button>
            </div>
          )}
        >
          <div className="space-y-4 p-2">
            <div className={`rounded-xl border p-4 ${wasPromoted ? 'border-blue-200 bg-blue-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className={`text-xs sm:text-sm font-bold ${wasPromoted ? 'text-blue-900' : 'text-emerald-900'}`}>
                {wasPromoted
                  ? <><span className="break-all">{createdEmail}</span> has been promoted to manager with {selectedRoles.length} assigned role(s).</>
                  : <>Manager account created for <span className="break-all">{createdEmail}</span> with {selectedRoles.length} assigned role(s).</>
                }
              </p>
              <p className={`mt-1 text-xs ${wasPromoted ? 'text-blue-700' : 'text-emerald-700'}`}>
                {wasPromoted
                  ? 'Their existing login credentials remain unchanged. They have been notified by email about their new manager access and workspaces.'
                  : 'Login credentials have been sent by email and the account will have access to all assigned workspaces in the sidebar menu.'
                }
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
