// frontend/src/pages/inventory/InventoryPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  X,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Archive,
  CheckCircle,
  TrendingDown,
  PackageX,
  ChevronDown,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

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

export const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [inventories, setInventories] = useState<EnrichedInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStockLevel, setFilterStockLevel] = useState('');
  const [selectedInventory, setSelectedInventory] = useState<EnrichedInventory | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(settings.defaultPageSize);

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
          minStockLevel: item?.minStockLevel || 3,
          maxStockLevel: item?.maxStockLevel || 1000,
          reorderPoint: item?.reorderPoint || 10,
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
    const onHand = inventory.quantityOnHand;

    // Use either availableQuantity or quantityOnHand for calculation
    const qty = available || onHand;

    // Get thresholds from item (using same defaults as enrichment)
    const reorderPoint = inventory.reorderPoint || 10;
    const minStock = inventory.minStockLevel || 3;
    const maxStock = inventory.maxStockLevel || 1000;

    // Critical: at or below minimum stock level
    if (qty <= minStock) return 'critical';

    // Low: at or below reorder point
    if (qty <= reorderPoint) return 'low';

    // High: at or above 90% of max stock
    if (qty >= maxStock * 0.9) return 'high';

    // Adequate: everything in between
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

  const handleModalSuccess = () => {
    fetchInventories();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedInventory(null);
  };

  // ============================================================================
  // FILTERING
  // ============================================================================

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterStockLevel]);

  const filteredInventories = inventories.filter((inventory) => {
    const matchesSearch =
      !searchTerm ||
      (inventory.itemName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (inventory.itemSku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (inventory.warehouseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (inventory.locationName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
    if (!lastUpdated) return t('inventory.lastUpdated.never');
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 5) return t('inventory.lastUpdated.justNow');
    if (diffSecs < 60) return t('inventory.lastUpdated.secondsAgo', { count: diffSecs });
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return t('inventory.lastUpdated.minutesAgo', { count: diffMins });
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
                • {t('settings.autoRefresh30')} • {t('dashboard.stats.lastUpdated')}: {formatLastUpdated()}
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
            <p className="text-gray-600 dark:text-gray-400">{t('inventory.messages.loading')}</p>
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
                  filteredInventories.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((inventory, index) => {
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
                              title={t('inventory.view.title')}
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
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredInventories.length / pageSize)}
            totalItems={filteredInventories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        )}
      </motion.div>

      {/* Modals */}
      {isCreateModalOpen && (
        <InventoryFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleModalSuccess}
          mode="create"
        />
      )}

      {isEditModalOpen && selectedInventory && (
        <InventoryFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleModalSuccess}
          mode="edit"
          inventory={selectedInventory}
        />
      )}

      {isViewModalOpen && selectedInventory && (
        <InventoryViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          inventory={selectedInventory}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('inventory.delete.title')}
        message={t('inventory.delete.confirm', { name: selectedInventory?.itemName || '' })}
      />
    </div>
  );
};

// ============================================================================
// INVENTORY VIEW MODAL COMPONENT
// ============================================================================

interface InventoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: EnrichedInventory;
}

