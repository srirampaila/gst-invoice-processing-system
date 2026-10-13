# Phase 7 Implementation Plan — Confidence Scoring & Human Review Workflow

## 1. Overview and Objective
Phase 7 implements a **transparent, multi-factor deterministic confidence scoring engine and human-review decision workflow** for AI-processed GST invoices. 

The core architectural principle:
> **The system must NEVER claim that an invoice is trustworthy merely because the LLM produced valid JSON.**
> Phase 6 deterministic validation remains the ultimate financial and regulatory authority.

---

## 2. Current Architecture & Existing Signals
Phase 1–6 components provide rich diagnostic evidence:
1. **OCR Pipeline (Phase 3 & 4):**
   - `average_confidence` (0–100%) from Tesseract
   - Preprocessing artifacts and noise indicators
2. **LLM Extraction Layer (Phase 5):**
   - `CanonicalInvoice` schema 
   - `ExtractionMetadata.confidence` (0.0–1.0)
   - `ExtractionMetadata.warnings`
3. **Deterministic Validation Engine (Phase 6):**
   - `ValidationResult.status` (`PASS`, `WARNING`, `FAIL`)
   - `ValidationResult.error_count` & `warning_count`
   - `ValidationResult.issues` (`ValidationIssue` list with `rule_id`, `severity`, `expected`, `actual`, `message`)
   - `ValidationResult.seller_gstin_result` & `buyer_gstin_result`
   - `CalculatedFinancials` (exact item sum, CGST/SGST/IGST recalculations, grand total discrepancy)

---

## 3. Confidence Scoring Architecture

### 3.1 Multi-Factor Component Scores (0–100)
The engine evaluates 6 distinct components:

| Factor | Description | Default Weight | Key Inputs |
| :--- | :--- | :---: | :--- |
| **`ocr_quality`** | Character & word recognition certainty | **15% (0.15)** | OCR `average_confidence`, noise markers |
| **`field_completeness`** | Presence of core and contextual fields | **15% (0.15)** | Seller name/address, buyer name/address, POS, items count |
| **`critical_fields`** | Mandatory fields required for legal validity | **20% (0.20)** | Invoice number, invoice date, seller GSTIN, grand total |
| **`gst_validation`** | Structural & checksum validity of GSTINs | **20% (0.20)** | `GSTIN-001`, `GSTIN-002`, `GSTIN-003`, `STATE-001` |
| **`financial_validation`**| Recomputed tax arithmetic & total reconciliation | **20% (0.20)** | `TOTAL-001`, `MATH-001`, `TAX-*`, discrepancies |
| **`line_item_quality`** | Internal consistency of item rates & values | **10% (0.10)** | Item description, unit price, quantity, taxable value |

### 3.2 Scoring Formula
$$\text{Base Score} = \sum_{i=1}^{N} \left( \text{Factor Score}_i \times \text{Weight}_i \right)$$

$$\text{Penalty Deductions} = (\text{Error Count} \times 15) + (\text{Warning Count} \times 5)$$

$$\text{Calculated Score} = \max\left(0.0, \min\left(100.0, \text{Base Score} - \text{Penalty Deductions}\right)\right)$$

### 3.3 Confidence Tiers & Recommendations
- **`HIGH`** ($\ge 85.0$ and zero critical overrides): eligible for `AUTO_ACCEPT`.
- **`MEDIUM`** ($60.0 \le \text{Score} < 85.0$): `REVIEW_REQUIRED`.
- **`LOW`** ($< 60.0$ or severe critical failures): `REVIEW_REQUIRED` or `REJECT_OR_REPROCESS`.

---

## 4. Critical Safety Overrides (Non-Negotiable Guardrails)
Regardless of the numerical score, hard safety rules cap confidence and force human review:

1. **`OVERRIDE_FINANCIAL_ERROR`**: If any arithmetic/tax error exists (e.g., `TOTAL-001`, `MATH-001`, `TAX-*`), confidence tier **cannot be HIGH**, `requires_review = True`, and recommendation cannot be `AUTO_ACCEPT`.
2. **`OVERRIDE_MISSING_INVOICE_NUMBER`**: If `invoice_number` is missing, confidence capped at `LOW`, `requires_review = True`.
3. **`OVERRIDE_MISSING_INVOICE_DATE`**: If `invoice_date` is missing, confidence capped at `LOW`, `requires_review = True`.
4. **`OVERRIDE_INVALID_SELLER_GSTIN`**: If seller GSTIN fails regex/format checks (`GSTIN-001`), confidence capped at `LOW`, `requires_review = True`.
5. **`OVERRIDE_SEVERE_OCR`**: If OCR confidence $< 50.0\%$, recommendation is `REJECT_OR_REPROCESS` or `REVIEW_REQUIRED`, cannot `AUTO_ACCEPT`.
6. **`OVERRIDE_MULTIPLE_CRITICAL_ERRORS`**: If $\ge 2$ errors exist, recommendation is set to `REJECT_OR_REPROCESS`.

---

## 5. Human Review Workflow & Data Integrity
1. **Original Invoice Immutability:** The original `CanonicalInvoice` is strictly read-only and never modified during review.
2. **`ReviewRecord` Schema:** Tracks the review lifecycle (`PENDING_REVIEW`, `APPROVED`, `REJECTED`, `REPROCESS_REQUIRED`) with timestamp, reviewer notes, and action logs.
3. **Audit Trail:** Review decisions and manual overrides are persisted to `data/outputs/confidence/reviews/`.

---

## 6. Implementation Phases & Deliverables
1. **Module Creation (`src/confidence/`):**
   - `config.py`, `models.py`, `rules.py`, `scoring.py`, `service.py`, `exceptions.py`
2. **Batch Processing Utility (`src/utils/process_confidence_batch.py`):**
   - Evaluates all 25 canonical invoices, generates JSONs, CSV reports, and batch metrics.
3. **Streamlit UI Integration (`app/dashboard.py`):**
   - Dedicated "Confidence & Review" tab with factor visualization, override alerts, and interactive review action buttons.
4. **Comprehensive Unit Testing (`tests/test_confidence.py`):**
   - 20+ unit tests covering clean, noisy, rotated, invalid math, missing fields, and edge cases.
5. **Documentation & Handoff:**
   - `docs/PHASE_7_CONFIDENCE_AND_REVIEW.md` and `README.md` updates.
