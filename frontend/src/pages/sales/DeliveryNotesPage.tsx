// frontend/src/pages/sales/DeliveryNotesPage.tsx

import { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, RefreshCw, Truck, X, ChevronDown,
  Eye, Edit2, CheckCircle2, Package, Download, Trash2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { salesService } from '@/services/sales.service';
import { DeliveryNote, DeliveryNoteStatus, Customer } from '@/types';
import { toast } from 'react-hot-toast';
import { Pagination } from '@/components/ui/Pagination';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

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
};

const StatusBadge = ({ status }: { status: DeliveryNoteStatus }) => {
  const { t } = useTranslation();
  const labelMap: Record<DeliveryNoteStatus, string> = {
    DRAFT: t('sales.deliveryNotes.statusDraft'),
    VALIDATED: t('sales.deliveryNotes.statusValidated'),
  };
  const className = DN_STATUS_CLASS[status] ?? DN_STATUS_CLASS.DRAFT;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {labelMap[status] ?? labelMap.DRAFT}
    </span>
  );
};

// ─── Detail Modal — PDF-accurate HTML preview ─────────────────────────────────

const DetailModal = ({
  open,
  onClose,
  note,
  onDownload,
}: {
  open: boolean;
  onClose: () => void;
  note: DeliveryNote | null;
  onDownload: (n: DeliveryNote) => void;
}) => {
  if (!open || !note) return null;

  const totalOrdered = (note.lines || []).reduce((s, l) => s + l.orderedQuantity, 0);
  const totalDelivered = totalOrdered;
  const totalAmount = (note.lines || []).reduce((s, l) => {
    if (l.totalPrice != null && l.totalPrice > 0) return s + l.totalPrice;
    const qty = l.deliveredQuantity > 0 ? l.deliveredQuantity : l.orderedQuantity;
    return s + (qty * (l.unitPrice ?? 0));
  }, 0);
  const hasPrices = (note.lines || []).some(l => l.unitPrice != null && l.unitPrice > 0);
  const fmtPrice = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u00A0/g, ' ') + ' MAD';

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  const statusLabel = note.status === 'VALIDATED' ? 'VALIDÉ' : 'BROUILLON';
  const statusColor = note.status === 'VALIDATED' ? '#1a5e3f' : '#6b5500';
  const statusBg   = note.status === 'VALIDATED' ? '#d1fae5' : '#fef9c3';

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
                <span className="font-bold text-sm text-[#1a2e4a]">{note.reference}</span>
                <StatusBadge status={note.status} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDownload(note)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2e4a] text-white text-xs font-semibold hover:bg-[#243d60] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger PDF
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                >
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
                      BON DE LIVRAISON
                    </div>
                    <div style={{ fontSize: '9pt', fontWeight: 700, color: '#1a2e4a', marginTop: '3mm' }}>
                      TechSupply Maroc
                    </div>
                    <div style={{ fontSize: '7.5pt', color: '#777', marginTop: '1mm' }}>
                      Casablanca, Maroc
                    </div>
                    <div style={{ fontSize: '7.5pt', color: '#777', marginTop: '0.5mm' }}>
                      contact@techsupply.ma · +212 5XX XXX XXX
                    </div>
                  </div>

                  {/* Right: Logo + Doc info box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3mm' }}>
                    {/* Logo placeholder */}
                    <div style={{
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      padding: '4px 14px',
                      color: '#adb5bd',
                      fontSize: '8pt',
                      background: '#f8f9fc',
                      letterSpacing: '2px',
                      fontWeight: 600,
                    }}>
                      LOGO
                    </div>

                    {/* Document info box */}
                    <div style={{
                      border: '1px solid #d2dae6',
                      borderRadius: '4px',
                      background: '#f8fafd',
                      padding: '5px 10px',
                      minWidth: '140px',
                    }}>
                      {[
                        ['BON N°', note.reference],
                        ['DATE', fmtDate(note.createdAt)],
                        ['STATUT', statusLabel],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '6.5pt', fontWeight: 700, color: '#1a2e4a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {label}
                          </span>
                          <span style={{
                            fontSize: '7.5pt',
                            color: label === 'STATUT' ? statusColor : '#2d3748',
                            fontWeight: label === 'STATUT' ? 700 : 400,
                            background: label === 'STATUT' ? statusBg : 'transparent',
                            padding: label === 'STATUT' ? '1px 5px' : '0',
                            borderRadius: label === 'STATUT' ? '3px' : '0',
                          }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── TOP SEPARATOR ── */}
                <div style={{ borderTop: '1.5px solid #1a2e4a', marginBottom: '5mm' }} />

                {/* ── LIVRÉ À + META ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5mm' }}>

                  {/* Left: client */}
                  <div>
                    <div style={{ fontSize: '7pt', fontWeight: 700, color: '#1a2e4a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2mm' }}>
                      Livré à
                    </div>
                    <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#1a2e4a', marginBottom: '1.5mm' }}>
                      {note.customerName}
                    </div>
                    {note.deliveryAddress && (
                      <div style={{ fontSize: '8pt', color: '#555', lineHeight: 1.5, maxWidth: '80mm' }}>
                        {note.deliveryAddress}
                      </div>
                    )}
                    {note.notes && (
                      <div style={{ fontSize: '7.5pt', color: '#888', marginTop: '2mm', fontStyle: 'italic', maxWidth: '80mm' }}>
                        {note.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: meta rows */}
                  <div style={{ textAlign: 'right', minWidth: '90mm' }}>
                    {[
                      note.deliveryDate ? ['DATE DE LIVRAISON', fmtDate(note.deliveryDate)] : null,
                      note.quoteId ? ['RÉFÉRENCE DEVIS', note.quoteId] : null,
                      ['CRÉÉ LE', fmtDate(note.createdAt)],
                    ].filter(Boolean).map(([label, value]: any) => (
                      <div key={label as string} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8mm', marginBottom: '2.5mm' }}>
                        <span style={{ fontSize: '7pt', fontWeight: 700, color: '#1a2e4a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {label}
                        </span>
                        <span style={{ fontSize: '8.5pt', color: '#2d3748', minWidth: '40mm', textAlign: 'right' }}>
                          {value}
                        </span>
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
                        { label: 'QTÉ LIVRÉE', align: 'center' },
                        { label: 'PRIX UNIT. HT', align: 'right' },
                        { label: 'REMISE', align: 'center' },
                        { label: 'MONTANT HT', align: 'right' },
                        { label: 'REMARQUES', align: 'left' },
                      ].map((h) => (
                        <th
                          key={h.label}
                          style={{
                            background: '#1a2e4a',
                            color: '#fff',
                            fontWeight: 700,
                            padding: '4mm 5mm',
                            textAlign: h.align as React.CSSProperties['textAlign'],
                            fontSize: '8pt',
                            letterSpacing: '0.3px',
                            borderBottom: 'none',
                          }}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(note.lines || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ padding: '8mm', textAlign: 'center', color: '#aaa', fontStyle: 'italic', fontSize: '8pt', border: '1px solid #dee2e6' }}
                        >
                          Aucune ligne
                        </td>
                      </tr>
                    ) : (
                      (note.lines || []).map((line, idx) => (
                        <tr key={line.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                          <td style={{ padding: '3.5mm 5mm', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748' }}>
                            <div style={{ fontWeight: 600 }}>{line.itemName}</div>
                            {line.itemSku && (
                              <div style={{ fontSize: '7pt', color: '#888', marginTop: '0.5mm' }}>SKU: {line.itemSku}</div>
                            )}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'center', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748', fontFamily: 'monospace' }}>
                            {line.orderedQuantity}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'right', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {line.unitPrice != null ? fmtPrice(line.unitPrice) : '—'}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'center', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#2d3748', fontFamily: 'monospace' }}>
                            {line.discountPercent != null && line.discountPercent > 0 ? `${line.discountPercent}%` : '—'}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', textAlign: 'right', borderBottom: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', color: '#1a2e4a', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {line.totalPrice != null ? fmtPrice(line.totalPrice) : line.unitPrice != null ? fmtPrice(line.orderedQuantity * line.unitPrice) : '—'}
                          </td>
                          <td style={{ padding: '3.5mm 5mm', borderBottom: '1px solid #dee2e6', color: '#555', fontSize: '8pt' }}>
                            {line.notes ?? (line.lotId ? `Lot: ${line.lotId}` : line.serialId ? `S/N: ${line.serialId}` : '—')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* ── SUMMARY ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6mm' }}>
                  <div style={{
                    border: '1px solid #d2dae6',
                    borderRadius: '4px',
                    background: '#f8fafd',
                    padding: '5mm 8mm',
                    minWidth: '90mm',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5mm' }}>
                      <span style={{ fontSize: '8pt', color: '#555' }}>Total articles commandés</span>
                      <span style={{ fontSize: '8.5pt', color: '#2d3748', fontFamily: 'monospace' }}>{totalOrdered}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5mm' }}>
                      <span style={{ fontSize: '8pt', color: '#555' }}>Total articles livrés</span>
                      <span style={{ fontSize: '8.5pt', color: '#2d3748', fontFamily: 'monospace' }}>{totalDelivered}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #d2dae6', margin: '2.5mm 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10pt', fontWeight: 700, color: '#1a2e4a' }}>MONTANT TOTAL</span>
                      <span style={{ fontSize: '11pt', fontWeight: 700, color: '#1a2e4a', fontFamily: 'monospace' }}>
                        {hasPrices ? fmtPrice(totalAmount) : `${totalDelivered} unités`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── SPACER ── */}
                <div style={{ minHeight: '12mm' }} />

                {/* ── FOOTER SEPARATOR ── */}
                <div style={{ borderTop: '1px solid #1a2e4a', marginTop: '4mm', marginBottom: '4mm' }} />

                {/* ── SIGNATURE ZONE ── */}
                <div style={{ display: 'flex', gap: '8mm', marginBottom: '5mm' }}>
                  {['Signature émetteur', 'Signature récepteur'].map((label) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        border: '1px solid #d2dae6',
                        borderRadius: '4px',
                        padding: '3mm 5mm',
                        minHeight: '26mm',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#1a2e4a', textAlign: 'center' }}>
                        {label}
                      </div>
                      <div style={{ borderTop: '1px solid #c8d4e0', marginTop: '14mm', marginLeft: '8mm', marginRight: '8mm' }} />
                    </div>
                  ))}
                </div>

                {/* ── TERMS ── */}
                <div style={{ textAlign: 'center', fontSize: '6.5pt', color: '#9ca3af', borderTop: '0.5px solid #e5e7eb', paddingTop: '2mm' }}>
                  Marchandise vérifiée à la réception — Toute réclamation doit être signalée dans les 48h — TechSupply Maroc © 2024
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

interface DNLineRow {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  orderedQuantity: string;
  deliveredQuantity: string;
  unitPrice: string;
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
  unitPrice: '',
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
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DNLineRow[]>([newDNLineRow()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setCustomerId(note.customerId);
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
          unitPrice: l.unitPrice != null ? l.unitPrice.toString() : '',
          lotId: l.lotId ?? '',
          serialId: l.serialId ?? '',
        })));
      } else {
        setLines([newDNLineRow()]);
      }
    } else {
      setCustomerId('');
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
        deliveryDate: deliveryDate || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
        lines: lines.filter(l => l.itemName).map(l => ({
          itemId: l.itemId || undefined,
          itemName: l.itemName,
          itemSku: l.itemSku || undefined,
          orderedQuantity: parseFloat(l.orderedQuantity) || 0,
          deliveredQuantity: parseFloat(l.deliveredQuantity) || 0,
          unitPrice: l.unitPrice ? parseFloat(l.unitPrice) : undefined,
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

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
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
                    <div key={line.id} className="grid gap-2 items-center p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr auto' }}>
                      <input value={line.itemName} onChange={(e) => handleLineChange(idx, 'itemName', e.target.value)} placeholder="Item name" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input value={line.itemSku} onChange={(e) => handleLineChange(idx, 'itemSku', e.target.value)} placeholder="SKU" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input type="number" min="0" value={line.orderedQuantity} onChange={(e) => handleLineChange(idx, 'orderedQuantity', e.target.value)} placeholder="Ordered" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input type="number" min="0" value={line.deliveredQuantity} onChange={(e) => handleLineChange(idx, 'deliveredQuantity', e.target.value)} placeholder="Delivered" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)} placeholder="Unit price" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <input value={line.lotId || line.serialId} onChange={(e) => handleLineChange(idx, 'lotId', e.target.value)} placeholder="Lot/Serial" className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                      <button type="button" onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))} disabled={lines.length === 1} className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
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
    </AnimatePresence>,
    document.body,
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DeliveryNotesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, customerFilter]);

  const openDetail = async (note: DeliveryNote) => {
    try {
      const res = await salesService.getDeliveryNoteById(note.id);
      let fullNote = res.data ?? note;

      // If prices are missing and the note was converted from a quote,
      // fetch the original quote and backfill unit prices from its lines.
      if (
        fullNote.quoteId &&
        (fullNote.lines ?? []).some((l: any) => l.unitPrice == null || l.unitPrice === 0)
      ) {
        try {
          const quoteRes = await salesService.getQuoteById(fullNote.quoteId);
          const quoteLines: any[] = quoteRes.data?.lines ?? [];
          if (quoteLines.length > 0) {
            fullNote = {
              ...fullNote,
              lines: (fullNote.lines ?? []).map((line: any) => {
                if (line.unitPrice != null && line.unitPrice > 0) return line;
                // Match by itemId first, then by position
                const match =
                  quoteLines.find((ql: any) => ql.itemId && ql.itemId === line.itemId) ??
                  quoteLines[(fullNote.lines ?? []).indexOf(line)];
                if (!match) return line;
                const qty = line.deliveredQuantity > 0 ? line.deliveredQuantity : line.orderedQuantity;
                const unitPrice = match.unitPrice ?? null;
                const discountPercent = match.discountPercent ?? 0;
                const totalPrice =
                  match.totalPrice != null
                    ? match.totalPrice
                    : unitPrice != null
                    ? +(unitPrice * qty * (1 - discountPercent / 100)).toFixed(2)
                    : null;
                return { ...line, unitPrice, discountPercent, totalPrice };
              }),
            };
          }
        } catch {
          /* ignore — show whatever data we have */
        }
      }

      setSelectedNote(fullNote);
    } catch {
      setSelectedNote(note);
    }
    setIsDetailOpen(true);
  };

  // ─── PDF Generation ──────────────────────────────────────────────────────────

  const generateDeliveryNotePDF = (note: DeliveryNote) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W  = doc.internal.pageSize.getWidth();
    const H  = doc.internal.pageSize.getHeight();
    const ML = 14;
    const MR = 14;
    const RX = W - MR;
    const UW = W - ML - MR;

    // ── Helpers ────────────────────────────────────────────────────
    const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
    const fmtNum  = (v: number) => {
      const parts = v.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join(',');
    };
    const pdfFmtPrice = (v: number) => fmtNum(v) + ' MAD';

    const statusLabelMap: Record<string, string> = {
      VALIDATED: 'VALIDE',
      DRAFT:     'BROUILLON',
    };
    const statusColorMap: Record<string, [number, number, number]> = {
      VALIDATED: [22,  163, 74],
      DRAFT:     [100, 116, 139],
    };

    // ── HEADER BAND ────────────────────────────────────────────────
    doc.setFillColor(15, 28, 58);
    doc.rect(0, 0, W, 42, 'F');
    // Teal accent stripe (matching delivery note theme)
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 40, W, 2.5, 'F');

    // Company name left
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('TechSupply Maroc', ML, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 172, 210);
    doc.text('Casablanca, Maroc', ML, 24);
    doc.text('contact@techsupply.ma  |  +212 5XX XXX XXX', ML, 30);

    // BON DE LIVRAISON title right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('BON DE LIVRAISON', RX, 18, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 172, 210);
    doc.text(note.reference, RX, 29, { align: 'right' });

    // ── INFO STRIP (light bg below header) ─────────────────────────
    doc.setFillColor(244, 246, 251);
    doc.rect(0, 42.5, W, 22, 'F');

    const infoItems: [string, string][] = [
      ['DATE', fmtDate(note.createdAt)],
      ['LIVRAISON', note.deliveryDate ? fmtDate(note.deliveryDate) : '—'],
      ['STATUT', statusLabelMap[note.status] ?? note.status],
      ['BON N°', note.reference],
    ];
    const infoColW = UW / infoItems.length;
    infoItems.forEach(([label, value], i) => {
      const x = ML + i * infoColW;
      if (i > 0) {
        doc.setDrawColor(210, 220, 235);
        doc.setLineWidth(0.3);
        doc.line(x - 4, 46, x - 4, 62);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(label, x, 49);
      if (label === 'STATUT') {
        const sc = statusColorMap[note.status] ?? [100, 116, 139];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(sc[0], sc[1], sc[2]);
        doc.text(value, x, 58);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 30, 55);
        doc.text(value, x, 58);
      }
    });

    // Bottom border of info strip
    doc.setDrawColor(210, 220, 235);
    doc.setLineWidth(0.4);
    doc.line(0, 64.5, W, 64.5);

    // ── LIVRÉ À + META SECTION ─────────────────────────────────────
    const billY = 74;

    // Left: LIVRÉ À label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(20, 184, 166);
    doc.text('LIVRE A', ML, billY);

    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.5);
    doc.line(ML, billY + 1.5, ML + 16, billY + 1.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 28, 58);
    doc.text(note.customerName, ML, billY + 9);

    if (note.deliveryAddress) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const addrLines = doc.splitTextToSize(note.deliveryAddress, 90);
      doc.text(addrLines, ML, billY + 16);
    }

    if (note.notes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 135, 148);
      const notesLines = doc.splitTextToSize(note.notes, 90);
      doc.text(notesLines, ML, billY + (note.deliveryAddress ? 23 : 16));
    }

    // Right: meta info box
    const metaBoxX = W / 2 + 15;
    const metaBoxW = RX - metaBoxX;
    const metaRows: [string, string][] = [
      ['Cree le', fmtDate(note.createdAt)],
      ...(note.deliveryDate ? [['Date de livraison', fmtDate(note.deliveryDate)] as [string, string]] : []),
      ...(note.quoteId      ? [['Ref. devis', note.quoteId] as [string, string]] : []),
    ];
    const metaBoxH = 10 + metaRows.length * 9;

    doc.setFillColor(248, 250, 253);
    doc.setDrawColor(220, 228, 242);
    doc.setLineWidth(0.25);
    doc.roundedRect(metaBoxX, billY - 5, metaBoxW, metaBoxH, 2, 2, 'FD');

    // Teal accent bar
    doc.setFillColor(20, 184, 166);
    doc.roundedRect(metaBoxX, billY - 5, 2, metaBoxH, 1, 1, 'F');

    let metaRowY = billY + 2;
    metaRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(label, metaBoxX + 6, metaRowY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 28, 58);
      doc.text(value, metaBoxX + metaBoxW - 4, metaRowY, { align: 'right' });
      metaRowY += 9;
    });

    // ── ITEMS TABLE ────────────────────────────────────────────────
    const pdfHasPrices = (note.lines || []).some(l => l.unitPrice != null && l.unitPrice > 0);

    const tableHead = pdfHasPrices
      ? [['DESIGNATION', 'QTE LIVREE', 'PRIX UNIT.', 'REMISE', 'MONTANT HT', 'REMARQUES']]
      : [['DESIGNATION', 'QTE LIVREE', 'REMARQUES']];

    const tableBody = (note.lines || []).map(l => {
      const base = [
        l.itemSku ? `${l.itemName}\n(SKU: ${l.itemSku})` : l.itemName,
        l.orderedQuantity.toString(),
      ];
      if (pdfHasPrices) {
        base.push(l.unitPrice != null ? pdfFmtPrice(l.unitPrice) : '—');
        base.push(l.discountPercent != null && l.discountPercent > 0 ? `${l.discountPercent}%` : '—');
        const montant = l.totalPrice != null
          ? pdfFmtPrice(l.totalPrice)
          : l.unitPrice != null
          ? pdfFmtPrice(l.orderedQuantity * l.unitPrice)
          : '—';
        base.push(montant);
      }
      base.push(l.notes ?? (l.lotId ? `Lot: ${l.lotId}` : l.serialId ? `S/N: ${l.serialId}` : ''));
      return base;
    });

    const columnStyles: Record<number, object> = pdfHasPrices
      ? {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { halign: 'center', cellWidth: 18 },
          2: { halign: 'right', cellWidth: 38 },
          3: { halign: 'center', cellWidth: 16 },
          4: { halign: 'right', cellWidth: 38 },
          5: { cellWidth: 28, fontStyle: 'normal' },
        }
      : {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { halign: 'center', cellWidth: 36 },
          2: { cellWidth: 44, fontStyle: 'normal' },
        };

    autoTable(doc, {
      startY: 100,
      head: tableHead,
      body: tableBody,
      headStyles: {
        fillColor: [15, 28, 58],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 40, 65],
        cellPadding: { top: 4.5, bottom: 4.5, left: 5, right: 5 },
      },
      alternateRowStyles: { fillColor: [247, 249, 253] },
      columnStyles,
      styles: { lineColor: [225, 232, 245], lineWidth: 0.2, overflow: 'linebreak' },
      margin: { left: ML, right: MR },
      didParseCell: (data) => {
        if (data.section === 'head') {
          data.cell.styles.lineColor = [20, 184, 166];
          data.cell.styles.lineWidth = { bottom: 0.8, top: 0, left: 0, right: 0 };
        }
      },
    });

    const finalY: number = (doc as any).lastAutoTable?.finalY ?? 165;

    // ── SUMMARY ────────────────────────────────────────────────────
    const totalOrdered = (note.lines || []).reduce((s, l) => s + l.orderedQuantity, 0);
    const totalAmount  = (note.lines || []).reduce((s, l) => {
      if (l.totalPrice != null && l.totalPrice > 0) return s + l.totalPrice;
      return s + (l.orderedQuantity * (l.unitPrice ?? 0));
    }, 0);

    const sumX = W / 2 + 12;
    const sumW = RX - sumX;
    let   sumY = finalY + 10;

    // Ordered qty row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Total articles commandes', sumX, sumY);
    doc.setTextColor(30, 40, 65);
    doc.text(totalOrdered.toString(), RX, sumY, { align: 'right' });
    sumY += 8;

    // Teal separator line
    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.6);
    doc.line(sumX, sumY, RX, sumY);
    sumY += 4;

    // Total row — dark filled box
    doc.setFillColor(15, 28, 58);
    doc.roundedRect(sumX - 3, sumY - 1, sumW + 3, 13, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('MONTANT TOTAL', sumX + 2, sumY + 8);
    doc.text(
      pdfHasPrices ? pdfFmtPrice(totalAmount) : `${totalOrdered} unites`,
      RX - 3, sumY + 8, { align: 'right' },
    );

    // ── SIGNATURE ZONE ─────────────────────────────────────────────
    const sigZoneY = H - 52;

    doc.setDrawColor(210, 220, 235);
    doc.setLineWidth(0.4);
    doc.line(ML, sigZoneY - 6, RX, sigZoneY - 6);

    const sigBoxW = (UW - 10) / 2;
    const sigBoxH = 28;
    ['Signature emetteur', 'Bon pour accord - Client'].forEach((label, i) => {
      const sigX = ML + i * (sigBoxW + 10);
      doc.setFillColor(248, 250, 253);
      doc.setDrawColor(210, 220, 238);
      doc.setLineWidth(0.25);
      doc.roundedRect(sigX, sigZoneY, sigBoxW, sigBoxH, 2, 2, 'FD');
      // Teal top accent stripe
      doc.setFillColor(20, 184, 166);
      doc.roundedRect(sigX, sigZoneY, sigBoxW, 2, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 28, 58);
      doc.text(label, sigX + sigBoxW / 2, sigZoneY + 10, { align: 'center' });
      doc.setDrawColor(180, 198, 225);
      doc.setLineWidth(0.4);
      doc.line(sigX + 8, sigZoneY + sigBoxH - 6, sigX + sigBoxW - 8, sigZoneY + sigBoxH - 6);
    });

    // ── FOOTER BAND ────────────────────────────────────────────────
    doc.setFillColor(15, 28, 58);
    doc.rect(0, H - 16, W, 16, 'F');
    doc.setFillColor(20, 184, 166);
    doc.rect(0, H - 16, W, 1.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 172, 210);
    doc.text(
      'Marchandise verifiee a la reception  |  Toute reclamation signalée dans les 48h  |  TechSupply Maroc 2024',
      W / 2, H - 6, { align: 'center' },
    );

    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl as unknown as string, '_blank');
  };

  // ─────────────────────────────────────────────────────────────────────────────

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
        toast.success(t('sales.deliveryNotes.validated'));
      } else if (action === 'delete') {
        await salesService.deleteDeliveryNote(note.id);
        toast.success(t('sales.deliveryNotes.deleted'));
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
            <p className="text-xs text-neutral-500">{filtered.length} {t('sales.deliveryNotes.count')}</p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.MOVEMENTS_CREATE) && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/sales/delivery-notes/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-semibold shadow-md shadow-cyan-500/25 hover:from-cyan-700 hover:to-teal-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('sales.deliveryNotes.new')}
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
                filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((note) => (
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
                        <button onClick={() => openDetail(note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title={t('common.view')}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Download PDF */}
                        <button onClick={() => generateDeliveryNotePDF(note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download PDF">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit (DRAFT) */}
                        {note.status === 'DRAFT' && hasPermission(PERMISSIONS.MOVEMENTS_EDIT) && (
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
                        {/* Delete (DRAFT) */}
                        {note.status === 'DRAFT' && hasPermission(PERMISSIONS.MOVEMENTS_DELETE) && (
                          <button onClick={() => handleAction('delete', note)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={t('common.delete')}>
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
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / pageSize)}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      {/* Modals */}
      <DetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        note={selectedNote}
        onDownload={generateDeliveryNotePDF}
      />
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
