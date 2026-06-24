// frontend/src/pages/locations/LocationsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Edit, Trash2, MapPin, 
  Box, Tag, RefreshCw, 
  CheckCircle
} from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { LocationFormModal } from '@/components/locations/LocationFormModal';
import { Location, Warehouse as WarehouseType } from '@/types';
import { Pagination } from '@/components/ui/Pagination';

export const LocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [locations, setLocations] = useState<Location[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [locationsRes, warehousesRes] = await Promise.all([
        locationService.getLocations(),
        locationService.getWarehouses()
      ]);
      
      const locationsData = Array.isArray(locationsRes) ? locationsRes : (locationsRes.content || []);
      const warehousesData = Array.isArray(warehousesRes) ? warehousesRes : (warehousesRes.content || []);
      
      setLocations(locationsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('locations.locations.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedLocation(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditClick = (location: Location) => {
    setSelectedLocation(location);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLocation) return;
    try {
      await locationService.deleteLocation(selectedLocation.id);
      toast.success(t('locations.locations.messages.deleteSuccess'));
      fetchInitialData();
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(t('locations.locations.messages.deleteError'));
    }
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterWarehouse, filterType, filterStatus]);

  const filteredLocations = locations.filter(loc => {
    if (!loc) return false;
    const matchesSearch = !searchTerm ||
      (loc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (loc.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesWarehouse = !filterWarehouse || loc.warehouseId === filterWarehouse;
    const matchesType = !filterType || loc.type === filterType;
    const matchesStatus = !filterStatus ||
      (filterStatus === 'ACTIVE' ? loc.isActive !== false : loc.isActive === false);
    return matchesSearch && matchesWarehouse && matchesType && matchesStatus;
  });

  const stats = {
    total: locations.length,
    active: locations.filter(l => l?.isActive !== false).length,
    storage: locations.filter(l => l?.type === 'STORAGE').length,
    picking: locations.filter(l => l?.type === 'PICKING').length,
  };

  const getStatusBadge = (isActive?: boolean) => {
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
        isActive !== false
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }`}>
        {isActive !== false
          ? t('locations.locations.status.active')
          : t('locations.locations.status.inactive')}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('locations.locations.title')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('locations.locations.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchInitialData} variant="secondary" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          {hasPermission(PERMISSIONS.LOCATIONS_CREATE) && (
            <Button onClick={handleCreateClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('locations.locations.newLocation')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="text-blue-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.locations.stats.totalLocations')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.active}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.locations.stats.active')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Box className="text-purple-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.storage}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.locations.stats.storage')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Tag className="text-orange-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.picking}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.locations.stats.picking')}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border border-neutral-100 dark:border-neutral-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="relative md:col-span-2 lg:col-span-2 xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <Input 
              placeholder={t('locations.locations.searchPlaceholder')} 
              className="pl-10 w-full bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={filterWarehouse} 
            onChange={(e) => setFilterWarehouse(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.locations.allWarehouses')}</option>
            {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
          </Select>
          <Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.locations.allTypes')}</option>
            <option value="STORAGE">{t('locations.locations.types.storage')}</option>
            <option value="PICKING">{t('locations.locations.types.picking')}</option>
            <option value="RECEIVING">{t('locations.locations.types.receiving')}</option>
            <option value="SHIPPING">{t('locations.locations.types.shipping')}</option>
            <option value="STAGING">{t('locations.locations.types.staging')}</option>
            <option value="QUARANTINE">{t('locations.locations.types.quarantine')}</option>
          </Select>
          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.locations.allStatus')}</option>
            <option value="ACTIVE">{t('locations.locations.status.active')}</option>
            <option value="INACTIVE">{t('locations.locations.status.inactive')}</option>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.locations.table.code')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.locations.table.warehouse')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.locations.table.zoneAisleRack')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.locations.table.type')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.locations.table.status')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500 text-right">{t('locations.locations.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500">{t('common.loading')}</td></tr>
              ) : filteredLocations.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500">{t('locations.locations.messages.noLocations')}</td></tr>
              ) : (
                filteredLocations.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((loc) => (
                  <tr key={loc.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-neutral-600 dark:text-neutral-400">{loc.code}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {warehouses.find(w => w.id === loc.warehouseId)?.name || loc.warehouseId}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {loc.zone}/{loc.aisle}/{loc.rack}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {loc.type ? t(`locations.locations.types.${loc.type.toLowerCase()}`, { defaultValue: loc.type }) : t('common.na')}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(loc.isActive)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission(PERMISSIONS.LOCATIONS_EDIT) && (
                          <button onClick={() => handleEditClick(loc)} className="p-2 text-yellow-600 hover:text-yellow-900 transition-colors"><Edit size={18} /></button>
                        )}
                        {hasPermission(PERMISSIONS.LOCATIONS_DELETE) && (
                          <button onClick={() => handleDeleteClick(loc)} className="p-2 text-red-600 hover:text-red-900 transition-colors"><Trash2 size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredLocations.length / pageSize)}
          totalItems={filteredLocations.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('locations.locations.delete.title')}
        message={t('locations.locations.delete.confirm', { code: selectedLocation?.code || '' })}
      />

      <LocationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchInitialData}
        mode={formMode}
        location={selectedLocation}
      />
    </div>
  );
};
