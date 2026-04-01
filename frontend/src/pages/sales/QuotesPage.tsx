// frontend/src/pages/sales/QuotesPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import {
  Plus, Search, RefreshCw, FileText, X, ChevronDown,
  Eye, Edit2, Trash2, Send, CheckCircle2, XCircle, Truck, Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { salesService } from '@/services/sales.service';
import { Quote, QuoteStatus, Customer } from '@/types';
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

const QUOTE_STATUS_CLASS: Record<QuoteStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CONVERTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const StatusBadge = ({ status }: { status: QuoteStatus }) => {
  const { t } = useTranslation();
  const labelMap: Record<QuoteStatus, string> = {
    DRAFT: t('sales.quotes.statusDraft'),
    SENT: t('sales.quotes.statusSent'),
    ACCEPTED: t('sales.quotes.statusAccepted'),
    REJECTED: t('sales.quotes.statusRejected'),
    EXPIRED: t('sales.quotes.statusExpired'),
    CONVERTED: t('sales.quotes.statusConverted'),
  };
  const className = QUOTE_STATUS_CLASS[status] ?? QUOTE_STATUS_CLASS.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {labelMap[status] ?? labelMap.DRAFT}
    </span>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ open, onClose, quote }: { open: boolean; onClose: () => void; quote: Quote | null }) => {
  const { t } = useTranslation();
  if (!open || !quote) return null;
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
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{quote.reference}</h2>
                <p className="text-xs text-neutral-500">{quote.customerName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={quote.status} />
                {quote.validUntil && (
                  <span className="text-xs text-neutral-500">
                    {t('sales.quotes.validUntil')}: {new Date(quote.validUntil).toLocaleDateString()}
                  </span>
                )}
              </div>
              {quote.notes && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  {quote.notes}
                </p>
              )}
              {/* Lines */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Lines</h3>
                {quote.lines?.length ? (
                  <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                          <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-400">Item</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Qty</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Unit Price</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Discount</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.lines.map((line) => (
                          <tr key={line.id} className="border-b border-neutral-50 dark:border-neutral-800/50">
                            <td className="px-3 py-2 font-medium">{line.itemName}</td>
                            <td className="px-3 py-2 text-right">{line.quantity}</td>
                            <td className="px-3 py-2 text-right">{line.unitPrice.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right">{line.discountPercent}%</td>
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
              {/* Totals */}
              <div className="flex flex-col items-end gap-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex gap-4 text-sm">
                  <span className="text-neutral-500">{t('sales.quotes.subtotal')}:</span>
                  <span className="font-medium">{quote.subtotal?.toFixed(2)}</span>
                </div>
                {quote.discountPercent > 0 && (
                  <div className="flex gap-4 text-sm">
                    <span className="text-neutral-500">{t('sales.quotes.discount')}:</span>
                    <span className="font-medium text-red-500">-{quote.discountPercent}%</span>
                  </div>
                )}
                <div className="flex gap-4 text-sm font-bold">
                  <span className="text-neutral-700 dark:text-neutral-300">{t('sales.quotes.total')}:</span>
                  <span className="text-indigo-700 dark:text-indigo-400">{quote.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Line Row ─────────────────────────────────────────────────────────────────

interface QuoteLineRow {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  quantity: string;
  unitPrice: string;
  discountPercent: string;
}

const newQuoteLineRow = (): QuoteLineRow => ({
  id: Math.random().toString(36).slice(2),
  itemId: '',
  itemName: '',
  itemSku: '',
  quantity: '',
  unitPrice: '',
  discountPercent: '0',
});

// ─── Quote Form Modal ─────────────────────────────────────────────────────────

const QuoteFormModal = ({
  open,
  onClose,
  quote,
  customers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  quote: Quote | null;
  customers: Customer[];
  onSaved: () => void;
}) => {
  const { t } = useTranslation();
  const [customerId, setCustomerId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<QuoteLineRow[]>([newQuoteLineRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quote) {
      setCustomerId(quote.customerId);
      setValidUntil(quote.validUntil?.slice(0, 10) ?? '');
      setDiscountPercent(quote.discountPercent.toString());
      setNotes(quote.notes ?? '');
      if (quote.lines?.length) {
        setLines(quote.lines.map(l => ({
          id: l.id,
          itemId: l.itemId,
          itemName: l.itemName,
          itemSku: l.itemSku ?? '',
          quantity: l.quantity.toString(),
          unitPrice: l.unitPrice.toString(),
          discountPercent: l.discountPercent.toString(),
        })));
      } else {
        setLines([newQuoteLineRow()]);
      }
    } else {
      setCustomerId('');
      setValidUntil('');
      setDiscountPercent('0');
      setNotes('');
      setLines([newQuoteLineRow()]);
    }
  }, [quote, open]);

  const { subtotal, total } = useMemo(() => {
    const sub = lines.reduce((sum, l) => {
      const lineTotal = (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0);
      const disc = parseFloat(l.discountPercent) || 0;
      return sum + lineTotal * (1 - disc / 100);
    }, 0);
    const disc = parseFloat(discountPercent) || 0;
    return { subtotal: sub, total: sub * (1 - disc / 100) };
  }, [lines, discountPercent]);

  const handleLineChange = (idx: number, field: keyof QuoteLineRow, value: string) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error(t('sales.quotes.selectCustomer')); return; }
    setSaving(true);
    try {
      const payload = {
        customerId,
        validUntil: validUntil || undefined,
        discountPercent: parseFloat(discountPercent) || 0,
        notes: notes.trim() || undefined,
        lines: lines.filter(l => l.itemName).map(l => ({
          itemId: l.itemId || undefined,
          itemName: l.itemName,
          itemSku: l.itemSku || undefined,
          quantity: parseFloat(l.quantity) || 0,
          unitPrice: parseFloat(l.unitPrice) || 0,
          discountPercent: parseFloat(l.discountPercent) || 0,
        })),
      };
      if (quote) {
        await salesService.updateQuote(quote.id, payload);
        toast.success(t('sales.quotes.updated'));
      } else {
        await salesService.createQuote(payload);
        toast.success(t('sales.quotes.created'));
      }
      onSaved();
      onClose();
    } catch {
      toast.error(t('sales.quotes.saveFailed'));
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
                {quote ? t('common.edit') : t('sales.quotes.new')}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Customer + Valid Until */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('sales.quotes.customer')} *</label>
                  <StyledSelect value={customerId} onChange={setCustomerId} options={customerOptions} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('sales.quotes.validUntil')}</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Discount + Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t('sales.quotes.discount')}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Notes</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                    placeholder="Notes..."
                  />
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lines</label>
                  <button
                    type="button"
                    onClick={() => setLines(prev => [...prev, newQuoteLineRow()])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Line
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-1">
                    {[t('sales.quotes.itemName'), t('sales.quotes.sku'), t('sales.quotes.qty'), t('sales.quotes.unitPrice'), t('sales.quotes.discountPct'), t('sales.quotes.lineTotal'), ''].map((h, i) => (
                      <div key={i} className={`text-xs font-semibold text-neutral-400 ${i === 5 ? 'col-span-2 text-right' : i === 6 ? 'col-span-1' : 'col-span-2'}`}>{h}</div>
                    ))}
                  </div>
                  {lines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                      <div className="col-span-2">
                        <input value={line.itemName} onChange={(e) => handleLineChange(idx, 'itemName', e.target.value)} placeholder="Item" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input value={line.itemSku} onChange={(e) => handleLineChange(idx, 'itemSku', e.target.value)} placeholder="SKU" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" value={line.quantity} onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)} placeholder="Qty" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)} placeholder="Price" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-1">
                        <input type="number" min="0" max="100" step="0.1" value={line.discountPercent} onChange={(e) => handleLineChange(idx, 'discountPercent', e.target.value)} placeholder="0" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      </div>
                      <div className="col-span-2 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {((parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0) * (1 - (parseFloat(line.discountPercent) || 0) / 100)).toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} disabled={lines.length === 1} className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="flex flex-col items-end gap-1 mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl">
                  <div className="flex gap-6 text-xs">
                    <span className="text-neutral-500">{t('sales.quotes.subtotal')}:</span>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-6 text-xs">
                    <span className="text-neutral-500">{t('sales.quotes.discount')} ({discountPercent}%):</span>
                    <span className="font-semibold text-red-500">-{(subtotal * (parseFloat(discountPercent) || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-6 text-sm font-bold border-t border-neutral-200 dark:border-neutral-700 pt-1 mt-1">
                    <span className="text-neutral-700 dark:text-neutral-300">{t('sales.quotes.total')}:</span>
                    <span className="text-indigo-700 dark:text-indigo-400">{total.toFixed(2)}</span>
                  </div>
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

const QuotesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await salesService.getQuotes({ status: statusFilter || undefined, customerId: customerFilter || undefined });
      const data = res.data;
      setQuotes(Array.isArray(data) ? data : (data?.content ?? []));
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

  useEffect(() => { fetchQuotes(); }, [statusFilter, customerFilter]);
  useEffect(() => { fetchCustomers(); }, []);

  const generateQuotePDF = (quote: Quote) => {
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
    doc.setFontSize(36);
    doc.setTextColor(26, 58, 108);
    doc.text('DEVIS', 14, 27);

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
    doc.text('FACTURÉ À', 14, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(quote.customerName, 14, infoY + 6);

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
    row('DEVIS N°', quote.reference);
    row('DATE', new Date(quote.createdAt).toLocaleDateString('fr-FR'));
    if (quote.validUntil) row('VALIDITÉ', new Date(quote.validUntil).toLocaleDateString('fr-FR'));
    row('STATUT', quote.status);

    // ── Second separator ──
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.5);
    doc.line(14, 87, W - 14, 87);

    // ── Table ──
    autoTable(doc, {
      startY: 92,
      head: [['QTÉ', 'DÉSIGNATION', 'PRIX UNIT. HT', 'REMISE', 'MONTANT HT']],
      body: (quote.lines || []).map(l => [
        l.quantity.toString(),
        l.itemName,
        l.unitPrice.toFixed(2),
        `${l.discountPercent}%`,
        l.totalPrice.toFixed(2),
      ]),
      headStyles: { fillColor: [26, 58, 108], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5, halign: 'center' },
      bodyStyles: { fontSize: 8.5, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [235, 242, 255] },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        2: { halign: 'right', cellWidth: 34 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 34 },
      },
      styles: { lineColor: [200, 215, 235], lineWidth: 0.2 },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 150;

    // ── Totals ──
    const tX = W - 80;
    const tVX = W - 14;
    let tY = finalY + 9;
    const subtotal = quote.subtotal ?? (quote.lines || []).reduce((s, l) => s + l.totalPrice, 0);
    const total = quote.totalAmount ?? subtotal;
    const disc = subtotal - total;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Total HT', tX, tY);
    doc.text(`${subtotal.toFixed(2)}`, tVX, tY, { align: 'right' });

    if (disc > 0.001) {
      tY += 6;
      doc.text('Remise globale', tX, tY);
      doc.text(`-${disc.toFixed(2)}`, tVX, tY, { align: 'right' });
    }

    tY += 5;
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.3);
    doc.line(tX, tY, tVX, tY);

    tY += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 108);
    doc.text('TOTAL HT', tX, tY);
    doc.text(`${total.toFixed(2)} €`, tVX, tY, { align: 'right' });

    // ── Footer ──
    doc.setDrawColor(26, 58, 108);
    doc.setLineWidth(0.4);
    doc.line(14, H - 33, W - 14, H - 33);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 58, 108);
    doc.text('CONDITIONS ET MODALITÉS', 14, H - 26);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text("Devis valable 30 jours à compter de la date d'émission.", 14, H - 20);
    doc.text('Pour toute question, contactez notre service commercial.', 14, H - 14);

    doc.save(`devis-${quote.reference}.pdf`);
  };

  const filtered = useMemo(() =>
    quotes.filter(q =>
      !searchTerm ||
      q.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [quotes, searchTerm]
  );

  const handleAction = async (action: string, quote: Quote) => {
    try {
      if (action === 'send') { await salesService.sendQuote(quote.id); toast.success(t('sales.quotes.sent')); }
      else if (action === 'accept') {
        await salesService.acceptQuote(quote.id);
        toast.success(t('sales.quotes.accepted'));
      }
      else if (action === 'reject') { await salesService.rejectQuote(quote.id); toast.success(t('sales.quotes.rejected')); }
      else if (action === 'convert') { await salesService.convertToDelivery(quote.id, {}); toast.success(t('sales.quotes.converted')); }
      else if (action === 'delete') {
        await salesService.deleteQuote(quote.id);
        toast.success(t('sales.quotes.deleted'));
      }
      fetchQuotes();
    } catch {
      toast.error(t('sales.quotes.actionFailed'));
    }
  };

  const statusOptions = [
    { value: '', label: t('common.allStatuses') },
    { value: 'DRAFT', label: t('sales.quotes.statusDraft') },
    { value: 'SENT', label: t('sales.quotes.statusSent') },
    { value: 'ACCEPTED', label: t('sales.quotes.statusAccepted') },
    { value: 'REJECTED', label: t('sales.quotes.statusRejected') },
    { value: 'EXPIRED', label: t('sales.quotes.statusExpired') },
    { value: 'CONVERTED', label: t('sales.quotes.statusConverted') },
  ];

  const customerOptions = [
    { value: '', label: t('sales.quotes.allCustomers') },
    ...customers.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t('sales.quotes.title')}</h1>
            <p className="text-xs text-neutral-500">{filtered.length} quote(s)</p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/sales/quotes/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('sales.quotes.new')}
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('sales.quotes.searchPlaceholder')}
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
          onClick={fetchQuotes}
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
                  t('sales.quotes.reference'),
                  t('sales.quotes.customer'),
                  t('sales.quotes.status'),
                  t('sales.quotes.validUntil'),
                  t('sales.quotes.total'),
                  t('common.actions'),
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">{h}</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                    <p className="text-sm text-neutral-500">{t('sales.quotes.emptyState')}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((quote) => (
                  <motion.tr
                    key={quote.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{quote.reference}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{quote.customerName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {quote.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button onClick={() => { setSelectedQuote(quote); setIsDetailOpen(true); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title={t('common.view')}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Download PDF */}
                        <button onClick={() => generateQuotePDF(quote)} className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download PDF">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit (DRAFT) */}
                        {quote.status === 'DRAFT' && hasPermission(PERMISSIONS.PRODUCTS_EDIT) && (
                          <button onClick={() => { setSelectedQuote(quote); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title={t('common.edit')}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Send (DRAFT) */}
                        {quote.status === 'DRAFT' && (
                          <button onClick={() => handleAction('send', quote)} className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" title={t('sales.quotes.send')}>
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Accept (SENT) */}
                        {quote.status === 'SENT' && (
                          <button onClick={() => handleAction('accept', quote)} className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title={t('sales.quotes.accept')}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Reject (SENT) */}
                        {quote.status === 'SENT' && (
                          <button onClick={() => handleAction('reject', quote)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={t('sales.quotes.reject')}>
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Convert (ACCEPTED) */}
                        {quote.status === 'ACCEPTED' && (
                          <button onClick={() => handleAction('convert', quote)} className="p-1.5 rounded-lg text-neutral-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors" title={t('sales.quotes.convert')}>
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete (DRAFT or REJECTED) */}
                        {(quote.status === 'DRAFT' || quote.status === 'REJECTED') && hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                          <button onClick={() => handleAction('delete', quote)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={t('common.delete')}>
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
      <DetailModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} quote={selectedQuote} />
      <QuoteFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        quote={selectedQuote}
        customers={customers}
        onSaved={fetchQuotes}
      />
    </div>
  );
};

export default QuotesPage;
