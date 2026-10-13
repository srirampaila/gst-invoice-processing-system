import {
  SystemHealth,
  ProvidersResponse,
  SampleInvoice,
  PipelineExecutionResult,
  ReviewRecord,
  GSTR1Draft,
} from '../types';

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, ''); // Configurable backend URL or relative proxy

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // System Health & Providers
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/api/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getProviders(): Promise<ProvidersResponse> {
    const res = await fetch(`${API_BASE}/api/providers`);
    return handleResponse<ProvidersResponse>(res);
  },

  async getArchitectureSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/architecture/summary`);
    return handleResponse<any>(res);
  },

  // Invoices & Pipeline
  async getSamples(): Promise<SampleInvoice[]> {
    const res = await fetch(`${API_BASE}/api/invoices/samples`);
    return handleResponse<SampleInvoice[]>(res);
  },

  async uploadInvoice(file: File): Promise<{ file_name: string; invoice_id: string; file_size_kb: number; image_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/invoices/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async processInvoice(params: {
    fileName: string;
    provider?: string;
    amountTolerance?: number;
    highThreshold?: number;
    mediumThreshold?: number;
  }): Promise<PipelineExecutionResult> {
    const res = await fetch(`${API_BASE}/api/invoices/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: params.fileName,
        provider: params.provider || 'mock',
        amount_tolerance: params.amountTolerance ?? 1.0,
        high_threshold: params.highThreshold ?? 85.0,
        medium_threshold: params.mediumThreshold ?? 60.0,
      }),
    });
    return handleResponse<PipelineExecutionResult>(res);
  },

  // Reviews
  async getReviewRecord(invoiceId: string): Promise<ReviewRecord> {
    const res = await fetch(`${API_BASE}/api/reviews/${invoiceId}`);
    return handleResponse<ReviewRecord>(res);
  },

  async applyReviewAction(invoiceId: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_REPROCESSING', notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/reviews/${invoiceId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        notes: notes || '',
      }),
    });
    return handleResponse<any>(res);
  },

  // GSTR-1 Draft & Exports
  async getGSTR1Draft(): Promise<GSTR1Draft> {
    const res = await fetch(`${API_BASE}/api/gstr1/draft`);
    return handleResponse<GSTR1Draft>(res);
  },

  async runGSTR1Batch(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/gstr1/batch/run`, {
      method: 'POST',
    });
    return handleResponse<any>(res);
  },

  getExportDownloadUrl(exportType: 'combined_csv' | 'b2b_csv' | 'b2c_csv' | 'exclusions_csv' | 'excel'): string {
    return `${API_BASE}/api/gstr1/exports/${exportType}`;
  },

  // Evaluation & Performance
  async getEvaluationMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/evaluation/metrics`);
    return handleResponse<any>(res);
  },

  async getPerformanceMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/evaluation/performance`);
    return handleResponse<any>(res);
  },
};
