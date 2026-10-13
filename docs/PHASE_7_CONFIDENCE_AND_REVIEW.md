# Phase 7 — Confidence Scoring & Human Review Workflow

## 1. Objective

The primary objective of Phase 7 is to combine diagnostic signals from:
1. **OCR / Recognition certainty** (`average_confidence`)
2. **Field completeness** (contextual and structural entities)
3. **Critical mandatory fields** (invoice number, date, seller GSTIN, total)
4. **GST regulatory validation** (GSTIN structure, state consistency, checksums)
5. **Deterministic financial arithmetic** (taxable sum, CGST/SGST/IGST recalculations, grand total reconciliation)
6. **Line item quality** (descriptions, unit prices, item quantities, and rate matching)

into a **transparent, deterministic confidence score (0–100)** and an **actionable human-review decision workflow**.

### Core Architecture Principle
> **The system must NEVER claim that an invoice is trustworthy merely because the LLM produced valid JSON.**
> Phase 6 deterministic validation remains the non-negotiable financial and regulatory authority.

---

## 2. System Architecture

```
                                CanonicalInvoice (Extracted JSON)
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │   Deterministic Validation      │
                               │  (Phase 6 ValidationService)    │
                               └────────────────┬────────────────┘
                                                │
                          ┌─────────────────────┴─────────────────────┐
                          │ ValidationResult (Issues, Calculations)   │
                          │ OCR Metadata (Confidence, Noise metrics)  │
                          │ CanonicalInvoice                          │
                          └─────────────────────┬─────────────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │       ConfidenceService         │
                               │   (src/confidence/service.py)   │
                               └────────────────┬────────────────┘
                                                │
              ┌─────────────────────────────────┼─────────────────────────────────┐
              │                                 │                                 │
              ▼                                 ▼                                 ▼
   ┌──────────────────────┐          ┌──────────────────────┐          ┌──────────────────────┐
   │ Multi-Factor Scoring │          │ Penalty Deductions   │          │ Hard Safety          │
   │ (scoring.py)         │          │ (-15/error, -5/warn) │          │ Overrides (rules.py) │
   └──────────┬───────────┘          └──────────┬───────────┘          └──────────┬───────────┘
              │                                 │                                 │
              └─────────────────────────────────┼─────────────────────────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │        ConfidenceResult         │
                               │  - Overall Score (0-100)        │
                               │  - Tier: HIGH / MEDIUM / LOW    │
                               │  - Rec: AUTO_ACCEPT / REVIEW    │
                               │  - Factor Breakdown & Overrides │
                               └────────────────┬────────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │       ReviewRecord Model        │
                               │  - PENDING_REVIEW / APPROVED    │
                               │  - REJECTED / REPROCESS_REQ     │
                               │  - Immutable Invoice Preserved  │
                               └─────────────────────────────────┘
```

---

## 3. Confidence Factors & Configured Weights

The scoring engine evaluates six independent dimensions, summing to exactly 1.00 weight:

| Factor Name | Weight | Evaluation Dimension | Source Inputs |
| :--- | :---: | :--- | :--- |
| **`ocr_quality`** | **15% (0.15)** | Character recognition certainty & noise levels | Tesseract OCR `average_confidence` |
| **`field_completeness`** | **15% (0.15)** | Presence of standard non-critical contextual entities | Seller name/address, buyer name/address, POS, items presence |
| **`critical_fields`** | **20% (0.20)** | Mandatory legal tax invoice fields | `invoice_number`, `invoice_date`, `seller.gstin`, `grand_total` |
| **`gst_validation`** | **20% (0.20)** | GSTIN format validity, state mapping, and checksums | `GSTINValidationResult` (Seller & Buyer), `STATE-001` |
| **`financial_validation`** | **20% (0.20)** | Mathematical reconciliation of line items, taxes, & total | `CalculatedFinancials`, `TOTAL-001`, `MATH-001`, `TAX-*` |
| **`line_item_quality`** | **10% (0.10)** | Consistency of descriptions, unit rates, quantities | `InvoiceItem` attributes |

---

## 4. Scoring Formula & Deductions

