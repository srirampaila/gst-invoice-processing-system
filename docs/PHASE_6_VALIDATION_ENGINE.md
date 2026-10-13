# Phase 6 — Deterministic GST & Financial Validation Engine

## 1. Objective

The primary objective of Phase 6 is to provide an **independent, deterministic mathematical and regulatory verification layer** that operates on canonical structured invoice outputs (`CanonicalInvoice`).

The validation engine enforces strict separation of concerns:
1. **The LLM is NOT an authority on financial truth.** The LLM only interprets imperfect OCR text into structured format.
2. **Deterministic rules verify financial arithmetic and GST compliance.** Decimal-based exact calculations independently recompute item sums, tax rates, and grand totals.
3. **Never silently alter or repair data.** Extracted values are preserved in their entirety, while independently computed values and discrepancies are explicitly recorded.



## 2. Validation Architecture

```
                      CanonicalInvoice (JSON / Model)
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    ValidationService         │
                      │  (src/validation/service.py) │
                      └──────────────┬───────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       │                             │                             │
       ▼                             ▼                             ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│ Mandatory    │              │ Deterministic│              │ Financial &  │
│ Fields Check │              │ GSTIN Engine │              │ Tax Engine   │
│ (fields.py)  │              │ (gstin.py)   │              │(arithmetic.py│
└──────┬───────┘              └──────┬───────┘              └──────┬───────┘
       │                             │                             │
       └─────────────────────────────┼─────────────────────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    Rules Evaluation Engine   │
                      │   (src/validation/rules.py)  │
                      └──────────────┬───────────────┘
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │       ValidationResult       │
                      │  (Status: PASS/WARNING/FAIL) │
                      │  - Issues & Rule Violations  │
                      │  - Calculated Financials     │
                      │  - GSTIN Analysis Results    │
                      └──────────────────────────────┘
```

---

## 3. Validation Result Model (`ValidationResult`)

The output of the validation engine is encapsulated in Pydantic schema:

```python
class ValidationResult(BaseModel):
    invoice_id: str
    status: str                         # "PASS" | "WARNING" | "FAIL"
    passed: bool                        # True if status in (PASS, WARNING)
    requires_review: bool               # True if errors exist or warnings require review
    error_count: int
    warning_count: int
    issues: List[ValidationIssue]       # Detailed list of rule violations
    checks: List[ValidationCheck]       # Summary of checks performed
    calculated_values: CalculatedFinancials  # Independently recomputed financial values
    seller_gstin_result: Optional[GSTINValidationResult]
    buyer_gstin_result: Optional[GSTINValidationResult]
    validation_timestamp: str
```

### Issue Model (`ValidationIssue`)
```json
{
  "rule_id": "TOTAL-001",
  "severity": "ERROR",
  "field": "grand_total",
  "message": "Grand total does not reconcile with taxable + taxes. Expected ₹1180.00, got ₹1680.00 (Discrepancy: ₹500.00)",
  "expected": 1180.0,
  "actual": 1680.0
}
```

---

## 4. Rule Catalog

| Rule ID | Category | Severity | Description | Trigger Condition |
| :--- | :--- | :---: | :--- | :--- |
| **`FIELD-001`** | Field | `ERROR` | Mandatory Invoice Number | `invoice_number` is missing or empty |
| **`FIELD-002`** | Field | `ERROR` | Mandatory Invoice Date | `invoice_date` is missing, unparseable, or not `YYYY-MM-DD` |
| **`FIELD-003`** | Field | `ERROR` | Mandatory Seller GSTIN | `seller.gstin` is missing |
| **`FIELD-004`** | Field | `INFO` | Buyer GSTIN Status | Evaluates B2B vs B2C (unregistered) transaction |
| **`FIELD-005`** | Field | `WARNING` | Items Non-Empty | Line items list is empty |
| **`FIELD-006`** | Field | `ERROR` | Mandatory Taxable Value | `tax_summary.taxable_value` is null |
| **`FIELD-007`** | Field | `ERROR` | Mandatory Grand Total | `grand_total` is null |
| **`GSTIN-001`** | GSTIN | `ERROR` | Seller GSTIN Structural Validity | Length != 15, invalid state code, or invalid format |
| **`GSTIN-002`** | GSTIN | `ERROR` | Buyer GSTIN Structural Validity | Length != 15 or invalid format when buyer GSTIN is provided |
| **`GSTIN-003`** | GSTIN | `INFO`/`WARN` | Luhn Mod-36 Checksum | Checksum mismatch (non-strict mode records variance) |
| **`STATE-001`** | Tax/State | `PASS`/`WARN` | State & POS Consistency | Evaluates intra-state vs inter-state supply scenario |
| **`STATE-002`** | Tax/State | `WARNING` | Intra-State IGST Check | Intra-state supply has unexpected IGST > 0 |
| **`STATE-003`** | Tax/State | `INFO` | Inter-State Tax Check | Inter-state supply notes tax breakdown |
| **`MATH-001`** | Arithmetic | `ERROR` | Item Taxable Reconciliation | $\sum \text{item.taxable\_value} \neq \text{tax\_summary.taxable\_value}$ (exceeds tolerance) |
| **`TAX-CGST-001`**| Tax Rate | `ERROR` | CGST Rate Verification | $\text{taxable} \times \text{cgst\_rate} / 100 \neq \text{CGST}$ |
| **`TAX-SGST-001`**| Tax Rate | `ERROR` | SGST Rate Verification | $\text{taxable} \times \text{sgst\_rate} / 100 \neq \text{SGST}$ |
| **`TAX-IGST-001`**| Tax Rate | `ERROR` | IGST Rate Verification | $\text{taxable} \times \text{igst\_rate} / 100 \neq \text{IGST}$ |
| **`TOTAL-001`** | Arithmetic | `ERROR` | Grand Total Reconciliation | $\text{taxable} + \text{CGST} + \text{SGST} + \text{IGST} \neq \text{grand\_total}$ (exceeds tolerance) |

