import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Trash2, Download, FileText, Image as ImageIcon, Video, FileCheck } from 'lucide-react';
import { qualityService } from '@/services/quality.service';
import { QualityAttachment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const QualityAttachmentsPage = () => {
  const { t } = useTranslation();
  const [attachments, setAttachments] = useState<QualityAttachment[]>([]);
  const [filteredAttachments, setFilteredAttachments] = useState<QualityAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<QualityAttachment | null>(null);

  // Fetch attachments
  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const response = await qualityService.getAttachments();
      const data = response.content || [];
      setAttachments(data);
      setFilteredAttachments(data);
    } catch (error) {
      toast.error(t('quality.attachments.messages.fetchError'));
      console.error(error);
      setAttachments([]);
      setFilteredAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = attachments;

    if (searchTerm) {
      filtered = filtered.filter(
        (att) =>
          att.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          att.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter((att) => att.attachmentType === filterType);
    }

    setFilteredAttachments(filtered);
  }, [searchTerm, filterType, attachments]);

  // Handlers
  const handleUpload = () => {
    // TODO: Implement Upload Modal
    toast.error(t('quality.attachments.messages.uploadNotImplemented'));
  };

  const handleDelete = (attachment: QualityAttachment) => {
    setSelectedAttachment(attachment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAttachment) return;

    try {
      await qualityService.deleteAttachment(selectedAttachment.id);
      toast.success(t('quality.attachments.messages.deleteSuccess'));
      fetchAttachments();
    } catch (error) {
      toast.error(t('quality.attachments.messages.deleteError'));
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAttachment(null);
    }
  };

  const handleDownload = (attachment: QualityAttachment) => {
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    } else {
      toast.error(t('quality.attachments.messages.urlError'));
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type.includes('video')) return <Video className="w-5 h-5 text-purple-500" />;
    if (type.includes('pdf')) return <FileCheck className="w-5 h-5 text-red-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getAttachmentTypeBadge = (type?: string) => {
    if (!type) return null;
    const typeMap: Record<string, string> = {
      IMAGE: t('quality.attachments.stats.images'),
      VIDEO: t('quality.attachments.stats.videos'),
      DOCUMENT: t('quality.attachments.stats.documents'),
      CERTIFICATE: t('quality.attachments.stats.certificates'),
    };

    const colors: Record<string, string> = {
      IMAGE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      VIDEO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      DOCUMENT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      CERTIFICATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type] || colors.DOCUMENT}`}>
        {typeMap[type] || type}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return t('common.na');
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('quality.attachments.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {t('quality.attachments.subtitle')}
          </p>
        </div>
        <Button onClick={handleUpload} className="flex items-center gap-2">
          <Plus size={20} />
          {t('quality.attachments.upload')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('quality.attachments.stats.total')}</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {attachments.length}
              </p>
            </div>
            <FileText className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('quality.attachments.stats.images')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {attachments.filter((a) => a.attachmentType === 'IMAGE').length}
              </p>
            </div>
            <ImageIcon className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('quality.attachments.stats.documents')}</p>
              <p className="text-2xl font-bold text-gray-600">
                {attachments.filter((a) => a.attachmentType === 'DOCUMENT').length}
              </p>
            </div>
            <FileText className="text-gray-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('quality.attachments.stats.certificates')}</p>
              <p className="text-2xl font-bold text-green-600">
                {attachments.filter((a) => a.attachmentType === 'CERTIFICATE').length}
              </p>
            </div>
            <FileCheck className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder={t('quality.attachments.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">{t('quality.attachments.filters.allTypes')}</option>
            <option value="IMAGE">{t('quality.attachments.stats.images')}</option>
            <option value="VIDEO">{t('quality.attachments.stats.videos')}</option>
            <option value="DOCUMENT">{t('quality.attachments.stats.documents')}</option>
            <option value="CERTIFICATE">{t('quality.attachments.stats.certificates')}</option>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.attachments.table.file')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.attachments.table.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.attachments.table.size')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.attachments.table.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.attachments.table.uploadedBy')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.attachments.table.uploadedAt')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('quality.quarantines.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredAttachments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                      {t('quality.attachments.empty')}
                    </td>
                  </tr>
                ) : (
                  filteredAttachments.map((attachment) => (
                    <tr key={attachment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getFileIcon(attachment.fileType)}
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {attachment.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAttachmentTypeBadge(attachment.attachmentType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {formatFileSize(attachment.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {attachment.description || t('quality.attachments.noDescription')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {String(attachment.uploadedByName || attachment.uploadedBy || '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                        {attachment.uploadedAt ? format(new Date(attachment.uploadedAt), 'MMM dd, yyyy HH:mm') : t('common.na')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(attachment)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('quality.details.attachments.download')}
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(attachment)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title={t('common.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAttachment(null);
        }}
        onConfirm={confirmDelete}
        title={t('quality.attachments.delete.title')}
        message={t('quality.attachments.delete.confirm', { name: selectedAttachment?.fileName })}
      />
    </div>
  );
};