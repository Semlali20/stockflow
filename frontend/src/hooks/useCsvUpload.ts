import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api';
import toast from 'react-hot-toast';

export interface CsvRowError {
  row: number;
  message: string;
}

export interface CsvImportResult {
  imported: number;
  failed: number;
  errors: CsvRowError[];
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  result: CsvImportResult | null;
  error: string | null;
}

interface UseCsvUploadReturn extends UploadState {
  uploadCsv: (file: File, endpoint: string) => Promise<void>;
  reset: () => void;
}

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.pdf'];

export function isAcceptedFileType(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ACCEPTED_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function useCsvUpload(): UseCsvUploadReturn {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    result: null,
    error: null,
  });

  const uploadCsv = useCallback(async (file: File, endpoint: string) => {
    if (!isAcceptedFileType(file.name)) {
      toast.error('Please upload a CSV, XLSX, or PDF file');
      return;
    }

    setState({ isUploading: true, progress: 0, result: null, error: null });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<CsvImportResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && event.total > 0) {
            setState(prev => ({
              ...prev,
              progress: Math.round((event.loaded / event.total!) * 100),
            }));
          }
        },
      });

      const result = response.data;
      setState({ isUploading: false, progress: 100, result, error: null });

      if (result.failed === 0) {
        toast.success(`${result.imported} records imported successfully`);
      } else if (result.imported > 0) {
        toast.success(`${result.imported} imported, ${result.failed} failed`);
      } else {
        toast.error(`Import failed: ${result.failed} errors`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setState({ isUploading: false, progress: 0, result: null, error: message });
      toast.error(`Import failed: ${message}`);
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, result: null, error: null });
  }, []);

  return { ...state, uploadCsv, reset };
}
