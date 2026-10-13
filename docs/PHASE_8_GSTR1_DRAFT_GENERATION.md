# Phase 8 — GSTR-1 Draft Data Generation & Export Engine

## 1. Objective

The primary objective of Phase 8 is to transform verified, eligible canonical invoice records into standardized **GSTR-1 draft datasets** suitable for accounting review, statutory audit, and structured CSV / Excel export.

### Strict Scope Boundary & Legal Disclaimer
> **THIS IS A DRAFT / PREPARATION SYSTEM ONLY.**
> **System Designation:** `"GSTR-1 DRAFT — NOT FILED"`
> **Disclaimer:** *This system prepares GSTR-1 draft data only. It does not file returns with the GST portal, perform portal logins, solve CAPTCHAs/OTPs, or submit government API payloads.*

---

## 2. End-to-End Data Lineage Architecture

The GSTR-1 engine maintains strict provenance and complete traceability from the original invoice scan to the final statutory return draft row:

```
┌────────────────────────────────────────────────────────┐
│ Raw Invoice Image / PDF Scan (Phase 2 Dataset)         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ OpenCV Preprocessed Image + Tesseract OCR Text (Ph 3/4)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ CanonicalInvoice Structured Extraction (Phase 5)       │
│ - invoice_number, invoice_date, seller, buyer, totals  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Deterministic Validation (Phase 6 ValidationService)   │
│ - Zero financial errors, GSTIN validation, math checks │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Confidence & Human Review Engine (Phase 7 Engine)      │
│ - ConfidenceResult (score >= 85.0 -> AUTO_ACCEPT)      │
│ - ReviewRecord (APPROVED / PENDING_REVIEW / REJECTED)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Phase 8 GSTR-1 Eligibility Gate & Mapper               │
│ - B2B Invoices (Buyer GSTIN present) ──> Table 4A      │
│ - B2C Invoices (Buyer GSTIN absent)  ──> Table 7       │
│ - Ineligible / Incomplete            ──> Exclusions    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Multi-Format Exports (CSV + Multi-Sheet XLSX)          │
│ - gstr1_draft.csv, b2b_table_4a.csv, b2c_table_7.csv   │
│ - exclusions.csv, validation_report.csv, .xlsx         │
└────────────────────────────────────────────────────────┘
```

---

## 3. Strict Eligibility Gate

An invoice is admitted into GSTR-1 draft generation if and only if:
1. **Decision Gate:**
   - `review_status == "APPROVED"` **OR**
   - (`confidence_tier == "HIGH"` **AND** `recommendation == "AUTO_ACCEPT"`)
2. **Validation Integrity Gate:**
   - Zero critical validation errors (`error_count == 0` for arithmetic, tax rates, mandatory fields, and GSTIN format).
   - Absolute exclusion of `TOTAL-001`, `MATH-001`, `TAX-*`, `FIELD-001`, `FIELD-002`, `FIELD-003`, `GSTIN-001` failures.
3. **Exclusion Handling:**
   - Invoices in `REJECTED` or `REPROCESS_REQUIRED` state, or with confidence tier `LOW` / recommendation `REJECT_OR_REPROCESS`, are strictly excluded.
   - Every excluded invoice is recorded in `GSTR1ExclusionRecord` with explicit diagnostic reasons, validation status, and triggered rules.

---

## 4. GSTR-1 Classification & Field Mapping

### 4.1 Table 4A: B2B Taxable Supplies to Registered Persons
- **Trigger:** Buyer GSTIN is present and structurally valid.
- **Model:** `GSTR1B2BInvoice`
- **Field Schema:**
  - `source_invoice_id`: Source invoice tracking ID (e.g. `INV_CLEAN_001`)
  - `recipient_gstin`: Validated buyer GSTIN (e.g. `27AAACB1234A1Z5`)
  - `recipient_name`: Trade / Legal name of recipient
  - `invoice_number`: Exact extracted invoice number
  - `invoice_date`: Normalized `YYYY-MM-DD` date
  - `invoice_value`: Validated gross grand total (INR)
  - `place_of_supply`: Standard state code & name (e.g. `27-Maharashtra`)
  - `reverse_charge`: Default `"N"`
  - `invoice_type`: `"Regular"`
  - `taxable_value`: Validated net taxable value
  - `rate`: Applicable tax rate percentage (e.g. `18.0%`)
  - `cgst_amount`: Validated Central GST
  - `sgst_amount`: Validated State/UT GST
  - `igst_amount`: Validated Integrated GST
  - `cess_amount`: Default `0.0`

