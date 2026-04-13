import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

interface UseFileDownloadReturn extends DownloadState {
  downloadCsv: (url: string, filename: string, params?: Record<string, unknown>) => Promise<void>;
}

export function useFileDownload(): UseFileDownloadReturn {
  const [state, setState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
  });

  const downloadCsv = useCallback(async (
    url: string,
    filename: string,
    params?: Record<string, unknown>
  ) => {
    setState({ isDownloading: true, progress: 0, error: null });

    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
        params,
        onDownloadProgress: (event) => {
          if (event.total && event.total > 0) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setState(prev => ({ ...prev, progress: pct }));
          } else {
            setState(prev => ({ ...prev, progress: 50 }));
          }
        },
      });

      const contentDisposition = response.headers['content-disposition'] || '';
      const serverFilename = contentDisposition.match(/filename="?([^";\n]+)"?/)?.[1];

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] ?? 'text/csv;charset=utf-8',
      });

      saveAs(blob, serverFilename || filename);
      setState({ isDownloading: false, progress: 100, error: null });
      toast.success(`${filename} exported successfully`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setState({ isDownloading: false, progress: 0, error: message });
      toast.error(`Export failed: ${message}`);
    }
  }, []);

  return { ...state, downloadCsv };
}
