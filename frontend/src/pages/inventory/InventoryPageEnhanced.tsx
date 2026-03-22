// frontend/src/pages/inventory/InventoryPageEnhanced.tsx
import React, { useState, useEffect } from 'react';
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
  FileText,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ReportModal } from '@/components/ui/ReportModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';

const inventoryReportColumns = [
  { header: 'Item ID', key: 'itemId', width: 15 },
  { header: 'Item Name', key: 'itemName', width: 25 },
  { header: 'SKU', key: 'itemSku', width: 15 },
  { header: 'Warehouse', key: 'warehouseName', width: 20 },
  { header: 'Location', key: 'locationName', width: 20 },
  { header: 'On Hand', key: 'quantityOnHand', width: 12 },
  { header: 'Reserved', key: 'quantityReserved', width: 12 },
  { header: 'Available', key: 'availableQuantity', width: 12 },
  { header: 'UOM', key: 'uom', width: 8 },
  { header: 'Status', key: 'status', width: 15 },
  { header: 'Expiry Date', key: 'expiryDate', width: 15 },
];

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
  const [, setIsCreateModalOpen] = useState(false);
  const [, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, setIsViewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { isDownloading, downloadCsv } = useFileDownload();

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

  const handleCreate = () => {
    setSelectedInventory(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (inventory: EnrichedInventory) => {
    setSelectedInventory(inventory);
    setIsEditModalOpen(true);
  };

  const handleView = (inventory: EnrichedInventory) => {
    setSelectedInventory(inventory);
    setIsViewModalOpen(true);
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
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={15} />}
            onClick={() => downloadCsv(API_ENDPOINTS.INVENTORY.INVENTORY_EXPORT_CSV, 'inventory.csv')}
            loading={isDownloading}
          >
            {t('inventory.exportCsv')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText size={15} />}
            onClick={() => setIsReportModalOpen(true)}
          >
            {t('inventory.report')}
          </Button>
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

      {/* TODO: Add Create/Edit/View Modals */}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={t('inventory.title')}
        description={t('inventory.reportDescription')}
        columns={inventoryReportColumns}
        fetchData={async () => {
          return inventories as unknown as Record<string, unknown>[];
        }}
        filename="inventory-report"
      />
    </div>
  );
};

export default InventoryPageEnhanced;
