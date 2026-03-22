// frontend/src/pages/purchase/SuppliersPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus, Search, RefreshCw, Truck, X, ChevronDown, Edit2, Trash2,
} from 'lucide-react';
import { purchaseService } from '@/services/purchase.service';
import { Supplier, SupplierStatus } from '@/types';
import { toast } from 'react-hot-toast';

// ─── Styled Select ────────────────────────────────────────────────────────────

const StyledSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600/60
        bg-white dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-sm
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400
        transition-all duration-200 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: SupplierStatus }) => {
  const { t } = useTranslation();
  const config: Record<SupplierStatus, { label: string; className: string }> = {
    ACTIVE: { label: t('purchase.suppliers.statusActive'), className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    INACTIVE: { label: t('purchase.suppliers.statusInactive'), className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' },
    BLOCKED: { label: t('purchase.suppliers.statusBlocked'), className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };
  const { label, className } = config[status] ?? config.INACTIVE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  paymentTermsDays: string;
  leadTimeDays: string;
  status: SupplierStatus;
  notes: string;
}

const EMPTY_FORM: SupplierFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  paymentTermsDays: '',
  leadTimeDays: '',
  status: 'ACTIVE',
  notes: '',
};

const SupplierFormModal = ({
  open,
  onClose,
  supplier,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSaved: () => void;
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<SupplierFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        address: supplier.address ?? '',
        contactPerson: supplier.contactPerson ?? '',
        paymentTermsDays: supplier.paymentTermsDays?.toString() ?? '',
        leadTimeDays: supplier.leadTimeDays?.toString() ?? '',
        status: supplier.status,
        notes: supplier.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t('purchase.suppliers.name') + ' is required');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Supplier> = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        contactPerson: form.contactPerson.trim() || undefined,
        paymentTermsDays: form.paymentTermsDays ? parseInt(form.paymentTermsDays) : undefined,
        leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };
      if (supplier) {
        await purchaseService.updateSupplier(supplier.id, payload);
        toast.success(t('purchase.suppliers.updated'));
      } else {
        await purchaseService.createSupplier(payload);
        toast.success(t('purchase.suppliers.created'));
      }
      onSaved();
      onClose();
    } catch {
      toast.error(t('purchase.suppliers.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof SupplierFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {supplier ? t('common.edit') : t('purchase.suppliers.new')}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  {t('purchase.suppliers.name')} *
                </label>
                <input
                  value={form.name}
                  onChange={set('name')}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="Supplier name"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {t('purchase.suppliers.email')}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {t('purchase.suppliers.phone')}
                  </label>
                  <input
                    value={form.phone}
                    onChange={set('phone')}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  {t('purchase.suppliers.contactPerson')}
                </label>
                <input
                  value={form.contactPerson}
                  onChange={set('contactPerson')}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="Contact person name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  {t('purchase.suppliers.address')}
                </label>
                <input
                  value={form.address}
                  onChange={set('address')}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  placeholder="123 Main St, City"
                />
              </div>

              {/* Payment Terms + Lead Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {t('purchase.suppliers.paymentTerms')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.paymentTermsDays}
                    onChange={set('paymentTermsDays')}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {t('purchase.suppliers.leadTime')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.leadTimeDays}
                    onChange={set('leadTimeDays')}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="7"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  {t('purchase.suppliers.status')}
                </label>
                <StyledSelect
                  value={form.status}
                  onChange={(v) => setForm(prev => ({ ...prev, status: v as SupplierStatus }))}
                  options={[
                    { value: 'ACTIVE', label: t('purchase.suppliers.statusActive') },
                    { value: 'INACTIVE', label: t('purchase.suppliers.statusInactive') },
                    { value: 'BLOCKED', label: t('purchase.suppliers.statusBlocked') },
                  ]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                  {t('purchase.suppliers.notes')}
                </label>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit as any}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteConfirmModal = ({
  open,
  onClose,
  onConfirm,
  name,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}) => {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {t('common.delete')} Supplier
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              {t('purchase.suppliers.deleteConfirm')} <span className="font-semibold text-neutral-700 dark:text-neutral-300">"{name}"</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const SuppliersPage = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await purchaseService.getSuppliers({ search: searchTerm || undefined, status: statusFilter || undefined });
      const data = res.data;
      setSuppliers(Array.isArray(data) ? data : (data?.content ?? []));
    } catch {
      // silent — empty state shown in table
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, [searchTerm, statusFilter]);

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return;
    try {
      await purchaseService.deleteSupplier(selectedSupplier.id);
      toast.success(t('purchase.suppliers.deleted'));
      setIsDeleteOpen(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch {
      toast.error(t('purchase.suppliers.deleteFailed'));
    }
  };

  const statusOptions = useMemo(() => [
    { value: '', label: t('purchase.suppliers.allStatuses') },
    { value: 'ACTIVE', label: t('purchase.suppliers.statusActive') },
    { value: 'INACTIVE', label: t('purchase.suppliers.statusInactive') },
    { value: 'BLOCKED', label: t('purchase.suppliers.statusBlocked') },
  ], [t]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {t('purchase.suppliers.title')}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{suppliers.length} {t('purchase.suppliers.count')}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setSelectedSupplier(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('purchase.suppliers.new')}
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('purchase.suppliers.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600/60 bg-white dark:bg-neutral-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <StyledSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchSuppliers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900/80 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                {[
                  t('purchase.suppliers.name'),
                  t('purchase.suppliers.email'),
                  t('purchase.suppliers.phone'),
                  t('purchase.suppliers.contactPerson'),
                  t('purchase.suppliers.leadTime'),
                  t('purchase.suppliers.status'),
                  t('common.actions'),
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-neutral-400 dark:text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span className="text-sm">{t('common.loading')}</span>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Truck className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm text-neutral-500">{t('purchase.suppliers.emptyState')}</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{supplier.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{supplier.email ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{supplier.phone ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{supplier.contactPerson ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {supplier.leadTimeDays != null ? `${supplier.leadTimeDays}d` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={supplier.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <SupplierFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        supplier={selectedSupplier}
        onSaved={fetchSuppliers}
      />
      <DeleteConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        name={selectedSupplier?.name ?? ''}
      />
    </div>
  );
};

export default SuppliersPage;
