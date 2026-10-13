# Phase 5 LLM Structured Extraction Report

**Project:** AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System  
**Phase:** Phase 5 — LLM Structured Extraction  
**Date:** 2026-10-06  
**Status:** COMPLETE  

---

## 1. Objective
The objective of Phase 5 is to transform raw, imperfect OCR text (extracted during Phase 4) into a strictly validated, canonical structured invoice JSON representation. The LLM extraction layer interprets layout semantics, normalizes field names, maps line items, and produces typed outputs without acting as the final financial validator—preserving a strict separation of concerns for the Phase 6 Deterministic Validation Engine.

---

## 2. Architecture
The extraction subsystem is modularized in `src/extraction/`:
- **`src/extraction/models.py`:** Canonical Pydantic schemas (`CanonicalInvoice`, `Party`, `InvoiceItem`, `TaxSummary`, `ExtractionMetadata`).
- **`src/extraction/config.py` (`ExtractionConfig`):** Manages provider configuration, model targets, API tokens, temperature, timeouts, and retry limits.
- **`src/extraction/prompts.py`:** Robust system instructions and user prompt templates designed to parse OCR noise and avoid hallucinations.
- **`src/extraction/exceptions.py`:** Dedicated exception hierarchy (`ExtractionError`, `LLMProviderError`, `LLMResponseParsingError`, `SchemaValidationError`).
- **`src/extraction/llm_client.py`:** Provider abstraction layer (`BaseLLMClient`, `OpenAIClient`, `MockLLMClient`, and factory `get_llm_client`).
- **`src/extraction/parser.py`:** Strips code formatting, parses JSON, computes explainable extraction confidence, and validates models.
- **`src/extraction/service.py` (`ExtractionService`):** High-level orchestrator converting raw OCR text into `CanonicalInvoice` instances.

```text
┌──────────────────────────────┐
│  Preprocessed OCR Text (P4)  │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Prompt Engineering Engine    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ LLM Client Provider Layer    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ JSON Parser & Code-Fence Fix │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Pydantic Schema Validation   │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ Confidence & Warning Scoring │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ CanonicalInvoice Model (P5)  │
└──────────────┬───────────────┘
               ↓
[ Phase 6 Deterministic Engine ]
```

---

## 3. Canonical Schema
The canonical schema is implemented in Pydantic (`CanonicalInvoice`):
- `invoice_number`: Optional[str]
- `invoice_date`: Optional[str] (ISO YYYY-MM-DD)
- `seller`: `Party` (`name`, `gstin`, `address`)
- `buyer`: `Party` (`name`, `gstin`, `address`)
- `place_of_supply`: Optional[str] (2-digit state code)
- `items`: List[`InvoiceItem`] (`description`, `quantity`, `unit_price`, `taxable_value`, `cgst_rate`, `cgst_amount`, `sgst_rate`, `sgst_amount`, `igst_rate`, `igst_amount`)
- `tax_summary`: `TaxSummary` (`taxable_value`, `cgst`, `sgst`, `igst`)
- `grand_total`: Optional[float]
- `currency`: str = "INR"
- `extraction_metadata`: `ExtractionMetadata` (`source_file`, `extraction_method`, `model`, `extraction_timestamp`, `confidence`, `warnings`)

---

## 4. LLM Provider Architecture
- **Provider Abstraction (`BaseLLMClient`):** Decouples prompt execution from concrete LLM APIs.
- **`OpenAIClient`:** Supports direct OpenAI GPT models (`gpt-4o`, `gpt-4o-mini`) via environment configuration (`OPENAI_API_KEY` or `LLM_API_KEY`) with JSON mode enabled.
- **`MockLLMClient`:** A deterministic heuristic pattern extractor allowing automated testing, offline continuous integration, and evaluation across the synthetic benchmark without requiring third-party API spend.
- **Configuration Fallbacks:** Defaulting to mock execution when API keys are not supplied ensures resilience across all environments.

---

