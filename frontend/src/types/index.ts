export interface SystemHealth {
  status: string;
  environment: string;
  ollama_ready: boolean;
  ollama_model: string;
  installed_ollama_models: string[];
  tesseract_available: boolean;
  gemini_configured: boolean;
  openai_configured: boolean;
  canonical_invoice_count: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  available: boolean;
  is_local: boolean;
  requires_key: boolean;
  key_configured: boolean;
}

export interface ProvidersResponse {
  providers: ProviderInfo[];
  default_provider: string;
}

export interface SampleInvoice {
  file_name: string;
  invoice_id: string;
  category: string;
  file_size_kb: number;
  has_review: boolean;
  review_status?: string | null;
  image_url: string;
}

export interface InvoiceParty {
  name?: string | null;
  gstin?: string | null;
  address?: string | null;
  state_code?: string | null;
  pan?: string | null;
}

export interface LineItem {
  item_id?: string | null;
  description?: string | null;
  hsn_sac?: string | null;
  quantity?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  discount_amount?: number | null;
  taxable_value?: number | null;
  cgst_rate?: number | null;
  cgst_amount?: number | null;
  sgst_rate?: number | null;
  sgst_amount?: number | null;
  igst_rate?: number | null;
  igst_amount?: number | null;
  cess_rate?: number | null;
  cess_amount?: number | null;
  item_total?: number | null;
}

export interface TaxSummary {
  taxable_value?: number | null;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  cess?: number | null;
  total_tax?: number | null;
}

export interface ExtractionMetadata {
  source_file: string;
  extraction_method: string;
  model: string;
  confidence: number;
  warnings: string[];
}

export interface CanonicalInvoice {
  invoice_number?: string | null;
  invoice_date?: string | null;
  place_of_supply?: string | null;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  items: LineItem[];
  tax_summary: TaxSummary;
  grand_total?: number | null;
  round_off?: number | null;
  extraction_metadata: ExtractionMetadata;
}

export interface ValidationIssue {
  rule_id: string;
  rule_name: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  field_name?: string | null;
  expected_value?: any;
  actual_value?: any;
}

export interface ValidationCheck {
  check_name: string;
  passed: boolean;
  message: string;
}

export interface ValidationCalculatedValues {
  calculated_item_taxable_sum?: number | null;
  calculated_cgst?: number | null;
  calculated_sgst?: number | null;
  calculated_igst?: number | null;
  calculated_cess?: number | null;
  calculated_total_tax?: number | null;
  calculated_grand_total?: number | null;
  taxable_discrepancy?: number | null;
  tax_discrepancy?: number | null;
  grand_total_discrepancy?: number | null;
}

export interface ValidationResult {
  invoice_id?: string | null;
  status: 'PASS' | 'WARNING' | 'FAIL';
  requires_review: boolean;
  error_count: number;
  warning_count: number;
  issues: ValidationIssue[];
  checks: ValidationCheck[];
  calculated_values: ValidationCalculatedValues;
}

export interface ConfidenceFactor {
  score: number;
  weight: number;
  weighted_score: number;
  reason: string;
}

export interface SafetyRuleTriggered {
  rule_id: string;
  severity: string;
  description: string;
  override_effect: string;
}

export interface ConfidenceResult {
  invoice_id?: string | null;
  overall_score: number;
  confidence_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: 'AUTO_ACCEPT' | 'REVIEW_REQUIRED' | 'REJECT_OR_REPROCESS';
  factors: Record<string, ConfidenceFactor>;
  triggered_rules: SafetyRuleTriggered[];
  requires_human_review: boolean;
  explanation: string;
}

export interface ReviewRecord {
  invoice_id: string;
  review_status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REPROCESS_REQUIRED';
  reviewer_action?: string | null;
  reviewer_id?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
  requires_review: boolean;
  confidence_score: number;
  confidence_tier: string;
  validation_status: string;
  error_count: number;
  warning_count: number;
}

export interface GSTR1B2BInvoice {
  gstin_of_recipient: string;
  receiver_name?: string | null;
  invoice_number: string;
  invoice_date: string;
  invoice_value: number;
  place_of_supply: string;
  reverse_charge: string;
  applicable_pct_tax_rate: number;
  invoice_type: string;
  e_commerce_gstin?: string | null;
  rate: number;
  taxable_value: number;
  cess_amount: number;
  source_invoice_id: string;
  source_validation_status: string;
  source_confidence_score: number;
}

export interface GSTR1B2CSInvoice {
  type: string;
  place_of_supply: string;
  applicable_pct_tax_rate: number;
  rate: number;
  taxable_value: number;
  cess_amount: number;
  e_commerce_gstin?: string | null;
  source_invoice_id: string;
  source_validation_status: string;
  source_confidence_score: number;
}

export interface GSTR1ExclusionRecord {
  invoice_id: string;
  reason: string;
  confidence_score: number;
  confidence_tier: string;
  recommendation: string;
  review_status: string;
  validation_status: string;
  error_count: number;
  warning_count: number;
  triggered_rules: string[];
}

export interface GSTR1Draft {
  gstin_of_supplier?: string | null;
  return_period?: string | null;
  gross_turnover?: number | null;
  b2b_records: GSTR1B2BInvoice[];
  b2c_records: GSTR1B2CSInvoice[];
  exclusions: GSTR1ExclusionRecord[];
  source_invoice_count: number;
  included_invoice_count: number;
  excluded_invoice_count: number;
  b2b_count: number;
  b2c_count: number;
  total_taxable_value: number;
  total_invoice_value: number;
  total_b2b_taxable_value: number;
  total_b2c_taxable_value: number;
  total_b2b_invoice_value: number;
}

export interface PipelineExecutionResult {
  invoice_id: string;
  file_name: string;
  total_latency_seconds: number;
  provider_used: string;
  model_used: string;
  image_url: string;
  processed_image_url: string;
  preprocessing: {
    status: string;
    applied_steps: string[];
    processing_time: number;
  };
  ocr: {
    average_confidence: number;
    word_count: number;
    character_count: number;
    processing_time: number;
    raw_text: string;
  };
  canonical_invoice: CanonicalInvoice;
  validation: ValidationResult;
  confidence: ConfidenceResult;
  review_record: ReviewRecord;
  gstr1: {
    is_admitted: boolean;
    table_type?: string | null;
    record?: GSTR1B2BInvoice | GSTR1B2CSInvoice | null;
    exclusion?: GSTR1ExclusionRecord | null;
  };
}
