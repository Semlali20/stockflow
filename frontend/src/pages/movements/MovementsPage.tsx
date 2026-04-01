// frontend/src/pages/movements/MovementsPage.tsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import {
  Plus, Search, RefreshCw, Package, FileText,
  Activity, CheckCircle2, TrendingUp, X, SlidersHorizontal,
  ArrowDownCircle, ChevronDown, Download, Table, File,
} from 'lucide-react';
import { movementService } from '@/services/movement.service';
import { inventoryService } from '@/services/inventory.service';
import { alertService } from '@/services/alert.service';
import { Movement, MovementType, MovementStatus } from '@/types';
import { toast } from 'react-hot-toast';
import { confirmDelete } from '@/utils/confirmDialog';
import MovementDetailModal from '@/components/movements/MovementDetailModal';
import MovementCard from '@/components/movements/Movementcard';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ─── Styled select ───────────────────────────────────────────────────
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

// ─── Component ───────────────────────────────────────────────────────
const MovementsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  const { isDownloading, downloadCsv } = useFileDownload();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized Options
  const STAT_CARDS = useMemo(() => [
    {
      key: 'total',
      label: t('movements.stats.total'),
      icon: Package,
      gradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/20',
      border: 'border-indigo-200/60 dark:border-indigo-700/40',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800/60',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-indigo-700 dark:text-indigo-300',
    },
    {
      key: 'draft',
      label: t('movements.stats.draft'),
      icon: FileText,
      gradient: 'from-slate-50 to-neutral-50 dark:from-slate-800/40 dark:to-neutral-800/20',
      border: 'border-slate-200/60 dark:border-slate-700/40',
      iconBg: 'bg-slate-100 dark:bg-slate-700/60',
      iconColor: 'text-slate-500 dark:text-slate-400',
      valueColor: 'text-slate-700 dark:text-slate-300',
    },
    {
      key: 'inProgress',
      label: t('movements.stats.inProgress'),
      icon: Activity,
      gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20',
      border: 'border-blue-200/60 dark:border-blue-700/40',
      iconBg: 'bg-blue-100 dark:bg-blue-800/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-700 dark:text-blue-300',
      pulse: true,
    },
    {
      key: 'completed',
      label: t('movements.stats.completed'),
      icon: CheckCircle2,
      gradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20',
      border: 'border-emerald-200/60 dark:border-emerald-700/40',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-700 dark:text-emerald-300',
    },
  ], [t]);

  const TYPE_OPTIONS = useMemo(() => [
    { value: '', label: t('movements.types.all') },
    { value: MovementType.RECEIPT, label: t('movements.types.receipt') },
    { value: MovementType.ISSUE, label: t('movements.types.issue') },
    { value: MovementType.TRANSFER, label: t('movements.types.transfer') },
    { value: MovementType.PICKING, label: t('movements.types.picking') },
    { value: MovementType.PUTAWAY, label: t('movements.types.putAway') },
    { value: MovementType.RETURN, label: t('movements.types.return') },
    { value: MovementType.ADJUSTMENT, label: t('movements.types.adjustment') },
    { value: MovementType.CYCLE_COUNT, label: t('movements.types.cycleCount') },
    { value: MovementType.RELOCATION, label: t('movements.types.relocation') },
    { value: MovementType.QUARANTINE, label: t('movements.types.quarantine') },
  ], [t]);

  const STATUS_OPTIONS = useMemo(() => [
    { value: '', label: t('movements.statuses.all') },
    { value: MovementStatus.DRAFT, label: t('movements.statuses.draft') },
    { value: MovementStatus.PENDING, label: t('movements.statuses.pending') },
    { value: MovementStatus.IN_PROGRESS, label: t('movements.statuses.inProgress') },
    { value: MovementStatus.COMPLETED, label: t('movements.statuses.completed') },
    { value: MovementStatus.CANCELLED, label: t('movements.statuses.cancelled') },
    { value: MovementStatus.ON_HOLD, label: t('movements.statuses.onHold') },
    { value: MovementStatus.PARTIALLY_COMPLETED, label: t('movements.statuses.partial') },
  ], [t]);

  const fetchMovements = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await movementService.getMovements({ size: 100 });
      setMovements(response.content || []);
    } catch (error) {
      console.error('Failed to fetch movements:', error);
      toast.error(t('movements.messages.fetchError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMovements(); }, []);

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      !searchTerm ||
      m.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || m.type === filters.type;
    const matchesStatus = !filters.status || m.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stat values
  const stats = {
    total: movements.length,
    draft: movements.filter((m) => m.status === MovementStatus.DRAFT || m.status === MovementStatus.PENDING).length,
    inProgress: movements.filter((m) => m.status === MovementStatus.IN_PROGRESS || m.status === MovementStatus.PARTIALLY_COMPLETED).length,
    completed: movements.filter((m) => m.status === MovementStatus.COMPLETED).length,
  };

  const handleStatusChange = async (movementId: string, newStatus: MovementStatus) => {
    try {
      setLoading(true);
      switch (newStatus) {
        case MovementStatus.IN_PROGRESS:
          await movementService.startMovement(movementId);
          break;
        case MovementStatus.COMPLETED:
          await movementService.completeMovement(movementId);
          break;
        case MovementStatus.CANCELLED:
          await movementService.cancelMovement(movementId, '');
          break;
        case MovementStatus.ON_HOLD:
          await movementService.holdMovement(movementId, '');
          break;
        default:
          break;
      }

      if (newStatus === MovementStatus.COMPLETED) {
        const movement = movements.find((m) => m.id === movementId);
        if (movement) {
          const lines = await movementService.getLinesByMovement(movementId);
          for (const line of lines) {
            try {
              if (line.fromLocationId) {
                await inventoryService.adjustInventory({
                  itemId: line.itemId,
                  locationId: line.fromLocationId,
                  quantityChange: -(line.actualQuantity || line.requestedQuantity),
                  reason: `Movement ${movement.referenceNumber} completed`,
                });
              }
              if (line.toLocationId) {
                await inventoryService.adjustInventory({
                  itemId: line.itemId,
                  locationId: line.toLocationId,
                  quantityChange: line.actualQuantity || line.requestedQuantity,
                  reason: `Movement ${movement.referenceNumber} completed`,
                });
              }
              if (line.fromLocationId) {
                const remaining = await inventoryService.getAvailableQuantity(line.itemId, line.fromLocationId);
                if (remaining < 10) {
                  await alertService.createAlert({
                    type: 'LOW_STOCK',
                    severity: remaining < 5 ? 'CRITICAL' : 'HIGH',
                    title: t('movements.alerts.lowStockTitle'),
                    message: t('movements.alerts.lowStockMessage', { itemId: line.itemId, remaining }),
                    itemId: line.itemId,
                    locationId: line.fromLocationId,
                  });
                }
              }
            } catch (err) {
              console.error('Inventory update error:', err);
            }
          }
          toast.success(t('movements.messages.completionSuccess'));
        }
      } else {
        toast.success(t('movements.messages.statusUpdateSuccess', { status: newStatus }));
      }
      await fetchMovements(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movementId: string) => {
    const ok = await confirmDelete(t('movements.delete.confirmTitle'), t('movements.delete.confirmMessage'));
    if (!ok) return;
    try {
      await movementService.deleteMovement(movementId);
      toast.success(t('movements.messages.deleteSuccess'));
      fetchMovements(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('movements.messages.deleteError'));
    }
  };

  const handleExportCSV = () => {
    downloadCsv(API_ENDPOINTS.MOVEMENTS.MOVEMENTS_EXPORT_CSV, 'movements.csv');
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    const rows = filteredMovements.map((m) => ({
      'Reference Number': m.referenceNumber || '',
      'Type': m.type || '',
      'Status': m.status || '',
      'Priority': m.priority || '',
      'Warehouse ID': m.warehouseId || '',
      'Movement Date': m.movementDate ? new Date(m.movementDate).toLocaleDateString() : '',
      'Notes': m.notes || '',
      'Created At': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = [20, 15, 15, 12, 20, 18, 30, 18].map((w) => ({ wch: w }));
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movements');
    XLSX.writeFile(wb, 'movements.xlsx');
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();

    // Background shapes
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setFillColor(92, 107, 192);
    doc.circle(pageW - 20, -10, 40, 'F');
    doc.setFillColor(48, 63, 159);
    doc.circle(20, 55, 25, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Movements Report', 15, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${filteredMovements.length}`, 15, 27);

    autoTable(doc, {
      startY: 45,
      head: [['Reference', 'Type', 'Status', 'Priority', 'Movement Date', 'Notes', 'Created At']],
      body: filteredMovements.map((m) => [
        m.referenceNumber || '',
        m.type || '',
        m.status || '',
        m.priority || '',
        m.movementDate ? new Date(m.movementDate).toLocaleDateString() : '',
        m.notes || '',
        m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
      ]),
      headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      margin: { left: 15, right: 15 },
      didDrawPage: (data) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      },
    });

    doc.save('movements.pdf');
    setShowExportMenu(false);
  };

  const hasActiveFilters = filters.type || filters.status || searchTerm;

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {t('movements.title')}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {t('movements.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMovements(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800
                text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400
                hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
              title={t('movements.refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800
                  text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400
                  hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {t('common.export')}
                <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={handleExportCSV}
                    disabled={isDownloading}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Download className="w-3 h-3 text-green-600" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Table className="w-3 h-3 text-emerald-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <File className="w-3 h-3 text-red-500" />
                    PDF
                  </button>
                </div>
              )}
            </div>

            {hasPermission(PERMISSIONS.MOVEMENTS_CREATE) && (
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/movements/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                  shadow-lg shadow-indigo-500/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                {t('movements.newMovement')}
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => {
            const Icon = card.icon;
            const value = stats[card.key as keyof typeof stats];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`rounded-2xl p-5 bg-gradient-to-br ${card.gradient} border ${card.border} shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  {card.pulse && value > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {t('common.live')}
                    </span>
                  )}
                </div>
                <p className={`text-3xl font-bold ${card.valueColor}`}>{value}</p>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">{card.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Search & Filters ───────────────────────────────── */}
        <div className="rounded-2xl bg-white dark:bg-neutral-800/90 shadow-sm border border-neutral-200/80 dark:border-neutral-700/60 p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={t('movements.filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600/60
                  bg-neutral-50 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 text-sm
                  placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                  focus:border-indigo-400 transition-all duration-200"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                hasActiveFilters
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-neutral-200 dark:border-neutral-600/60 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-indigo-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('movements.filters.filters')}
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  {(filters.type ? 1 : 0) + (filters.status ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700/50">
                  <StyledSelect
                    value={filters.type}
                    onChange={(v) => setFilters({ ...filters, type: v })}
                    options={TYPE_OPTIONS}
                  />
                  <StyledSelect
                    value={filters.status}
                    onChange={(v) => setFilters({ ...filters, status: v })}
                    options={STATUS_OPTIONS}
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={() => { setFilters({ type: '', status: '' }); setSearchTerm(''); }}
                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t('movements.filters.clearAll')}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Results count ─────────────────────────────────── */}
        {!loading && movements.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('movements.filters.showing')} <span className="font-semibold text-neutral-700 dark:text-neutral-300">{filteredMovements.length}</span> {t('movements.filters.of')}{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{movements.length}</span> {t('movements.filters.movementsCount')}
            </p>
            {hasActiveFilters && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                <TrendingUp className="w-3 h-3" /> {t('movements.filters.filtered')}
              </span>
            )}
          </div>
        )}

        {/* ── Movements Grid ─────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('movements.messages.loading')}</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/60 shadow-sm p-16 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-5">
              <ArrowDownCircle className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              {hasActiveFilters ? t('movements.messages.noMatch') : t('movements.messages.noMovements')}
            </h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              {hasActiveFilters
                ? t('movements.messages.adjustFilters')
                : t('movements.messages.createFirst')}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {hasActiveFilters ? (
                <button
                  onClick={() => { setFilters({ type: '', status: '' }); setSearchTerm(''); }}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {t('movements.filters.clearFilters')}
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/movements/new')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                    bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25"
                >
                  <Plus className="w-4 h-4" />
                  {t('movements.actions.createMovement')}
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMovements.map((movement, i) => (
                <motion.div
                  key={movement.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <MovementCard
                    movement={movement}
                    onClick={() => { setSelectedMovement(movement); setIsDetailModalOpen(true); }}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      {isDetailModalOpen && selectedMovement && (
        <MovementDetailModal
          movement={selectedMovement}
          isOpen={isDetailModalOpen}
          onClose={() => { setIsDetailModalOpen(false); setSelectedMovement(null); }}
          onUpdate={() => fetchMovements(true)}
        />
      )}


    </div>
  );
};

export default MovementsPage;
