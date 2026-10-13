# Phase 8 Implementation Plan — GSTR-1 Draft Generation

## 1. Objective & Scope

Phase 8 implements the **GSTR-1 Draft Data Generation and Export Engine**, converting eligible, validated canonical invoices into normalized GSTR-1 draft tables for review, audit, and structured CSV/Excel export.

### Strict Boundary Statement:
> **THIS IS A DRAFT / PREPARATION SYSTEM ONLY.**
> System designation: **"GSTR-1 Draft — Not Filed"**.
> Strictly out of scope: GST portal authentication, CAPTCHA/OTP solving, automated tax submission, and government API interactions.

---

## 2. Upstream Artifacts & Data Lineage

The GSTR-1 generator consumes three validated data layers without mutating any source records:

```
┌──────────────────────────────────────────────────────────┐
│ CanonicalInvoice (Phase 5 Canonical Schema)              │
│ - invoice_number, invoice_date, place_of_supply, items   │
│ - seller.gstin, buyer.gstin, tax_summary, grand_total    │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ ValidationResult (Phase 6 Deterministic Validation)      │
│ - status (PASS/WARNING/FAIL), error_count, issues        │
│ - calculated_values (calculated_item_taxable_sum, taxes) │
│ - seller_gstin_result, buyer_gstin_result                │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ ConfidenceResult & ReviewRecord (Phase 7 Engine)         │
│ - confidence_score, confidence_tier (HIGH/MEDIUM/LOW)    │
│ - recommendation (AUTO_ACCEPT/REVIEW/REPROCESS)          │
│ - review_status (PENDING_REVIEW/APPROVED/REJECTED)       │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ GSTR-1 Eligibility Gate & Mapper (Phase 8)               │
│ - B2B Invoices ──> GSTR-1 Table 4A                       │
│ - B2C Invoices ──> GSTR-1 Table 7                        │
│ - Ineligible   ──> Exclusions Report                     │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Eligibility Gate Criteria

An invoice is admitted into GSTR-1 draft generation if and only if:
1. **Decision Gate:**
   - `review_status == "APPROVED"` **OR**
   - (`confidence_tier == "HIGH"` **AND** `recommendation == "AUTO_ACCEPT"`)
2. **Validation Integrity Gate:**
   - Zero critical validation errors (`ValidationResult.error_count == 0` for arithmetic, tax rates, mandatory fields, and GSTIN format).
   - Absolute exclusion of `TOTAL-001`, `MATH-001`, `TAX-*`, `FIELD-001`, `FIELD-002`, `FIELD-003`, `GSTIN-001` failures.
3. **Exclusion Handling:**
   - Invoices in `REJECTED` or `REPROCESS_REQUIRED` state, or with confidence tier `LOW` / recommendation `REJECT_OR_REPROCESS`, are strictly excluded.
   - Every excluded invoice is recorded in `GSTR1ExclusionRecord` with explicit exclusion reasons, validation status, and triggered rules.

---

## 4. GSTR-1 Classification & Mapping Rules

### 4.1 B2B Transactions (Table 4A — Taxable outward supplies to registered persons)
- **Condition:** Buyer GSTIN is present, structurally valid, and 15 characters long.
- **Target Schema:** `GSTR1B2BInvoice`
- **Field Mappings:**
  - `recipient_gstin`: Extracted `buyer.gstin`
  - `recipient_name`: Extracted `buyer.name`
  - `invoice_number`: Extracted `invoice_number` (exact string preserved)
  - `invoice_date`: Formatted `YYYY-MM-DD`
  - `invoice_value`: Validated `grand_total` (or calculated grand total)
  - `place_of_supply`: Validated state code & name (e.g. `"27-Maharashtra"`)
  - `reverse_charge`: Default `"N"`
  - `invoice_type`: `"Regular"`
  - `taxable_value`: Validated `taxable_value`
  - `rate`: Applicable tax rate (e.g. `18.0%`) derived from line items / tax ratios
  - `cgst_amount`: Validated `cgst`
  - `sgst_amount`: Validated `sgst`
  - `igst_amount`: Validated `igst`
  - `source_invoice_id`: Full source traceability ID

### 4.2 B2C Transactions (Table 7 — Taxable outward supplies to unregistered persons)
- **Condition:** Buyer GSTIN is absent / None / blank (or unregistered).
- **Target Schema:** `GSTR1B2CSInvoice`
- **Field Mappings:**
  - `place_of_supply`: Validated `place_of_supply`
  - `invoice_number`: Extracted `invoice_number`
  - `invoice_date`: Formatted `YYYY-MM-DD`
  - `invoice_value`: Validated `grand_total`
  - `taxable_value`: Validated `taxable_value`
  - `rate`: Applicable tax rate
  - `cgst_amount`: Validated `cgst`
  - `sgst_amount`: Validated `sgst`
  - `igst_amount`: Validated `igst`
  - `source_invoice_id`: Lineage key
  - Note: Buyer GSTIN remains strictly `None` / empty (no fabrication).

---

## 5. GSTR-1 Deterministic Validation Rules

Before exporting, every generated draft row is verified by `GSTR1Validator`:
- **`GSTR1-001`**: Mandatory Invoice Number present and non-empty.
- **`GSTR1-002`**: Mandatory Invoice Date formatted as `YYYY-MM-DD`.
- **`GSTR1-003`**: Mandatory Place of Supply populated.
- **`GSTR1-004`**: B2B Recipient GSTIN strictly valid 15-character format.
- **`GSTR1-005`**: B2C Recipient GSTIN strictly absent / blank.
- **`GSTR1-006`**: Taxable Value $> 0$ and non-negative.
- **`GSTR1-007`**: Invoice Value equals Taxable Value + CGST + SGST + IGST (within ₹1.00 tolerance).
- **`GSTR1-008`**: Tax rate consistency ($\text{Rate} \approx (\text{Taxes} / \text{Taxable}) \times 100$).
- **`GSTR1-009`**: Intra-state vs Inter-state tax allocation matches POS.
- **`GSTR1-010`**: Source invoice lineage key present and unique (no duplicate rows).

---

## 6. Export Architecture & Artifacts

Export outputs will be written to `data/outputs/gstr1/`:
1. `gstr1_draft.csv`: Unified tabular export of all admitted records.
2. `b2b_table_4a.csv`: Standardized B2B Table 4A format.
3. `b2c_table_7.csv`: Standardized B2C Table 7 format.
4. `exclusions.csv`: Comprehensive catalog of excluded invoices with rejection reasons.
5. `validation_report.csv`: GSTR-1 rule verification audit log.
6. `gstr1_draft.xlsx`: Formatted multi-sheet Excel workbook (`Summary`, `B2B_Table_4A`, `B2C_Table_7`, `Exclusions`, `Validation_Report`) with numeric cell types.
7. `summary.json`: Top-level aggregate metrics.

---

## 7. Implementation Deliverables

1. **`src/gst/exceptions.py`**: GSTR-1 domain exceptions.
2. **`src/gst/gstr1_models.py`**: Pydantic schemas for B2B, B2C, Exclusions, and GSTR1Draft.
3. **`src/gst/gstr1_mapper.py`**: Deterministic mapper from canonical models to GSTR-1 draft records.
4. **`src/gst/gstr1_validator.py`**: Rule-based GSTR-1 validator.
5. **`src/gst/gstr1_generator.py`**: Generator orchestrator.
6. **`src/gst/__init__.py`**: Module exports.
7. **`src/export/gstr1_csv.py` & `src/export/gstr1_excel.py`**: CSV and Excel export generators.
8. **`src/utils/process_gstr1_batch.py`**: Batch generator for the 25-invoice suite.
9. **`tests/test_gstr1.py`**: 24+ unit tests covering classification, mapping, validation, and exports.
10. **`app/dashboard.py`**: Added `"📑 GSTR-1 Draft (Phase 8)"` tab with summary cards, tables, traceability inspection, and download buttons.
11. **`docs/PHASE_8_GSTR1_DRAFT_GENERATION.md` & `README.md` updates**.
