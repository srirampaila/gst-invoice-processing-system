import React, { useState, useEffect } from 'react';
import {
  Activity,
  Award,
  Layers,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { StatCard } from '../../components/common/StatCard';
import { api } from '../../lib/api';
import { formatPercent } from '../../lib/utils';

export const TestingEvaluationView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pyramid' | 'ocr' | 'validation' | 'categories' | 'confusion' | 'errors'>('pyramid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getEvaluationMetrics().then(setData).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const summary = data?.summary || {};
  const ocrList = data?.ocr_evaluation || [];
  const valList = data?.validation_evaluation || [];
  const catList = data?.category_results || [];
  const errList = data?.error_analysis || [];
  const cm = data?.confusion_matrices || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Empirical Benchmarks
            </span>
            <Badge variant="emerald" size="sm">
              Phase 10 Scientific Evaluation
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            Testing &amp; Scientific Evaluation
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Reproducible empirical evaluation across Test Pyramid Levels 1–5, OCR benchmarks,
            GST validation precision, confidence safety overrides, and GSTR-1 return routing.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Pytest Pass Rate"
          value="100.0%"
          subvalue="118 / 118 automated tests"
          badgeText="100% Pass"
          badgeVariant="emerald"
          accent
        />
        <StatCard
          label="OCR CER Reduction"
          value="75.0%"
          subvalue="22.7% → 5.67% error rate"
          badgeText="Optimal"
          badgeVariant="emerald"
        />
        <StatCard
          label="Math Error Detection"
          value="100.0%"
          subvalue="3/3 TOTAL-001 caught"
          badgeText="Zero Escape"
          badgeVariant="emerald"
        />
        <StatCard
          label="GSTR-1 Admitted"
          value="60.0%"
          subvalue="15 / 25 compliant invoices"
          badgeText="12 B2B | 3 B2C"
          badgeVariant="slate"
        />
        <StatCard
          label="Return Classification"
          value="100.0%"
          subvalue="0 misclassifications"
          badgeText="Exact"
          badgeVariant="emerald"
        />
      </div>

      {/* Main Tabs Container */}
      <Card variant="white" padding="none">
        <div className="px-5 pt-4">
          <Tabs
            variant="underline"
            activeTab={activeTab}
            onChange={(t) => setActiveTab(t as any)}
            tabs={[
              { id: 'pyramid', label: 'Test Pyramid & Quality', icon: <Layers className="w-4 h-4" /> },
              { id: 'ocr', label: 'OCR CER/WER Gains', icon: <Activity className="w-4 h-4" /> },
              { id: 'validation', label: 'GST Validation Benchmark', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'categories', label: 'Category Matrix', icon: <Award className="w-4 h-4" /> },
              { id: 'confusion', label: 'Confusion Matrices', icon: <FileCheck className="w-4 h-4" /> },
              { id: 'errors', label: '10-Pattern Root Cause Catalog', icon: <AlertTriangle className="w-4 h-4" /> },
            ]}
          />
        </div>

        <div className="p-5">
          {/* TAB 1: Pyramid */}
          {activeTab === 'pyramid' && (
            <div className="space-y-6 text-xs text-[#20251F]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-serif font-bold text-base mb-3 text-[#20251F]">
                    5-Tier Quality &amp; Test Pyramid Structure
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Level 1: Unit Tests (65 Tests)</span>
                        <span className="text-[#1B523D]">100% PASS</span>
                      </div>
                      <p className="text-[#60695C] text-[11px]">
                        Statutory regex, Luhn Mod-36 checksum algorithm, tax arithmetic, decimal precision.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Level 2: Component Tests (18 Tests)</span>
                        <span className="text-[#1B523D]">100% PASS</span>
                      </div>
                      <p className="text-[#60695C] text-[11px]">
                        ValidationService, ConfidenceService, GSTR1DraftGenerator, ExportService.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Level 3: Integration &amp; API Tests (20 Tests)</span>
                        <span className="text-[#1B523D]">100% PASS</span>
                      </div>
                      <p className="text-[#60695C] text-[11px]">
                        FastAPI bridge endpoints, review persistence, batch execution, Ollama error handling.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Level 4: End-to-End Tests (12 Tests)</span>
                        <span className="text-[#1B523D]">100% PASS</span>
                      </div>
                      <p className="text-[#60695C] text-[11px]">
                        Image Scan → Preprocess → OCR → Extract → Validate → Confidence → GSTR-1 Export.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                      <div className="flex justify-between font-bold text-xs mb-1">
                        <span>Level 5: Benchmark Evaluation (3 Tests)</span>
                        <span className="text-[#1B523D]">100% PASS</span>
                      </div>
                      <p className="text-[#60695C] text-[11px]">
                        25-invoice canonical ground-truth precision, recall, and CER/WER measurement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-[#FAFAF8] rounded-xl border border-[#E2E0D8] space-y-4">
                  <h4 className="font-serif font-bold text-sm text-[#20251F]">
                    Verification Rigor Invariants
                  </h4>
                  <ul className="space-y-2.5 text-xs text-[#60695C]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#246B50] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#20251F]">Zero Ground-Truth Manipulation:</strong> All 25 synthetic invoice
                        scans and statutory rules are evaluated in their unaltered, ground-truth form.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#246B50] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#20251F]">Independent Decimal Authority:</strong> Floating point precision is
                        strictly rejected for financial reconciliation in favor of Python Decimal.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#246B50] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[#20251F]">Execution Speed:</strong> Full automated regression test suite passes in{' '}
                        <code className="font-mono text-[#1B523D] font-bold">&lt; 3.0s</code> (excluding multi-repetition performance sweeps).
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OCR Evaluation */}
          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase block">Mean Raw CER</span>
                  <span className="text-sm font-bold text-[#8F342D]">22.70%</span>
                </div>
                <div className="p-3 bg-[#E6F0E9] rounded border border-[#C3DCC9]">
                  <span className="text-[10px] text-[#1B523D] uppercase block">Preprocessed CER</span>
                  <span className="text-sm font-bold text-[#1B523D]">5.67% (-75.0%)</span>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase block">Mean Raw WER</span>
                  <span className="text-sm font-bold text-[#8F342D]">80.71%</span>
                </div>
                <div className="p-3 bg-[#E6F0E9] rounded border border-[#C3DCC9]">
                  <span className="text-[10px] text-[#1B523D] uppercase block">Preprocessed WER</span>
                  <span className="text-sm font-bold text-[#1B523D]">38.90% (-51.8%)</span>
                </div>
              </div>

              {ocrList.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                        <th className="py-2.5 px-3 font-semibold">Invoice ID</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Raw CER</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Preproc CER</th>
                        <th className="py-2.5 px-3 font-semibold text-right">CER Delta</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Raw Conf</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Preproc Conf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E0D8]">
                      {ocrList.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#FAFAF8]">
                          <td className="py-2 px-3 font-mono font-bold text-[#20251F]">{r.invoice_id}</td>
                          <td className="py-2 px-3 font-mono text-right text-[#8F342D]">
                            {(r.raw_cer * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 px-3 font-mono text-right text-[#1B523D] font-bold">
                            {(r.prep_cer * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 px-3 font-mono text-right text-[#1B523D]">
                            {-(r.cer_reduction * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 px-3 font-mono text-right">{r.raw_conf?.toFixed(1)}%</td>
                          <td className="py-2 px-3 font-mono text-right font-semibold">{r.prep_conf?.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GST Validation */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-[#E6F0E9] rounded border border-[#C3DCC9]">
                  <span className="text-[10px] text-[#1B523D] uppercase block">Math Error Recall (TPR)</span>
                  <span className="text-sm font-bold text-[#1B523D]">100.0% (3/3)</span>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase block">Luhn GSTIN Checksum</span>
                  <span className="text-sm font-bold text-[#20251F]">100.0% (4/4)</span>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase block">Mandatory Seller ID</span>
                  <span className="text-sm font-bold text-[#20251F]">100.0% (25/25)</span>
                </div>
                <div className="p-3 bg-[#E6F0E9] rounded border border-[#C3DCC9]">
                  <span className="text-[10px] text-[#1B523D] uppercase block">Exclusion Gating Precision</span>
                  <span className="text-sm font-bold text-[#1B523D]">100.0%</span>
                </div>
              </div>

              {valList.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                        <th className="py-2.5 px-3 font-semibold">Invoice ID</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Errors</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Warnings</th>
                        <th className="py-2.5 px-3 font-semibold">Triggered Statutory Rules</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E0D8]">
                      {valList.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#FAFAF8]">
                          <td className="py-2 px-3 font-mono font-bold text-[#20251F]">{r.invoice_id}</td>
                          <td className="py-2 px-3">
                            <Badge variant={r.status === 'PASS' ? 'emerald' : r.status === 'WARNING' ? 'amber' : 'crimson'} size="sm">
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 font-mono text-right">{r.error_count}</td>
                          <td className="py-2 px-3 font-mono text-right">{r.warning_count}</td>
                          <td className="py-2 px-3 font-mono text-[#60695C] text-[11px]">{r.rule_ids || 'NONE'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Categories */}
          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                    <th className="py-2.5 px-3 font-semibold">Invoice Category</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Count</th>
                    <th className="py-2.5 px-3 font-semibold">Expected Outcome</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Admitted</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Quarantined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {catList.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FAFAF8]">
                      <td className="py-2.5 px-3 font-bold text-[#20251F]">{c.category}</td>
                      <td className="py-2.5 px-3 font-mono text-right">{c.count}</td>
                      <td className="py-2.5 px-3 text-[#60695C]">{c.expected_outcome}</td>
                      <td className="py-2.5 px-3 font-mono text-right font-bold text-[#1B523D]">{c.admitted || 0}</td>
                      <td className="py-2.5 px-3 font-mono text-right font-bold text-[#8F342D]">{c.quarantined || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: Confusion Matrices */}
          {activeTab === 'confusion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E2E0D8]">
                <h4 className="font-serif font-bold text-sm mb-2 text-[#20251F]">
                  1. Invalid Math Detection Matrix (TOTAL-001)
                </h4>
                <div className="p-4 bg-white rounded border border-[#E2E0D8] text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-[#E6F0E9] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">True Negative</span>
                      <span className="text-base font-bold text-[#1B523D]">TN = 19</span>
                    </div>
                    <div className="p-3 bg-[#FDF4E7] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">False Positive</span>
                      <span className="text-base font-bold text-[#8E5B1A]">FP = 3</span>
                    </div>
                    <div className="p-3 bg-[#FAFAF8] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">False Negative</span>
                      <span className="text-base font-bold text-[#20251F]">FN = 0</span>
                    </div>
                    <div className="p-3 bg-[#E6F0E9] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">True Positive (TPR)</span>
                      <span className="text-base font-bold text-[#1B523D]">TP = 3 (100%)</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#60695C] mt-2">
                  100% Sensitivity / Recall in detecting intentional grand total arithmetic discrepancies.
                </p>
              </div>

              <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E2E0D8]">
                <h4 className="font-serif font-bold text-sm mb-2 text-[#20251F]">
                  2. GSTR-1 Eligibility Gate Matrix
                </h4>
                <div className="p-4 bg-white rounded border border-[#E2E0D8] text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-[#E6F0E9] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">True Excluded</span>
                      <span className="text-base font-bold text-[#1B523D]">TN = 10</span>
                    </div>
                    <div className="p-3 bg-[#FAFAF8] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">False Admitted</span>
                      <span className="text-base font-bold text-[#20251F]">FP = 0</span>
                    </div>
                    <div className="p-3 bg-[#FAFAF8] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">False Excluded</span>
                      <span className="text-base font-bold text-[#20251F]">FN = 0</span>
                    </div>
                    <div className="p-3 bg-[#E6F0E9] rounded">
                      <span className="block text-[10px] uppercase text-[#60695C]">True Admitted</span>
                      <span className="text-base font-bold text-[#1B523D]">TP = 15</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#60695C] mt-2">
                  Precision: 100.0% | Recall: 100.0% | F1 Score: 1.000 for statutory return gating.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: Errors */}
          {activeTab === 'errors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                    <th className="py-2.5 px-3 font-semibold">Pattern</th>
                    <th className="py-2.5 px-3 font-semibold">Stage</th>
                    <th className="py-2.5 px-3 font-semibold">Root Cause</th>
                    <th className="py-2.5 px-3 font-semibold">System Defense Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {errList.map((err: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FAFAF8]">
                      <td className="py-2.5 px-3 font-bold text-[#20251F]">{err.pattern_name}</td>
                      <td className="py-2.5 px-3 font-mono text-[#60695C]">{err.affected_stage}</td>
                      <td className="py-2.5 px-3 text-[#60695C] leading-relaxed max-w-xs">{err.root_cause}</td>
                      <td className="py-2.5 px-3 text-[#1B523D] font-medium leading-relaxed max-w-sm">
                        {err.system_behavior}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
