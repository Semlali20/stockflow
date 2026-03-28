// frontend/src/pages/sales/DeliveryNotesPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, RefreshCw, Truck, X, ChevronDown,
  Eye, Edit2, CheckCircle2, XCircle, Package, Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { salesService } from '@/services/sales.service';
import { inventoryService } from '@/services/inventory.service';
import { DeliveryNote, DeliveryNoteStatus, Customer } from '@/types';
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

const DN_STATUS_CLASS: Record<DeliveryNoteStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  VALIDATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const StatusBadge = ({ status }: { status: DeliveryNoteStatus }) => {
  const { t } = useTranslation();
  const labelMap: Record<DeliveryNoteStatus, string> = {
    DRAFT: t('sales.deliveryNotes.statusDraft'),
    VALIDATED: t('sales.deliveryNotes.statusValidated'),
    SHIPPED: t('sales.deliveryNotes.statusShipped'),
    DELIVERED: t('sales.deliveryNotes.statusDelivered'),
    CANCELLED: t('sales.deliveryNotes.statusCancelled'),
  };
  const className = DN_STATUS_CLASS[status] ?? DN_STATUS_CLASS.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {labelMap[status] ?? labelMap.DRAFT}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ open, onClose, note }: { open: boolean; onClose: () => void; note: DeliveryNote | null }) => {
  const { t } = useTranslation();
  if (!open || !note) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{note.reference}</h2>
                <p className="text-xs text-neutral-500">{note.customerName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={note.status} />
                {note.deliveryDate && (
                  <span className="text-xs text-neutral-500">
                    {t('sales.deliveryNotes.deliveryDate')}: {new Date(note.deliveryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {note.deliveryAddress && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-xs font-semibold text-neutral-400 mb-1">{t('sales.deliveryNotes.deliveryAddress')}</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{note.deliveryAddress}</p>
                </div>
              )}
              {note.notes && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">{note.notes}</p>
              )}
              {/* Lines */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Lines</h3>
                {note.lines?.length ? (
                  <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                          <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-400">Item</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Ordered</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Delivered</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-400">Lot/Serial</th>
                        </tr>
                      </thead>
                      <tbody>
                        {note.lines.map((line) => (
                          <tr key={line.id} className="border-b border-neutral-50 dark:border-neutral-800/50">
                            <td className="px-3 py-2 font-medium">{line.itemName}</td>
                            <td className="px-3 py-2 text-right">{line.orderedQuantity}</td>
                            <td className="px-3 py-2 text-right">{line.deliveredQuantity}</td>
                            <td className="px-3 py-2 text-neutral-500">{line.lotId ?? line.serialId ?? '—'}</td>
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

// ─── Line Row ─────────────────────────────────────────────────────────────────

interface DNLineRow {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  orderedQuantity: string;
  deliveredQuantity: string;
  lotId: string;
  serialId: string;
}

const newDNLineRow = (): DNLineRow => ({
  id: Math.random().toString(36).slice(2),
  itemId: '',
  itemName: '',
  itemSku: '',
  orderedQuantity: '',
  deliveredQuantity: '',
  lotId: '',
  serialId: '',
});

// ─── Delivery Note Form Modal ─────────────────────────────────────────────────

const DeliveryNoteFormModal = ({
  open,
  onClose,
  note,
  customers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  note: DeliveryNote | null;
  customers: Customer[];
  onSaved: () => void;
}) => {
  const { t } = useTranslation();
  const [customerId, setCustomerId] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DNLineRow[]>([newDNLineRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setCustomerId(note.customerId);
      setQuoteId(note.quoteId ?? '');
      setDeliveryDate(note.deliveryDate?.slice(0, 10) ?? '');
      setDeliveryAddress(note.deliveryAddress ?? '');
      setNotes(note.notes ?? '');
      if (note.lines?.length) {
        setLines(note.lines.map(l => ({
          id: l.id,
          itemId: l.itemId,
          itemName: l.itemName,
          itemSku: l.itemSku ?? '',
          orderedQuantity: l.orderedQuantity.toString(),
          deliveredQuantity: l.deliveredQuantity.toString(),
          lotId: l.lotId ?? '',
          serialId: l.serialId ?? '',
        })));
      } else {
        setLines([newDNLineRow()]);
      }
    } else {
      setCustomerId('');
      setQuoteId('');
      setDeliveryDate('');
      setDeliveryAddress('');
      setNotes('');
      setLines([newDNLineRow()]);
    }
  }, [note, open]);

  const handleLineChange = (idx: number, field: keyof DNLineRow, value: string) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error(t('sales.deliveryNotes.selectCustomer')); return; }
    setSaving(true);
    try {
      const payload = {
        customerId,
        quoteId: quoteId.trim() || undefined,
        deliveryDate: deliveryDate || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        lines: lines.filter(l => l.itemName).map(l => ({
          itemId: l.itemId || undefined,
          itemName: l.itemName,
          itemSku: l.itemSku || undefined,
          orderedQuantity: parseFloat(l.orderedQuantity) || 0,
          deliveredQuantity: parseFloat(l.deliveredQuantity) || 0,
          lotId: l.lotId || undefined,
          serialId: l.serialId || undefined,
        })),
      };
      if (note) {
        await salesService.updateDeliveryNote(note.id, payload);
        toast.success(t('sales.deliveryNotes.updated'));
      } else {
        await salesService.createDeliveryNote(payload);
        toast.success(t('sales.deliveryNotes.created'));
      }
      onSaved();
      onClose();
    } catch {
      toast.error(t('sales.deliveryNotes.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const customerOptions = [
    { value: '', label: 'Select a customer...' },
    ...customers.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {note ? t('common.edit') : t('sales.deliveryNotes.new')}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Customer + Quote ID */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('sales.deliveryNotes.customer')} *</label>
                  <StyledSelect value={customerId} onChange={setCustomerId} options={customerOptions} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Quote ID (optional)</label>
                  <input
                    value={quoteId}
                    onChange={(e) => setQuoteId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="Link to a quote..."
                  />
                </div>
              </div>

              {/* Delivery Date + Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('sales.deliveryNotes.deliveryDate')}</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('sales.deliveryNotes.deliveryAddress')}</label>
                  <input
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="Delivery address..."
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
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lines</label>
                  <button
                    type="button"
                    onClick={() => setLines(prev => [...prev, newDNLineRow()])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Line
                  </button>
                </div>
                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <div className="col-span-3">
                        <input value={line.itemName} onChange={(e) => handleLineChange(idx, 'itemName', e.target.value)} placeholder="Item name" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input value={line.itemSku} onChange={(e) => handleLineChange(idx, 'itemSku', e.target.value)} placeholder="SKU" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" value={line.orderedQuantity} onChange={(e) => handleLineChange(idx, 'orderedQuantity', e.target.value)} placeholder="Ordered" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" value={line.deliveredQuantity} onChange={(e) => handleLineChange(idx, 'deliveredQuantity', e.target.value)} placeholder="Delivered" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input value={line.lotId || line.serialId} onChange={(e) => handleLineChange(idx, 'lotId', e.target.value)} placeholder="Lot/Serial" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} disabled={lines.length === 1} className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                {t('common.cancel')}
              </button>
              <button onClick={handleSubmit as any} disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all">
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DeliveryNotesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await salesService.getDeliveryNotes({ status: statusFilter || undefined, customerId: customerFilter || undefined });
      const data = res.data;
      setNotes(Array.isArray(data) ? data : (data?.content ?? []));
    } catch {
      // silent — empty state shown in table
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await salesService.getActiveCustomers();
      const data = res.data;
      setCustomers(Array.isArray(data) ? data : (data?.content ?? []));
    } catch { /* silent */ }
  };

  useEffect(() => { fetchNotes(); }, [statusFilter, customerFilter]);
  useEffect(() => { fetchCustomers(); }, []);

  const generateDeliveryNotePDF = (note: DeliveryNote) => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ── Decorative background shapes (left side) ──
    doc.setFillColor(154, 208, 170);
    doc.ellipse(8, 105, 22, 68, 'F');
    doc.setFillColor(140, 185, 225);
    doc.ellipse(18, 155, 18, 52, 'F');
    doc.setFillColor(200, 225, 150);
    doc.ellipse(5, 195, 14, 38, 'F');
    doc.setFillColor(154, 208, 170);
    doc.ellipse(10, 240, 10, 28, 'F');

    // ── Title ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(26, 58, 108);
    doc.text('BON DE LIVRAISON', 14, 27);

    // ── Company name ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text('TechSupply Maroc', 14, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Casablanca, Maroc', 14, 40);

    // ── Top separator ──
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.5);
    doc.line(14, 46, W - 14, 46);

    // ── Info columns ──
    const infoY = 53;
    // Left — customer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(26, 58, 108);
    doc.text('LIVRÉ À', 14, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(note.customerName, 14, infoY + 6);
    if (note.deliveryAddress) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(note.deliveryAddress, 14, infoY + 12);
    }

    // Right — document details
    const dX = W - 75;
    const vX = W - 14;
    let dY = infoY;
    const row = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(26, 58, 108);
      doc.text(label, dX, dY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);
      doc.text(value, vX, dY, { align: 'right' });
      dY += 7;
    };
    row('BON N°', note.reference);
    row('DATE', new Date(note.createdAt).toLocaleDateString('fr-FR'));
    if (note.deliveryDate) row('LIVRAISON', new Date(note.deliveryDate).toLocaleDateString('fr-FR'));
    row('STATUT', note.status);

    // ── Second separator ──
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.5);
    doc.line(14, 87, W - 14, 87);

    // ── Table ──
    autoTable(doc, {
      startY: 92,
      head: [['DÉSIGNATION', 'QTÉ COMMANDÉE', 'QTÉ LIVRÉE', 'REMARQUES']],
      body: (note.lines || []).map(l => [
        l.itemName,
        l.orderedQuantity.toString(),
        l.deliveredQuantity.toString(),
        l.notes ?? '',
      ]),
      headStyles: { fillColor: [26, 58, 108], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5, halign: 'center' },
      bodyStyles: { fontSize: 8.5, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [235, 242, 255] },
      columnStyles: {
        1: { halign: 'center', cellWidth: 36 },
        2: { halign: 'center', cellWidth: 32 },
        3: { cellWidth: 40 },
      },
      styles: { lineColor: [200, 215, 235], lineWidth: 0.2 },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 150;

    // ── Summary box ──
    const totalOrdered = (note.lines || []).reduce((s, l) => s + l.orderedQuantity, 0);
    const totalDelivered = (note.lines || []).reduce((s, l) => s + l.deliveredQuantity, 0);

    let sY = finalY + 9;
    const sX = W - 80;
    const sVX = W - 14;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Total articles commandés', sX, sY);
    doc.text(totalOrdered.toString(), sVX, sY, { align: 'right' });

    sY += 6;
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.3);
    doc.line(sX, sY, sVX, sY);

    sY += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 108);
    doc.text('TOTAL LIVRÉ', sX, sY);
    doc.text(totalDelivered.toString(), sVX, sY, { align: 'right' });

    // ── Footer ──
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.4);
    doc.line(14, H - 33, W - 14, H - 33);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 108);
    doc.text('CONDITIONS ET MODALITÉS DE LIVRAISON', 14, H - 26);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Merci de vérifier la marchandise à la réception et de signaler toute anomalie.', 14, H - 20);
    doc.text('Pour toute réclamation, contactez notre service logistique.', 14, H - 14);

    doc.save(`bon-livraison-${note.reference}.pdf`);
  };

  const filtered = useMemo(() =>
    notes.filter(n =>
      !searchTerm ||
      n.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [notes, searchTerm]
  );

  const handleAction = async (action: string, note: DeliveryNote) => {
    try {
      if (action === 'validate') {
        await salesService.validateDeliveryNote(note.id);
        // Deduct inventory only when NOT linked to a quote and a location is set
        if (!note.quoteId && note.locationId) {
          await Promise.allSettled(
            (note.lines || [])
              .filter(l => l.itemId)
              .map(l =>
                inventoryService.adjustInventory({
                  itemId: l.itemId,
                  locationId: note.locationId!,
                  warehouseId: note.inventoryId,
                  quantityChange: -l.deliveredQuantity,
                  reason: `Delivery note ${note.reference} validated — ${l.itemName}`,
                })
              )
          );
        }
        toast.success(t('sales.deliveryNotes.validated'));
      }
      else if (action === 'ship') { await salesService.shipDeliveryNote(note.id); toast.success(t('sales.deliveryNotes.shipped')); }
      else if (action === 'deliver') { await salesService.deliverDeliveryNote(note.id); toast.success(t('sales.deliveryNotes.delivered')); }
      else if (action === 'cancel') {
        // Cancel: inventory stays unchanged — just update status
        await salesService.cancelDeliveryNote(note.id);
        toast.success(t('sales.deliveryNotes.cancelled'));
      }
      fetchNotes();
    } catch {
      toast.error(t('sales.deliveryNotes.actionFailed'));
    }
  };

  const statusOptions = [
    { value: '', label: t('common.allStatuses') },
    { value: 'DRAFT', label: t('sales.deliveryNotes.statusDraft') },
    { value: 'VALIDATED', label: t('sales.deliveryNotes.statusValidated') },
    { value: 'SHIPPED', label: t('sales.deliveryNotes.statusShipped') },
    { value: 'DELIVERED', label: t('sales.deliveryNotes.statusDelivered') },
    { value: 'CANCELLED', label: t('sales.deliveryNotes.statusCancelled') },
  ];

  const customerOptions = [
    { value: '', label: t('sales.deliveryNotes.allCustomers') },
    ...customers.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t('sales.deliveryNotes.title')}</h1>
            <p className="text-xs text-neutral-500">{filtered.length} delivery note(s)</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/sales/delivery-notes/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-semibold shadow-md shadow-cyan-500/25 hover:from-cyan-700 hover:to-teal-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('sales.deliveryNotes.new')}
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('sales.deliveryNotes.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600/60 bg-white dark:bg-neutral-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="w-full sm:w-44">
          <StyledSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        </div>
        <div className="w-full sm:w-44">
          <StyledSelect value={customerFilter} onChange={setCustomerFilter} options={customerOptions} />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchNotes}
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
                  t('sales.deliveryNotes.reference'),
                  t('sales.deliveryNotes.customer'),
                  t('sales.deliveryNotes.status'),
                  t('sales.deliveryNotes.deliveryDate'),
                  t('common.actions'),
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span className="text-sm">{t('common.loading')}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Package className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm text-neutral-500">{t('sales.deliveryNotes.emptyState')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((note) => (
                  <motion.tr
                    key={note.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{note.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{note.customerName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={note.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {note.deliveryDate ? new Date(note.deliveryDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button onClick={() => { setSelectedNote(note); setIsDetailOpen(true); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title={t('common.view')}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Download PDF */}
                        <button onClick={() => generateDeliveryNotePDF(note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download PDF">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit (DRAFT) */}
                        {note.status === 'DRAFT' && (
                          <button onClick={() => { setSelectedNote(note); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title={t('common.edit')}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Validate (DRAFT) */}
                        {note.status === 'DRAFT' && (
                          <button onClick={() => handleAction('validate', note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title={t('sales.deliveryNotes.validate')}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Ship (VALIDATED) */}
                        {note.status === 'VALIDATED' && (
                          <button onClick={() => handleAction('ship', note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" title={t('sales.deliveryNotes.ship')}>
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Deliver (SHIPPED) */}
                        {note.status === 'SHIPPED' && (
                          <button onClick={() => handleAction('deliver', note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title={t('sales.deliveryNotes.deliver')}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Cancel (DRAFT/VALIDATED) */}
                        {(note.status === 'DRAFT' || note.status === 'VALIDATED') && (
                          <button onClick={() => handleAction('cancel', note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={t('sales.deliveryNotes.cancel')}>
                            <XCircle className="w-3.5 h-3.5" />
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
      <DetailModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} note={selectedNote} />
      <DeliveryNoteFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        note={selectedNote}
        customers={customers}
        onSaved={fetchNotes}
      />
    </div>
  );
};

export default DeliveryNotesPage;