1. **Factor Contribution:**
   $$\text{Base Score} = \sum_{i=1}^{6} \left( \text{Factor Score}_i \times \text{Weight}_i \right)$$

2. **Validation Penalties:**
   $$\text{Penalties} = (\text{error\_count} \times 15.0) + (\text{warning\_count} \times 5.0)$$

3. **Composite Bounded Score:**
   $$\text{Overall Score} = \max\left(0.0, \min\left(100.0, \text{Base Score} - \text{Penalties}\right)\right)$$

---

## 5. Confidence Tiers & Decision Thresholds

| Confidence Tier | Minimum Score | Default Recommendation | Required Human Action |
| :--- | :---: | :--- | :--- |
| **`HIGH`** | $\ge 85.0$ | `AUTO_ACCEPT` | No review required (if 0 safety overrides) |
| **`MEDIUM`** | $\ge 60.0 \text{ and } < 85.0$ | `REVIEW_REQUIRED` | Human auditor inspection & sign-off |
| **`LOW`** | $< 60.0$ | `REJECT_OR_REPROCESS` / `REVIEW_REQUIRED` | Flagged for manual correction or rescanning |

---

## 6. Critical Safety Overrides (Hard Guardrails)

Regardless of the numerical composite score, safety rules override the tier and force human review:

| Override Rule | Trigger Condition | Override Effect |
| :--- | :--- | :--- |
| **`OVERRIDE_FINANCIAL_ERROR`** | Any validation error in arithmetic/taxes (`TOTAL-001`, `MATH-001`, `TAX-*`) | Confidence tier **cannot be HIGH**; `requires_review = True`; recommendation cannot be `AUTO_ACCEPT` |
| **`OVERRIDE_TOTAL_001_FAILED`** | Grand total fails reconciliation | Capped to **`LOW`** tier; `requires_review = True`; forced manual review |
| **`OVERRIDE_MISSING_INVOICE_NUMBER`** | `invoice_number` is missing or empty | Capped to **`LOW`** tier; `requires_review = True` |
| **`OVERRIDE_MISSING_INVOICE_DATE`** | `invoice_date` is missing or invalid | Capped to **`LOW`** tier; `requires_review = True` |
| **`OVERRIDE_INVALID_SELLER_GSTIN`** | Seller GSTIN missing or format invalid | Capped to **`LOW`** tier; `requires_review = True` |
| **`OVERRIDE_DEGRADED_OCR`** | OCR confidence $< 65.0\%$ | Recommendation cannot be `AUTO_ACCEPT`; forced review |
| **`OVERRIDE_SEVERE_OCR_FAILURE`** | OCR confidence $< 40.0\%$ | Capped to **`LOW`** tier; recommendation = `REJECT_OR_REPROCESS` |
| **`OVERRIDE_MULTIPLE_CRITICAL_ERRORS`**| Validation error count $\ge 2$ | Capped to **`LOW`** tier; recommendation = `REJECT_OR_REPROCESS` |
| **`OVERRIDE_WARNINGS_DETECTED`** | Validation warning count $> 0$ | `requires_review = True`; recommendation = `REVIEW_REQUIRED` |

---

## 7. Human Review State Machine & Immutability

### Review Status States:
- `PENDING_REVIEW`: Default initial state awaiting human auditor review.
- `APPROVED`: Authoritative manual approval by human reviewer.
- `REJECTED`: Authoritative manual rejection.
- `REPROCESS_REQUIRED`: Flagged for upstream rescanning, deskewing, or re-extraction.

### Data Immutability:
- The extracted `CanonicalInvoice` is **strictly immutable** and is never modified during review.
- Review actions, timestamps, justifications, and notes are tracked in a distinct `ReviewRecord` audit trail.

---

## 8. Benchmark Evaluation on 25-Invoice Dataset

All 25 canonical invoices from Phase 5/6 were processed through the Phase 7 Confidence Engine:

