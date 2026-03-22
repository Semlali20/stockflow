// frontend/src/pages/purchase/PurchaseOrdersPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, RefreshCw, ShoppingCart, X, ChevronDown,
  Eye, Edit2, Trash2, CheckCircle2, Send, XCircle,
} from 'lucide-react';
import { purchaseService } from '@/services/purchase.service';
import { PurchaseOrder, PurchaseOrderStatus, Supplier } from '@/types';
import { toast } from 'react-hot-toast';

// ─── StyledSelect ─────────────────────────────────────────────────────────────

const StyledSelect = ({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) => (
  <div className={`relative ${className}`}>
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

const STATUS_CLASS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  PARTIALLY_RECEIVED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  RECEIVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const StatusBadge = ({ status }: { status: PurchaseOrderStatus }) => {
  const { t } = useTranslation();
  const labelMap: Record<PurchaseOrderStatus, string> = {
    DRAFT: t('purchase.orders.statusDraft'),
    CONFIRMED: t('purchase.orders.statusConfirmed'),
    SENT: t('purchase.orders.statusSent'),
    PARTIALLY_RECEIVED: t('purchase.orders.statusPartiallyReceived'),
    RECEIVED: t('purchase.orders.statusReceived'),
    CANCELLED: t('purchase.orders.statusCancelled'),
  };
  const className = STATUS_CLASS[status] ?? STATUS_CLASS.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {labelMap[status] ?? labelMap.DRAFT}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ open, onClose, order }: { open: boolean; onClose: () => void; order: PurchaseOrder | null }) => {
  const { t } = useTranslation();
  if (!open || !order) return null;
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
            className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{order.reference}</h2>
                <p className="text-xs text-neutral-500">{order.supplierName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={order.status} />
                {order.expectedDeliveryDate && (
                  <span className="text-xs text-neutral-500">
                    {t('purchase.orders.expectedDelivery')}: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                  </span>
                )}
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 ms-auto">
                  Total: {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {order.notes && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  {order.notes}
                </p>
              )}
              {/* Lines table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">{t('purchase.orders.lines')}</h3>
                {order.lines?.length ? (
                  <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                          <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-400">Item</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-400">SKU</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Ordered</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Received</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Unit Price</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.lines.map((line) => (
                          <tr key={line.id} className="border-b border-neutral-50 dark:border-neutral-800/50">
                            <td className="px-3 py-2 font-medium">{line.itemName}</td>
                            <td className="px-3 py-2 text-neutral-500">{line.itemSku ?? '—'}</td>
                            <td className="px-3 py-2 text-right">{line.orderedQuantity}</td>
                            <td className="px-3 py-2 text-right">{line.receivedQuantity}</td>
                            <td className="px-3 py-2 text-right">{line.unitPrice.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{line.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 text-center py-6">No lines</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Line Form Row ─────────────────────────────────────────────────────────────

interface LineFormRow {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  orderedQuantity: string;
  unitPrice: string;
}

const newLineRow = (): LineFormRow => ({
  id: Math.random().toString(36).slice(2),
  itemId: '',
  itemName: '',
  itemSku: '',
  orderedQuantity: '',
  unitPrice: '',
});

// ─── Order Form Modal ─────────────────────────────────────────────────────────

const OrderFormModal = ({
  open,
  onClose,
  order,
  suppliers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  suppliers: Supplier[];
  onSaved: () => void;
}) => {
  const { t } = useTranslation();
  const [supplierId, setSupplierId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineFormRow[]>([newLineRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setSupplierId(order.supplierId);
      setExpectedDeliveryDate(order.expectedDeliveryDate?.slice(0, 10) ?? '');
      setNotes(order.notes ?? '');
      if (order.lines?.length) {
        setLines(order.lines.map(l => ({
          id: l.id,
          itemId: l.itemId,
          itemName: l.itemName,
          itemSku: l.itemSku ?? '',
          orderedQuantity: l.orderedQuantity.toString(),
          unitPrice: l.unitPrice.toString(),
        })));
      } else {
        setLines([newLineRow()]);
      }
    } else {
      setSupplierId('');
      setExpectedDeliveryDate('');
      setNotes('');
      setLines([newLineRow()]);
    }
  }, [order, open]);

  const totalAmount = useMemo(() =>
    lines.reduce((sum, l) => sum + (parseFloat(l.orderedQuantity) || 0) * (parseFloat(l.unitPrice) || 0), 0),
    [lines]
  );

  const handleLineChange = (idx: number, field: keyof LineFormRow, value: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const handleAddLine = () => setLines(prev => [...prev, newLineRow()]);
  const handleRemoveLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) { toast.error(t('common.selectSupplier')); return; }
    setSaving(true);
    try {
      const payload = {
        supplierId,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: notes.trim() || undefined,
        lines: lines.filter(l => l.itemName).map(l => ({
          itemId: l.itemId || undefined,
          itemName: l.itemName,
          itemSku: l.itemSku || undefined,
          orderedQuantity: parseFloat(l.orderedQuantity) || 0,
          unitPrice: parseFloat(l.unitPrice) || 0,
        })),
      };
      if (order) {
        await purchaseService.updatePurchaseOrder(order.id, payload);
        toast.success(t('purchase.orders.updated'));
      } else {
        await purchaseService.createPurchaseOrder(payload);
        toast.success(t('purchase.orders.created'));
      }
      onSaved();
      onClose();
    } catch {
      toast.error(t('purchase.orders.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const supplierOptions = [
    { value: '', label: 'Select a supplier...' },
    ...suppliers.map(s => ({ value: s.id, label: s.name })),
  ];

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
            className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {order ? t('common.edit') : t('purchase.orders.new')}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Supplier + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('purchase.orders.supplier')} *</label>
                  <StyledSelect value={supplierId} onChange={setSupplierId} options={supplierOptions} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('purchase.orders.expectedDelivery')}</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all resize-none"
                />
              </div>

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('purchase.orders.lines')}</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Line
                  </button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <div className="col-span-3">
                        <input
                          value={line.itemName}
                          onChange={(e) => handleLineChange(idx, 'itemName', e.target.value)}
                          placeholder="Item name"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          value={line.itemSku}
                          onChange={(e) => handleLineChange(idx, 'itemSku', e.target.value)}
                          placeholder="SKU"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={line.orderedQuantity}
                          onChange={(e) => handleLineChange(idx, 'orderedQuantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                          placeholder="Unit price"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="col-span-2 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {((parseFloat(line.orderedQuantity) || 0) * (parseFloat(line.unitPrice) || 0)).toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length === 1}
                          className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-end mt-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-2">
                    <span className="text-xs text-neutral-500 me-2">{t('purchase.orders.totalAmount')}:</span>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                      {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </form>

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

// ─── Delete Confirm ───────────────────────────────────────────────────────────

const DeleteConfirmModal = ({
  open, onClose, onConfirm, reference,
}: { open: boolean; onClose: () => void; onConfirm: () => void; reference: string }) => {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">Delete Purchase Order</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to delete order <span className="font-semibold">"{reference}"</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                {t('common.cancel')}
              </button>
              <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">
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

const PurchaseOrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await purchaseService.getPurchaseOrders({
        status: statusFilter || undefined,
        supplierId: supplierFilter || undefined,
      });
      const data = res.data;
      setOrders(Array.isArray(data) ? data : (data?.content ?? []));
    } catch {
      // silent — empty state shown in table
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await purchaseService.getActiveSuppliers();
      const data = res.data;
      setSuppliers(Array.isArray(data) ? data : (data?.content ?? []));
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, supplierFilter]);
  useEffect(() => { fetchSuppliers(); }, []);

  const filteredOrders = useMemo(() =>
    orders.filter(o =>
      !searchTerm ||
      o.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [orders, searchTerm]
  );

  const handleAction = async (action: string, order: PurchaseOrder) => {
    try {
      if (action === 'confirm') { await purchaseService.confirmOrder(order.id); toast.success(t('purchase.orders.confirmOrder')); }
      else if (action === 'send') { await purchaseService.sendOrder(order.id); toast.success(t('purchase.orders.sentOrder')); }
      else if (action === 'cancel') { await purchaseService.cancelOrder(order.id); toast.success(t('purchase.orders.cancelOrder')); }
      fetchOrders();
    } catch {
      toast.error(t('purchase.orders.actionFailed'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await purchaseService.deletePurchaseOrder(selectedOrder.id);
      toast.success(t('purchase.orders.deleted'));
      setIsDeleteOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error(t('purchase.orders.deleteFailed'));
    }
  };

  const statusOptions = [
    { value: '', label: t('common.allStatuses') },
    { value: 'DRAFT', label: t('purchase.orders.statusDraft') },
    { value: 'CONFIRMED', label: t('purchase.orders.statusConfirmed') },
    { value: 'SENT', label: t('purchase.orders.statusSent') },
    { value: 'PARTIALLY_RECEIVED', label: t('purchase.orders.statusPartiallyReceived') },
    { value: 'RECEIVED', label: t('purchase.orders.statusReceived') },
    { value: 'CANCELLED', label: t('purchase.orders.statusCancelled') },
  ];

  const supplierOptions = [
    { value: '', label: t('purchase.orders.allSuppliers') },
    ...suppliers.map(s => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t('purchase.orders.title')}</h1>
            <p className="text-xs text-neutral-500">{filteredOrders.length} {t('purchase.orders.count')}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/purchase/orders/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('purchase.orders.new')}
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('purchase.orders.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600/60 bg-white dark:bg-neutral-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="w-full sm:w-44">
          <StyledSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        </div>
        <div className="w-full sm:w-44">
          <StyledSelect value={supplierFilter} onChange={setSupplierFilter} options={supplierOptions} />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchOrders}
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
                  t('purchase.orders.reference'),
                  t('purchase.orders.supplier'),
                  t('purchase.orders.status'),
                  t('purchase.orders.expectedDelivery'),
                  t('purchase.orders.totalAmount'),
                  t('common.actions'),
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span className="text-sm">{t('common.loading')}</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm text-neutral-500">{t('purchase.orders.emptyState')}</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{order.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{order.supplierName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button
                          onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={t('common.view')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit (DRAFT only) */}
                        {order.status === 'DRAFT' && (
                          <button
                            onClick={() => { setSelectedOrder(order); setIsFormOpen(true); }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            title={t('common.edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Confirm (DRAFT) */}
                        {order.status === 'DRAFT' && (
                          <button
                            onClick={() => handleAction('confirm', order)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title={t('purchase.orders.confirm')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Send (CONFIRMED) */}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleAction('send', order)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            title={t('purchase.orders.send')}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Cancel (DRAFT/CONFIRMED) */}
                        {(order.status === 'DRAFT' || order.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleAction('cancel', order)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            title={t('purchase.orders.cancel')}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete (DRAFT) */}
                        {order.status === 'DRAFT' && (
                          <button
                            onClick={() => { setSelectedOrder(order); setIsDeleteOpen(true); }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
      <DetailModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} order={selectedOrder} />
      <OrderFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        order={selectedOrder}
        suppliers={suppliers}
        onSaved={fetchOrders}
      />
      <DeleteConfirmModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        reference={selectedOrder?.reference ?? ''}
      />
    </div>
  );
};

export default PurchaseOrdersPage;
