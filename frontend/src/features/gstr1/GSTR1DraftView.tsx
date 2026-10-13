import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  RefreshCw,
  Building,
  ShoppingCart,
  ShieldAlert,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { StatCard } from '../../components/common/StatCard';
import { api } from '../../lib/api';
import { GSTR1Draft } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';

export const GSTR1DraftView: React.FC = () => {
  const [draft, setDraft] = useState<GSTR1Draft | null>(null);
  const [activeTab, setActiveTab] = useState<'b2b' | 'b2c' | 'exclusions' | 'lineage'>('b2b');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lineageSearch, setLineageSearch] = useState('');
  const [selectedLineageId, setSelectedLineageId] = useState<string>('INV_CLEAN_001');

  const loadDraft = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGSTR1Draft();
      setDraft(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDraft();
  }, []);

  const handleRegenerateBatch = async () => {
    setIsRegenerating(true);
    try {
      await api.runGSTR1Batch();
      await loadDraft();
    } catch (e: any) {
      alert(e.message || 'Batch generation failed.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const b2bList = draft?.b2b_records || [];
  const b2cList = draft?.b2c_records || [];
  const exclusionsList = draft?.exclusions || [];

  const allLineageIds = Array.from(
    new Set([
      ...b2bList.map((r) => r.source_invoice_id),
      ...b2cList.map((r) => r.source_invoice_id),
      ...exclusionsList.map((e) => e.invoice_id),
    ])
  ).sort();

  const selectedB2B = b2bList.find((r) => r.source_invoice_id === selectedLineageId);
  const selectedB2C = b2cList.find((r) => r.source_invoice_id === selectedLineageId);
  const selectedExclusion = exclusionsList.find((e) => e.invoice_id === selectedLineageId);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Statutory Return Preparation
            </span>
            <Badge variant="amber" size="sm">
              DRAFT STATUS — NOT FILED
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            GSTR-1 Draft Studio &amp; Exports
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Statutory classification into Table 4A (B2B Taxable Invoices) and Table 7 (B2C Small Retail Invoices).
            Quarantines non-compliant records with complete source lineage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDraft}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRegenerateBatch}
            isLoading={isRegenerating}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Re-run 25-Invoice Batch
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Evaluated Invoices"
          value={draft?.source_invoice_count ?? 25}
          subvalue="Benchmark batch dataset"
        />
        <StatCard
          label="GSTR-1 Admitted"
          value={`${draft?.included_invoice_count ?? 15} (${formatPercent(
            ((draft?.included_invoice_count ?? 15) / (draft?.source_invoice_count ?? 25)) * 100
          )})`}
          subvalue={`${draft?.b2b_count ?? 12} B2B | ${draft?.b2c_count ?? 3} B2CS`}
          badgeText="Admitted"
          badgeVariant="emerald"
        />
        <StatCard
          label="Quarantined / Excluded"
          value={draft?.excluded_invoice_count ?? 10}
          subvalue="Math / Noise / Incomplete"
          badgeText="Excluded"
          badgeVariant="crimson"
        />
        <StatCard
          label="Total Taxable Value"
          value={formatCurrency(draft?.total_taxable_value ?? 127999)}
          subvalue="Net statutory base"
        />
        <StatCard
          label="Gross Invoice Value"
          value={formatCurrency(draft?.total_invoice_value ?? 151038.82)}
          subvalue="Including all taxes"
          accent
        />
      </div>

      {/* Download Action Strip */}
      <Card
        variant="subtle"
        header={
          <div className="flex items-center justify-between w-full">
            <span className="font-serif font-bold text-sm text-[#20251F]">
              Download Generated Statutory Export Files
            </span>
            <Badge variant="emerald">Portal-Compliant Format</Badge>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-1">
          <a
            href={api.getExportDownloadUrl('excel')}
            download="gstr1_draft.xlsx"
            className="p-3.5 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group shadow-fine"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-[#246B50]" />
              <div>
                <span className="font-bold text-xs text-[#20251F] block">Multi-Sheet Excel</span>
                <span className="text-[10px] text-[#60695C]">gstr1_draft.xlsx (5 Sheets)</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50]" />
          </a>

          <a
            href={api.getExportDownloadUrl('combined_csv')}
            download="gstr1_draft.csv"
            className="p-3.5 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group shadow-fine"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#246B50]" />
              <div>
                <span className="font-bold text-xs text-[#20251F] block">Combined Draft CSV</span>
                <span className="text-[10px] text-[#60695C]">gstr1_draft.csv (Flat File)</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50]" />
          </a>

          <a
            href={api.getExportDownloadUrl('b2b_csv')}
            download="b2b_table_4a.csv"
            className="p-3.5 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group shadow-fine"
          >
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-[#246B50]" />
              <div>
                <span className="font-bold text-xs text-[#20251F] block">Table 4A (B2B) CSV</span>
                <span className="text-[10px] text-[#60695C]">b2b_table_4a.csv</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50]" />
          </a>

          <a
            href={api.getExportDownloadUrl('b2c_csv')}
            download="b2c_table_7.csv"
            className="p-3.5 bg-white hover:bg-[#E6F0E9] border border-[#E2E0D8] rounded-lg transition-all flex items-center justify-between group shadow-fine"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-[#246B50]" />
              <div>
                <span className="font-bold text-xs text-[#20251F] block">Table 7 (B2CS) CSV</span>
                <span className="text-[10px] text-[#60695C]">b2c_table_7.csv</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#60695C] group-hover:text-[#246B50]" />
          </a>
        </div>
      </Card>

      {/* Main Tables & Lineage Tabs */}
      <Card variant="white" padding="none">
        <div className="px-5 pt-4">
          <Tabs
            variant="underline"
            activeTab={activeTab}
            onChange={(t) => setActiveTab(t as any)}
            tabs={[
              { id: 'b2b', label: 'B2B Table 4A Records', count: b2bList.length, icon: <Building className="w-4 h-4" /> },
              { id: 'b2c', label: 'B2CS Table 7 Records', count: b2cList.length, icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'exclusions', label: 'Exclusions Catalog', count: exclusionsList.length, icon: <ShieldAlert className="w-4 h-4" /> },
              { id: 'lineage', label: 'Source Lineage Audit', icon: <Search className="w-4 h-4" /> },
            ]}
          />
        </div>

        <div className="p-5">
          {/* TAB 1: B2B Table 4A */}
          {activeTab === 'b2b' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                    <th className="py-2.5 px-3 font-semibold">Recipient GSTIN</th>
                    <th className="py-2.5 px-3 font-semibold">Invoice No</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Invoice Val</th>
                    <th className="py-2.5 px-3 font-semibold">Place of Supply</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Rate</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Taxable Val</th>
                    <th className="py-2.5 px-3 font-semibold">Source Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {b2bList.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#20251F]">{r.gstin_of_recipient}</td>
                      <td className="py-2.5 px-3 font-mono text-[#20251F]">{r.invoice_number}</td>
                      <td className="py-2.5 px-3 font-mono text-[#60695C]">{r.invoice_date}</td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums font-semibold">
                        {formatCurrency(r.invoice_value)}
                      </td>
                      <td className="py-2.5 px-3 text-[#20251F]">{r.place_of_supply}</td>
                      <td className="py-2.5 px-3 font-mono text-right text-[#60695C]">
                        {r.applicable_pct_tax_rate}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums font-bold text-[#1B523D]">
                        {formatCurrency(r.taxable_value)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#60695C]">{r.source_invoice_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: B2CS Table 7 */}
          {activeTab === 'b2c' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Place of Supply</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Rate</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Taxable Value</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Cess</th>
                    <th className="py-2.5 px-3 font-semibold">Source Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {b2cList.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#20251F]">{r.type}</td>
                      <td className="py-2.5 px-3 text-[#20251F]">{r.place_of_supply}</td>
                      <td className="py-2.5 px-3 font-mono text-right text-[#60695C]">
                        {r.applicable_pct_tax_rate}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums font-bold text-[#1B523D]">
                        {formatCurrency(r.taxable_value)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums text-[#60695C]">
                        {formatCurrency(r.cess_amount)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#60695C]">{r.source_invoice_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Exclusions Catalog */}
          {activeTab === 'exclusions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                    <th className="py-2.5 px-3 font-semibold">Invoice ID</th>
                    <th className="py-2.5 px-3 font-semibold">GSTR-1 Exclusion Rationale</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Confidence</th>
                    <th className="py-2.5 px-3 font-semibold">Validation</th>
                    <th className="py-2.5 px-3 font-semibold">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {exclusionsList.map((e, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#8F342D]">{e.invoice_id}</td>
                      <td className="py-2.5 px-3 text-[#20251F] font-medium leading-relaxed max-w-lg">
                        {e.reason}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right font-semibold">
                        {e.confidence_score.toFixed(1)}/100
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={e.validation_status === 'FAIL' ? 'crimson' : 'amber'} size="sm">
                          {e.validation_status} ({e.error_count} err)
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="neutral" size="sm">
                          {e.review_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: Lineage Audit */}
          {activeTab === 'lineage' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 max-w-md">
                <label className="text-xs font-bold text-[#20251F] shrink-0">Select Invoice to Trace:</label>
                <select
                  value={selectedLineageId}
                  onChange={(e) => setSelectedLineageId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#E2E0D8] rounded-lg text-xs font-mono font-bold text-[#20251F]"
                >
                  {allLineageIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Governance Card */}
                <Card
                  variant="white"
                  header={
                    <span className="font-serif font-bold text-xs text-[#20251F] uppercase">
                      1. Lifecycle Governance Record
                    </span>
                  }
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#E2E0D8]">
                      <span className="text-[#60695C]">Invoice Identifier:</span>
                      <span className="font-mono font-bold text-[#20251F]">{selectedLineageId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E2E0D8]">
                      <span className="text-[#60695C]">GSTR-1 Return Status:</span>
                      {selectedExclusion ? (
                        <Badge variant="crimson" size="sm">
                          EXCLUDED / QUARANTINED
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          ADMITTED INTO RETURN
                        </Badge>
                      )}
                    </div>
                    {selectedExclusion && (
                      <div className="py-1">
                        <span className="text-[#8F342D] font-bold block mb-1">Exclusion Reason:</span>
                        <p className="text-xs text-[#60695C] bg-[#FAFAF8] p-3 rounded border border-[#E2E0D8]">
                          {selectedExclusion.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Return Mapped JSON */}
                <Card
                  variant="white"
                  header={
                    <span className="font-serif font-bold text-xs text-[#20251F] uppercase">
                      2. Mapped Statutory Schema Record
                    </span>
                  }
                >
                  <pre className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E2E0D8] text-[11px] font-mono text-[#20251F] overflow-x-auto max-h-72">
                    {JSON.stringify(selectedB2B || selectedB2C || selectedExclusion || {}, null, 2)}
                  </pre>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
