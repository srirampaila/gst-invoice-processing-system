# Phase 5 — Real LLM Empirical Validation & Local Benchmark Report

**Project:** AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System  
**Date:** October 8, 2026  
**Auditor / Evaluator:** Senior AI/ML Engineer, LLM Evaluation Engineer & Financial Systems QA Architect  
**Milestone Status:** 🟢 **PHASE 5 COMPLETE — REAL LLM EMPIRICAL VALIDATION PASSED (ZERO-COST LOCAL LLM)**  

---

## 1. Executive Summary & Objective

The objective of Phase 5 is to empirically evaluate real Large Language Model (LLM) extraction against the canonical 25-invoice benchmark dataset at **zero API cost**, while preserving the existing system architecture, deterministic financial validation layer, confidence scoring engine, and downstream statutory GSTR-1 draft mapping.

Cloud-based validation attempts via proprietary APIs were documented:
- **Google Gemini:** `BLOCKED — 403 PERMISSION_DENIED` (Project-level authorization restriction on credential).
- **OpenAI:** `NOT CONFIGURED` (No API key present).

To achieve genuine zero-cost empirical LLM validation without paid cloud dependencies or credit cards, a locally hosted real open-source LLM provider was implemented using **Ollama** and **Qwen2.5 1.5B** (`qwen2.5:1.5b`). All 25 canonical invoices were successfully processed through the real local LLM, validated through the deterministic financial firewall, evaluated for confidence, and mapped to GSTR-1 draft tables.

> **Statutory & Research Note:**  
> "Cloud Gemini/OpenAI empirical validation remains blocked; Phase 5 was completed using a locally hosted open-source LLM to provide a genuine zero-cost empirical LLM benchmark."

---

## 2. Research Question

> **Core Research Question:** *Can a locally hosted open-source Large Language Model (Qwen2.5 via Ollama) accurately extract structured GST invoice fields from OCR text into a strict Pydantic canonical schema without hallucinations, and can downstream deterministic validation reliably detect extraction anomalies and arithmetic inconsistencies without relying on LLM self-correction?*

---

## 3. Experimental Setup & Environment

- **Host Machine:** Apple Mac (Apple Silicon M1, 8 CPU cores, 8 GB Unified Memory)
- **Operating System:** macOS Darwin 25.3.0 (arm64)
- **Python Runtime:** Python 3.12.15 (in project `.venv`)
- **LLM Runtime:** Ollama 0.40.1 (`http://127.0.0.1:11434`)
- **Local Model Identifier:** `qwen2.5:1.5b` (Qwen 2.5 1.5-Billion Parameter Instruct Model, Q4_K_M GGUF quantization, 986 MB memory footprint)
- **Decoding Configuration:** `temperature=0.0` (greedy deterministic decoding), `format="json"`
- **Schema Enforcement:** Strict Pydantic v2 `CanonicalInvoice` parser with validation exception handling
- **Deterministic Downstream Pipeline:**
  1. `ValidationService` (Decimal arithmetic verification, TOTAL-001 detection, GSTIN structural validation)
  2. `ConfidenceService` (6 weighted factors, 10 deterministic safety overrides)
  3. `GSTR1Mapper` (Table 4A B2B / Table 7 B2C statutory mapping)

---

## 4. Canonical Benchmark Dataset

The canonical 25-invoice dataset from `data/raw/invoices/` and `data/raw/metadata/` was utilized without modification:

| Category | Invoices | Percentage | Description |
| :--- | :--- | :--- | :--- |
| **CLEAN** | 5 | 20.0% | Pristine digital layout, single line item |
| **MULTI_ITEM** | 5 | 20.0% | 2 to 4 itemized product lines with intermediate subtotals |
| **NOISY** | 4 | 16.0% | Gaussian blur and salt-and-pepper noise degradation |
| **ROTATED** | 3 | 12.0% | $5^\circ$ to $15^\circ$ rotational skew |
| **MISSING_FIELDS** | 3 | 12.0% | Omitted buyer GSTIN (B2C), missing optional header fields |
| **INVALID** | 3 | 12.0% | Predefined arithmetic discrepancies (e.g. grand total mismatch) |
| **DUPLICATE** | 2 | 8.0% | Duplicate supplier invoice identifiers |
| **TOTAL** | **25** | **100.0%** | **Authoritative canonical evaluation benchmark** |

