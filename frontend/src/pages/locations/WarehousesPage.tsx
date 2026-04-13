// frontend/src/pages/locations/WarehousesPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Edit, Trash2, Warehouse, 
  Globe, RefreshCw, CheckCircle, 
  AlertCircle
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
import { WarehouseFormModal } from '@/components/warehouses/WarehouseFormModal';
import { Warehouse as WarehouseType, Site } from '@/types';

export const WarehousesPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [warehousesRes, sitesRes] = await Promise.all([
        locationService.getWarehouses(),
        locationService.getSites()
      ]);
      
      const warehousesData = Array.isArray(warehousesRes) ? warehousesRes : (warehousesRes.content || []);
      const sitesData = Array.isArray(sitesRes) ? sitesRes : (sitesRes.content || []);
      
      setWarehouses(warehousesData);
      setSites(sitesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('locations.warehouses.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedWarehouse(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditClick = (warehouse: WarehouseType) => {
    setSelectedWarehouse(warehouse);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (warehouse: WarehouseType) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedWarehouse) return;
    try {
      await locationService.deleteWarehouse(selectedWarehouse.id);
      toast.success(t('locations.warehouses.messages.deleteSuccess'));
      fetchInitialData();
      setIsDeleteDialogOpen(false);
      setSelectedWarehouse(null);
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error(t('locations.warehouses.messages.deleteError'));
    }
  };

  const filteredWarehouses = warehouses.filter(wh => {
    if (!wh) return false;
    const matchesSearch = !searchTerm || 
      (wh.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (wh.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesSite = !filterSite || wh.siteId === filterSite;
    const matchesStatus = !filterStatus ||
      (filterStatus === 'ACTIVE' ? wh.isActive !== false : wh.isActive === false);
    return matchesSearch && matchesSite && matchesStatus;
  });

  const stats = {
    total: warehouses.length,
    active: warehouses.filter(w => w?.isActive !== false).length,
    inactive: warehouses.filter(w => w?.isActive === false).length,
    sites: sites.length,
  };

  const getStatusBadge = (isActive?: boolean) => {
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
        isActive !== false
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }`}>
        {isActive !== false
          ? t('locations.warehouses.status.active')
          : t('locations.warehouses.status.inactive')}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('locations.warehouses.title')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('locations.warehouses.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchInitialData} variant="secondary" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          {hasPermission(PERMISSIONS.LOCATIONS_CREATE) && (
            <Button onClick={handleCreateClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('locations.warehouses.newWarehouse')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Warehouse className="text-blue-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.warehouses.stats.totalWarehouses')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.active}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.warehouses.stats.active')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="text-red-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.inactive}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.warehouses.stats.inactive')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Globe className="text-purple-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.sites}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.warehouses.stats.sites')}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border border-neutral-100 dark:border-neutral-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <Input 
              placeholder={t('locations.warehouses.searchPlaceholder')} 
              className="pl-10 w-full bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={filterSite} 
            onChange={(e) => setFilterSite(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.warehouses.allSites')}</option>
            {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
          </Select>
          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.warehouses.allStatus')}</option>
            <option value="ACTIVE">{t('locations.warehouses.status.active')}</option>
            <option value="INACTIVE">{t('locations.warehouses.status.inactive')}</option>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.warehouses.table.code')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.warehouses.table.name')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.warehouses.table.site')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.warehouses.table.address')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.warehouses.table.status')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500 text-right">{t('locations.warehouses.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500">{t('common.loading')}</td></tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-500">{t('locations.warehouses.messages.noWarehouses')}</td></tr>
              ) : (
                filteredWarehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-neutral-600 dark:text-neutral-400">{wh.code}</td>
                    <td className="px-6 py-4 text-sm font-medium dark:text-white">{wh.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {sites.find(s => s.id === wh.siteId)?.name || wh.siteId}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">{wh.address}</td>
                    <td className="px-6 py-4">{getStatusBadge(wh.isActive)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission(PERMISSIONS.LOCATIONS_EDIT) && (
                          <button onClick={() => handleEditClick(wh)} className="p-2 text-neutral-400 hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                        )}
                        {hasPermission(PERMISSIONS.LOCATIONS_DELETE) && (
                          <button onClick={() => handleDeleteClick(wh)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('locations.warehouses.delete.title')}
        message={t('locations.warehouses.delete.confirm', { name: selectedWarehouse?.name || '' })}
      />

      <WarehouseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchInitialData}
        mode={formMode}
        warehouse={selectedWarehouse}
      />
    </div>
  );
};
