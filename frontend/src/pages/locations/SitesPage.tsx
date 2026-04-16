// frontend/src/pages/locations/SitesPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Edit, Trash2, Globe, 
  MapPin, Building2, RefreshCw, CheckCircle
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
import { SiteFormModal } from '@/components/sites/SiteFormModal';
import { Site } from '@/types';

export const SitesPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const response = await locationService.getSites();
      const sitesData = Array.isArray(response) ? response : (response.content || []);
      setSites(sitesData);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error(t('locations.sites.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedSite(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditClick = (site: Site) => {
    setSelectedSite(site);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (site: Site) => {
    setSelectedSite(site);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSite) return;
    try {
      await locationService.deleteSite(selectedSite.id);
      toast.success(t('locations.sites.messages.deleteSuccess'));
      fetchSites();
      setIsDeleteDialogOpen(false);
      setSelectedSite(null);
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error(t('locations.sites.messages.deleteError'));
    }
  };

  const filteredSites = sites.filter(site => {
    if (!site) return false;
    const matchesSearch = !searchTerm || 
      (site.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (site.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = !filterType || site.type === filterType;
    const matchesStatus = !filterStatus || site.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: sites.length,
    active: sites.filter(s => s?.status === 'ACTIVE').length,
    warehouses: sites.filter(s => s?.type === 'WAREHOUSE').length,
    offices: sites.filter(s => s?.type === 'OFFICE').length,
  };

  const getStatusBadge = (status: string) => {
    const s = status || 'UNKNOWN';
    const isActive = s === 'ACTIVE';
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }`}>
        {t(`locations.sites.status.${s.toLowerCase()}`, { defaultValue: s })}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('locations.sites.title')}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('locations.sites.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchSites} variant="secondary" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          {hasPermission(PERMISSIONS.LOCATIONS_CREATE) && (
            <Button onClick={handleCreateClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('locations.sites.newSite')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Globe className="text-blue-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.sites.stats.totalSites')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.active}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.sites.stats.active')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="text-purple-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.warehouses}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.sites.stats.warehouses')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-neutral-800 p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="text-orange-500" size={24} />
            <span className="text-2xl font-bold dark:text-white">{stats.offices}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('locations.sites.stats.distributionCenters')}</p>
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
              placeholder={t('locations.sites.searchPlaceholder')} 
              className="pl-10 w-full bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.sites.allTypes')}</option>
            <option value="WAREHOUSE">{t('locations.sites.types.warehouse')}</option>
            <option value="DISTRIBUTION_CENTER">{t('locations.sites.types.distributionCenter')}</option>
            <option value="MANUFACTURING">{t('locations.sites.types.manufacturing')}</option>
            <option value="RETAIL">{t('locations.sites.types.retail')}</option>
            <option value="OFFICE">{t('locations.sites.types.office')}</option>
          </Select>
          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-700 h-11 rounded-xl"
          >
            <option value="">{t('locations.sites.allStatus')}</option>
            <option value="ACTIVE">{t('locations.sites.status.active')}</option>
            <option value="INACTIVE">{t('locations.sites.status.inactive')}</option>
          </Select>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.sites.table.name')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.sites.table.type')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.sites.table.address')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500">{t('locations.sites.table.status')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-neutral-500 text-right">{t('locations.sites.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-neutral-500">{t('common.loading')}</td></tr>
              ) : filteredSites.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-neutral-500">{t('locations.sites.messages.noSites')}</td></tr>
              ) : (
                filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium dark:text-white">{site.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {site.type ? t(`locations.sites.types.${site.type.toLowerCase()}`, { defaultValue: site.type }) : t('common.na')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">{site.address}</td>
                    <td className="px-6 py-4">{getStatusBadge(site.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission(PERMISSIONS.LOCATIONS_EDIT) && (
                          <button onClick={() => handleEditClick(site)} className="p-2 text-yellow-600 hover:text-yellow-900 transition-colors"><Edit size={18} /></button>
                        )}
                        {hasPermission(PERMISSIONS.LOCATIONS_DELETE) && (
                          <button onClick={() => handleDeleteClick(site)} className="p-2 text-red-600 hover:text-red-900 transition-colors"><Trash2 size={18} /></button>
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
        title={t('locations.sites.delete.title')}
        message={t('locations.sites.delete.confirm', { name: selectedSite?.name || '' })}
      />

      <SiteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchSites}
        mode={formMode}
        site={selectedSite}
      />
    </div>
  );
};