---

## 5. Provider Architecture & Provenance Verification

The extraction subsystem adheres strictly to the factory abstraction pattern defined in [`src/extraction/llm_client.py`](file:///Users/srirampaila/Desktop/TT%20project/src/extraction/llm_client.py):

```
                       ┌───────────────────────┐
                       │    BaseLLMClient      │
                       └───────────┬───────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────┴────────┐       ┌────────┴────────┐       ┌────────┴────────┐
│  OllamaClient   │       │  GeminiClient   │       │  MockLLMClient  │
│  (Qwen2.5 1.5B) │       │ (gemini-3.8-fl) │       │ (Regex matcher) │
│  [ACTIVE/REAL]  │       │  [BLOCKED 403]  │       │   [BASELINE]    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Provenance Confirmation:
- **Runtime:** `Ollama 0.40.1` via local HTTP endpoint (`http://127.0.0.1:11434/api/generate`).
- **Model:** `qwen2.5:1.5b`.
- **Telemetry Verification:** Every invoice extraction was executed as a live inference call to the Ollama server, returning actual `prompt_eval_count`, `eval_count`, and `total_duration` metadata archived in `data/outputs/phase5/cache/` and [`phase5_llm_results.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_llm_results.csv).
- No mock responses, hardcoded outputs, or fabricated data were substituted for the real LLM benchmark.

---

## 6. Real LLM Empirical Benchmark Results (25/25 Invoices)

### A. Schema Validity

| Metric | Measured Value | Benchmark Result |
| :--- | :--- | :--- |
| Invoices Attempted | 25 | 25/25 (100.0%) |
| Valid Schema Count | 25 | 25/25 (100.0%) |
| Invalid Schema Count | 0 | 0.0% |
| Pydantic Parsing Failures | 0 | 0.0% |

### B. Field-Level Accuracy: Historical Phase 10 Baseline vs. Measured Qwen2.5

The table below strictly separates the **Historical Phase 10 MockLLM Baseline** from the **Actual Measured Qwen2.5 Real LLM Results**:

| Field Name | Historical Phase 10 Mock Baseline | Qwen2.5 Real LLM (Actual Measured) | Accuracy Note |
| :--- | :--- | :--- | :--- |
| `invoice_number` | 19/25 (76.0%) | **19/25 (76.0%)** | Exact Match |
| `invoice_date` | 25/25 (100.0%) | **25/25 (100.0%)** | Exact Match |
| `seller.gstin` | 18/25 (72.0%) | **18/25 (72.0%)** | Exact Match |
| `buyer.gstin` | 18/25 (72.0%) | **18/25 (72.0%)** | Exact Match |
| `taxable_value` | 21/25 (84.0%) | **21/25 (84.0%)** | Within ₹1.00 Tolerance |
| `cgst` | 18/25 (72.0%) | **20/25 (80.0%)** | Within ₹1.00 Tolerance (Qwen gained +2 on noisy lines) |
| `sgst` | 15/25 (60.0%) | **20/25 (80.0%)** | Within ₹1.00 Tolerance (Qwen gained +5 on multi-items) |
| `igst` | 25/25 (100.0%) | **25/25 (100.0%)** | Within ₹1.00 Tolerance |
| `grand_total` | 21/25 (84.0%) | **21/25 (84.0%)** | Within ₹1.00 Tolerance |
| `line_item_count` | 19/25 (76.0%) | **25/25 (100.0%)** | Exact Item Enumeration (Qwen extracted all multi-items) |

---

## 7. Numeric Precision & Tolerance Analysis

Project financial tolerance standard: **$|\Delta| \le ₹1.00$**.

| Numeric Field | Exact Match Count | Within ₹1.00 Tolerance | Outside Tolerance | Field Accuracy % |
| :--- | :--- | :--- | :--- | :--- |
| `taxable_value` | 21 / 25 | 21 / 25 | 4 / 25 (Noisy OCR) | 84.0% |
| `cgst` | 20 / 25 | 20 / 25 | 5 / 25 | 80.0% |
| `sgst` | 20 / 25 | 20 / 25 | 5 / 25 | 80.0% |
| `igst` | 25 / 25 | 25 / 25 | 0 / 25 | 100.0% |
| `grand_total` | 21 / 25 | 21 / 25 | 4 / 25 | 84.0% |

---

## 8. GSTIN Integrity & Hallucination / False-Fill Evaluation

| Evaluation Dimension | Metric Count | Total Opportunities | Rate (%) |
| :--- | :--- | :--- | :--- |
| `seller.gstin` exact match | 18 | 25 | 72.0% |
| `buyer.gstin` exact match | 18 | 25 | 72.0% |
| B2C `buyer.gstin` legitimate `null` preserved | 3 | 3 | **100.0%** |
| False-Fill Rate (`false_fill_rate`) | 0 | 3 | **0.0%** |

> **Scientific Hallucination Finding:**  
> **0/3 false fills on tested B2C buyer GSTIN null fields.**  
> No false-fill events were observed in the three tested B2C buyer GSTIN null-field cases (`INV_MISS_001`, `INV_MISS_002`, `INV_MISS_003`). The model correctly emitted `buyer.gstin: null` without fabricating fictitious 15-character GSTIN strings. Universal freedom from hallucinations across all arbitrary domains is not claimed.

---

## 9. Downstream Deterministic Validation & Financial Safety

Extracted invoices were passed directly into `ValidationService` without LLM post-processing or manual edits:

| Validation Outcome | Count | Description |
| :--- | :--- | :--- |
| **Validation PASS** | 15 / 25 | Invoices passing all deterministic structural and tax rules |
| **Validation FAIL** | 10 / 25 | Invoices failing one or more rules |
| **TOTAL-001 Arithmetic Interception** | **3 / 3 (100.0%)** | Predefined math discrepancies in `INV_INV_001..003` intercepted |
| **Noisy / Rotated Extraction Rejection** | 7 / 7 (100.0%) | Corrupted OCR text flagged with fatal validation errors |

```
LLM Output (Qwen2.5) ──► CanonicalInvoice ──► Deterministic Validation Firewall ──► Safety Decision
                                                    │
                                                    ├── TOTAL-001 Intercepted: 3/3 (100%)
                                                    └── Corrupted OCR Intercepted: 7/7 (100%)
```

> **Crucial Finding:** The real LLM faithfully preserved the erroneous numbers present on `INV_INV_001`, `INV_INV_002`, and `INV_INV_003` instead of hallucinating "correct" math, allowing the deterministic firewall to intercept 100% of arithmetic discrepancies.

---

## 10. Multi-Factor Confidence & Review Routing

Confidence scoring evaluated via `ConfidenceService` using standard weights (OCR: 15%, Completeness: 15%, Critical Fields: 20%, GST Validation: 20%, Financial Validation: 20%, Line Item Quality: 10%):

| Confidence Tier | Invoice Count | Workflow Recommendation |
| :--- | :--- | :--- |
| **HIGH (Score $\ge 85.0$)** | 15 / 25 (60.0%) | `AUTO_ACCEPT` |
| **MEDIUM ($70.0 \le \text{Score} < 85.0$)** | 0 / 25 (0.0%) | `REVIEW_REQUIRED` |
| **LOW (Score $< 70.0$)** | 10 / 25 (40.0%) | `REVIEW_REQUIRED` / `REJECT_OR_REPROCESS` |

---

## 11. GSTR-1 Draft Eligibility Classification

| GSTR-1 Mapping Table | Invoices Mapped | Ineligible / Excluded | Key Rationale |
| :--- | :--- | :--- | :--- |
| **Table 4A (B2B)** | 12 | 0 | Valid seller & buyer GSTIN, clean validation |
| **Table 7 (B2C)** | 3 | 0 | Legitimate B2C (`INV_MISS_001..003`), null buyer GSTIN |
| **Excluded / Rejected** | 0 | 10 | 3 Invalid math (`INV_INV_*`) + 4 Noisy + 3 Rotated |
| **Total Admitted** | **15 / 25 (60.0%)** | **10 / 25 (40.0%)** | **100% GSTR-1 admission classification accuracy against the defined synthetic benchmark ground truth** |

---

## 12. Inference Latency & Token Usage Telemetry

### A. Local LLM Wall-Clock Inference Latency

*Measured strictly around the local Ollama HTTP inference call on Apple Silicon M1 (8GB unified memory):*

| Latency Metric | Measured Duration (ms) | Measured Duration (seconds) |
| :--- | :--- | :--- |
| **Mean Latency** | **7,111.86 ms** | ~7.11 s |
| **Median Latency** | **6,410.74 ms** | ~6.41 s |
| **P95 Latency** | **10,169.39 ms** | ~10.17 s |
| **Minimum Latency** | **5,767.43 ms** | ~5.77 s |
| **Maximum Latency** | **10,687.83 ms** | ~10.69 s |

### B. Token Usage Telemetry

*Collected directly from Ollama response metadata (`prompt_eval_count`, `eval_count`):*

| Metric | Measured Value |
| :--- | :--- |
| Mean Input Prompt Tokens | 832.2 tokens / invoice |
| Mean Output Completion Tokens | 322.8 tokens / invoice |
| Total Recorded Tokens (25 Invoices) | 28,874 tokens |

---

## 13. Financial Cost Analysis

- **API / Cloud Inference Cost:** **₹0.00**
- **Credit Card Required:** **None**
- **Cost Statement:**
  > *"API/inference service cost for the experiment was ₹0 because inference was executed locally using an open-source model. Local electricity and hardware costs were not separately measured."*

---

## 14. Comprehensive Provider Comparison Matrix

| Metric / Dimension | Phase 10 Mock Baseline | Local Real LLM (`Qwen2.5 1.5B`) | Cloud Gemini (`gemini-3.8-flash`) | Cloud OpenAI (`gpt-4o-mini`) |
| :--- | :--- | :--- | :--- | :--- |
| **Provider Status** | `ACTIVE (MOCK)` | `EMPIRICALLY_EVALUATED` | `BLOCKED (403)` | `NOT_CONFIGURED` |
| **Invoices Attempted** | 25 / 25 | **25 / 25** | 0 / 25 | 0 / 25 |
| **Schema Validity** | 100.0% (25/25) | **100.0% (25/25)** | NOT MEASURED | NOT MEASURED |
| **Invoice Number Accuracy** | 76.0% (19/25) | **76.0% (19/25)** | NOT MEASURED | NOT MEASURED |
| **Invoice Date Accuracy** | 100.0% (25/25) | **100.0% (25/25)** | NOT MEASURED | NOT MEASURED |
| **Seller GSTIN Accuracy** | 72.0% (18/25) | **72.0% (18/25)** | NOT MEASURED | NOT MEASURED |
| **Buyer GSTIN Accuracy** | 72.0% (18/25) | **72.0% (18/25)** | NOT MEASURED | NOT MEASURED |
| **Taxable Value Accuracy** | 84.0% (21/25) | **84.0% (21/25)** | NOT MEASURED | NOT MEASURED |
| **CGST Accuracy** | 72.0% (18/25) | **80.0% (20/25)** | NOT MEASURED | NOT MEASURED |
| **SGST Accuracy** | 60.0% (15/25) | **80.0% (20/25)** | NOT MEASURED | NOT MEASURED |
| **IGST Accuracy** | 100.0% (25/25) | **100.0% (25/25)** | NOT MEASURED | NOT MEASURED |
| **Grand Total Accuracy** | 84.0% (21/25) | **84.0% (21/25)** | NOT MEASURED | NOT MEASURED |
| **Line Item Count Accuracy**| 76.0% (19/25) | **100.0% (25/25)** | NOT MEASURED | NOT MEASURED |
| **B2C Null False-Fill Rate**| 0.0% (0/3) | **0.0% (0/3)** | NOT MEASURED | NOT MEASURED |
| **TOTAL-001 Detection** | 3 / 3 (100.0%) | **3 / 3 (100.0%)** | NOT MEASURED | NOT MEASURED |
| **HIGH Confidence Count** | 15 | **15** | NOT MEASURED | NOT MEASURED |
| **GSTR-1 Admitted** | 15 | **15** | NOT MEASURED | NOT MEASURED |
| **Mean Inference Latency** | 0.35 ms | **7,111.86 ms** | NOT MEASURED | NOT MEASURED |
| **P95 Inference Latency** | 1.62 ms | **10,169.39 ms** | NOT MEASURED | NOT MEASURED |
| **Direct API Cost** | ₹0.00 | **₹0.00** | NOT BILLED | NOT BILLED |

---

## 15. Generated Phase 5 Evaluation Artifacts

All empirical results are archived in `data/outputs/phase5/`:
- [`phase5_llm_results.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_llm_results.csv) — Per-invoice empirical extraction, validation, confidence, and provenance records.
- [`phase5_field_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_field_metrics.csv) — Field-by-field accuracy comparison.
- [`phase5_numeric_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_numeric_metrics.csv) — Exact match and ₹1.00 tolerance metrics.
- [`phase5_gstin_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_gstin_metrics.csv) — Seller/buyer GSTIN integrity and B2C null preservation.
- [`phase5_hallucination_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_hallucination_metrics.csv) — False-fill rate across ground-truth null fields.
- [`phase5_validation_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_validation_metrics.csv) — Pass/fail counts and arithmetic firewall metrics.
- [`phase5_confidence_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_confidence_metrics.csv) — Distribution across HIGH, MEDIUM, LOW tiers.
- [`phase5_gstr1_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_gstr1_metrics.csv) — Table 4A/7 admission and exclusion metrics.
- [`phase5_latency_metrics.csv`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_latency_metrics.csv) — Mean, median, P95, min, max inference latency.
- [`phase5_summary.json`](file:///Users/srirampaila/Desktop/TT%20project/data/outputs/phase5/phase5_summary.json) — Machine-readable summary payload.

---

## 16. Scientific Limitations & Threats to Validity

1. **Synthetic Benchmark Scope:** Evaluated on 25 canonical synthetic invoices. Production deployment across thousands of diverse physical tax layouts may encounter domain shifts.
2. **Local Hardware Constraints:** Running on 8 GB Apple M1 required a compact 1.5B parameter model (`qwen2.5:1.5b`). Larger models (e.g., Qwen 7B/14B or Llama 3 8B) may offer higher OCR typo resilience at the cost of higher memory and inference latency.
3. **No Direct GST Filing:** The system prepares and validates draft GSTR-1 payloads; official government filing requires authenticated GSTN portal APIs and digital signatures (DSC/EVC).

---

## 17. Final Phase 5 Classification

**Final Status:** 🟢 **PHASE 5 — REAL LLM EMPIRICAL VALIDATION COMPLETE (ZERO-COST LOCAL LLM)**

> *"On the 25-invoice synthetic benchmark, the locally hosted Qwen2.5 model achieved 100% schema validity, 0/3 false fills on tested B2C buyer GSTIN null fields, and 100% arithmetic error detection when coupled with the downstream deterministic validation firewall, incurring ₹0 in API costs."*