## 5. Prompt Strategy
The system prompt in `src/extraction/prompts.py` enforces core constraints:
1. **OCR Noise Awareness:** Informs the model that colons, spacing, and word boundaries may be merged (e.g. `SELLERGSTIN:`, `CGST:90.0`).
2. **Anti-Hallucination:** Explicitly instructs the model to populate missing or unreadable fields with `null` rather than guessing.
3. **Identifier Exactness:** Preserves alphanumeric strings for invoice IDs and 15-character GSTINs.
4. **Structured JSON:** Forces strict JSON output adhering to the canonical schema.

---

## 6. OCR-to-JSON Pipeline
1. Ingests preprocessed OCR text from `data/outputs/ocr/preprocessed/`.
2. Assembles system and user prompts with raw text tokens.
3. Transmits prompt to active LLM client.
4. Cleans response string (stripping markdown code fences).
5. Parses JSON object dictionary with fallback regular expression matching.
6. Validates dictionary types via Pydantic model validation.
7. Evaluates extraction confidence heuristic and logs structural warnings.
8. Returns structured `CanonicalInvoice`.

---

## 7. Error Handling
- **`LLMProviderError`:** Handles network timeouts, bad gateway statuses, or missing API authentication without crashing.
- **`LLMResponseParsingError`:** Traps invalid or corrupted JSON payloads, logging exact syntax issues.
- **`SchemaValidationError`:** Traps type mismatches or schema violations.
- **Safe Fallback:** When parsing fails, `ExtractionService` returns a valid `CanonicalInvoice` shell with `confidence=0.0` and error descriptions in `warnings`.

---

## 8. Confidence Methodology
Extraction confidence is an application-level heuristic score ($0.0 \le \text{confidence} \le 1.0$) distinct from Tesseract's OCR token certainty:
- **Base Score:** `1.0`
- **Missing `invoice_number`:** `-0.20`
- **Missing or Malformed `invoice_date`:** `-0.15`
- **Missing `seller.gstin`:** `-0.25`
- **Invalid GSTIN Length:** `-0.10`
- **Missing `grand_total`:** `-0.20`
- **Missing `tax_summary.taxable_value`:** `-0.10`
- **Missing Line Items:** `-0.15`

---

## 9. Dataset Evaluation
The complete canonical dataset of 25 invoice OCR texts (`data/outputs/ocr/preprocessed/*.txt`) was extracted and evaluated against raw ground truth (`data/raw/invoices/*.json`).

Artifacts generated:
- **Canonical JSON Outputs:** 25 files in `data/outputs/extraction/json/*.json`
- **Metadata Outputs:** 25 files in `data/outputs/extraction/metadata/*.json`
- **Evaluation CSV:** `data/outputs/extraction/evaluation_results.csv`

---

## 10. Extraction Metrics

| Metric | Empirical Result | Notes |
| :--- | :--- | :--- |
| **Total Invoices Processed** | 25 / 25 | 100.0% completion |
| **Schema Validation Success** | 25 / 25 (100.0%) | All outputs conform to Pydantic schema |
| **Average Extraction Latency** | 0.0004s (Mock) | Fast deterministic parsing |
| **Average Extraction Confidence** | 0.89 (89.0%) | High structural completeness |
| **Invoice Number Accuracy** | 19 / 25 (76.0%) | 100% on clean/standard; misses heavily degraded scans |
| **Invoice Date Accuracy** | 25 / 25 (100.0%) | Perfect capture across all categories |
| **Seller GSTIN Accuracy** | 18 / 25 (72.0%) | 100% on standard; misses noisy/rotated scans |
| **Buyer GSTIN Accuracy** | 15 / 22 (68.2%) | Evaluated on B2B invoices; correctly identified B2C nulls |
| **Taxable Value Accuracy** | 21 / 25 (84.0%) | Exact numeric match within ±0.01 tolerance |
| **CGST Amount Accuracy** | 18 / 25 (72.0%) | Exact match |
| **SGST Amount Accuracy** | 15 / 25 (60.0%) | Exact match |
| **Grand Total Accuracy** | 21 / 25 (84.0%) | Exact match |
| **Line Items Completeness** | 19 / 25 (76.0%) | Item counts match ground truth exactly |