---

## 5. GSTIN Validation Engine

The GSTIN engine performs deterministic multi-tier verification:

1. **Length Check:** Exactly 15 alphanumeric characters.
2. **State Code Check:** First 2 digits mapped to standard 38 Indian State/UT codes (01 to 38, 97, 99).
3. **PAN Structure:** Characters 3 to 12 follow Indian PAN format (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
4. **Entity / Default Code:** 13th character is entity sequence number (`1-9, A-Z`), 14th character is strictly `'Z'`.
5. **Luhn Mod-36 Checksum Algorithm:**
   - Character code points: `0-9` (0-9), `A-Z` (10-35).
   - Weights: alternating 1 and 2 across characters 1 to 14.
   - Summing quotients and remainders modulo 36.

---

## 6. Financial Arithmetic & Configurable Tolerance

All calculations use Python's `decimal.Decimal` quantized to `0.01` with `ROUND_HALF_UP`:
- Binary floating-point representation errors (e.g., $0.1 + 0.2 = 0.30000000000000004$) are completely prevented.
- **Configurable Amount Tolerance:** Default **₹1.00** (`VALIDATION_AMOUNT_TOLERANCE=1.00`), adjustable per organization policy.

---

## 7. 25-Invoice Benchmark Evaluation Results

The complete suite of 25 canonical invoices from Phase 5 extraction was validated:

| Category | Invoices Tested | PASS | WARNING | FAIL | Key Findings |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **CLEAN** | 5 | 5 | 0 | 0 | 100% pass; mathematical totals and GSTINs reconcile perfectly. |
| **DUPLICATE** | 2 | 2 | 0 | 0 | Valid syntax and math (duplicate detection delegated to batch layer). |
| **INVALID MATH** | 3 | 0 | 0 | 3 | **100% (3/3) detected** via `TOTAL-001` (₹500.00 discrepancy). |
| **MISSING FIELDS** | 3 | 3 | 0 | 0 | B2C transactions accepted with `FIELD-004` (INFO), item tax fallback. |
| **MULTI ITEM** | 5 | 5 | 0 | 0 | All 5-item invoices reconcile: $\sum \text{items} = ₹6,000 \rightarrow \text{Total} = ₹7,080$. |
| **NOISY** | 4 | 0 | 0 | 4 | Severe OCR noise corrupted seller GSTIN and line items -> flagged. |
| **ROTATED** | 3 | 0 | 0 | 3 | Rotated OCR failure flagged with missing required fields. |
| **TOTAL** | **25** | **15 (60.0%)** | **0 (0.0%)** | **10 (40.0%)** | **100% of invalid invoices caught.** |

---

## 8. Intentionally Invalid Invoice Detection

The 3 synthetic invalid-math invoices in the ground truth dataset (`INV_INV_001`, `INV_INV_002`, `INV_INV_003`) have intentionally inflated grand totals (₹1,680.00 vs expected ₹1,180.00):

- **Expected Invalid Invoices:** 3
- **Detected as FAIL:** 3/3 (100.0%)
- **Missed Invalid Invoices:** 0 (0.0%)
- **Triggered Rule:** `TOTAL-001` (`grand_total discrepancy: ₹500.00`)

---

## 9. Unit & Regression Test Suite

All 42 tests across Phases 1 to 6 pass with zero errors:

```bash
.venv/bin/pytest
======================== 42 passed, 2 warnings in 1.53s ========================
```

---

## 10. Phase 7 (Confidence Engine & Review Boundary) Handoff

The validation engine outputs complete diagnostic data for Phase 7:
- `requires_review = True` whenever any `ERROR` or critical `WARNING` is present.
- Discrepancy amounts and expected vs actual values are ready for the human review UI.
- Phase 7 will consume `ExtractionMetadata.confidence` + `ValidationResult` to compute the final multi-factor confidence tier.
