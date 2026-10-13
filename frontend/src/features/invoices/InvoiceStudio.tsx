import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Play,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Maximize2,
  Scale,
  Download,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { FileUploadZone } from './FileUploadZone';
import { SamplePicker } from './SamplePicker';
import { api } from '../../lib/api';
import { SampleInvoice, PipelineExecutionResult } from '../../types';
import { formatCurrency, formatDuration, formatPercent } from '../../lib/utils';

interface InvoiceStudioProps {
  selectedProvider: string;
  activeResult: PipelineExecutionResult | null;
  onResultGenerated: (result: PipelineExecutionResult) => void;
}

export const InvoiceStudio: React.FC<InvoiceStudioProps> = ({
  selectedProvider,
  activeResult,
  onResultGenerated,
}) => {
  const [sourceTab, setSourceTab] = useState<'samples' | 'upload'>('samples');
  const [samples, setSamples] = useState<SampleInvoice[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [tolerance, setTolerance] = useState(1.0);
  const [highThreshold, setHighThreshold] = useState(85.0);
  const [mediumThreshold, setMediumThreshold] = useState(60.0);
  const [showSettings, setShowSettings] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.getSamples().then((loaded) => {
      setSamples(loaded);
      if (loaded.length > 0) {
        setSelectedFile(loaded[0].file_name);
        setSelectedImageUrl(loaded[0].image_url);
      }
    }).catch(console.error);
  }, []);

  const handleSelectSample = (sample: SampleInvoice) => {
    setSelectedFile(sample.file_name);
    setSelectedImageUrl(sample.image_url);
  };

  const handleFileUploaded = (fileData: { file_name: string; invoice_id: string; file_size_kb: number; image_url: string }) => {
    setSelectedFile(fileData.file_name);
    setSelectedImageUrl(fileData.image_url);
  };

  const handleExecute = async () => {
    if (!selectedFile) return;
    setIsExecuting(true);
    setError(null);
    try {
      const res = await api.processInvoice({
        fileName: selectedFile,
        provider: selectedProvider,
        amountTolerance: tolerance,
        highThreshold,
        mediumThreshold,
      });
      onResultGenerated(res);
    } catch (err: any) {
      setError(err.message || 'Pipeline execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              Studio Environment
            </span>
            <Badge variant="slate" size="sm">
              Provider: {selectedProvider.toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            Single Invoice Processing Studio
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Execute the complete multi-stage pipeline: Vision Preprocessing → Tesseract OCR →
            Structured AI Extraction → Deterministic GST Validation → Confidence Gating → GSTR-1 Return Mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            leftIcon={<Sliders className="w-3.5 h-3.5" />}
          >
            {showSettings ? 'Hide Parameters' : 'Adjust Parameters'}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleExecute}
            isLoading={isExecuting}
            disabled={!selectedFile}
            leftIcon={<Play className="w-4 h-4 fill-current" />}
          >
            Execute End-to-End Pipeline
          </Button>
        </div>
      </div>

      {/* Optional Tuning Parameters Bar */}
      {showSettings && (
        <Card variant="subtle" padding="sm" className="animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-2">
            <div>
              <label className="text-xs font-bold text-[#20251F] block mb-1">
                Statutory Amount Tolerance (₹)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-[#E2E0D8] rounded text-xs font-mono"
              />
              <span className="text-[10px] text-[#60695C] mt-0.5 block">Standard statutory tolerance is ₹1.00</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#20251F] block mb-1">
                HIGH Confidence Threshold ({highThreshold}%)
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#246B50]"
              />
              <span className="text-[10px] text-[#60695C] mt-0.5 block">Invoices ≥ {highThreshold}% auto-admitted</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#20251F] block mb-1">
                MEDIUM Confidence Threshold ({mediumThreshold}%)
              </label>
              <input
                type="range"
                min="40"
                max="75"
                value={mediumThreshold}
                onChange={(e) => setMediumThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#B87928]"
              />
              <span className="text-[10px] text-[#60695C] mt-0.5 block">Scores between {mediumThreshold}% and {highThreshold}% require review</span>
            </div>
          </div>
        </Card>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Source Selection */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            variant="white"
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-serif font-bold text-sm text-[#20251F]">
                  1. Select or Upload Invoice Scan
                </span>
                <Badge variant="outline">25 Benchmark Samples</Badge>
              </div>
            }
          >
            <Tabs
              variant="pills"
              activeTab={sourceTab}
              onChange={(t) => setSourceTab(t as any)}
              tabs={[
                { id: 'samples', label: 'Benchmark Samples', count: samples.length },
                { id: 'upload', label: 'Upload Custom File' },
              ]}
              className="mb-4"
            />

            {sourceTab === 'samples' ? (
              <SamplePicker
                samples={samples}
                selectedSample={selectedFile}
                onSelectSample={handleSelectSample}
              />
            ) : (
              <FileUploadZone onFileUploaded={handleFileUploaded} />
            )}
          </Card>
        </div>

        {/* Right Column: Visual Document Preview & Live State */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            variant="white"
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#246B50]" />
                  <span className="font-serif font-bold text-sm text-[#20251F]">
                    Document Canvas: <code className="font-mono text-xs">{selectedFile || 'No file selected'}</code>
                  </span>
                </div>
                {selectedImageUrl && (
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="flex items-center gap-1 text-xs text-[#246B50] hover:underline"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand</span>
                  </button>
                )}
              </div>
            }
          >
            {selectedImageUrl ? (
              <div className="bg-[#FAFAF8] rounded-lg border border-[#E2E0D8] p-4 flex items-center justify-center min-h-[340px] max-h-[460px] overflow-hidden">
                <img
                  src={selectedImageUrl}
                  alt="Selected invoice preview"
                  className="max-h-[420px] w-auto object-contain rounded shadow-fine border border-[#E2E0D8]"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[340px] text-[#60695C] border-2 border-dashed border-[#E2E0D8] rounded-lg">
                <FileText className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">No invoice selected</p>
              </div>
            )}
          </Card>

          {/* Error Callout */}
          {error && (
            <div className="bg-[#FCECEB] border-l-4 border-l-[#B94B43] border border-[#F3BDB9] rounded-r-lg p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#B94B43] shrink-0 mt-0.5" />
              <div className="text-xs text-[#8F342D]">
                <span className="font-bold">Execution Error:</span> {error}
              </div>
            </div>
          )}

          {/* Pipeline Results / Empty State */}
          {!activeResult && (
            <Card variant="subtle" padding="md" className="text-center py-8 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#E6F0E9] text-[#246B50] flex items-center justify-center mx-auto">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#20251F]">
                Ready to Process Invoice
              </h3>
              <p className="text-xs text-[#60695C] max-w-md mx-auto">
                {selectedFile ? (
                  <>
                    Ready to process <code className="font-mono text-[#246B50] font-semibold">{selectedFile}</code>. Click <strong>"Execute End-to-End Pipeline"</strong> above to run vision preprocessing, OCR, entity extraction, deterministic validation, and return mapping.
                  </>
                ) : (
                  <>
                    Select an invoice from the benchmark catalog or upload your own document on the left, then click <strong>"Execute End-to-End Pipeline"</strong>.
                  </>
                )}
              </p>
            </Card>
          )}

          {activeResult && (
            <Card
              variant="white"
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#246B50]" />
                    <span className="font-serif font-bold text-sm text-[#20251F]">
                      2. Pipeline Execution Summary ({formatDuration(activeResult.total_latency_seconds)})
                    </span>
                  </div>
                  <Badge
                    variant={
                      activeResult.validation.status === 'PASS'
                        ? 'emerald'
                        : activeResult.validation.status === 'WARNING'
                        ? 'amber'
                        : 'crimson'
                    }
                  >
                    {activeResult.validation.status}
                  </Badge>
                </div>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-2">
                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase font-bold block">1. Preprocessing</span>
                  <span className="text-xs font-semibold text-[#1B523D] block mt-0.5">✓ Complete</span>
                  <span className="text-[11px] text-[#60695C]">{formatDuration(activeResult.preprocessing.processing_time)}</span>
                </div>

                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase font-bold block">2. OCR Confidence</span>
                  <span className="text-xs font-semibold text-[#20251F] block mt-0.5">
                    {formatPercent(activeResult.ocr.average_confidence)}
                  </span>
                  <span className="text-[11px] text-[#60695C]">{activeResult.ocr.word_count} tokens</span>
                </div>

                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase font-bold block">3. Validation</span>
                  <span
                    className={`text-xs font-bold block mt-0.5 ${
                      activeResult.validation.status === 'PASS'
                        ? 'text-[#1B523D]'
                        : activeResult.validation.status === 'WARNING'
                        ? 'text-[#8E5B1A]'
                        : 'text-[#8F342D]'
                    }`}
                  >
                    {activeResult.validation.status}
                  </span>
                  <span className="text-[11px] text-[#60695C]">
                    {activeResult.validation.error_count} err / {activeResult.validation.warning_count} warn
                  </span>
                </div>

                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase font-bold block">4. Confidence</span>
                  <span className="text-xs font-semibold text-[#20251F] block mt-0.5">
                    {activeResult.confidence.confidence_tier} ({activeResult.confidence.overall_score.toFixed(1)})
                  </span>
                  <span className="text-[11px] text-[#60695C]">{activeResult.confidence.recommendation}</span>
                </div>

                <div className="p-3 bg-[#FAFAF8] rounded border border-[#E2E0D8]">
                  <span className="text-[10px] text-[#60695C] uppercase font-bold block">5. GSTR-1 Status</span>
                  {activeResult.gstr1.is_admitted ? (
                    <span className="text-xs font-bold text-[#1B523D] block mt-0.5">
                      ✓ {activeResult.gstr1.table_type || 'Admitted'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#8F342D] block mt-0.5">
                      ✗ Quarantined
                    </span>
                  )}
                  <span className="text-[11px] text-[#60695C]">
                    {activeResult.gstr1.is_admitted ? 'Return draft' : 'Ineligible'}
                  </span>
                </div>
              </div>

              {/* Explanatory Banner */}
              <div className="mt-4 pt-4 border-t border-[#E2E0D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-[#20251F]">
                  <span className="font-bold">Recommendation:</span>{' '}
                  <span className="text-[#60695C]">{activeResult.confidence.explanation}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/validation')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Inspect Validation
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/review')}
                    rightIcon={<Scale className="w-3.5 h-3.5" />}
                  >
                    Audit Review
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Full Document Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title={`Invoice Canvas Preview: ${selectedFile}`}
        maxWidth="4xl"
      >
        <div className="flex items-center justify-center p-2 bg-[#FAFAF8] rounded-lg">
          <img
            src={selectedImageUrl}
            alt="Full invoice preview"
            className="max-h-[75vh] w-auto object-contain rounded border border-[#E2E0D8]"
          />
        </div>
      </Modal>
    </div>
  );
};