### 4.2 Table 7: B2C Small Supplies to Unregistered Persons
- **Trigger:** Buyer GSTIN is absent / None (or unregistered).
- **Model:** `GSTR1B2CSInvoice`
- **Field Schema:**
  - `source_invoice_id`: Lineage tracking ID
  - `place_of_supply`: Standard state code & name
  - `invoice_number`: Extracted invoice number
  - `invoice_date`: Normalized `YYYY-MM-DD` date
  - `invoice_value`: Validated gross grand total
  - `taxable_value`: Validated net taxable value
  - `rate`: Applicable tax rate percentage
  - `cgst_amount`: Validated Central GST
  - `sgst_amount`: Validated State/UT GST
  - `igst_amount`: Validated Integrated GST
  - Note: Buyer GSTIN is strictly omitted (no fabricated GSTINs).

---

## 5. GSTR-1 Deterministic Validation Rules

Before export generation, every generated draft record is verified against statutory rules in `src/gst/gstr1_validator.py`:

| Rule ID | Category | Severity | Description & Condition |
| :--- | :--- | :---: | :--- |
| **`GSTR1-001`** | Core Field | `ERROR` | Mandatory invoice number present and non-empty. |
| **`GSTR1-002`** | Core Field | `ERROR` | Invoice date strictly formatted as `YYYY-MM-DD`. |
| **`GSTR1-003`** | Tax/State | `ERROR` | Place of supply present and non-empty. |
| **`GSTR1-004`** | B2B GSTIN | `ERROR` | Recipient GSTIN strictly valid 15-character alphanumeric format. |
| **`GSTR1-005`** | B2C GSTIN | `ERROR` | Recipient GSTIN strictly absent for B2C records. |
| **`GSTR1-006`** | Financial | `ERROR` | Taxable and invoice values are strictly non-negative. |
| **`GSTR1-007`** | Arithmetic | `ERROR` | $\text{Invoice Value} = \text{Taxable} + \text{CGST} + \text{SGST} + \text{IGST} + \text{Cess}$ (within ₹1.00 tolerance). |
| **`GSTR1-008`** | Tax Rate | `WARNING` | Applicable tax rate within valid statutory bounds ($0\% \le \text{rate} \le 50\%$). |
| **`GSTR1-010`** | Duplicate | `ERROR` | Unique lineage key verification (prevents duplicate source rows). |

---

## 6. Multi-Format Export Architecture

Export artifacts are saved into `data/outputs/gstr1/`:

1. **`gstr1_draft.csv`**: Unified flat CSV containing all admitted Table 4A and Table 7 records with statutory section tags.
2. **`b2b_table_4a.csv`**: Official B2B Table 4A format CSV.
3. **`b2c_table_7.csv`**: Official B2C Table 7 format CSV.
4. **`exclusions.csv`**: Complete audit log of excluded/ineligible invoices with rejection reasons.
5. **`validation_report.csv`**: GSTR-1 draft validation findings.
6. **`gstr1_draft.xlsx`**: Professional multi-sheet Excel workbook with styled headers, gridlines, auto-fitted column widths, and numeric currency formatting (`#,##0.00`).
   - Sheet 1: `Summary`
   - Sheet 2: `B2B_Table_4A`
   - Sheet 3: `B2C_Table_7`
   - Sheet 4: `Exclusions`
   - Sheet 5: `Validation_Report`
7. **`summary.json`**: Top-level machine-readable summary.

---

## 7. 25-Invoice Benchmark Evaluation Results

All 25 canonical invoices in the project benchmark suite were evaluated through the Phase 8 engine:

| Invoice Category | Invoices Tested | Included in GSTR-1 | Excluded | Target Table | Total Taxable (₹) | Total Grand Total (₹) | Key Findings & Diagnostics |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **CLEAN** | 5 | 5 | 0 | Table 4A (B2B) | ₹5,000.00 | ₹5,900.00 | 100% clean passes; perfect reconciliation. |
| **DUPLICATE** | 2 | 2 | 0 | Table 4A (B2B) | ₹2,000.00 | ₹2,360.00 | Admitted individually; duplicate keys guarded across streams. |
| **INVALID MATH** | 3 | 0 | 3 | None (Excluded) | ₹0.00 | ₹0.00 | **100% (3/3) caught & excluded** due to ₹500 discrepancy (`TOTAL-001`). |
| **MISSING FIELDS** | 3 | 3 | 0 | Table 7 (B2C) | ₹3,000.00 | ₹3,540.00 | B2C transactions mapped cleanly without fabricated buyer GSTINs. |
| **MULTI-ITEM** | 5 | 5 | 0 | Table 4A (B2B) | ₹30,000.00 | ₹35,400.00 | 5-item invoices reconciled: $\sum \text{items} = ₹6,000 \rightarrow \text{Total} = ₹7,080$. |
| **NOISY** | 4 | 0 | 4 | None (Excluded) | ₹0.00 | ₹0.00 | Corrupted OCR characters & missing mandatory GSTINs $\rightarrow$ Excluded. |
| **ROTATED** | 3 | 0 | 3 | None (Excluded) | ₹0.00 | ₹0.00 | Severe OCR degradation & missing required fields $\rightarrow$ Excluded. |
| **TOTAL** | **25** | **15 (60.0%)** | **10 (40.0%)** | **12 B2B / 3 B2C** | **₹40,000.00** | **₹47,200.00** | **Zero invalid or unverified invoices leaked into GSTR-1.** |

---

## 8. Financial Summary of Admitted Invoices

- **Total Admitted Invoices:** 15
  - **B2B Records (Table 4A):** 12
  - **B2C Records (Table 7):** 3
- **Total Taxable Value:** **₹40,000.00**
- **Total CGST (Central Tax):** **₹3,600.00**
- **Total SGST (State/UT Tax):** **₹3,600.00**
- **Total IGST (Integrated Tax):** **₹0.00**
- **Total Grand Invoice Value:** **₹47,200.00**

---

## 9. Comprehensive Test Suite

All 86 project unit and integration tests pass cleanly:

```bash
.venv/bin/pytest
======================== 86 passed, 2 warnings in 1.58s ========================
```

Key test scenarios in `tests/test_gstr1.py`:
1. B2B classification based on valid recipient GSTIN
2. B2C classification when recipient GSTIN is absent
3. B2B recipient GSTIN mapping
4. B2C recipient GSTIN absence (no fabrication)
5. Exact invoice number preservation
6. Invoice date normalization to `YYYY-MM-DD`
7. Taxable value mapping
8. CGST amount mapping
9. SGST amount mapping
10. IGST amount mapping (inter-state transactions)
11. Grand total mapping
12. Place of supply mapping
13. Invalid invoice exclusion (TOTAL-001 failure)
14. Low-confidence invoice exclusion
15. Human-approved invoice inclusion
16. HIGH tier + AUTO_ACCEPT invoice inclusion
17. Missing place of supply exclusion
18. Duplicate source invoice detection
19. GSTR-1 draft validation rules
20. Flat CSV export verification
21. Multi-sheet Excel (.xlsx) export verification
22. Source invoice lineage key preservation
23. Financial summary aggregation
24. Canonical invoice data immutability

---

## 10. Dashboard UI Integration

The Streamlit dashboard (`app/dashboard.py`) features the dedicated primary tab:
- **`📑 GSTR-1 Draft (Phase 8)`**
  - Status Banner: `"GSTR-1 DRAFT — NOT FILED"`
  - Single-invoice mapping card for the currently uploaded invoice (showing Table 4A/Table 7 admission or detailed exclusion reasons).
  - High-level metric cards for total evaluated, admitted, excluded, taxable sum, and grand total.
  - Sub-tabs for:
    - `🏢 B2B Invoices - Table 4A`
    - `🛒 B2C Invoices - Table 7`
    - `🚫 Exclusions Catalog`
    - `🔍 Lineage & Audit Drilldown` (interactive invoice selector showing source -> validation -> confidence -> GSTR-1 mapping).
  - Download action buttons for `gstr1_draft.csv`, `b2b_table_4a.csv`, `b2c_table_7.csv`, and `gstr1_draft.xlsx`.

---

## 11. Known Limitations & Phase 9 Handoff

### Known Limitations:
1. **Scope:** Only Table 4A (B2B Regular) and Table 7 (B2C Small) are mapped. Advanced tables (Table 6 Exports, Table 9 Credit/Debit Notes, Table 11 Advances) are reserved for future extensions.
2. **Phase 5 Real-LLM Extraction:** Phase 5 remains paused and will be completed at the end of the roadmap.

### Phase 9 Readiness:
Phase 8 artifacts (`gstr1_draft.csv`, `gstr1_draft.xlsx`, `summary.json`) provide a clean, validated data foundation for Phase 9 final auditing, packaging, and end-of-roadmap integration.