const InventoryViewModal: React.FC<InventoryViewModalProps> = ({ isOpen, onClose, inventory }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.na') || 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{value || t('common.na') || 'N/A'}</span>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      AVAILABLE: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: t('inventory.status.available') },
      RESERVED: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: t('inventory.status.reserved') },
      QUARANTINED: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', label: t('inventory.status.quarantined') },
      DAMAGED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: t('inventory.status.damaged') },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('inventory.view.title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inventory.view.itemInfo')}</h3>
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <InfoRow label={t('inventory.view.itemName')} value={inventory.itemName} />
              <InfoRow label={t('inventory.view.sku')} value={inventory.itemSku} />
              <InfoRow label={t('inventory.view.itemId')} value={inventory.itemId} />
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inventory.view.locationInfo')}</h3>
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <InfoRow label={t('inventory.view.warehouse')} value={inventory.warehouseName} />
              <InfoRow label={t('inventory.view.location')} value={inventory.locationName} />
              <InfoRow label={t('inventory.view.warehouseId')} value={inventory.warehouseId} />
              <InfoRow label={t('inventory.view.locationId')} value={inventory.locationId} />
            </div>
          </div>

          {/* Quantity Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inventory.view.quantityInfo')}</h3>
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <InfoRow
                label={t('inventory.view.onHand')}
                value={
                  <span className="font-bold text-gray-900 dark:text-white">
                    {inventory.quantityOnHand} {inventory.uom}
                  </span>
                }
              />
              <InfoRow
                label={t('inventory.view.reserved')}
                value={
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {inventory.quantityReserved} {inventory.uom}
                  </span>
                }
              />
              <InfoRow
                label={t('inventory.view.damaged')}
                value={
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {inventory.quantityDamaged} {inventory.uom}
                  </span>
                }
              />
              <InfoRow
                label={t('inventory.view.available')}
                value={
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {inventory.availableQuantity} {inventory.uom}
                  </span>
                }
              />
              <InfoRow label={t('inventory.view.uom')} value={inventory.uom} />
            </div>
          </div>

          {/* Tracking Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inventory.view.trackingInfo')}</h3>
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <InfoRow label={t('inventory.view.lotNumber')} value={inventory.lotNumber || t('inventory.view.notAssigned')} />
              <InfoRow label={t('inventory.view.serialNumber')} value={inventory.serialNumber || t('inventory.view.notAssigned')} />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inventory.view.additionalInfo')}</h3>
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <InfoRow label={t('inventory.view.status')} value={getStatusBadge(inventory.status)} />
              <InfoRow
                label={t('inventory.view.unitCost')}
                value={inventory.unitCost ? `$${inventory.unitCost.toFixed(2)}` : t('common.na')}
              />
              <InfoRow label={t('inventory.view.manufactureDate')} value={formatDate(inventory.manufactureDate)} />
              <InfoRow label={t('inventory.view.expiryDate')} value={formatDate(inventory.expiryDate)} />
              <InfoRow label={t('inventory.view.lastCountDate')} value={formatDate(inventory.lastCountDate)} />
              <InfoRow label={t('inventory.view.attributes')} value={inventory.attributes || t('inventory.view.none')} />
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inventory.view.systemInfo')}</h3>
            <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-4">
              <InfoRow label={t('inventory.view.inventoryId')} value={inventory.id} />
              <InfoRow label={t('inventory.view.createdAt')} value={formatDate(inventory.createdAt)} />
              <InfoRow label={t('inventory.view.updatedAt')} value={formatDate(inventory.updatedAt)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-neutral-900/50">
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// INVENTORY FORM MODAL COMPONENT
// ============================================================================

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  inventory?: EnrichedInventory | null;
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  inventory,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [serials, setSerials] = useState<any[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const itemDropdownRef = useRef<HTMLDivElement>(null);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const warehouseDropdownRef = useRef<HTMLDivElement>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const [lotSearch, setLotSearch] = useState('');
  const [lotDropdownOpen, setLotDropdownOpen] = useState(false);
  const lotDropdownRef = useRef<HTMLDivElement>(null);
  const [serialSearch, setSerialSearch] = useState('');
  const [serialDropdownOpen, setSerialDropdownOpen] = useState(false);
  const serialDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target as Node)) {
        setItemDropdownOpen(false);
      }
      if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(e.target as Node)) {
        setWarehouseDropdownOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false);
      }
      if (lotDropdownRef.current && !lotDropdownRef.current.contains(e.target as Node)) {
        setLotDropdownOpen(false);
      }
      if (serialDropdownRef.current && !serialDropdownRef.current.contains(e.target as Node)) {
        setSerialDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    itemId: '',
    warehouseId: '',
    locationId: '',
    lotId: '',
    serialId: '',
    quantityOnHand: 0,
    quantityReserved: 0,
    quantityDamaged: 0,
    uom: '',
    status: 'AVAILABLE',
    unitCost: '',
    expiryDate: '',
    manufactureDate: '',
    attributes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchWarehouses();
      fetchLots();
      fetchSerials();

      if (mode === 'edit' && inventory) {
        setFormData({
          itemId: inventory.itemId || '',
          warehouseId: inventory.warehouseId || '',
          locationId: inventory.locationId || '',
          lotId: inventory.lotId || '',
          serialId: inventory.serialId || '',
          quantityOnHand: inventory.quantityOnHand || 0,
          quantityReserved: inventory.quantityReserved || 0,
          quantityDamaged: inventory.quantityDamaged || 0,
          uom: inventory.uom || '',
          status: inventory.status || 'AVAILABLE',
          unitCost: inventory.unitCost?.toString() || '',
          expiryDate: inventory.expiryDate || '',
          manufactureDate: inventory.manufactureDate || '',
          attributes: inventory.attributes || '',
        });

        if (inventory.warehouseId) {
          fetchLocationsByWarehouse(inventory.warehouseId);
        }
      } else {
        setFormData({
          itemId: '',
          warehouseId: '',
          locationId: '',
          lotId: '',
          serialId: '',
          quantityOnHand: 0,
          quantityReserved: 0,
          quantityDamaged: 0,
          uom: '',
          status: 'AVAILABLE',
          unitCost: '',
          expiryDate: '',
          manufactureDate: '',
          attributes: '',
        });
        setLocations([]);
      }
    }
  }, [isOpen, mode, inventory]);

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      setItems(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await locationService.getWarehouses();
      setWarehouses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchLocationsByWarehouse = async (warehouseId: string) => {
    try {
      const response = await locationService.getLocationsByWarehouse(warehouseId);
      setLocations(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchLots = async () => {
    try {
      const response = await inventoryService.getAllLots();
      setLots(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching lots:', error);
    }
  };

  const fetchSerials = async () => {
    try {
      const response = await inventoryService.getAllSerials();
      setSerials(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching serials:', error);
    }
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setFormData({ ...formData, warehouseId, locationId: '' });
    if (warehouseId) {
      fetchLocationsByWarehouse(warehouseId);
    } else {
      setLocations([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        quantity: formData.quantityOnHand,
        reservedQuantity: formData.quantityReserved,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
        lotId: formData.lotId || undefined,
        serialId: formData.serialId || undefined,
        expiryDate: formData.expiryDate || undefined,
        manufactureDate: formData.manufactureDate || undefined,
        attributes: formData.attributes || undefined,
      };

      if (mode === 'create') {
        await inventoryService.createInventory(submitData);
        toast.success(t('inventory.messages.createSuccess'));
      } else if (inventory) {
        await inventoryService.updateInventory(inventory.id, submitData);
        toast.success(t('inventory.messages.updateSuccess'));
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving inventory:', error);
      toast.error(error.response?.data?.message || t('inventory.messages.saveError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? t('inventory.form.createTitle') : t('inventory.form.editTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.form.item')} <span className="text-red-500">*</span>
              </label>
              <div ref={itemDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setItemDropdownOpen(o => !o); setItemSearch(''); }}
                  className="w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-sm text-left"
                >
                  <span className={formData.itemId ? '' : 'text-gray-400 dark:text-gray-500'}>
                    {formData.itemId
                      ? (() => { const i = items.find(x => x.id === formData.itemId); return i ? `${i.name} (${i.sku})` : t('inventory.form.selectItem'); })()
                      : t('inventory.form.selectItem')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${itemDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {itemDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={itemSearch}
                          onChange={e => setItemSearch(e.target.value)}
                          placeholder={`${t('common.search')}...`}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {items
                        .filter(i => `${i.name} ${i.sku}`.toLowerCase().includes(itemSearch.toLowerCase()))
                        .map(item => (
                          <li
                            key={item.id}
                            onClick={() => { setFormData(f => ({ ...f, itemId: item.id })); setItemDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              formData.itemId === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {item.name} <span className="text-gray-400 dark:text-gray-500">({item.sku})</span>
                          </li>
                        ))}
                      {items.filter(i => `${i.name} ${i.sku}`.toLowerCase().includes(itemSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('common.noResults') ?? 'No results'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.form.warehouse')} <span className="text-red-500">*</span>
              </label>
              <div ref={warehouseDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setWarehouseDropdownOpen(o => !o); setWarehouseSearch(''); }}
                  className="w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-sm text-left"
                >
                  <span className={formData.warehouseId ? '' : 'text-gray-400 dark:text-gray-500'}>
                    {formData.warehouseId
                      ? warehouses.find(w => w.id === formData.warehouseId)?.name ?? t('inventory.form.selectWarehouse')
                      : t('inventory.form.selectWarehouse')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${warehouseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {warehouseDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={warehouseSearch}
                          onChange={e => setWarehouseSearch(e.target.value)}
                          placeholder={`${t('common.search')}...`}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {warehouses
                        .filter(w => w.name.toLowerCase().includes(warehouseSearch.toLowerCase()))
                        .map(wh => (
                          <li
                            key={wh.id}
                            onClick={() => { handleWarehouseChange(wh.id); setWarehouseDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              formData.warehouseId === wh.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {wh.name}
                          </li>
                        ))}
                      {warehouses.filter(w => w.name.toLowerCase().includes(warehouseSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('common.noResults') ?? 'No results'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.form.location')} <span className="text-red-500">*</span>
              </label>
              <div ref={locationDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { if (formData.warehouseId) { setLocationDropdownOpen(o => !o); setLocationSearch(''); } }}
                  disabled={!formData.warehouseId}
                  className={`w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-sm text-left ${!formData.warehouseId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={formData.locationId ? '' : 'text-gray-400 dark:text-gray-500'}>
                    {formData.locationId
                      ? locations.find(l => l.id === formData.locationId)?.code ?? t('inventory.form.selectLocation')
                      : t('inventory.form.selectLocation')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {locationDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={locationSearch}
                          onChange={e => setLocationSearch(e.target.value)}
                          placeholder={`${t('common.search')}...`}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {locations
                        .filter(l => l.code.toLowerCase().includes(locationSearch.toLowerCase()))
                        .map(loc => (
                          <li
                            key={loc.id}
                            onClick={() => { setFormData(f => ({ ...f, locationId: loc.id })); setLocationDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              formData.locationId === loc.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {loc.code}
                          </li>
                        ))}
                      {locations.filter(l => l.code.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('common.noResults') ?? 'No results'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Lot (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.lot')}</label>
              <div ref={lotDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setLotDropdownOpen(o => !o); setLotSearch(''); }}
                  className="w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-sm text-left"
                >
                  <span className={formData.lotId ? '' : 'text-gray-400 dark:text-gray-500'}>
                    {formData.lotId
                      ? lots.find(l => l.id === formData.lotId)?.lotNumber ?? t('inventory.form.noLot')
                      : t('inventory.form.noLot')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${lotDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {lotDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={lotSearch}
                          onChange={e => setLotSearch(e.target.value)}
                          placeholder={`${t('common.search')}...`}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                      <li
                        onClick={() => { setFormData(f => ({ ...f, lotId: '' })); setLotDropdownOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${!formData.lotId ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        {t('inventory.form.noLot')}
                      </li>
                      {lots
                        .filter(l => l.lotNumber.toLowerCase().includes(lotSearch.toLowerCase()))
                        .map(lot => (
                          <li
                            key={lot.id}
                            onClick={() => { setFormData(f => ({ ...f, lotId: lot.id })); setLotDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              formData.lotId === lot.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {lot.lotNumber}
                          </li>
                        ))}
                      {lots.filter(l => l.lotNumber.toLowerCase().includes(lotSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('common.noResults') ?? 'No results'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Serial (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.serial')}</label>
              <div ref={serialDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { setSerialDropdownOpen(o => !o); setSerialSearch(''); }}
                  className="w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-sm text-left"
                >
                  <span className={formData.serialId ? '' : 'text-gray-400 dark:text-gray-500'}>
                    {formData.serialId
                      ? serials.find(s => s.id === formData.serialId)?.serialNumber ?? t('inventory.form.noSerial')
                      : t('inventory.form.noSerial')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${serialDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {serialDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={serialSearch}
                          onChange={e => setSerialSearch(e.target.value)}
                          placeholder={`${t('common.search')}...`}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                      <li
                        onClick={() => { setFormData(f => ({ ...f, serialId: '' })); setSerialDropdownOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${!formData.serialId ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        {t('inventory.form.noSerial')}
                      </li>
                      {serials
                        .filter(s => s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase()))
                        .map(serial => (
                          <li
                            key={serial.id}
                            onClick={() => { setFormData(f => ({ ...f, serialId: serial.id })); setSerialDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              formData.serialId === serial.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {serial.serialNumber}
                          </li>
                        ))}
                      {serials.filter(s => s.serialNumber.toLowerCase().includes(serialSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('common.noResults') ?? 'No results'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity On Hand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.form.onHand')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.quantityOnHand}
                onChange={(e) => setFormData({ ...formData, quantityOnHand: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {/* Quantity Reserved */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.reserved')}</label>
              <Input
                type="number"
                value={formData.quantityReserved}
                onChange={(e) => setFormData({ ...formData, quantityReserved: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {/* Quantity Damaged */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.damaged')}</label>
              <Input
                type="number"
                value={formData.quantityDamaged}
                onChange={(e) => setFormData({ ...formData, quantityDamaged: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {/* UOM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.form.uom')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                required
                placeholder={t('inventory.form.uomPlaceholder')}
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.form.status')} <span className="text-red-500">*</span>
              </label>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="dark:bg-neutral-700 dark:border-neutral-600">
                <option value="AVAILABLE">{t('inventory.status.available')}</option>
                <option value="RESERVED">{t('inventory.status.reserved')}</option>
                <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
                <option value="DAMAGED">{t('inventory.status.damaged')}</option>
              </Select>
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.unitCost')}</label>
              <Input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {/* Manufacture Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.manufactureDate')}</label>
              <Input
                type="date"
                value={formData.manufactureDate}
                onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.expiryDate')}</label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.form.attributes')}</label>
            <textarea
              value={formData.attributes}
              onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={t('inventory.form.attributesPlaceholder')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('inventory.form.saving') : mode === 'create' ? t('inventory.form.create') : t('inventory.form.update')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InventoryPage;
