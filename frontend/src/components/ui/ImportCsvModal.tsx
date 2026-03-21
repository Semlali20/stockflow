import React, { useCallback, useRef, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { useCsvUpload, CsvRowError } from '@/hooks/useCsvUpload';
import { cn } from '@/utils/cn';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title: string;
  importEndpoint: string;
  templateColumns: string[];
  exampleRows?: string[][];
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  importEndpoint,
  templateColumns,
  exampleRows = [],
}) => {
  const { isUploading, progress, result, error, uploadCsv, reset } = useCsvUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return;
    }
    setSelectedFile(file);
    reset();
  }, [reset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    await uploadCsv(selectedFile, importEndpoint);
    if (onSuccess) setTimeout(onSuccess, 500);
  }, [selectedFile, uploadCsv, importEndpoint, onSuccess]);

  const handleClose = useCallback(() => {
    reset();
    setSelectedFile(null);
    onClose();
  }, [reset, onClose]);

  const downloadTemplate = useCallback(() => {
    const header = templateColumns.join(',');
    const rows = exampleRows.map(row => row.join(','));
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [templateColumns, exampleRows, title]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Import ${title} from CSV`} size="lg">
      <div className="space-y-5">

        {/* Template download */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Download the CSV template with correct column headers
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={downloadTemplate}
          >
            Template
          </Button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            selectedFile && 'border-green-400 bg-green-50 dark:bg-green-900/10'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle size={24} className="text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); reset(); }}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={36} className="mx-auto text-gray-400 mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-200">Drop CSV file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">Max file size: 50MB</p>
            </>
          )}
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
              <span className="font-medium text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Import result */}
        {result && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                <p className="text-xs text-gray-500">Imported</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-600" />
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="p-4 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Errors</p>
                <div className="space-y-1.5">
                  {result.errors.map((err: CsvRowError, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono shrink-0">
                        Row {err.row}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              variant="primary"
              icon={<Upload size={16} />}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              loading={isUploading}
            >
              Import CSV
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