| Invoice Category | Invoices | Avg Score | HIGH | MEDIUM | LOW | Decisions (AUTO / REVIEW / REPROCESS) | Key Findings & Overrides Triggered |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **CLEAN** | 5 | 96.1 | 5 | 0 | 0 | 5 / 0 / 0 | 100% clean passes; OCR $\approx 86\%$, full reconciliation, `AUTO_ACCEPT`. |
| **DUPLICATE** | 2 | 96.1 | 2 | 0 | 0 | 2 / 0 / 0 | Valid syntax & arithmetic; confidence high at individual invoice level. |
| **INVALID MATH** | 3 | 67.0 | 0 | 0 | 3 | 0 / 3 / 0 | **100% detected & capped to LOW** via `OVERRIDE_TOTAL_001_FAILED` (₹500 discrepancy). |
| **MISSING FIELDS** | 3 | 95.8 | 3 | 0 | 0 | 3 / 0 / 0 | B2C transactions with valid math and optional buyer GSTIN safely accepted. |
| **MULTI ITEM** | 5 | 95.6 | 5 | 0 | 0 | 5 / 0 / 0 | 5-item invoices with full item descriptions and tax reconciliation $\rightarrow$ `AUTO_ACCEPT`. |
| **NOISY** | 4 | 34.7 | 0 | 0 | 4 | 0 / 0 / 4 | Corrupted characters & invalid seller GSTIN $\rightarrow$ `REJECT_OR_REPROCESS` (Overrides: 3). |
| **ROTATED** | 3 | 12.7 | 0 | 0 | 3 | 0 / 0 / 3 | Missing mandatory fields & severe OCR failure $\rightarrow$ `REJECT_OR_REPROCESS` (Overrides: 3-5). |
| **TOTAL** | **25** | **72.6** | **15 (60.0%)** | **0 (0.0%)** | **10 (40.0%)** | **15 / 3 / 7** | **Zero false acceptances of invalid/corrupted invoices.** |

---

## 9. Comprehensive Test Suite

All 62 unit and integration tests pass cleanly:

```bash
.venv/bin/pytest
======================== 62 passed, 2 warnings in 1.63s ========================
```

Key test scenarios in `tests/test_confidence.py`:
1. High-confidence clean invoice auto-acceptance
2. Missing invoice number override capping tier to LOW
3. Missing invoice date override capping tier to LOW
4. Invalid seller GSTIN override capping tier to LOW
5. Invalid buyer GSTIN review requirement
6. Financial validation failure forbidding AUTO_ACCEPT
7. TOTAL-001 failure forcing LOW tier and review
8. Degraded/severe OCR confidence overrides
9. Missing line items factor score penalty
10. Valid B2C missing buyer GSTIN handling
11. Multiple validation errors triggering REJECT_OR_REPROCESS
12. Score boundary validation ($0.0 \le \text{score} \le 100.0$)
13. HIGH tier prevention on arithmetic failure
14. Warning review trigger enforcement
15. Reviewer APPROVE action
16. Reviewer REJECT action
17. Reviewer REQUEST_REPROCESSING action
18. Canonical invoice immutability verification
19. Pydantic schema validation
20. Configuration and weights validation

---

## 10. Dashboard UI Integration

The Streamlit web application (`app/dashboard.py`) features a dedicated primary tab:
- **`⚖️ Confidence & Human Review (Phase 7)`**
  - Metric cards for overall score, tier badge, system recommendation, and current review status.
  - Interactive visual progress meter for confidence.
  - Multi-factor score breakdown table with weights and human-readable reasons.
  - Safety overrides callout table detailing triggered risk rules.
  - Human review action panel with note input and `Approve`, `Reject`, `Request Reprocessing` action buttons with persistent JSON audit trail.

---

## 11. Known Limitations & Phase 8 Handoff

### Known Limitations:
1. **Duplicate Detection:** Batch-level duplicate detection across historical invoices is handled at database/batch level, not single-invoice confidence scoring.
2. **Phase 5 Real LLM:** Phase 5 remains intentionally paused and will be completed at the end of the roadmap.

### Phase 8 Readiness:
Phase 7 outputs (`ConfidenceResult` + `ReviewRecord`) provide complete authority for Phase 8 GSTR-1 draft generation:
- Only invoices with `review_status == "APPROVED"` or `confidence_tier == "HIGH"` & `recommendation == "AUTO_ACCEPT"` will be permitted into GSTR-1 tables (B2B Table 4A, B2CS Table 7).
