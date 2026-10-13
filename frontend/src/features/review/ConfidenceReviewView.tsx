import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Clock,
  User,
  Info,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PipelineExecutionResult } from '../../types';
import { api } from '../../lib/api';

interface ConfidenceReviewViewProps {
  activeResult: PipelineExecutionResult | null;
  onResultUpdated?: (result: PipelineExecutionResult) => void;
}

export const ConfidenceReviewView: React.FC<ConfidenceReviewViewProps> = ({
  activeResult,
  onResultUpdated,
}) => {
  const [notes, setNotes] = useState(activeResult?.review_record.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_REPROCESSING' | null>(null);

  const navigate = useNavigate();

  if (!activeResult) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-[#E2E0D8] p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E6F0E9] text-[#246B50] flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#20251F]">
          No Active Invoice Loaded for Human Review
        </h2>
        <p className="text-xs text-[#60695C] max-w-md mx-auto">
          Select or process an invoice in the Studio to inspect multi-factor confidence scores,
          triggered regulatory safety overrides, and submit binding audit sign-offs.
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

  const { confidence: conf, review_record: rev, invoice_id, validation: val, gstr1 } = activeResult;

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setIsSubmitting(true);
    setActionSuccess(null);
    try {
      const res = await api.applyReviewAction(invoice_id, pendingAction, notes);
      
      // Update local state copy
      const updatedResult: PipelineExecutionResult = {
        ...activeResult,
        review_record: res.record,
        gstr1: {
          ...activeResult.gstr1,
          is_admitted: res.gstr1_is_admitted,
          exclusion: res.gstr1_is_admitted
            ? null
            : activeResult.gstr1.exclusion
            ? { ...activeResult.gstr1.exclusion, reason: res.gstr1_exclusion_reason || activeResult.gstr1.exclusion.reason }
            : null,
        },
      };

      if (onResultUpdated) {
        onResultUpdated(updatedResult);
      }

      setActionSuccess(`Invoice marked as ${res.review_status} at ${res.reviewed_at}`);
      setPendingAction(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tierColors = {
    HIGH: { text: 'text-[#1B523D]', bg: 'bg-[#E6F0E9]', bar: 'bg-[#246B50]' },
    MEDIUM: { text: 'text-[#8E5B1A]', bg: 'bg-[#FDF4E7]', bar: 'bg-[#B87928]' },
    LOW: { text: 'text-[#8F342D]', bg: 'bg-[#FCECEB]', bar: 'bg-[#B94B43]' },
  };

  const hasFatalMathError = val.issues.some((i) => i.rule_id === 'TOTAL-001' || i.severity === 'ERROR');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Auditor Decision Studio
            </span>
            <Badge variant="slate" size="sm">
              Invoice ID: {invoice_id}
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            Confidence Scoring &amp; Human Review
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Multi-factor certainty evaluation across 6 dimensions with non-negotiable safety overrides.
            Human decisions are authoritative, auditable, and immutable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/gstr1')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Go to GSTR-1 Draft
          </Button>
        </div>
      </div>

      {/* Primary Score & Recommendation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 shadow-fine flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#60695C] tracking-wider block">
            Overall Certainty Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-serif font-bold text-[#20251F] tabular-nums">
              {conf.overall_score.toFixed(1)}
            </span>
            <span className="text-xs text-[#60695C]">/ 100</span>
          </div>
          <div className="w-full bg-[#EFEFEA] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full ${tierColors[conf.confidence_tier].bar} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, conf.overall_score))}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 shadow-fine flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#60695C] tracking-wider block">
            Confidence Tier
          </span>
          <div className="mt-2">
            <Badge
              variant={
                conf.confidence_tier === 'HIGH'
                  ? 'emerald'
                  : conf.confidence_tier === 'MEDIUM'
                  ? 'amber'
                  : 'crimson'
              }
              size="md"
              dot
            >
              {conf.confidence_tier} TIER
            </Badge>
          </div>
          <span className="text-xs text-[#60695C] mt-3 block">
            {conf.confidence_tier === 'HIGH'
              ? 'Eligible for auto-acceptance'
              : 'Requires explicit auditor sign-off'}
          </span>
        </div>

        <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 shadow-fine flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#60695C] tracking-wider block">
            System Recommendation
          </span>
          <div className="mt-2">
            <span className="font-mono font-bold text-sm text-[#20251F]">
              {conf.recommendation}
            </span>
          </div>
          <span className="text-xs text-[#60695C] mt-3 block line-clamp-1">{conf.explanation}</span>
        </div>

        <div className="bg-white border border-[#E2E0D8] rounded-xl p-5 shadow-fine flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#60695C] tracking-wider block">
            Review Status
          </span>
          <div className="mt-2">
            <Badge
              variant={
                rev.review_status === 'APPROVED'
                  ? 'emerald'
                  : rev.review_status === 'REJECTED'
                  ? 'crimson'
                  : rev.review_status === 'REPROCESS_REQUIRED'
                  ? 'amber'
                  : 'neutral'
              }
              size="md"
            >
              {rev.review_status}
            </Badge>
          </div>
          <span className="text-xs text-[#60695C] mt-3 block">
            {rev.reviewed_at ? `Signed off: ${rev.reviewed_at.split('T')[0]}` : 'Awaiting reviewer decision'}
          </span>
        </div>
      </div>

      {/* Fatal Error Notice if applicable */}
      {hasFatalMathError && (
        <div className="bg-[#FCECEB] border-l-4 border-l-[#B94B43] border border-[#F3BDB9] rounded-r-lg p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#B94B43] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase font-bold text-[#8F342D] tracking-wider">
                NON-NEGOTIABLE REGULATORY OVERRIDE ACTIVE
              </h4>
              <p className="text-xs text-[#8F342D] mt-1 leading-relaxed">
                This invoice contains critical mathematical errors (<code className="font-bold">TOTAL-001</code>).
                Under statutory rules, <span className="font-bold">manual human approval CANNOT bypass arithmetic errors</span> to
                admit this transaction into GSTR-1 returns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Reviewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Factor Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            variant="white"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-serif font-bold text-sm text-[#20251F]">
                  1. Multi-Factor Uncertainty Breakdown
                </span>
                <Badge variant="outline">6 Weighted Dimensions</Badge>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                    <th className="py-2.5 px-3 font-semibold">Factor</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Score</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Weight</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Points</th>
                    <th className="py-2.5 px-3 font-semibold">Assessment Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {Object.entries(conf.factors || {}).map(([key, f]) => (
                    <tr key={key} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#20251F]">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums">
                        {f.score.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right text-[#60695C]">
                        {(f.weight * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right font-bold text-[#1B523D] tabular-nums">
                        {f.weighted_score.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-[#60695C] text-[11px]">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Safety Overrides */}
          {conf.triggered_rules && conf.triggered_rules.length > 0 && (
            <Card
              variant="white"
              header={
                <div className="flex items-center gap-2 text-[#8E5B1A]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-serif font-bold text-sm text-[#20251F]">
                    2. Triggered Safety Overrides ({conf.triggered_rules.length})
                  </span>
                </div>
              }
            >
              <div className="space-y-2">
                {conf.triggered_rules.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FDF4E7] border border-[#F4D4A4] rounded-lg text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#8E5B1A]">{r.rule_id}</span>
                      <p className="text-[#20251F] font-medium mt-0.5">{r.description}</p>
                    </div>
                    <Badge variant="amber" size="sm">
                      {r.override_effect}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Authoritative Reviewer Action Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            variant="white"
            header={
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#246B50]" />
                <span className="font-serif font-bold text-sm text-[#20251F]">
                  Authoritative Reviewer Action Panel
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8] text-[11px] text-[#60695C] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#246B50] shrink-0 mt-0.5" />
                <span>
                  All actions take immediate effect and are immutably logged to the audit trail.
                  Taxable amounts cannot be manually mutated.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#20251F] block mb-1">
                  Audit Justification / Reviewer Notes:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter audit rationale for approval, rejection, or reprocessing request..."
                  rows={4}
                  className="w-full p-3 bg-white border border-[#E2E0D8] rounded-lg text-xs text-[#20251F] focus:outline-none focus:border-[#246B50] resize-none"
                />
              </div>

              {actionSuccess && (
                <div className="p-3 bg-[#E6F0E9] border border-[#C3DCC9] rounded-lg text-xs text-[#1B523D] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPendingAction('APPROVE')}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Approve
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingAction('REJECT')}
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Reject
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingAction('REQUEST_REPROCESSING')}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reprocess
                </Button>
              </div>
            </div>
          </Card>

          {/* Audit History Card */}
          <Card
            variant="subtle"
            header={<span className="font-serif font-bold text-xs text-[#20251F] uppercase">Audit Trail Record</span>}
          >
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E2E0D8]">
                <span className="text-[#60695C]">Invoice ID:</span>
                <span className="font-mono font-bold text-[#20251F]">{rev.invoice_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2E0D8]">
                <span className="text-[#60695C]">Status:</span>
                <span className="font-semibold text-[#20251F]">{rev.review_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2E0D8]">
                <span className="text-[#60695C]">Last Action:</span>
                <span className="font-mono text-[#20251F]">{rev.reviewer_action || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2E0D8]">
                <span className="text-[#60695C]">Reviewed At:</span>
                <span className="font-mono text-[#20251F]">{rev.reviewed_at || 'Pending'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#60695C]">GSTR-1 Admitted:</span>
                <span className={`font-bold ${gstr1.is_admitted ? 'text-[#1B523D]' : 'text-[#8F342D]'}`}>
                  {gstr1.is_admitted ? 'YES (Admitted)' : 'NO (Quarantined)'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title={`Confirm Action: ${pendingAction}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === 'APPROVE' ? 'primary' : pendingAction === 'REJECT' ? 'danger' : 'secondary'}
              size="sm"
              onClick={handleConfirmAction}
              isLoading={isSubmitting}
            >
              Confirm &amp; Sign-Off
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-[#20251F]">
          <p>
            Are you sure you want to mark invoice <code className="font-bold">{invoice_id}</code> as{' '}
            <span className="font-bold">{pendingAction}</span>?
          </p>
          {notes ? (
            <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
              <span className="font-semibold block mb-0.5">Attached Reviewer Notes:</span>
              <p className="italic text-[#60695C]">"{notes}"</p>
            </div>
          ) : (
            <p className="text-[#8E5B1A]">No reviewer notes entered. Proceeding without additional comments.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