---

## 11. Failure Analysis
1. **Clean & Standard Invoices (`INV_CLEAN_*`, `INV_DUP_*`, `INV_INV_*`, `INV_MISS_*`, `INV_MULTI_*`):**
   - Achieved 100% accuracy on invoice numbers, dates, seller GSTINs, buyer GSTINs, taxable values, CGST, and grand totals.
   - Accurately identified missing buyer GSTIN on B2C invoices (`INV_MISS_001-003`) as `null` without hallucination.
   - Successfully parsed multi-item invoices (`INV_MULTI_001-005`) extracting all 3 line items per invoice.
2. **Noisy Scans (`INV_NOISY_001-004`):**
   - Gaussian blur caused OCR mischaracterization of colons and numerals, yielding lowered confidence scores (`0.60`) and warnings.
3. **Rotated Scans (`INV_ROT_001-003`):**
   - Residual skew artifacts caused partial GSTIN truncation, dropping confidence to `0.60 – 0.75`.
   - *Impact on Architecture:* These edge cases provide realistic input variations for Phase 6 math validation and Phase 7 human review.

---

## 12. Security
- API keys are retrieved exclusively via `python-dotenv` from `.env`.
- No credentials or API keys are committed or stored in source code.
- `.env` is protected by `.gitignore`.

---

## 13. Limitations
- Phase 5 performs **extraction and syntactic structuring only**; it intentionally does not verify whether tax calculations balance or whether GSTIN checksums are valid.
- Production deployment with OpenAI/Anthropic models requires valid external credentials configured in `.env`.

---

## 14. Phase 6 Dependencies
Phase 6 (GST Validation Engine) will ingest `CanonicalInvoice` objects and apply deterministic rules:
- Math validation: $\sum \text{Item Taxable} = \text{Total Taxable}$
- Tax validation: $\text{Taxable} \times \text{Rate} = \text{CGST} + \text{SGST}$
- Total validation: $\text{Taxable} + \text{Taxes} = \text{Grand Total}$
- GSTIN format checksum and state-code matching.
- Missing field flags for routing to Phase 7 Human Review.

---

## 15. Real LLM Empirical Validation Architecture & Status
The system maintains a clean separation between the offline benchmark and live LLM validation:

### A. Provider Infrastructure
- **Live Provider:** `OpenAIClient` (`src/extraction/llm_client.py`) utilizing JSON schema mode with model `gpt-4o-mini`.
- **Batch Pipeline:** `src/utils/process_real_llm_extraction.py` processes `data/outputs/ocr/preprocessed/*.txt`, persisting raw responses into `data/outputs/extraction/real_llm/raw_responses/`, canonical JSON into `data/outputs/extraction/real_llm/json/`, and metadata into `data/outputs/extraction/real_llm/metadata/`.
- **Comparative Analysis:** Compares empirical live LLM metrics against the deterministic mock baseline in `data/outputs/extraction/mock_vs_real_comparison.csv`.

### B. Security & Credentials
- Credentials (`OPENAI_API_KEY` or `LLM_API_KEY`) are read strictly from local environment variables / `.env`.
- `.env` is gitignored; secrets are never logged, printed, or persisted in output metadata.

### C. Execution Status
- When live API credentials are not present in `.env`, the real LLM batch runner safely stops without silently faking execution or substituting mock data.
- **Current Real LLM Benchmark Status:** Blocked until `OPENAI_API_KEY` is provided in `.env`.

---

## 16. Phase 5 Completion Status
- **Architecture & Pydantic Schemas:** COMPLETE
- **Deterministic Mock Benchmark (25/25):** COMPLETE (100% schema validity, 0.89 mean confidence)
- **Unit & Integration Test Suite (25/25 passed):** COMPLETE
- **Streamlit Dual-Mode Integration:** COMPLETE
- **Real LLM Batch Runner (`src/utils/process_real_llm_extraction.py`):** COMPLETE
- **Real LLM Live Execution:** BLOCKED — Pending local `OPENAI_API_KEY` configuration in `.env`.
