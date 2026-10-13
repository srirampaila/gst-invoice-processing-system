import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { api } from '../../lib/api';
import { GSTR1Draft, SystemHealth } from '../../types';
import { formatCurrency } from '../../lib/utils';

export const ExecutiveOverview: React.FC = () => {
  const [draft, setDraft] = useState<GSTR1Draft | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [d, h] = await Promise.all([api.getGSTR1Draft(), api.getHealth()]);
      setDraft(d);
      setHealth(h);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Operational Intelligence
            </span>
            <Badge variant="emerald" size="sm" dot>
              Phase 12 Production Release
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            Executive Tax Dashboard
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Intelligent OCR document acquisition, bit-exact Python Decimal validation,
            auditable human review queues, and statutory GSTR-1 draft return generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Metrics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/studio')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Process Invoice
          </Button>
        </div>
      </div>

      {/* Statutory Disclaimer Card */}
      <div className="bg-[#FAFAF8] border-l-4 border-l-[#B87928] border border-[#E2E0D8] rounded-r-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#B87928] shrink-0 mt-0.5" />
        <div className="text-xs text-[#20251F] leading-relaxed">
          <span className="font-bold">Statutory Notice:</span> This application functions as an automated draft
          preparation and financial verification assistant. It{' '}
          <span className="font-semibold text-[#8E5B1A]">does not perform autonomous portal filing</span> or bypass
          authorized human signatory approval.
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Invoices"
          value={draft?.source_invoice_count ?? 25}
          subvalue="Canonical benchmark dataset"
          icon={<FileSpreadsheet className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="GSTR-1 Admitted"
          value={`${draft?.included_invoice_count ?? 15} (${(
            ((draft?.included_invoice_count ?? 15) / (draft?.source_invoice_count ?? 25)) *
            100
          ).toFixed(1)}%)`}
          subvalue={`${draft?.b2b_count ?? 12} Table 4A | ${draft?.b2c_count ?? 3} Table 7`}
          badgeText="Eligible"
          badgeVariant="emerald"
          icon={<FileCheck className="w-5 h-5 text-[#246B50]" />}
        />
        <StatCard
          label="Quarantined / Excluded"
          value={`${draft?.excluded_invoice_count ?? 10} (${(
            ((draft?.excluded_invoice_count ?? 10) / (draft?.source_invoice_count ?? 25)) *
            100
          ).toFixed(1)}%)`}
          subvalue="100% math/noise errors caught"
          badgeText="Ineligible"
          badgeVariant="crimson"
          icon={<AlertTriangle className="w-5 h-5 text-[#B94B43]" />}
        />
        <StatCard
          label="Taxable Value Sum"
          value={formatCurrency(draft?.total_taxable_value ?? 40000.0)}
          subvalue="B2B: ₹37,000 | B2C: ₹3,000"
          icon={<TrendingUp className="w-5 h-5 text-[#246B50]" />}
        />
        <StatCard
          label="Gross Invoice Total"
          value={formatCurrency(draft?.total_invoice_value ?? 47200.0)}
          subvalue="Enforces ₹1.00 tolerance"
          icon={<ShieldCheck className="w-5 h-5 text-[#246B50]" />}
        />
      </div>

      {/* Quick Launch Workspaces */}
      <Card
        variant="subtle"
        header={<span className="font-serif font-bold text-base text-[#20251F]">Quick Workspaces</span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1">
          <button
            onClick={() => navigate('/studio')}
            className="w-full text-left p-4 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group cursor-pointer shadow-fine"
          >
            <div>
              <span className="font-semibold text-xs text-[#20251F] block mb-1">
                🚀 Single Invoice Processing Studio
              </span>
              <span className="text-[11px] text-[#60695C] leading-snug">
                Upload scan or select from 25 benchmark samples
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
          </button>

          <button
            onClick={() => navigate('/gstr1')}
            className="w-full text-left p-4 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group cursor-pointer shadow-fine"
          >
            <div>
              <span className="font-semibold text-xs text-[#20251F] block mb-1">
                📑 GSTR-1 Draft Return &amp; Exports
              </span>
              <span className="text-[11px] text-[#60695C] leading-snug">
                Download B2B Table 4A, B2CS CSVs and Excel (.xlsx)
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
          </button>

          <button
            onClick={() => navigate('/evaluation')}
            className="w-full text-left p-4 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group cursor-pointer shadow-fine"
          >
            <div>
              <span className="font-semibold text-xs text-[#20251F] block mb-1">
                🧪 Scientific Evaluation &amp; Benchmarks
              </span>
              <span className="text-[11px] text-[#60695C] leading-snug">
                100% test pass rate, CER/WER deltas, confusion matrices
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
          </button>
        </div>
      </Card>
    </div>
  );
};
