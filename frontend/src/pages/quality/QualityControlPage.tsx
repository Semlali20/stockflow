import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle, 
  ClipboardCheck, RefreshCw, Filter 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { qualityService } from '@/services/quality.service';
import { productService } from '@/services/product.service';
import { QualityControl } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { QualityControlFormModal } from '@/components/quality-controls/QualityControlFormModal';
import { QualityControlDetailModal } from '@/components/quality-controls/QualityControlDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { confirmAction, promptInput } from '@/utils/confirmDialog';
import { format } from 'date-fns';

export const QualityControlsPage = () => {
  const { t } = useTranslation();

  // State
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [filteredQualityControls, setFilteredQualityControls] = useState<QualityControl[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterType, setFilterType] = useState('');
  const [itemsData, setItemsData] = useState<Map<string, any>>(new Map());

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState<QualityControl | null>(null);

  // ✅ Enrich quality controls with item data
  const enrichWithItemData = async (controls: QualityControl[]) => {
    const newItemsMap = new Map(itemsData);

    for (const qc of controls) {
      if (qc.itemId && !newItemsMap.has(qc.itemId)) {
        try {
          const item = await productService.getItemById(qc.itemId);

          // Fetch category if not included in item response
          let categoryName = t('common.unknownCategory', 'Unknown Category');
          if (item.category?.name) {
            categoryName = item.category.name;
          } else if (item.categoryId) {
            try {
              const category = await productService.getCategoryById(item.categoryId);
              categoryName = category.name;
            } catch (catError) {
              console.error('Error fetching category:', catError);
            }
          }

          newItemsMap.set(qc.itemId, {
            name: item.name,
            categoryName: categoryName,
            sku: item.sku,
          });
        } catch (error) {
          console.error('Error fetching item:', error);
          newItemsMap.set(qc.itemId, {
            name: t('common.unknownItem', 'Unknown Item'),
            categoryName: t('common.unknownCategory', 'Unknown Category'),
            sku: qc.itemId.slice(0, 8),
          });
        }
      }
    }

    setItemsData(newItemsMap);
  };

  // ✅ Fetch quality controls
  const fetchQualityControls = async () => {
    setLoading(true);
    try {
      const data = await qualityService.getQualityControls({ size: 100 });
      const controls = Array.isArray(data) ? data : (data?.content || []);
      setQualityControls(controls);
      setFilteredQualityControls(controls);

      // Enrich with item data
      await enrichWithItemData(controls);

      console.log('✅ Quality Controls loaded:', controls.length);
    } catch (error) {
      toast.error(t('quality.controls.messages.fetchError'));
      console.error(error);
      setQualityControls([]);
      setFilteredQualityControls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityControls();
  }, []);

  // ✅ Apply filters
  useEffect(() => {
    let filtered = Array.isArray(qualityControls) ? qualityControls : [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (qc) =>
          qc.controlNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qc.inspectionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qc.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qc.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((qc) => qc.status === filterStatus);
    }

    // Result filter
    if (filterResult === 'passed') {
      filtered = filtered.filter((qc) => qc.status === 'PASSED');
    } else if (filterResult === 'failed') {
      filtered = filtered.filter((qc) => qc.status === 'FAILED');
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter((qc) => qc.inspectionType === filterType);
    }

    setFilteredQualityControls(filtered);
  }, [searchTerm, filterStatus, filterResult, filterType, qualityControls]);

  // ✅ Handlers
  const handleCreate = () => {
    setSelectedQC(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (qc: QualityControl) => {
    setSelectedQC(qc);
    setIsEditModalOpen(true);
  };

  const handleView = (qc: QualityControl) => {
    setSelectedQC(qc);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (qc: QualityControl) => {
    setSelectedQC(qc);
    setIsDeleteDialogOpen(true);
  };

  // ✅ Quick Approve
  const handleQuickApprove = async (qc: QualityControl) => {
    const ok = await confirmAction(
      t('quality.controls.actions.approve'), 
      t('quality.controls.delete.confirm', { number: qc.controlNumber || qc.inspectionNumber || qc.id.slice(0, 8) }), 
      t('quality.controls.actions.approve')
    );
    if (!ok) return;

    try {
      await qualityService.approveQualityControl(qc.id);
      toast.success('✅ ' + t('quality.controls.messages.approveSuccess'));
      fetchQualityControls();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('quality.controls.messages.approveError'));
      console.error(error);
    }
  };

  // ✅ Quick Reject
  const handleQuickReject = async (qc: QualityControl) => {
    const reason = await promptInput(
      t('quality.controls.actions.reject'), 
      t('quality.controls.details.inspectorNotes'), 
      t('quality.controls.form.notesPlaceholder', 'e.g. Failed quality thresholds…')
    );
    if (!reason) return;

    try {
      await qualityService.rejectQualityControl(qc.id, reason);
      toast.success('❌ ' + t('quality.controls.messages.rejectSuccess'));
      fetchQualityControls();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('quality.controls.messages.rejectError'));
      console.error(error);
    }
  };

  // ✅ Update Status (Unused but kept for reference)
  // const handleUpdateStatus = async (qc: QualityControl, newStatus: string) => {
  //   try {
  //     await qualityService.updateQualityControlStatus(qc.id, newStatus);
  //     toast.success('✅ ' + t('quality.controls.messages.statusUpdateSuccess', { status: newStatus }));
  //     fetchQualityControls();
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || t('quality.controls.messages.statusUpdateError'));
  //     console.error(error);
  //   }
  // };

  // ✅ Confirm Delete
  const confirmDelete = async () => {
    if (!selectedQC) return;

    try {
      await qualityService.deleteQualityControl(selectedQC.id);
      toast.success(t('quality.controls.messages.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      setSelectedQC(null);
      fetchQualityControls();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('quality.controls.messages.deleteError'));
      console.error(error);
    }
  };

  // ✅ Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800' },
      PASSED: { bg: 'bg-green-100', text: 'text-green-800' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    const badge = badges[status] || badges.PENDING;
    return `${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-medium`;
  };

  // ✅ Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t('common.na');
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getInspectionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      RECEIVING: t('quality.controls.form.typeIncoming'),
      IN_PROCESS: t('quality.controls.form.typeInProcess'),
      FINAL: t('quality.controls.form.typeFinal'),
      SAMPLING: t('quality.controls.form.typeRandom'),
      '100_PERCENT': t('quality.controls.form.typeProcess'),
      RETURN: t('quality.controls.form.typeReturn')
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      PENDING: t('quality.controls.form.statusPending'),
      IN_PROGRESS: t('quality.controls.form.statusInProgress'),
      PASSED: t('quality.controls.form.statusPassed'),
      FAILED: t('quality.controls.form.statusFailed'),
      CANCELLED: t('common.cancelled'),
      QUARANTINED: t('quality.controls.form.statusQuarantined'),
      CONDITIONAL: t('quality.controls.form.statusConditional')
    };
    return statuses[status] || status;
  };

  // ✅ Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterResult('');
    setFilterType('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <ClipboardCheck className="text-blue-600" size={32} />
          {t('quality.controls.title')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('quality.controls.subtitle')}
        </p>
      </div>

      {/* Actions & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder={t('quality.controls.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus size={20} />
              {t('quality.controls.newQC')}
            </Button>
            <Button
              onClick={fetchQualityControls}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={18} />
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">{t('quality.controls.filters.allStatuses')}</option>
            <option value="PENDING">{t('quality.controls.form.statusPending')}</option>
            <option value="IN_PROGRESS">{t('quality.controls.form.statusInProgress')}</option>
            <option value="PASSED">{t('quality.controls.form.statusPassed')}</option>
            <option value="FAILED">{t('quality.controls.form.statusFailed')}</option>
            <option value="CANCELLED">{t('common.cancelled', 'Cancelled')}</option>
          </Select>

          <Select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <option value="">{t('quality.controls.filters.allResults')}</option>
            <option value="passed">{t('quality.controls.filters.passedOnly')}</option>
            <option value="failed">{t('quality.controls.filters.failedOnly')}</option>
          </Select>

          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">{t('quality.controls.filters.allTypes')}</option>
            <option value="RECEIVING">{t('quality.controls.form.typeIncoming')}</option>
            <option value="IN_PROCESS">{t('quality.controls.form.typeInProcess')}</option>
            <option value="FINAL">{t('quality.controls.form.typeFinal')}</option>
            <option value="SAMPLING">{t('quality.controls.form.typeRandom')}</option>
            <option value="100_PERCENT">{t('quality.controls.form.typeProcess')}</option>
          </Select>

          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter size={18} />
            {t('quality.controls.filters.clearFilters')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{t('quality.controls.stats.total')}</div>
          <div className="text-2xl font-bold text-gray-800">{qualityControls.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <div className="text-sm text-green-600">{t('quality.controls.stats.passed')}</div>
          <div className="text-2xl font-bold text-green-700">
            {qualityControls.filter(qc => qc.status === 'PASSED').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4">
          <div className="text-sm text-red-600">{t('quality.controls.stats.failed')}</div>
          <div className="text-2xl font-bold text-red-700">
            {qualityControls.filter(qc => qc.status === 'FAILED').length}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
          <div className="text-sm text-yellow-600">{t('quality.controls.stats.pending')}</div>
          <div className="text-2xl font-bold text-yellow-700">
            {qualityControls.filter(qc => qc.status === 'PENDING').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredQualityControls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ClipboardCheck size={48} className="mb-4 text-gray-400" />
            <p className="text-lg font-medium">{t('quality.controls.empty.title')}</p>
            <p className="text-sm">{t('quality.controls.empty.description')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.controlNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.result')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.quantity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.defects')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quality.controls.table.date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQualityControls.map((qc) => {
                  const itemData = itemsData.get(qc.itemId);
                  return (
                  <tr key={qc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {itemData?.categoryName || t('common.unknownCategory')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {itemData?.name || qc.itemId?.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{qc.inspectionType ? getInspectionTypeLabel(qc.inspectionType) : t('common.na')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(qc.status)}>
                        {getStatusLabel(qc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {qc.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          qc.status === 'PASSED'
                            ? 'bg-green-100 text-green-800'
                            : qc.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusLabel(qc.status)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {qc.quantityInspected || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (qc.defectCount || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {qc.defectCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(qc.testedDate || qc.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Actions */}
                        {(qc.status === 'PASSED' || qc.status === 'FAILED') && !qc.approvedBy && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(qc)}
                              className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                              title={t('quality.controls.actions.approve')}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleQuickReject(qc)}
                              className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                              title={t('quality.controls.actions.reject')}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                        {/* Standard Actions */}
                        <button
                          onClick={() => handleView(qc)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                          title={t('quality.controls.actions.viewDetails')}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(qc)}
                          className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50"
                          title={t('common.edit')}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(qc)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                          title={t('common.delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <QualityControlFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchQualityControls}
        />
      )}

      {isEditModalOpen && selectedQC && (
        <QualityControlFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchQualityControls}
          qualityControl={selectedQC}
        />
      )}

      {isDetailModalOpen && selectedQC && (
        <QualityControlDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          qualityControl={selectedQC}
          onUpdate={fetchQualityControls}
        />
      )}

      {isDeleteDialogOpen && selectedQC && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title={t('quality.controls.delete.title')}
          message={t('quality.controls.delete.confirm', { number: selectedQC.controlNumber || selectedQC.inspectionNumber || selectedQC.id.slice(0, 8) })}
        />
      )}
    </div>
  );
};