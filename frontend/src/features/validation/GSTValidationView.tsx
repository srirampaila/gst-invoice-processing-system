import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Scale,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PipelineExecutionResult } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface GSTValidationViewProps {
  activeResult: PipelineExecutionResult | null;
}

export const GSTValidationView: React.FC<GSTValidationViewProps> = ({ activeResult }) => {
  const navigate = useNavigate();

  if (!activeResult) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-[#E2E0D8] p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E6F0E9] text-[#246B50] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#20251F]">
          No Active Invoice Loaded in Validation Engine
        </h2>
        <p className="text-xs text-[#60695C] max-w-md mx-auto">
          Execute an invoice scan in the Studio to run independent Python Decimal mathematical reconciliation,
          GSTIN Luhn Mod-36 checksum checks, and tax exclusivity validation.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/studio')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Go to Invoice Studio
        </Button>
      </div>
    );
  }

  const { validation: val, canonical_invoice: inv, invoice_id } = activeResult;
  const cVals = val.calculated_values;
  const isPass = val.status === 'PASS';
  const isWarning = val.status === 'WARNING';
  const isFail = val.status === 'FAIL';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Deterministic Verification
            </span>
            <Badge
              variant={isPass ? 'emerald' : isWarning ? 'amber' : 'crimson'}
              size="sm"
              dot
            >
              STATUS: {val.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            GST &amp; Financial Validation Engine
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Strict regulatory arithmetic reconciliation via Python{' '}
            <code className="bg-[#EFEFEA] px-1 py-0.5 rounded text-xs font-mono">decimal.Decimal</code>.
            Detects arithmetic discrepancies, corrupt GSTINs, and illegal POS tax claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/review')}
            rightIcon={<Scale className="w-3.5 h-3.5" />}
          >
            Review &amp; Sign-Off
          </Button>
        </div>
      </div>

      {/* Main Status Banner */}
      <div
        className={`rounded-xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-fine ${
          isPass
            ? 'bg-[#E6F0E9] border-[#C3DCC9] text-[#1B523D]'
            : isWarning
            ? 'bg-[#FDF4E7] border-[#F4D4A4] text-[#8E5B1A]'
            : 'bg-[#FCECEB] border-[#F3BDB9] text-[#8F342D]'
        }`}
      >
        <div className="flex items-center gap-4">
          {isPass ? (
            <div className="w-10 h-10 rounded-full bg-[#246B50] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          ) : isWarning ? (
            <div className="w-10 h-10 rounded-full bg-[#B87928] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#B94B43] text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
          )}

          <div>
            <h3 className="font-serif font-bold text-base">
              {isPass
                ? 'VALIDATION STATUS: PASS — Zero Statutory Violations'
                : isWarning
                ? 'VALIDATION STATUS: WARNING — Non-Critical Variances Detected'
                : 'VALIDATION STATUS: FAIL — Critical Financial / Statutory Mismatch'}
            </h3>
            <p className="text-xs mt-0.5 opacity-90">
              {isPass
                ? 'All deterministic mathematical totals, place of supply tax exclusivity, and Luhn Mod-36 checksums verified cleanly.'
                : `${val.error_count} fatal error(s) and ${val.warning_count} warning(s) detected. GSTR-1 admission is gated.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-current/20 text-xs font-mono font-bold">
            {val.error_count} Errors / {val.warning_count} Warnings
          </div>
        </div>
      </div>

      {/* TOTAL-001 Discrepancy Callout if present */}
      {cVals?.grand_total_discrepancy && cVals.grand_total_discrepancy > 0 ? (
        <div className="bg-[#FCECEB] border-l-4 border-l-[#B94B43] border border-[#F3BDB9] rounded-r-lg p-5">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-[#B94B43] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#8F342D]">
                CRITICAL ARITHMETIC DISCREPANCY DETECTED (TOTAL-001)
              </h4>
              <p className="text-xs text-[#8F342D] leading-relaxed">
                Extracted invoice grand total (<span className="font-mono font-bold">{formatCurrency(inv.grand_total)}</span>)
                does not match the independently recomputed statutory total (
                <span className="font-mono font-bold">{formatCurrency(cVals.calculated_grand_total)}</span>).
                Variance of <span className="font-mono font-bold">{formatCurrency(cVals.grand_total_discrepancy)}</span> exceeds
                statutory tolerance limit of ₹1.00.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Financial Reconciliation Cards (Extracted vs Recomputed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Values */}
        <Card
          variant="white"
          header={
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#60695C]" />
              <span className="font-serif font-bold text-sm text-[#20251F]">
                1. Extracted Raw Financial Values
              </span>
            </div>
          }
        >
          <div className="space-y-3 text-xs py-1">
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Declared Taxable Value</span>
              <span className="font-mono font-bold text-[#20251F]">
                {formatCurrency(inv.tax_summary.taxable_value)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Declared Central Tax (CGST)</span>
              <span className="font-mono text-[#20251F]">{formatCurrency(inv.tax_summary.cgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Declared State Tax (SGST)</span>
              <span className="font-mono text-[#20251F]">{formatCurrency(inv.tax_summary.sgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Declared Integrated Tax (IGST)</span>
              <span className="font-mono text-[#20251F]">{formatCurrency(inv.tax_summary.igst)}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-[#FAFAF8] px-3 rounded font-semibold text-sm">
              <span className="text-[#20251F]">Declared Grand Total</span>
              <span className="font-mono font-bold text-[#20251F] tabular-nums">
                {formatCurrency(inv.grand_total)}
              </span>
            </div>
          </div>
        </Card>

        {/* Validated Recomputed Values */}
        <Card
          variant="white"
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#246B50]" />
                <span className="font-serif font-bold text-sm text-[#20251F]">
                  2. Independently Recomputed Decimal Values
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                Python Decimal
              </Badge>
            </div>
          }
        >
          <div className="space-y-3 text-xs py-1">
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Itemized Taxable Sum</span>
              <span className="font-mono font-bold text-[#20251F]">
                {formatCurrency(cVals?.calculated_item_taxable_sum)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Recomputed CGST</span>
              <span className="font-mono text-[#20251F]">{formatCurrency(cVals?.calculated_cgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Recomputed SGST</span>
              <span className="font-mono text-[#20251F]">{formatCurrency(cVals?.calculated_sgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
              <span className="text-[#60695C]">Recomputed IGST</span>
              <span className="font-mono text-[#20251F]">{formatCurrency(cVals?.calculated_igst)}</span>
            </div>
            <div
              className={`flex justify-between py-2.5 px-3 rounded font-semibold text-sm ${
                cVals?.grand_total_discrepancy && cVals.grand_total_discrepancy > 0
                  ? 'bg-[#FCECEB] text-[#8F342D]'
                  : 'bg-[#E6F0E9] text-[#1B523D]'
              }`}
            >
              <span>Calculated Statutory Total</span>
              <span className="font-mono font-bold tabular-nums">
                {formatCurrency(cVals?.calculated_grand_total)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Rule Issues Catalog */}
      <Card
        variant="white"
        header={
          <div className="flex items-center justify-between w-full">
            <span className="font-serif font-bold text-sm text-[#20251F]">
              3. Triggered Rule Issues ({val.issues?.length || 0})
            </span>
          </div>
        }
      >
        {val.issues && val.issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                  <th className="py-2.5 px-3 font-semibold">Rule ID</th>
                  <th className="py-2.5 px-3 font-semibold">Severity</th>
                  <th className="py-2.5 px-3 font-semibold">Field</th>
                  <th className="py-2.5 px-3 font-semibold">Explanation Message</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Expected</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {val.issues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#20251F]">
                      {issue.rule_id}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          issue.severity === 'ERROR'
                            ? 'crimson'
                            : issue.severity === 'WARNING'
                            ? 'amber'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {issue.severity}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#60695C]">{issue.field_name || '—'}</td>
                    <td className="py-2.5 px-3 text-[#20251F] font-medium">{issue.message}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-[#1B523D]">
                      {issue.expected_value !== null ? String(issue.expected_value) : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-[#8F342D] font-bold">
                      {issue.actual_value !== null ? String(issue.actual_value) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-[#246B50] flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8" />
            <p className="text-xs font-semibold">
              Zero validation violations or mathematical discrepancies detected.
            </p>
          </div>
        )}
      </Card>

      {/* Complete Statutory Checklist */}
      <Card
        variant="white"
        header={
          <div className="flex items-center justify-between w-full">
            <span className="font-serif font-bold text-sm text-[#20251F]">
              4. Complete Statutory Verification Checklist ({val.checks?.length || 0} Checks)
            </span>
          </div>
        }
      >
        {val.checks && val.checks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {val.checks.map((chk, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-[#FAFAF8] border border-[#E2E0D8] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#246B50] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#B94B43] shrink-0" />
                  )}
                  <span className="font-medium text-[#20251F]">{chk.check_name}</span>
                </div>
                <span className="text-[11px] text-[#60695C] text-right">{chk.message}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
};
