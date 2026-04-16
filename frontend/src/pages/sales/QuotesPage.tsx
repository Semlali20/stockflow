// frontend/src/pages/sales/QuotesPage.tsx

import { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
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

// ─── Detail Modal — PDF-accurate A4 preview ───────────────────────────────────

const DetailModal = ({
  open,
  onClose,
  quote,
  onDownload,
}: {
  open: boolean;
  onClose: () => void;
  quote: Quote | null;
  onDownload: (q: Quote) => void;
}) => {
  if (!open || !quote) return null;

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const fmtPrice = (v: number) =>
    v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';

  const subtotal = quote.subtotal ?? (quote.lines || []).reduce((s, l) => s + l.totalPrice, 0);
  const total = quote.totalAmount ?? subtotal;
  const discountAmount = subtotal - total;

  const statusLabelMap: Record<QuoteStatus, string> = {
    DRAFT: 'BROUILLON', SENT: 'ENVOYÉ', ACCEPTED: 'ACCEPTÉ',
    REJECTED: 'REJETÉ', EXPIRED: 'EXPIRÉ', CONVERTED: 'CONVERTI',
  };
  const statusColorMap: Record<QuoteStatus, { color: string; bg: string }> = {
    DRAFT:     { color: '#6b5500', bg: '#fef9c3' },
    SENT:      { color: '#1e40af', bg: '#dbeafe' },
    ACCEPTED:  { color: '#1a5e3f', bg: '#d1fae5' },
    REJECTED:  { color: '#9f1239', bg: '#ffe4e6' },
    EXPIRED:   { color: '#7c2d12', bg: '#ffedd5' },
    CONVERTED: { color: '#581c87', bg: '#f3e8ff' },
  };
  const { color: statusColor, bg: statusBg } = statusColorMap[quote.status] ?? statusColorMap.DRAFT;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
            className="w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '92vh' }}
          >
            {/* ── Modal toolbar ── */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-neutral-200 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-[#1a2e4a]">{quote.reference}</span>
                <StatusBadge status={quote.status} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDownload(quote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2e4a] text-white text-xs font-semibold hover:bg-[#243d60] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger PDF
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Paper preview ── */}
            <div className="overflow-y-auto bg-neutral-300 p-5" style={{ flex: 1 }}>
              {/* A4 white paper */}
              <div
                className="mx-auto bg-white shadow-xl"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '14mm',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  color: '#2d3748',
                  position: 'relative',
                }}
              >

                {/* ── HEADER ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6mm' }}>
                  {/* Left: Title + Company */}
                  <div>
                    <div style={{ fontSize: '22pt', fontWeight: 900, color: '#1a2e4a', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                      DEVIS
                    </div>
                    <div style={{ fontSize: '9pt', fontWeight: 700, color: '#1a2e4a', marginTop: '3mm' }}>
                      TechSupply Maroc
                    </div>
                    <div style={{ fontSize: '7.5pt', color: '#777', marginTop: '1mm' }}>Casablanca, Maroc</div>
                    <div style={{ fontSize: '7.5pt', color: '#777', marginTop: '0.5mm' }}>contact@techsupply.ma · +212 5XX XXX XXX</div>
                  </div>

                  {/* Right: Logo + Doc info */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3mm' }}>
                    <div style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '4px 14px', color: '#adb5bd', fontSize: '8pt', background: '#f8f9fc', letterSpacing: '2px', fontWeight: 600 }}>
                      LOGO
                    </div>
                    <div style={{ border: '1px solid #d2dae6', borderRadius: '4px', background: '#f8fafd', padding: '5px 10px', minWidth: '150px' }}>
                      {([
                        ['DEVIS N°', quote.reference],
                        ['DATE', fmtDate(quote.createdAt)],
                        quote.validUntil ? ['VALIDITÉ', fmtDate(quote.validUntil)] : null,
                        ['STATUT', statusLabelMap[quote.status]],
                      ] as ([string, string] | null)[]).filter(Boolean).map(([label, value]: any) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '6.5pt', fontWeight: 700, color: '#1a2e4a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                          <span style={{
                            fontSize: '7.5pt',
                            color: label === 'STATUT' ? statusColor : '#2d3748',
                            fontWeight: label === 'STATUT' ? 700 : 400,
                            background: label === 'STATUT' ? statusBg : 'transparent',
                            padding: label === 'STATUT' ? '1px 5px' : '0',
                            borderRadius: label === 'STATUT' ? '3px' : '0',
                          }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── TOP SEPARATOR ── */}
                <div style={{ borderTop: '1.5px solid #1a2e4a', marginBottom: '5mm' }} />

                {/* ── FACTURÉ À + META ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5mm' }}>
                  <div>
                    <div style={{ fontSize: '7pt', fontWeight: 700, color: '#1a2e4a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2mm' }}>
                      Facturé à
                    </div>
                    <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.5mm' }}>
                      {quote.customerName}
                    </div>
                    {quote.notes && (
                      <div style={{ fontSize: '7.5pt', color: '#888', marginTop: '2mm', fontStyle: 'italic', maxWidth: '80mm' }}>
                        {quote.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '90mm' }}>
                    {([
                      ['CRÉÉ LE', fmtDate(quote.createdAt)],
                      quote.validUntil ? ['VALIDE JUSQU\'AU', fmtDate(quote.validUntil)] : null,
                    ] as ([string, string] | null)[]).filter(Boolean).map(([label, value]: any) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8mm', marginBottom: '2.5mm' }}>
                        <span style={{ fontSize: '7pt', fontWeight: 700, color: '#1a2e4a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                        <span style={{ fontSize: '8.5pt', color: '#2d3748', minWidth: '40mm', textAlign: 'right' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── SECTION SEPARATOR ── */}
                <div style={{ borderTop: '0.5px solid #ced4da', marginBottom: '4mm' }} />

                {/* ── ITEMS TABLE ── */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                  <thead>
                    <tr>
                      {[
                        { label: 'DÉSIGNATION', align: 'left' },
                        { label: 'QTÉ', align: 'center' },
                        { label: 'PRIX UNIT. HT', align: 'right' },
                        { label: 'REMISE', align: 'center' },
                        { label: 'MONTANT HT', align: 'right' },
                      ].map((h) => (
                        <th key={h.label} style={{ background: '#1a2e4a', color: '#fff', fontWeight: 700, padding: '4mm 5mm', textAlign: h.align as React.CSSProperties['textAlign'], fontSize: '8pt', letterSpacing: '0.3px' }}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(quote.lines || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '8mm', textAlign: 'center', color: '#aaa', fontStyle: 'italic', fontSize: '8pt', border: '1px solid #dee2e6' }}>
                          Aucune ligne
                        </td>
                      </tr>
                    ) : (
                      (quote.lines || []).map((line, idx) => (
                        <tr key={line.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                          <td style={{ padding: '3.5mm 5mm', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748' }}>
                            <div style={{ fontWeight: 600 }}>{line.itemName}</div>
                            {line.itemSku && <div style={{ fontSize: '7pt', color: '#888', marginTop: '0.5mm' }}>SKU: {line.itemSku}</div>}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'center', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748', fontFamily: 'monospace' }}>
                            {line.quantity}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'right', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {fmtPrice(line.unitPrice)}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'center', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: line.discountPercent > 0 ? '#b45309' : '#aaa' }}>
                            {line.discountPercent > 0 ? `-${line.discountPercent}%` : '—'}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'right', borderBottom: '1px solid #dee2e6', color: '#1a2e4a', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {fmtPrice(line.totalPrice)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* ── SUMMARY BOX ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6mm' }}>
                  <div style={{ border: '1px solid #d2dae6', borderRadius: '4px', background: '#f8fafd', padding: '5mm 8mm', minWidth: '100mm' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5mm' }}>
                      <span style={{ fontSize: '8pt', color: '#555' }}>Sous-total HT</span>
                      <span style={{ fontSize: '8.5pt', color: '#2d3748', fontFamily: 'monospace' }}>{fmtPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0.001 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5mm' }}>
                        <span style={{ fontSize: '8pt', color: '#b45309' }}>Remise globale ({quote.discountPercent}%)</span>
                        <span style={{ fontSize: '8.5pt', color: '#b45309', fontFamily: 'monospace' }}>-{fmtPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #d2dae6', margin: '2.5mm 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10pt', fontWeight: 700, color: '#1a2e4a' }}>TOTAL HT</span>
                      <span style={{ fontSize: '11pt', fontWeight: 700, color: '#1a2e4a', fontFamily: 'monospace' }}>{fmtPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* ── SPACER ── */}
                <div style={{ minHeight: '12mm' }} />

                {/* ── FOOTER SEPARATOR ── */}
                <div style={{ borderTop: '1px solid #1a2e4a', marginTop: '4mm', marginBottom: '4mm' }} />

                {/* ── SIGNATURE ZONE ── */}
                <div style={{ display: 'flex', gap: '8mm', marginBottom: '5mm' }}>
                  {['Signature émetteur', 'Bon pour accord — Client'].map((label) => (
                    <div key={label} style={{ flex: 1, border: '1px solid #d2dae6', borderRadius: '4px', padding: '3mm 5mm', minHeight: '26mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#1a2e4a', textAlign: 'center' }}>{label}</div>
                      <div style={{ borderTop: '1px solid #c8d4e0', marginTop: '14mm', marginLeft: '8mm', marginRight: '8mm' }} />
                    </div>
                  ))}
                </div>

                {/* ── TERMS ── */}
                <div style={{ textAlign: 'center', fontSize: '6.5pt', color: '#9ca3af', borderTop: '0.5px solid #e5e7eb', paddingTop: '2mm' }}>
                  Devis valable 30 jours — Tout accord doit être signé et retourné — TechSupply Maroc © 2024
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
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
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W  = doc.internal.pageSize.getWidth();   // 210
    const H  = doc.internal.pageSize.getHeight();  // 297
    const ML = 14;  // left margin
    const MR = 14;  // right margin
    const RX = W - MR; // right edge x
    const UW = W - ML - MR; // usable width

    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const fmtPrice = (v: number) =>
      v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';

    // ── LEFT: Title + Company ──────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(26, 46, 74);
    doc.text('DEVIS', ML, 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(26, 46, 74);
    doc.text('TechSupply Maroc', ML, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 125, 138);
    doc.text('Casablanca, Maroc', ML, 37);
    doc.text('contact@techsupply.ma · +212 5XX XXX XXX', ML, 41);

    // ── RIGHT: Logo placeholder ────────────────────────────────────
    const logoX = RX - 48;
    doc.setDrawColor(200, 205, 218);
    doc.setFillColor(248, 249, 252);
    doc.setLineWidth(0.3);
    doc.roundedRect(logoX, 12, 22, 12, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(170, 175, 192);
    doc.text('LOGO', logoX + 11, 19, { align: 'center' });

    // ── RIGHT: Document info box ───────────────────────────────────
    const ibX = RX - 48;
    const ibY = 27;
    const ibW = 48;
    const statusLabelMap: Record<QuoteStatus, string> = {
      DRAFT: 'BROUILLON', SENT: 'ENVOYÉ', ACCEPTED: 'ACCEPTÉ',
      REJECTED: 'REJETÉ', EXPIRED: 'EXPIRÉ', CONVERTED: 'CONVERTI',
    };
    const ibRows: [string, string][] = [
      ['DEVIS N°', quote.reference],
      ['DATE', fmtDate(quote.createdAt)],
      ...(quote.validUntil ? [['VALIDITÉ', fmtDate(quote.validUntil)] as [string, string]] : []),
      ['STATUT', statusLabelMap[quote.status] ?? quote.status],
    ];
    const ibH = 6 + ibRows.length * 6.5;
    doc.setDrawColor(210, 218, 232);
    doc.setFillColor(248, 250, 253);
    doc.setLineWidth(0.25);
    doc.roundedRect(ibX, ibY, ibW, ibH, 2, 2, 'FD');
    let ibRowY = ibY + 6;
    ibRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(26, 46, 74);
      doc.text(label, ibX + 3, ibRowY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(42, 47, 58);
      doc.text(value, ibX + ibW - 3, ibRowY, { align: 'right' });
      ibRowY += 6.5;
    });

    // ── TOP SEPARATOR ──────────────────────────────────────────────
    doc.setDrawColor(26, 46, 74);
    doc.setLineWidth(0.5);
    doc.line(ML, 46, RX, 46);

    // ── FACTURÉ À (left) ──────────────────────────────────────────
    const sec2Y = 54;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(26, 46, 74);
    doc.text('FACTURÉ À', ML, sec2Y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(25, 30, 42);
    doc.text(quote.customerName, ML, sec2Y + 7);

    if (quote.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 135, 148);
      const notesLines = doc.splitTextToSize(quote.notes, 82);
      doc.text(notesLines, ML, sec2Y + 14);
    }

    // ── META (right) ───────────────────────────────────────────────
    const metaX = W / 2 + 5;
    let metaRowY = sec2Y;
    const metaRows: [string, string][] = [
      ['CRÉÉ LE', fmtDate(quote.createdAt)],
      ...(quote.validUntil ? [['VALIDE JUSQU\'AU', fmtDate(quote.validUntil)] as [string, string]] : []),
    ];
    metaRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(26, 46, 74);
      doc.text(label, metaX, metaRowY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(42, 47, 58);
      doc.text(value, RX, metaRowY, { align: 'right' });
      metaRowY += 7;
    });

    // ── SECTION SEPARATOR ──────────────────────────────────────────
    doc.setDrawColor(210, 218, 228);
    doc.setLineWidth(0.3);
    doc.line(ML, 80, RX, 80);

    // ── ITEMS TABLE ────────────────────────────────────────────────
    autoTable(doc, {
      startY: 85,
      head: [['DÉSIGNATION', 'QTÉ', 'PRIX UNIT. HT', 'REMISE', 'MONTANT HT']],
      body: (quote.lines || []).map(l => [
        l.itemSku ? `${l.itemName}\n(SKU: ${l.itemSku})` : l.itemName,
        l.quantity.toString(),
        fmtPrice(l.unitPrice),
        l.discountPercent > 0 ? `-${l.discountPercent}%` : '—',
        fmtPrice(l.totalPrice),
      ]),
      headStyles: {
        fillColor: [26, 46, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [42, 50, 65],
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'right', cellWidth: 36 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 36 },
      },
      styles: { lineColor: [220, 226, 235], lineWidth: 0.2, overflow: 'linebreak' },
      margin: { left: ML, right: MR },
    });

    const finalY: number = (doc as any).lastAutoTable?.finalY ?? 165;

    // ── SUMMARY BOX ────────────────────────────────────────────────
    const subtotal = quote.subtotal ?? (quote.lines || []).reduce((s, l) => s + l.totalPrice, 0);
    const total    = quote.totalAmount ?? subtotal;
    const discAmt  = subtotal - total;

    const sumBoxX = W / 2 + 10;
    const sumBoxW = RX - sumBoxX;
    const sumBoxY = finalY + 8;
    const hasDisc = discAmt > 0.001;
    const sumBoxH = hasDisc ? 32 : 22;

    doc.setFillColor(248, 250, 253);
    doc.setDrawColor(210, 218, 232);
    doc.setLineWidth(0.25);
    doc.roundedRect(sumBoxX, sumBoxY, sumBoxW, sumBoxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 82, 98);
    doc.text('Sous-total HT', sumBoxX + 4, sumBoxY + 7);
    doc.setFontSize(8.5);
    doc.setTextColor(42, 47, 58);
    doc.text(fmtPrice(subtotal), sumBoxX + sumBoxW - 4, sumBoxY + 7, { align: 'right' });

    let sumCurY = sumBoxY + 7;
    if (hasDisc) {
      sumCurY += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9);
      doc.text(`Remise globale (${quote.discountPercent}%)`, sumBoxX + 4, sumCurY);
      doc.text(`-${fmtPrice(discAmt)}`, sumBoxX + sumBoxW - 4, sumCurY, { align: 'right' });
    }

    doc.setDrawColor(210, 218, 232);
    doc.setLineWidth(0.2);
    doc.line(sumBoxX + 4, sumCurY + 4, sumBoxX + sumBoxW - 4, sumCurY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 46, 74);
    doc.text('TOTAL HT', sumBoxX + 4, sumCurY + 11);
    doc.text(fmtPrice(total), sumBoxX + sumBoxW - 4, sumCurY + 11, { align: 'right' });

    // ── FOOTER SEPARATOR ───────────────────────────────────────────
    doc.setDrawColor(26, 46, 74);
    doc.setLineWidth(0.4);
    doc.line(ML, H - 52, RX, H - 52);

    // ── SIGNATURE ZONE ─────────────────────────────────────────────
    const sigZoneY = H - 49;
    const sigBoxW  = (UW - 8) / 2;
    const sigBoxH  = 26;

    ['Signature émetteur', 'Bon pour accord — Client'].forEach((label, i) => {
      const sigX = ML + i * (sigBoxW + 8);
      doc.setDrawColor(200, 210, 228);
      doc.setLineWidth(0.25);
      doc.roundedRect(sigX, sigZoneY, sigBoxW, sigBoxH, 2, 2, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(26, 46, 74);
      doc.text(label, sigX + sigBoxW / 2, sigZoneY + 6, { align: 'center' });
      doc.setDrawColor(185, 200, 220);
      doc.setLineWidth(0.3);
      doc.line(sigX + 8, sigZoneY + sigBoxH - 6, sigX + sigBoxW - 8, sigZoneY + sigBoxH - 6);
    });

    // ── TERMS ──────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'Devis valable 30 jours — Tout accord doit être signé et retourné — TechSupply Maroc © 2024',
      W / 2, H - 8, { align: 'center' },
    );

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
      <DetailModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} quote={selectedQuote} onDownload={generateQuotePDF} />
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
