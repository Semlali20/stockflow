// frontend/src/pages/inventory/InventoryPageEnhanced.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertTriangle,
  Archive,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  TrendingDown,
  PackageX,
  ChevronDown,
  FileText,
  Table,
  File,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';


// ============================================================================
// INTERFACES
// ============================================================================

interface Inventory {
  id: string;
  itemId: string;
  warehouseId: string;
  locationId: string;
  lotId?: string;
  serialId?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityDamaged: number;
  availableQuantity: number;
  uom: string;
  status: string;
  unitCost?: number;
  expiryDate?: string;
  manufactureDate?: string;
  lastCountDate?: string;
  attributes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrichedInventory extends Inventory {
  itemName?: string;
  itemSku?: string;
  warehouseName?: string;
  locationName?: string;
  lotNumber?: string;
  serialNumber?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
}

// ============================================================================
// MAIN ENHANCED INVENTORY PAGE COMPONENT
// ============================================================================

export const InventoryPageEnhanced: React.FC = () => {
  const { t } = useTranslation();
  const [inventories, setInventories] = useState<EnrichedInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStockLevel, setFilterStockLevel] = useState(''); // NEW: Filter by stock level
  const [selectedInventory, setSelectedInventory] = useState<EnrichedInventory | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0);

  // Reference data
  const [items, setItems] = useState<Map<string, any>>(new Map());
  const [warehouses, setWarehouses] = useState<Map<string, any>>(new Map());
  const [locations, setLocations] = useState<Map<string, any>>(new Map());
  const [lots, setLots] = useState<Map<string, any>>(new Map());
  const [serials, setSerials] = useState<Map<string, any>>(new Map());

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Form state (create / edit)
  const [formItemId, setFormItemId] = useState('');
  const [formWarehouseId, setFormWarehouseId] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formLotId, setFormLotId] = useState('');
  const [formSerialId, setFormSerialId] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUom, setFormUom] = useState('PCS');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formUnitCost, setFormUnitCost] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formManufactureDate, setFormManufactureDate] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const { isDownloading, downloadCsv } = useFileDownload();

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // EXPORT HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    setShowExportMenu(false);
    downloadCsv(API_ENDPOINTS.INVENTORY.INVENTORY_EXPORT_CSV, `inventory-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    try {
      const data = filteredInventories.map((inv) => ({
        'Item Name': inv.itemName || '',
        'SKU': inv.itemSku || '',
        'Warehouse': inv.warehouseName || '',
        'Location': inv.locationName || '',
        'On Hand': inv.quantityOnHand,
        'Reserved': inv.quantityReserved,
        'Available': inv.availableQuantity,
        'UOM': inv.uom,
        'Status': inv.status,
        'Unit Cost': inv.unitCost ?? '',
        'Expiry Date': inv.expiryDate ? inv.expiryDate.split('T')[0] : '',
        'Manufacture Date': inv.manufactureDate ? inv.manufactureDate.split('T')[0] : '',
        'Lot': inv.lotNumber || '',
        'Serial': inv.serialNumber || '',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row: any) => String(row[key] ?? '').length)) + 2,
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      XLSX.writeFile(wb, `inventory-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel file');
    }
  };

  const handleExportPDF = () => {
    setShowExportMenu(false);
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

      // Decorative background shapes
      doc.setFillColor(154, 208, 170); doc.ellipse(8, 105, 22, 68, 'F');
      doc.setFillColor(140, 185, 225); doc.ellipse(18, 155, 18, 52, 'F');
      doc.setFillColor(200, 225, 150); doc.ellipse(5, 195, 14, 38, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(26, 58, 108);
      doc.text('INVENTORY', 14, 22);

      doc.setFillColor(26, 58, 108);
      doc.rect(14, 26, 120, 1.2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${dateStr}`, 14, 34);
      doc.text(`Total records: ${filteredInventories.length}`, 14, 40);

      autoTable(doc, {
        startY: 48,
        head: [['Item', 'SKU', 'Warehouse', 'Location', 'On Hand', 'Reserved', 'Available', 'UOM', 'Status', 'Expiry']],
        body: filteredInventories.map((inv) => [
          inv.itemName || '',
          inv.itemSku || '',
          inv.warehouseName || '',
          inv.locationName || '',
          inv.quantityOnHand,
          inv.quantityReserved,
          inv.availableQuantity,
          inv.uom,
          inv.status,
          inv.expiryDate ? inv.expiryDate.split('T')[0] : '—',
        ]),
        headStyles: { fillColor: [26, 58, 108], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        margin: { left: 14, right: 14 },
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        const pageW = doc.internal.pageSize.getWidth();
        doc.setFillColor(26, 58, 108);
        doc.rect(0, pageH - 12, pageW, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Stock Management System', 14, pageH - 4);
        doc.text(`Page ${i} / ${pageCount}`, pageW - 28, pageH - 4);
      }

      doc.save(`inventory-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (items.size > 0) {
      fetchInventories();
    }
  }, [items]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (items.size > 0) {
        fetchInventories();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [items]);

  // Update timestamp display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // FETCH REFERENCE DATA
  // ============================================================================

  const fetchReferenceData = async () => {
    try {
      const [itemsData, warehousesData, locationsData, lotsData, serialsData] = await Promise.all([
        productService.getItems(),
        locationService.getWarehouses(),
        locationService.getLocations(),
        inventoryService.getAllLots(),
        inventoryService.getAllSerials(),
      ]);

      const itemsMap = new Map(
        (Array.isArray(itemsData) ? itemsData : []).map((item: any) => [item.id, item])
      );
      const warehousesMap = new Map(
        (Array.isArray(warehousesData) ? warehousesData : []).map((wh: any) => [wh.id, wh])
      );
      const locationsMap = new Map(
        (Array.isArray(locationsData) ? locationsData : []).map((loc: any) => [loc.id, loc])
      );
      const lotsMap = new Map(
        (Array.isArray(lotsData) ? lotsData : []).map((lot: any) => [lot.id, lot])
      );
      const serialsMap = new Map(
        (Array.isArray(serialsData) ? serialsData : []).map((serial: any) => [serial.id, serial])
      );

      setItems(itemsMap);
      setWarehouses(warehousesMap);
      setLocations(locationsMap);
      setLots(lotsMap);
      setSerials(serialsMap);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      toast.error(t('inventory.messages.refDataError'));
    }
  };

  // ============================================================================
  // FETCH INVENTORIES WITH ENRICHED DATA
  // ============================================================================

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAllInventories();
      const inventoryArray = Array.isArray(data) ? data : [];

      const enrichedData = inventoryArray.map((inv: Inventory) => {
        const item = items.get(inv.itemId);
        const warehouse = warehouses.get(inv.warehouseId);
        const location = locations.get(inv.locationId);
        const lot = inv.lotId ? lots.get(inv.lotId) : null;
        const serial = inv.serialId ? serials.get(inv.serialId) : null;

        return {
          ...inv,
          itemName: item?.name || t('common.unknownItem'),
          itemSku: item?.sku || '',
          warehouseName: warehouse?.name || t('common.unknownWarehouse'),
          locationName: location?.code || t('common.unknownLocation'),
          lotNumber: lot?.lotNumber || '',
          serialNumber: serial?.serialNumber || '',
          minStockLevel: item?.minStockLevel || 0,
          maxStockLevel: item?.maxStockLevel || 1000,
          reorderPoint: item?.reorderPoint || 5,
        } as EnrichedInventory;
      });

      setInventories(enrichedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching inventories:', error);
      toast.error(t('inventory.messages.fetchError'));
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STOCK LEVEL HELPERS
  // ============================================================================

  const getStockLevel = (inventory: EnrichedInventory): 'critical' | 'low' | 'adequate' | 'high' => {
    const available = inventory.availableQuantity;
    const reorderPoint = inventory.reorderPoint || 5;
    const minStock = inventory.minStockLevel || 0;
    const maxStock = inventory.maxStockLevel || 1000;

    if (available <= minStock) return 'critical';
    if (available <= reorderPoint) return 'low';
    if (available >= maxStock * 0.9) return 'high';
    return 'adequate';
  };

  const getStockLevelBadge = (level: string) => {
    const config = {
      critical: {
        color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
        icon: AlertCircle,
        label: t('inventory.stockLevel.critical'),
      },
      low: {
        color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
        icon: AlertTriangle,
        label: t('inventory.stockLevel.low'),
      },
      adequate: {
        color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
        icon: CheckCircle,
        label: t('inventory.stockLevel.adequate'),
      },
      high: {
        color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
        icon: TrendingUp,
        label: t('inventory.stockLevel.high'),
      },
    };

    const cfg = config[level as keyof typeof config] || config.adequate;
    const Icon = cfg.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </span>
    );
  };

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const resetForm = () => {
    setFormItemId('');
    setFormWarehouseId('');
    setFormLocationId('');
    setFormLotId('');
    setFormSerialId('');
    setFormQuantity('');
    setFormUom('PCS');
    setFormStatus('AVAILABLE');
    setFormUnitCost('');
    setFormExpiryDate('');
    setFormManufactureDate('');
  };

  const handleCreate = () => {
    setSelectedInventory(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (inventory: EnrichedInventory) => {
    setSelectedInventory(inventory);
    setFormItemId(inventory.itemId);
    setFormWarehouseId(inventory.warehouseId);
    setFormLocationId(inventory.locationId);
    setFormLotId(inventory.lotId || '');
    setFormSerialId(inventory.serialId || '');
    setFormQuantity(String(inventory.quantityOnHand));
    setFormUom(inventory.uom);
    setFormStatus(inventory.status);
    setFormUnitCost(inventory.unitCost != null ? String(inventory.unitCost) : '');
    setFormExpiryDate(inventory.expiryDate ? inventory.expiryDate.split('T')[0] : '');
    setFormManufactureDate(inventory.manufactureDate ? inventory.manufactureDate.split('T')[0] : '');
    setIsEditModalOpen(true);
  };

  const handleView = (inventory: EnrichedInventory) => {
    setSelectedInventory(inventory);
    setIsViewModalOpen(true);
  };

  const handleFormSubmit = async (isEdit: boolean) => {
    if (!formWarehouseId || !formLocationId || !formQuantity || !formUom || (!isEdit && !formItemId)) {
      toast.error(t('common.fillRequired'));
      return;
    }
    setFormSubmitting(true);
    try {
      if (isEdit && selectedInventory) {
        await inventoryService.updateInventory(selectedInventory.id, {
          warehouseId: formWarehouseId,
          locationId: formLocationId,
          lotId: formLotId || undefined,
          serialId: formSerialId || undefined,
          quantityOnHand: Number(formQuantity),
          uom: formUom,
          status: formStatus,
          unitCost: formUnitCost ? Number(formUnitCost) : undefined,
          expiryDate: formExpiryDate || undefined,
          manufactureDate: formManufactureDate || undefined,
        });
        toast.success(t('inventory.messages.updateSuccess'));
        setIsEditModalOpen(false);
      } else {
        await inventoryService.createInventory({
          itemId: formItemId,
          warehouseId: formWarehouseId,
          locationId: formLocationId,
          lotId: formLotId || undefined,
          serialId: formSerialId || undefined,
          quantityOnHand: Number(formQuantity),
          uom: formUom,
          status: formStatus,
          unitCost: formUnitCost ? Number(formUnitCost) : undefined,
          expiryDate: formExpiryDate || undefined,
          manufactureDate: formManufactureDate || undefined,
        });
        toast.success(t('inventory.messages.createSuccess'));
        setIsCreateModalOpen(false);
      }
      fetchInventories();
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error(isEdit ? t('inventory.messages.updateError') : t('inventory.messages.createError'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (inventory: EnrichedInventory) => {
    setSelectedInventory(inventory);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedInventory) return;

    try {
      await inventoryService.deleteInventory(selectedInventory.id);
      toast.success(t('inventory.messages.deleteSuccess'));
      fetchInventories();
      setIsDeleteDialogOpen(false);
      setSelectedInventory(null);
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast.error(t('inventory.messages.deleteError'));
    }
  };


  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredInventories = inventories.filter((inventory) => {
    const matchesSearch =
      !searchTerm ||
      inventory.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.itemSku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inventory.locationName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || inventory.status === filterStatus;

    const stockLevel = getStockLevel(inventory);
    const matchesStockLevel = !filterStockLevel || stockLevel === filterStockLevel;

    return matchesSearch && matchesStatus && matchesStockLevel;
  });

  // ============================================================================
  // STATISTICS
  // ============================================================================

  const stats = {
    total: inventories.length,
    available: inventories.filter((i) => i.status === 'AVAILABLE').length,
    reserved: inventories.filter((i) => i.status === 'RESERVED').length,
    damaged: inventories.filter((i) => i.status === 'DAMAGED').length,
    lowStock: inventories.filter((i) => ['critical', 'low'].includes(getStockLevel(i))).length,
    criticalStock: inventories.filter((i) => getStockLevel(i) === 'critical').length,
  };

  // ============================================================================
  // STATUS BADGE
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      AVAILABLE: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: t('inventory.status.available') },
      RESERVED: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: t('inventory.status.reserved') },
      QUARANTINED: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', label: t('inventory.status.quarantined') },
      DAMAGED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: t('inventory.status.damaged') },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', label: status };

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================

  const formatLastUpdated = () => {
    if (!lastUpdated) return t('common.never');
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 5) return t('inventory.justNow');
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('inventory.title')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('inventory.subtitle')}
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • {t('inventory.autoRefresh')} {formatLastUpdated()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchInventories}
            disabled={loading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('inventory.refresh')}
          </Button>
          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={15} />}
              onClick={() => setShowExportMenu((v) => !v)}
              loading={isDownloading}
              className="flex items-center gap-1"
            >
              {t('common.export')}
              <ChevronDown size={13} className={`ml-0.5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <FileText size={15} className="text-green-600" />
                  CSV File (.csv)
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Table size={15} className="text-emerald-600" />
                  Excel File (.xlsx)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <File size={15} className="text-red-500" />
                  PDF Document (.pdf)
                </button>
              </div>
            )}
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('inventory.newInventory')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl shadow-lg p-5 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="text-blue-600 dark:text-blue-400" size={28} />
            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
              <Package className="text-blue-700 dark:text-blue-300" size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('inventory.stats.totalItems')}</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
        </motion.div>

        {/* Available */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-5 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
            <div className="w-10 h-10 bg-green-200 dark:bg-green-800/50 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-700 dark:text-green-300" size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-green-800 dark:text-green-300">{t('inventory.stats.available')}</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.available}</p>
        </motion.div>

        {/* Reserved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl shadow-lg p-5 border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center justify-between mb-2">
            <Archive className="text-yellow-600 dark:text-yellow-400" size={28} />
            <div className="w-10 h-10 bg-yellow-200 dark:bg-yellow-800/50 rounded-full flex items-center justify-center">
              <Archive className="text-yellow-700 dark:text-yellow-300" size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{t('inventory.stats.reserved')}</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.reserved}</p>
        </motion.div>

        {/* Damaged */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl shadow-lg p-5 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center justify-between mb-2">
            <PackageX className="text-red-600 dark:text-red-400" size={28} />
            <div className="w-10 h-10 bg-red-200 dark:bg-red-800/50 rounded-full flex items-center justify-center">
              <PackageX className="text-red-700 dark:text-red-300" size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{t('inventory.stats.damaged')}</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.damaged}</p>
        </motion.div>

        {/* Low Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl shadow-lg p-5 border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-orange-600 dark:text-orange-400" size={28} />
            <div className="w-10 h-10 bg-orange-200 dark:bg-orange-800/50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-orange-700 dark:text-orange-300" size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">{t('inventory.stats.lowStock')}</p>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.lowStock}</p>
        </motion.div>

        {/* Critical Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-2xl shadow-lg p-5 border border-rose-200 dark:border-rose-800 animate-pulse"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-rose-600 dark:text-rose-400" size={28} />
            <div className="w-10 h-10 bg-rose-200 dark:bg-rose-800/50 rounded-full flex items-center justify-center">
              <AlertCircle className="text-rose-700 dark:text-rose-300" size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{t('inventory.stats.critical')}</p>
          <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.criticalStock}</p>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <Input
              type="text"
              placeholder={t('inventory.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-50 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
          >
            <option value="">{t('inventory.filters.allStatuses')}</option>
            <option value="AVAILABLE">{t('inventory.status.available')}</option>
            <option value="RESERVED">{t('inventory.status.reserved')}</option>
            <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
            <option value="DAMAGED">{t('inventory.status.damaged')}</option>
          </Select>

          {/* Stock Level Filter */}
          <Select
            value={filterStockLevel}
            onChange={(e) => setFilterStockLevel(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
          >
            <option value="">{t('inventory.filters.allStockLevels')}</option>
            <option value="critical">{t('inventory.stockLevel.critical')}</option>
            <option value="low">{t('inventory.stockLevel.low')}</option>
            <option value="adequate">{t('inventory.stockLevel.adequate')}</option>
            <option value="high">{t('inventory.stockLevel.high')}</option>
          </Select>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('inventory.loadingInventory')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.item')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.sku')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.location')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.onHand')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.reserved')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.available')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.stockLevel')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.status')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('inventory.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInventories.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <Package size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('inventory.messages.noRecords')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('inventory.messages.adjustFilters')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInventories.map((inventory, index) => {
                    const stockLevel = getStockLevel(inventory);
                    return (
                      <motion.tr
                        key={inventory.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {inventory.itemName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {inventory.warehouseName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            {inventory.itemSku || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-medium">
                            {inventory.locationName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {inventory.quantityOnHand}{' '}
                            <span className="text-xs text-gray-500 dark:text-gray-400">{inventory.uom}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            {inventory.quantityReserved}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            {inventory.availableQuantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStockLevelBadge(stockLevel)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(inventory.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleView(inventory)}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                              title={t('common.view')}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(inventory)}
                              className="p-2 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
                              title={t('common.edit')}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(inventory)}
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title={t('common.delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('inventory.deleteTitle')}
        message={`${t('inventory.deleteMessage')} "${selectedInventory?.itemName}"? ${t('common.close')}`}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('inventory.newInventory')}
        size="xl"
      >
        <div className="space-y-4">
          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('inventory.table.item')} <span className="text-red-500">*</span>
            </label>
            <Select value={formItemId} onChange={e => setFormItemId(e.target.value)} className="w-full">
              <option value="">-- {t('inventory.form.selectItem', 'Select an item')} --</option>
              {Array.from(items.values()).map((item: any) => (
                <option key={item.id} value={item.id}>{item.name}{item.sku ? ` (${item.sku})` : ''}</option>
              ))}
            </Select>
          </div>

          {/* Warehouse + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.warehouse', 'Warehouse')} <span className="text-red-500">*</span>
              </label>
              <Select value={formWarehouseId} onChange={e => { setFormWarehouseId(e.target.value); setFormLocationId(''); }} className="w-full">
                <option value="">-- {t('inventory.form.selectWarehouse', 'Select warehouse')} --</option>
                {Array.from(warehouses.values()).map((wh: any) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.location', 'Location')} <span className="text-red-500">*</span>
              </label>
              <Select value={formLocationId} onChange={e => setFormLocationId(e.target.value)} className="w-full">
                <option value="">-- {t('inventory.form.selectLocation', 'Select location')} --</option>
                {Array.from(locations.values())
                  .filter((loc: any) => !formWarehouseId || loc.warehouseId === formWarehouseId)
                  .map((loc: any) => (
                    <option key={loc.id} value={loc.id}>{loc.code}{loc.name ? ` — ${loc.name}` : ''}</option>
                  ))}
              </Select>
            </div>
          </div>

          {/* Qty + UOM + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.table.onHand')} <span className="text-red-500">*</span>
              </label>
              <Input type="number" min="0" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.uom', 'UOM')} <span className="text-red-500">*</span>
              </label>
              <Input type="text" value={formUom} onChange={e => setFormUom(e.target.value)} placeholder="PCS, KG, L…" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.table.status')} <span className="text-red-500">*</span>
              </label>
              <Select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full">
                <option value="AVAILABLE">{t('inventory.status.available')}</option>
                <option value="RESERVED">{t('inventory.status.reserved')}</option>
                <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
                <option value="DAMAGED">{t('inventory.status.damaged')}</option>
              </Select>
            </div>
          </div>

          {/* Unit cost + Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.unitCost', 'Unit Cost')}
              </label>
              <Input type="number" min="0" step="0.01" value={formUnitCost} onChange={e => setFormUnitCost(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.expiryDate', 'Expiry Date')}
              </label>
              <Input type="date" value={formExpiryDate} onChange={e => setFormExpiryDate(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.manufactureDate', 'Manufacture Date')}
              </label>
              <Input type="date" value={formManufactureDate} onChange={e => setFormManufactureDate(e.target.value)} className="w-full" />
            </div>
          </div>

          {/* Lot + Serial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.lot', 'Lot')}
              </label>
              <Select value={formLotId} onChange={e => setFormLotId(e.target.value)} className="w-full">
                <option value="">— {t('inventory.form.noLot', 'No lot')} —</option>
                {Array.from(lots.values())
                  .filter((lot: any) => !formItemId || lot.itemId === formItemId)
                  .map((lot: any) => (
                    <option key={lot.id} value={lot.id}>{lot.lotNumber}</option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.serial', 'Serial')}
              </label>
              <Select value={formSerialId} onChange={e => setFormSerialId(e.target.value)} className="w-full">
                <option value="">— {t('inventory.form.noSerial', 'No serial')} —</option>
                {Array.from(serials.values())
                  .filter((s: any) => !formItemId || s.itemId === formItemId)
                  .map((s: any) => (
                    <option key={s.id} value={s.id}>{s.serialNumber}</option>
                  ))}
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={formSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => handleFormSubmit(false)} loading={formSubmitting}>
              {t('common.create', 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('inventory.editInventory', 'Edit Inventory')}
        size="xl"
      >
        <div className="space-y-4">
          {/* Item (read-only in edit) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('inventory.table.item')}
            </label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-md text-sm text-gray-700 dark:text-gray-300">
              {selectedInventory?.itemName} {selectedInventory?.itemSku ? `(${selectedInventory.itemSku})` : ''}
            </div>
          </div>

          {/* Warehouse + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.warehouse', 'Warehouse')} <span className="text-red-500">*</span>
              </label>
              <Select value={formWarehouseId} onChange={e => { setFormWarehouseId(e.target.value); setFormLocationId(''); }} className="w-full">
                <option value="">-- {t('inventory.form.selectWarehouse', 'Select warehouse')} --</option>
                {Array.from(warehouses.values()).map((wh: any) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.location', 'Location')} <span className="text-red-500">*</span>
              </label>
              <Select value={formLocationId} onChange={e => setFormLocationId(e.target.value)} className="w-full">
                <option value="">-- {t('inventory.form.selectLocation', 'Select location')} --</option>
                {Array.from(locations.values())
                  .filter((loc: any) => !formWarehouseId || loc.warehouseId === formWarehouseId)
                  .map((loc: any) => (
                    <option key={loc.id} value={loc.id}>{loc.code}{loc.name ? ` — ${loc.name}` : ''}</option>
                  ))}
              </Select>
            </div>
          </div>

          {/* Qty + UOM + Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.table.onHand')} <span className="text-red-500">*</span>
              </label>
              <Input type="number" min="0" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.uom', 'UOM')} <span className="text-red-500">*</span>
              </label>
              <Input type="text" value={formUom} onChange={e => setFormUom(e.target.value)} placeholder="PCS, KG, L…" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.table.status')} <span className="text-red-500">*</span>
              </label>
              <Select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full">
                <option value="AVAILABLE">{t('inventory.status.available')}</option>
                <option value="RESERVED">{t('inventory.status.reserved')}</option>
                <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
                <option value="DAMAGED">{t('inventory.status.damaged')}</option>
              </Select>
            </div>
          </div>

          {/* Unit cost + Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.unitCost', 'Unit Cost')}
              </label>
              <Input type="number" min="0" step="0.01" value={formUnitCost} onChange={e => setFormUnitCost(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.expiryDate', 'Expiry Date')}
              </label>
              <Input type="date" value={formExpiryDate} onChange={e => setFormExpiryDate(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.manufactureDate', 'Manufacture Date')}
              </label>
              <Input type="date" value={formManufactureDate} onChange={e => setFormManufactureDate(e.target.value)} className="w-full" />
            </div>
          </div>

          {/* Lot + Serial */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.lot', 'Lot')}
              </label>
              <Select value={formLotId} onChange={e => setFormLotId(e.target.value)} className="w-full">
                <option value="">— {t('inventory.form.noLot', 'No lot')} —</option>
                {Array.from(lots.values())
                  .filter((lot: any) => !selectedInventory?.itemId || lot.itemId === selectedInventory.itemId)
                  .map((lot: any) => (
                    <option key={lot.id} value={lot.id}>{lot.lotNumber}</option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('inventory.form.serial', 'Serial')}
              </label>
              <Select value={formSerialId} onChange={e => setFormSerialId(e.target.value)} className="w-full">
                <option value="">— {t('inventory.form.noSerial', 'No serial')} —</option>
                {Array.from(serials.values())
                  .filter((s: any) => !selectedInventory?.itemId || s.itemId === selectedInventory.itemId)
                  .map((s: any) => (
                    <option key={s.id} value={s.id}>{s.serialNumber}</option>
                  ))}
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={formSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => handleFormSubmit(true)} loading={formSubmitting}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={t('inventory.viewInventory', 'Inventory Details')}
        size="lg"
      >
        {selectedInventory && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('inventory.table.item'), value: selectedInventory.itemName },
                { label: t('inventory.table.sku'), value: selectedInventory.itemSku || '—' },
                { label: t('inventory.table.location'), value: `${selectedInventory.warehouseName} / ${selectedInventory.locationName}` },
                { label: t('inventory.table.onHand'), value: `${selectedInventory.quantityOnHand} ${selectedInventory.uom}` },
                { label: t('inventory.table.reserved'), value: `${selectedInventory.quantityReserved} ${selectedInventory.uom}` },
                { label: t('inventory.table.available'), value: `${selectedInventory.availableQuantity} ${selectedInventory.uom}` },
                { label: t('inventory.table.status'), value: selectedInventory.status },
                { label: t('inventory.form.unitCost', 'Unit Cost'), value: selectedInventory.unitCost != null ? selectedInventory.unitCost : '—' },
                { label: t('inventory.form.expiryDate', 'Expiry Date'), value: selectedInventory.expiryDate ? selectedInventory.expiryDate.split('T')[0] : '—' },
                { label: t('inventory.form.manufactureDate', 'Manufacture Date'), value: selectedInventory.manufactureDate ? selectedInventory.manufactureDate.split('T')[0] : '—' },
                { label: t('inventory.form.lot', 'Lot'), value: selectedInventory.lotNumber || '—' },
                { label: t('inventory.form.serial', 'Serial'), value: selectedInventory.serialNumber || '—' },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{String(f.value)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setIsViewModalOpen(false)}>{t('common.close')}</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default InventoryPageEnhanced;
