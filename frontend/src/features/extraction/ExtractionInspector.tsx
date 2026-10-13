import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Code2,
  Building,
  UserCheck,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PipelineExecutionResult } from '../../types';
import { formatCurrency, formatDuration, formatPercent } from '../../lib/utils';

interface ExtractionInspectorProps {
  activeResult: PipelineExecutionResult | null;
}

export const ExtractionInspector: React.FC<ExtractionInspectorProps> = ({ activeResult }) => {
  const navigate = useNavigate();

  if (!activeResult) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-[#E2E0D8] p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E6F0E9] text-[#246B50] flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#20251F]">
          No Active Invoice Loaded in Inspector
        </h2>
        <p className="text-xs text-[#60695C] max-w-md mx-auto">
          Process an invoice image in the Single Invoice Processing Studio to inspect raw OCR text tokens,
          parsed canonical JSON entities, and structured line item tax distributions.
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

  const { canonical_invoice: inv, ocr, provider_used, model_used } = activeResult;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Semantic Deep-Dive
            </span>
            <Badge variant="slate" size="sm">
              Provider: {provider_used.toUpperCase()} ({model_used})
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            OCR &amp; AI Extraction Inspector
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Side-by-side verification of raw Tesseract OCR UTF-8 text tokens against the validated
            Pydantic canonical invoice entity graph.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/validation')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Inspect GST Validation
          </Button>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Raw OCR Text Tokens */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            variant="white"
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#246B50]" />
                  <span className="font-serif font-bold text-sm text-[#20251F]">
                    Raw OCR Output (Tesseract 5.5.3)
                  </span>
                </div>
                <Badge variant="emerald" size="sm">
                  {formatPercent(ocr.average_confidence)} Conf
                </Badge>
              </div>
            }
          >
            <div className="grid grid-cols-3 gap-2 py-2 mb-3 border-b border-[#E2E0D8] text-center">
              <div className="p-2 bg-[#FAFAF8] rounded">
                <span className="text-[10px] text-[#60695C] uppercase block">Tokens</span>
                <span className="font-mono font-bold text-xs">{ocr.word_count}</span>
              </div>
              <div className="p-2 bg-[#FAFAF8] rounded">
                <span className="text-[10px] text-[#60695C] uppercase block">Characters</span>
                <span className="font-mono font-bold text-xs">{ocr.character_count}</span>
              </div>
              <div className="p-2 bg-[#FAFAF8] rounded">
                <span className="text-[10px] text-[#60695C] uppercase block">Latency</span>
                <span className="font-mono font-bold text-xs">{formatDuration(ocr.processing_time)}</span>
              </div>
            </div>

            <textarea
              readOnly
              value={ocr.raw_text}
              rows={18}
              className="w-full p-3 font-mono text-xs bg-[#FAFAF8] border border-[#E2E0D8] rounded-lg text-[#20251F] focus:outline-none resize-none leading-relaxed"
            />
          </Card>
        </div>

        {/* Right Column: Structured Canonical Extraction */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Identifiers Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-[#E2E0D8] rounded-lg shadow-fine">
              <span className="text-[10px] uppercase font-bold text-[#60695C] block">
                Invoice Number
              </span>
              <span className="font-mono font-bold text-sm text-[#20251F] block mt-1">
                {inv.invoice_number || 'MISSING / UNKNOWN'}
              </span>
            </div>

            <div className="p-4 bg-white border border-[#E2E0D8] rounded-lg shadow-fine">
              <span className="text-[10px] uppercase font-bold text-[#60695C] block">
                Invoice Date
              </span>
              <span className="font-mono font-bold text-sm text-[#20251F] block mt-1">
                {inv.invoice_date || 'MISSING / UNKNOWN'}
              </span>
            </div>

            <div className="p-4 bg-white border border-[#E2E0D8] rounded-lg shadow-fine">
              <span className="text-[10px] uppercase font-bold text-[#60695C] block">
                Grand Total (Extracted)
              </span>
              <span className="font-serif font-bold text-base text-[#20251F] block mt-0.5 tabular-nums">
                {formatCurrency(inv.grand_total)}
              </span>
            </div>
          </div>

          {/* Parties Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller Card */}
            <Card
              variant="white"
              header={
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#246B50]" />
                  <span className="font-serif font-bold text-xs text-[#20251F] uppercase tracking-wider">
                    Seller Entity
                  </span>
                </div>
              }
            >
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#60695C] block text-[10px] uppercase font-semibold">Trade Name</span>
                  <span className="font-bold text-[#20251F]">{inv.seller.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#60695C] block text-[10px] uppercase font-semibold">Seller GSTIN</span>
                  <code className="bg-[#FAFAF8] px-1.5 py-0.5 rounded border border-[#E2E0D8] font-mono text-[11px]">
                    {inv.seller.gstin || 'MISSING'}
                  </code>
                </div>
                <div>
                  <span className="text-[#60695C] block text-[10px] uppercase font-semibold">Address</span>
                  <span className="text-[#60695C] line-clamp-2">{inv.seller.address || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* Buyer Card */}
            <Card
              variant="white"
              header={
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#246B50]" />
                  <span className="font-serif font-bold text-xs text-[#20251F] uppercase tracking-wider">
                    Buyer Entity
                  </span>
                </div>
              }
            >
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#60695C] block text-[10px] uppercase font-semibold">Recipient Name</span>
                  <span className="font-bold text-[#20251F]">{inv.buyer.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#60695C] block text-[10px] uppercase font-semibold">Buyer GSTIN</span>
                  <code className="bg-[#FAFAF8] px-1.5 py-0.5 rounded border border-[#E2E0D8] font-mono text-[11px]">
                    {inv.buyer.gstin || 'N/A (B2C Retail Transaction)'}
                  </code>
                </div>
                <div>
                  <span className="text-[#60695C] block text-[10px] uppercase font-semibold">Place of Supply</span>
                  <span className="font-semibold text-[#20251F]">{inv.place_of_supply || 'N/A'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Line Items Table */}
          <Card
            variant="white"
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#246B50]" />
                  <span className="font-serif font-bold text-sm text-[#20251F]">
                    Extracted Line Items ({inv.items?.length || 0})
                  </span>
                </div>
              </div>
            }
          >
            {inv.items && inv.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-3 font-semibold">HSN/SAC</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Taxable Val</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E0D8]">
                    {inv.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#60695C]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-[#20251F]">{item.description || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-[#60695C]">{item.hsn_sac || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-right">{item.quantity || 1}</td>
                        <td className="py-2.5 px-3 font-mono text-right tabular-nums">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right tabular-nums font-semibold">
                          {formatCurrency(item.taxable_value)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right tabular-nums font-bold text-[#1B523D]">
                          {formatCurrency(item.item_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[#60695C] text-xs">
                No individual line items itemized in extraction schema.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
