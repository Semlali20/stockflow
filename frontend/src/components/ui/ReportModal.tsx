import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FileSpreadsheet, FileText, BarChart2, Loader } from 'lucide-react';
import { generateExcelReport, generatePdfReport, ReportColumn, ReportFormat } from '@/utils/reportGenerator';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  columns: ReportColumn[];
  fetchData: () => Promise<Record<string, unknown>[]>;
  filename?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  columns,
  fetchData,
  filename,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('excel');
  const [isGenerating, setIsGenerating] = useState(false);

  const formats: { key: ReportFormat; label: string; icon: React.ReactNode; description: string; color: string }[] = [
    {
      key: 'excel',
      label: 'Excel (.xlsx)',
      icon: <FileSpreadsheet size={24} />,
      description: 'Best for data analysis and filtering',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      key: 'pdf',
      label: 'PDF Document',
      icon: <FileText size={24} />,
      description: 'Best for sharing and printing',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      key: 'csv',
      label: 'CSV File',
      icon: <BarChart2 size={24} />,
      description: 'Raw data for custom processing',
      color: 'text-blue-600 dark:text-blue-400',
    },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      toast.loading('Fetching data for report...', { id: 'report-gen' });
      const data = await fetchData();
      toast.loading('Generating report...', { id: 'report-gen' });

      const config = {
        title,
        subtitle: description,
        columns,
        data,
        filename: filename || title.toLowerCase().replace(/\s+/g, '-'),
      };

      if (selectedFormat === 'excel') {
        generateExcelReport(config);
      } else if (selectedFormat === 'pdf') {
        generatePdfReport(config);
      } else {
        const { generateCsvReport } = await import('@/utils/reportGenerator');
        generateCsvReport(config);
      }

      toast.success(`${title} report generated successfully!`, { id: 'report-gen' });
      onClose();
    } catch (err) {
      toast.error('Failed to generate report. Please try again.', { id: 'report-gen' });
      console.error('Report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Generate ${title} Report`} size="md">
      <div className="space-y-5">
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select export format:</p>
          <div className="grid grid-cols-1 gap-3">
            {formats.map(fmt => (
              <button
                key={fmt.key}
                onClick={() => setSelectedFormat(fmt.key)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200',
                  selectedFormat === fmt.key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <span className={fmt.color}>{fmt.icon}</span>
                <div>
                  <p className={cn(
                    'font-medium',
                    selectedFormat === fmt.key
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-800 dark:text-gray-200'
                  )}>{fmt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fmt.description}</p>
                </div>
                {selectedFormat === fmt.key && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={isGenerating ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
