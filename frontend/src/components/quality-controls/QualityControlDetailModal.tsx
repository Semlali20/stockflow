import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, AlertCircle, FileText, Download, Calendar, User, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { qualityService } from '@/services/quality.service';
import { QualityControl, QualityAttachment } from '@/types';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { confirmWarning } from '@/utils/confirmDialog';
import { format } from 'date-fns';

interface QualityControlDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualityControl: QualityControl;
  onUpdate?: () => void;
}

export const QualityControlDetailModal: React.FC<QualityControlDetailModalProps> = ({
  isOpen,
  onClose,
  qualityControl: initialQualityControl,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<QualityAttachment[]>([]);
  const [qualityControl, setQualityControl] = useState<QualityControl>(initialQualityControl);

  useEffect(() => {
    if (isOpen && initialQualityControl?.id) {
      setQualityControl(initialQualityControl);
      fetchAttachments();
    }
  }, [isOpen, initialQualityControl]);

 const fetchAttachments = async () => {
  // ⚠️ TEMPORARY: Backend expects Long (number) but we have UUID (string)
  // Skip fetching attachments to prevent 400 error
  console.log('⚠️ Attachments disabled - backend type mismatch');
  setAttachments([]);
};

  const handleApprove = async () => {
    setLoading(true);
    try {
      await qualityService.approveQualityControl(qualityControl.id);
      toast.success(t('quality.controls.messages.approveSuccess'));
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('quality.controls.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt(t('quality.controls.messages.rejectionPrompt'));
    if (!reason) return;

    setLoading(true);
    try {
      await qualityService.rejectQualityControl(qualityControl.id, reason);
      toast.success(t('quality.controls.messages.statusUpdateSuccess', { status: 'REJECTED' }));
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('quality.controls.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const ok = await confirmWarning(
      t('quality.controls.details.updateStatus'),
      t('quality.controls.details.confirmUpdate', { status: getStatusLabel(newStatus) }),
      t('common.update')
    );
    if (!ok) return;

    setLoading(true);
    try {
      const updatedQC = await qualityService.updateQualityControlStatus(qualityControl.id, newStatus);
      toast.success(t('quality.controls.messages.statusUpdateSuccess', { status: newStatus }));

      // Update the local state with the new data
      setQualityControl(updatedQC);

      // Refresh the parent list
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('quality.controls.messages.statusUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PASSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      QUARANTINED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      CONDITIONAL_ACCEPT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getDispositionBadge = (disposition: string) => {
    const colors: Record<string, string> = {
      ACCEPT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      REJECT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      REWORK: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      SCRAP: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      CONDITIONAL_ACCEPT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      RETURN_TO_SUPPLIER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[disposition] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      PENDING: t('quality.controls.form.statusPending'),
      IN_PROGRESS: t('quality.controls.form.statusInProgress'),
      PASSED: t('quality.controls.form.statusPassed'),
      FAILED: t('quality.controls.form.statusFailed'),
      CANCELLED: t('common.cancelled'),
      QUARANTINED: t('quality.controls.form.statusQuarantined'),
      CONDITIONAL_ACCEPT: t('quality.controls.form.statusConditional')
    };
    return statuses[status] || status;
  };

  const getDispositionLabel = (disposition: string) => {
    const dispositions: Record<string, string> = {
      ACCEPT: t('quality.controls.form.resultAccept'),
      REJECT: t('quality.controls.form.resultReject'),
      REWORK: t('quality.controls.form.resultRework'),
      SCRAP: t('quality.controls.form.resultScrap'),
      CONDITIONAL_ACCEPT: t('quality.controls.form.statusConditional'),
      RETURN_TO_SUPPLIER: t('quality.controls.form.resultReturn'),
      UNDER_REVIEW: t('quality.controls.form.resultReview')
    };
    return dispositions[disposition] || disposition;
  };

  const getSeverityLabel = (severity: string) => {
    const severities: Record<string, string> = {
      CRITICAL: t('common.critical'),
      MAJOR: t('common.major'),
      MINOR: t('common.minor')
    };
    return severities[severity] || severity;
  };

  const getAvailableStatusActions = () => {
    const actions: { label: string; status: string; color: string; icon: any }[] = [];

    switch (qualityControl.status) {
      case 'PENDING':
        actions.push({ label: t('quality.controls.details.startInspection'), status: 'IN_PROGRESS', color: 'blue', icon: AlertCircle });
        break;
      case 'IN_PROGRESS':
        actions.push({ label: t('quality.controls.details.markPassed'), status: 'PASSED', color: 'green', icon: CheckCircle });
        actions.push({ label: t('quality.controls.details.markFailed'), status: 'FAILED', color: 'red', icon: XCircle });
        actions.push({ label: t('quality.controls.details.quarantine'), status: 'QUARANTINED', color: 'orange', icon: AlertTriangle });
        break;
      case 'FAILED':
        actions.push({ label: t('quality.controls.details.quarantine'), status: 'QUARANTINED', color: 'orange', icon: AlertTriangle });
        actions.push({ label: t('quality.controls.details.conditionalAccept'), status: 'CONDITIONAL_ACCEPT', color: 'purple', icon: CheckCircle });
        break;
      case 'QUARANTINED':
        actions.push({ label: t('quality.controls.details.reInspect'), status: 'IN_PROGRESS', color: 'blue', icon: AlertCircle });
        break;
    }

    return actions;
  };

  if (!isOpen || !qualityControl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('quality.controls.details.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {qualityControl.controlNumber || qualityControl.inspectionNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('quality.controls.form.status')}</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusBadge(qualityControl.status)}`}>
                    {getStatusLabel(qualityControl.status)}
                  </span>
                </div>
                {qualityControl.disposition && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('quality.controls.details.disposition')}</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getDispositionBadge(qualityControl.disposition)}`}>
                      {getDispositionLabel(qualityControl.disposition)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {/* Status Update Actions */}
                {getAvailableStatusActions().map((action) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    blue: 'bg-blue-600 hover:bg-blue-700',
                    green: 'bg-green-600 hover:bg-green-700',
                    red: 'bg-red-600 hover:bg-red-700',
                    orange: 'bg-orange-600 hover:bg-orange-700',
                    purple: 'bg-purple-600 hover:bg-purple-700',
                  };

                  return (
                    <Button
                      key={action.status}
                      onClick={() => handleUpdateStatus(action.status)}
                      disabled={loading}
                      className={`${colorClasses[action.color as keyof typeof colorClasses]} text-white flex items-center gap-2`}
                    >
                      <Icon size={16} />
                      {action.label}
                    </Button>
                  );
                })}

                {/* Approval Actions */}
                {qualityControl.status === 'PASSED' && !qualityControl.approvedAt && (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                    {t('common.approve')}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={loading}
                    variant="danger"
                    className="flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    {t('common.reject')}
                  </Button>
                  </>
                )}
              </div>

              {qualityControl.approvedAt && (
                <div className="text-right">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <CheckCircle size={16} />
                    {t('quality.controls.details.approved')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('quality.controls.details.approvedByOn', { user: qualityControl.approvedBy, date: format(new Date(qualityControl.approvedAt), 'MMM dd, yyyy') })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard icon={<FileText />} label={t('quality.controls.details.info.itemId')} value={qualityControl.itemId} />
            <InfoCard icon={<Calendar />} label={t('quality.controls.form.type')} value={qualityControl.inspectionType} />
            <InfoCard icon={<User />} label={t('quality.controls.details.info.inspectorId')} value={qualityControl.inspectorId} />
            {qualityControl.lotId && <InfoCard icon={<FileText />} label={t('quality.controls.form.lot')} value={qualityControl.lotId} />}
            {qualityControl.serialNumber && <InfoCard icon={<FileText />} label={t('quality.controls.form.serial')} value={qualityControl.serialNumber} />}
            {qualityControl.inspectionLocationId && (
              <InfoCard icon={<MapPin />} label={t('quality.controls.details.info.location')} value={qualityControl.inspectionLocationId} />
            )}
          </div>

          {/* Quantities */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quality.controls.details.quantities.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuantityCard label={t('quality.controls.details.quantities.inspected')} value={qualityControl.quantityInspected} />
              {qualityControl.passedQuantity !== undefined && (
                <QuantityCard label={t('quality.controls.details.quantities.passed')} value={qualityControl.passedQuantity} color="green" />
              )}
              {qualityControl.failedQuantity !== undefined && (
                <QuantityCard label={t('quality.controls.details.quantities.failed')} value={qualityControl.failedQuantity} color="red" />
              )}
              {qualityControl.defectCount !== undefined && (
                <QuantityCard label={t('quality.controls.details.quantities.defects')} value={qualityControl.defectCount} color="orange" />
              )}
            </div>
            {qualityControl.defectRate !== undefined && (
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('quality.controls.details.quantities.defectRate')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(qualityControl.defectRate * 100).toFixed(2)}%</p>
              </div>
            )}
          </div>

          {/* Inventory Adjustment Impact */}
          {(qualityControl.status === 'PASSED' || qualityControl.status === 'FAILED' || qualityControl.status === 'QUARANTINED') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={20} />
                {t('quality.controls.details.impact.title')}
              </h3>
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('quality.controls.form.status')}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(qualityControl.status)}`}>
                      {getStatusLabel(qualityControl.status)}
                    </span>
                  </div>
                </div>

                {qualityControl.status === 'PASSED' && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {t('quality.controls.details.impact.passedTitle')}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          {t('quality.controls.details.impact.passedDesc', { qty: qualityControl.quantityInspected })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {qualityControl.status === 'FAILED' && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <XCircle className="text-red-600 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          {t('quality.controls.details.impact.failedTitle')}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {t('quality.controls.details.impact.failedDesc', { qty: qualityControl.failedQuantity || qualityControl.quantityInspected })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {qualityControl.status === 'QUARANTINED' && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="text-orange-600 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {t('quality.controls.details.impact.quarTitle')}
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          {t('quality.controls.details.impact.quarDesc', { qty: qualityControl.quantityInspected })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{t('quality.controls.details.impact.autoAdjustment')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Inspection Results */}
          {qualityControl.inspectionResults && qualityControl.inspectionResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quality.controls.form.results')}</h3>
              <div className="space-y-3">
                {qualityControl.inspectionResults.map((result, index) => (
                  <div key={result.id || index} className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{result.testParameter}</h4>
                        {result.defectType && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{t('quality.controls.details.info.defectType')}: {result.defectType}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.defectSeverity && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            result.defectSeverity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            result.defectSeverity === 'MAJOR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {getSeverityLabel(result.defectSeverity)}
                          </span>
                        )}
                        {result.isPassed ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <XCircle className="text-red-600" size={20} />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {result.expectedValue && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('quality.controls.form.expectedValue')}:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.expectedValue}</span>
                        </div>
                      )}
                      {result.actualValue && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('quality.controls.form.actualValue')}:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.actualValue}</span>
                        </div>
                      )}
                      {result.minValue !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('quality.controls.form.minValue')}:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.minValue}</span>
                        </div>
                      )}
                      {result.maxValue !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('quality.controls.form.maxValue')}:</span>
                          <span className="ml-1 text-gray-900 dark:text-white">{result.maxValue}</span>
                        </div>
                      )}
                    </div>
                    {result.remarks && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">{result.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(qualityControl.inspectorNotes || qualityControl.correctiveAction) && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quality.controls.details.notesActions')}</h3>
              <div className="space-y-4">
                {qualityControl.inspectorNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('quality.controls.details.inspectorNotes')}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {qualityControl.inspectorNotes}
                    </p>
                  </div>
                )}
                {qualityControl.correctiveAction && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('quality.controls.details.correctiveActions')}
                    </label>
                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {qualityControl.correctiveAction}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quality.controls.details.attachments')} ({attachments.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="text-gray-400 flex-shrink-0" size={20} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(attachment.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
                      title={t('common.download')}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quality.controls.details.timeline.title')}</h3>
            <div className="space-y-2 text-sm">
              {qualityControl.scheduledDate && (
                <TimelineItem label={t('quality.controls.details.timeline.scheduled')} value={format(new Date(qualityControl.scheduledDate), 'MMM dd, yyyy HH:mm')} />
              )}
              {qualityControl.startTime && (
                <TimelineItem label={t('quality.controls.details.timeline.started')} value={format(new Date(qualityControl.startTime), 'MMM dd, yyyy HH:mm')} />
              )}
              {qualityControl.endTime && (
                <TimelineItem label={t('quality.controls.details.timeline.completed')} value={format(new Date(qualityControl.endTime), 'MMM dd, yyyy HH:mm')} />
              )}
              <TimelineItem label={t('quality.controls.details.timeline.created')} value={format(new Date(qualityControl.createdAt), 'MMM dd, yyyy HH:mm')} />
              {qualityControl.updatedAt && qualityControl.updatedAt !== qualityControl.createdAt && (
                <TimelineItem label={t('quality.controls.details.timeline.lastUpdated')} value={format(new Date(qualityControl.updatedAt), 'MMM dd, yyyy HH:mm')} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <Button onClick={onClose}>{t('common.close')}</Button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const QuantityCard: React.FC<{ label: string; value: number; color?: 'green' | 'red' | 'orange' }> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
};

const TimelineItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
  </div>
);