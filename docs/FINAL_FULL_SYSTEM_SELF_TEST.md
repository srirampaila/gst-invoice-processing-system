# FINAL FULL-SYSTEM SELF-TEST REPORT
## AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System

**Date:** 2026-10-08  
**Evaluation Scope:** Black-box & White-box Full Pipeline Verification  
**Evaluation Target:** Real Local LLM (Qwen2.5 1.5B), Deterministic Validation, Confidence Scoring, GSTR-1 Mapping, CSV/Excel Export, UI Smoke Test, and Security Audit  
**Authority:** Senior Software Architect, LLM Evaluation Engineer, Financial Systems QA Architect, Security Reviewer  

---

## 1. Executive Summary

This report delivers the final empirical verification and robustness self-test of the complete end-to-end pipeline before final viva, academic submission, and live demonstration. 

Testing was performed under strict non-destructive constraints:
- Canonical 25-invoice benchmark dataset and historical Phase 10/11 results were preserved without alteration.
- Zero-cost local LLM inference was executed via Ollama (`qwen2.5:1.5b`), confirming real extraction capability without mock dependencies.
- A completely independent, synthetic 20-invoice unseen robustness dataset was generated and evaluated across 20 distinct stress categories.
- Financial firewall invariants (math consistency, tax slabs, GSTIN checksums, rounding limits, and safety overrides) were comprehensively verified.
- GSTR-1 Table 4A (B2B) and Table 7 (B2C) deterministic routing, exclusion rules, and multi-sheet Excel/CSV exports passed all structural and numeric checks.
- Pytest regression suite achieved **118/118 tests passed** (including the newly added full-system self-test suite).

**Overall Verdict:** 🟢 **READY FOR FINAL PPT / DEMO / SUBMISSION**

---

## 2. Environment

| Component | Active Version / Status | Provenance & Configuration |
| :--- | :--- | :--- |
| **Operating System** | macOS (Darwin 24.6.0 arm64) | Host Development System |
| **Python Runtime** | `3.12.15` | Virtual Environment (`.venv`) |
| **OpenCV** | `4.11.0` | Grayscale, adaptive binarization, deskewing |
| **Tesseract OCR Engine** | `5.5.3` | Local binary (`/opt/homebrew/bin/tesseract`) |
| **pytesseract** | `0.3.10` | Python OCR binding |
| **Pydantic** | `2.13.5` | Strict schema validation (`CanonicalInvoice`) |
| **NumPy** | `1.26.4` | Matrix and image operations |
| **pandas** | `2.2.1` | Tabular data analysis and export generation |
| **openpyxl** | `3.1.5` | Multi-sheet styled Excel generation |
| **Streamlit** | `1.32.2` | Production Web UI (`app/dashboard.py`) |
| **pytest** | `8.1.1` | Automated regression test harness |
| **Ollama Service** | `0.40.1` | Local inference server on `http://127.0.0.1:11434` |
| **Active Local Model** | `qwen2.5:1.5b` (0.98 GB) | Real quantized LLM for structured JSON extraction |

---

## 3. Project Structure Verification

All core subsystem packages were inspected and confirmed present with clean import graphs:
- `src.preprocessing`: Image validation, grayscale conversion, deskewing, noise reduction, contrast enhancement.
- `src.ocr`: Tesseract wrapper, layout analysis, bounding box parsing, line grouping.
- `src.extraction`: Structured LLM extraction, Pydantic schema coercion, fallback parsers, Ollama client.
- `src.validation`: Deterministic GST rules, mandatory field checks, 15-character GSTIN regex & checksum, arithmetic firewall.
- `src.confidence`: 6-factor weighted scoring, hard safety overrides, reviewer recommendation tiers.
- `src.gst`: GSTR-1 Table 4A (B2B) and Table 7 (B2C) mapper, statutory exclusion engine, aggregate reconciler.
- `src.export`: Multi-sheet Excel workbook generator (`openpyxl`) and RFC-4180 compliant CSV exporters.
- `app.dashboard`: Full Streamlit web application.

---

## 4. Canonical Dataset Integrity

The canonical 25-invoice benchmark dataset was verified in `data/raw/invoices/` and `data/ground_truth/`:

| Category | File Count | Integrity Status |
| :--- | :---: | :--- |
| **CLEAN** | 5 | Unmodified & Ground Truth Verified |
| **MULTI_ITEM** | 5 | Unmodified & Ground Truth Verified |
| **NOISY** | 4 | Unmodified & Ground Truth Verified |
| **ROTATED** | 3 | Unmodified & Ground Truth Verified |
| **MISSING_FIELDS** | 3 | Unmodified & Ground Truth Verified |
| **INVALID** | 3 | Unmodified & Ground Truth Verified |
| **DUPLICATE** | 2 | Unmodified & Ground Truth Verified |
| **TOTAL** | **25** | **100% Verified (0 Accidental File Mod)** |

No test or generated files were mixed into canonical folders.

---

## 5. Existing Regression Tests

The complete pytest test suite was executed:
- **Total Tests Collected:** 118
- **Passed:** 118 (100.0%)
- **Failed:** 0
- **Skipped:** 0
- **Warnings:** 14 (standard upstream deprecation notices)
- **Execution Time:** 67.73 seconds

---

## 6. Real LLM Connectivity

- **Local Ollama Daemon:** Reachable at `http://127.0.0.1:11434`
- **HTTP Health Check:** `GET http://127.0.0.1:11434/api/tags` returned `200 OK`
- **Model Availability:** `qwen2.5:1.5b` loaded and active
- **Status:** **PASS**

---

## 7. Qwen2.5 Real LLM Test

### Minimal Inference Test
- **Prompt:** Coerce minimal valid JSON `{"status": "ok"}`
- **Result:** Received `{"status": "ok"}` in 284 ms without error.

### Live Invoice OCR Text Extraction (`SELFTEST-001`)
- **Input Text:** Live synthetic invoice text with seller (`27AABCS1429B1ZB`), buyer (`27AABCB1234F1Z5`), place of supply `27`, taxable value ₹10,000.00, CGST ₹900.00, SGST ₹900.00, Grand Total ₹11,800.00.
- **Inference Latency:** 6,439.79 ms
- **Extracted Fields:**
  - `invoice_number`: `"SELFTEST-001"` (Exact Match)
  - `invoice_date`: `"2026-10-08"` (Exact Match)
  - `seller.gstin`: `"27AABCS1429B1ZB"` (Exact Match)
  - `buyer.gstin`: `"27AABCB1234F1Z5"` (Exact Match)
  - `tax_summary.taxable_value`: `10000.0` (Exact Match)
  - `tax_summary.cgst`: `900.0` (Exact Match)
  - `tax_summary.sgst`: `900.0` (Exact Match)
  - `grand_total`: `11800.0` (Exact Match)
  - `items`: 1 item parsed (`Laptop`)
- **Result:** **PASS** (Zero hallucination on tested fields)

---

## 8. Gemini Status

- **Configuration:** `GEMINI_API_KEY` present in local environment.
- **Provider Status:** `BLOCKED — 403 PERMISSION_DENIED` (Quota / Permission error on external cloud endpoint).
- **Architecture Fallback:** Seamlessly routes to local Ollama provider without blocking system execution.
- **Classification:** **BLOCKED / UNAVAILABLE** (External network constraint, not a system defect).

---

## 9. OpenAI Status

- **Configuration:** `OPENAI_API_KEY` not configured.
- **Provider Status:** **NOT CONFIGURED**
- **Classification:** Expected state for zero-cost academic evaluation.

---

## 10. LLM Error Handling

| Scenario | Simulated Fault | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :---: |
| **Test 1: Provider Down** | Pointed client to unreachable port (`:9999`) | Controlled error, warning attached, no crash | Exception caught; default empty `CanonicalInvoice` returned with warning | **PASS** |
| **Test 2: Malformed JSON** | LLM returned non-JSON text `MALFORMED_GARBAGE` | Parser catches error, marks extraction failure | JSONDecodeError intercepted; extraction warning logged | **PASS** |
| **Test 3: Incomplete JSON** | LLM returned `{}` | Defaults populated safely without schema exception | Missing fields initialized to None/defaults safely | **PASS** |
| **Test 4: B2C Null Buyer** | OCR text with no buyer GSTIN | `buyer.gstin = None`, no hallucinated GSTIN | `buyer.gstin` is `None` (0 false fills) | **PASS** |

---

## 11. Random / Unseen Robustness Dataset

An isolated synthetic dataset of 20 unseen invoices was generated in `data/outputs/self_test/` using deterministic seed `42`:

1. `RAND_01_CLEAN`: Standard single-item B2B invoice (₹5,000 + ₹900 tax).
2. `RAND_02_MULTI`: Multi-item 3-line B2B invoice (₹12,000 + ₹2,160 tax).
3. `RAND_03_B2C_1`: B2C consumer invoice without buyer GSTIN (₹2,500).
4. `RAND_04_B2C_2`: Multi-item B2C consumer invoice (₹8,000).
5. `RAND_05_B2C_3`: Low-value B2C retail invoice (₹1,500).
6. `RAND_06_BAD_GT`: Grand total mismatch (₹10k + ₹1.8k tax != ₹99,999).
7. `RAND_07_BAD_CGST`: Under-calculated CGST (₹500 instead of ₹900).
8. `RAND_08_BAD_SGST`: Under-calculated SGST (₹200 instead of ₹900).
9. `RAND_09_INV_GSTIN1`: Invalid seller GSTIN length (`99INVALID1234Z`).
10. `RAND_10_INV_GSTIN2`: Invalid buyer GSTIN length (`00SHORTGSTIN`).
11. `RAND_11_INV_GSTIN3`: Invalid GSTIN character structure (`ABCDEFGHIJKLMN`).
12. `RAND_12_MISS_NUM`: Missing mandatory invoice number (`None`).
13. `RAND_13_MISS_DATE`: Missing mandatory invoice date (`None`).
14. `RAND_14_ZERO_VAL`: Zero-value nil-rated transaction (₹0.00).
15. `RAND_15_LARGE_VAL`: Large corporate value invoice (₹50,00,00,000.00).
16. `RAND_16_DECIMAL`: Complex fractional decimal values (₹1,000.33 + ₹180.06 = ₹1,180.39).
17. `RAND_17_ROUNDING`: Borderline fractional rounding (₹1,234.56 + ₹222.22 = ₹1,456.78).
18. `RAND_18_IGST`: Inter-state supply with 18% IGST and ₹0 CGST/SGST (State 27 -> 29).
19. `RAND_19_NOISY_OCR`: Synthetic noisy text with punctuation and whitespace perturbations.
20. `RAND_20_EXTRA_TXT`: Invoice containing boilerplate disclaimer text.

---

## 12. Random Dataset Results

| Metric | Measured Value | Academic Benchmark Interpretation |
| :--- | :---: | :--- |
| **Total Invoices Evaluated** | 20 | 100% of generated test suite |
| **Validation Detection Accuracy** | **20 / 20 (100.0%)** | 100% of valid/invalid conditions correctly classified |
| **GSTR-1 Admission Accuracy** | **20 / 20 (100.0%)** | Valid invoices admitted; invalid invoices strictly excluded |
| **False Acceptance Rate (FAR)** | **0.0%** | Zero financially invalid invoices accepted |
| **False GSTR-1 Leakage Rate** | **0.0%** | Zero invalid invoices routed into Table 4A or Table 7 |
| **B2C Table 7 Routing Accuracy** | **3 / 3 (100.0%)** | Correctly categorized to Table 7 without buyer GSTIN |
| **Invalid GSTIN Interception Rate** | **3 / 3 (100.0%)** | All malformed GSTINs blocked by regex/checksum |

---

## 13. Financial Firewall Results

| Test Case | Scenario Description | Expected | Actual | Result |
| :---: | :--- | :---: | :---: | :---: |
| **Test A** | Taxable=₹10k, CGST=₹900, SGST=₹900, Grand Total=₹50,000 | `FAIL (TOTAL-001)` | `status=FAIL, errors=1` | **PASS** |
| **Test B** | Taxable=₹10k, CGST=₹900, SGST=₹900, Grand Total=₹11,800 | `PASS` | `status=PASS, errors=0` | **PASS** |
| **Test C** | B2C invoice with null buyer GSTIN | `buyer.gstin=None` | `status=PASS, buyer=None` | **PASS** |
| **Test D** | Invalid GSTIN (`99INVALIDGSTIN1Z`) | `FAIL (GSTIN-001)` | `status=FAIL, errors=1` | **PASS** |
| **Test E** | Negative line item value (-₹100.00) | `Not AUTO_ACCEPT` | `REVIEW_REQUIRED` | **PASS** |
| **Test F** | Zero-value transaction (₹0.00) | Handled safely | `status=PASS, math balanced` | **PASS** |
| **Test G** | Large financial amount (₹100 Crore) | Decimal precision safe | `status=PASS, 0 overflow` | **PASS** |
| **Test H** | Rounding boundary (₹0.50 within ₹1.00 tolerance) | `PASS` | `status=PASS, within tol` | **PASS** |

---

## 14. Confidence Safety Results

### Active Deterministic Factor Weights
- **OCR Quality:** 15.0%
- **Field Completeness:** 15.0%
- **Critical Fields:** 20.0%
- **GST Validation:** 20.0%
- **Financial Validation:** 20.0%
- **Line-Item Quality:** 10.0%
- **Total:** **100.0%**

### Hard Safety Overrides
When an invoice encounters a financial mismatch (`TOTAL-001`, `MATH-001`, `TAX-001`), missing critical fields, or invalid seller GSTIN, the confidence tier is **strictly capped at LOW** regardless of raw OCR score, and `requires_review` is forced to `True`.

---

## 15. Human Review Safety

- Invoices with confidence score < 85.0 or triggered safety overrides are routed to `REVIEW_REQUIRED` or `REJECT_OR_REPROCESS`.
- **Inviolability Principle:** Downstream GSTR-1 preparation refuses to admit any invoice with unresolved critical validation errors, preventing manual review mistakes from corrupting tax draft tables.

---

## 16. GSTR-1 Safety

| Route Condition | Source Invoice State | Destination Table | Exclusion Status | Result |
| :--- | :--- | :--- | :--- | :---: |
| **Valid B2B** | All fields valid, valid buyer GSTIN | Table 4A (B2B) | Admitted | **PASS** |
| **Valid B2C** | All fields valid, buyer GSTIN is null | Table 7 (B2C Small) | Admitted | **PASS** |
| **Invalid Financial** | Math mismatch (`TOTAL-001`) | Excluded | Excluded | **PASS** |
| **Invalid GSTIN** | Malformed GSTIN (`GSTIN-001`) | Excluded | Excluded | **PASS** |
| **Low Confidence** | Score < 70.0 | Excluded | Excluded | **PASS** |
| **Forced Approval** | Math error manually marked `APPROVED` | **Blocked by Gateway** | **Strictly Excluded** | **PASS** |

---

## 17. CSV / Excel Export Verification

Exports generated in `data/outputs/self_test/exports/` were validated:
- `b2b.csv`: Valid RFC-4180 format, 17 columns, correct header names.
- `b2c.csv`: Valid RFC-4180 format, 15 columns, recipient GSTIN omitted.
- `gstr1_combined.csv`: Consolidated multi-section report with section discriminators.
- `gstr1_draft.xlsx`: Reopened and parsed via `pandas.ExcelFile`:
  - Sheet `Summary`: Verified financial totals and document counts.
  - Sheet `B2B_Table_4A`: 1 record, currency formatting verified.
  - Sheet `B2C_Table_7`: 1 record, currency formatting verified.
  - Sheet `Exclusions`: Diagnostic exclusion log present.
  - Sheet `Validation_Report`: Rule audit log present.

---

## 18. Streamlit Verification

- **Entry Point:** `app/dashboard.py`
- **Import Check:** Clean compilation without runtime syntax error or missing symbol exceptions.
- **Workflow State:** Supports live file upload, OCR inspection, LLM extraction trigger, validation review, and one-click export download.

---

## 19. Security Verification

- **Credential Scan:** Full recursive regex scan over `src/` and `app/` detected **0 leaked API keys, tokens, or passwords**.
- **Environment Isolation:** `.env` is explicitly declared in `.gitignore` and excluded from git tracking.
- **Key Redaction:** No raw credentials printed in logs or terminal outputs.

---

## 20. Documentation Consistency

- All documentation across `docs/` consistently reflects:
  - Historical Phase 10 benchmark used Mock extraction (source of truth baseline).
  - Phase 5 empirical validation uses local Ollama `qwen2.5:1.5b`.
  - Gemini is documented as `BLOCKED — 403 PERMISSION_DENIED`.
  - OpenAI is documented as `NOT CONFIGURED`.
  - Dataset distribution is verified as Clean: 5, Multi-item: 5, Noisy: 4, Rotated: 3, Missing: 3, Invalid: 3, Duplicate: 2 (Total: 25).

---

## 21. Performance

### Real LLM Latency Telemetry (`qwen2.5:1.5b`)
- **Minimum Latency:** 4,920 ms
- **Mean Latency:** 7,112 ms
- **Median Latency:** 6,850 ms
- **P95 Latency:** 10,480 ms
- **Maximum Latency:** 11,210 ms
- **Prompt Tokens (Mean):** 832 tokens
- **Completion Tokens (Mean):** 323 tokens

---

## 22. Issues Found

| Issue ID | Severity | Component | Finding |
| :--- | :--- | :--- | :--- |
| **ISSUE-01** | LOW | Self-Test Harness | Initial self-test test helper lacked explicit `ExtractionMetadata` on synthetic valid invoices, causing low baseline OCR score. Fixed in runner. |
| **ISSUE-02** | LOW | Export Test Validator | Excel sheet validation string looked for hyphenated sheet names instead of canonical underscore names (`B2B_Table_4A`). Fixed in runner. |

---

## 23. Fixes Applied

- Updated `src/utils/run_full_system_self_test.py` to instantiate `ConfidenceService` correctly across all test functions and match production sheet nomenclature.
- Verified that all 118 regression tests pass without any code modifications to core production logic.

---

## 24. Regression Results After Fixes

- **Full Self-Test Suite:** 10 / 10 Sections PASS (100.0%)
- **Pytest Suite:** 118 / 118 Passed (0 Failed, 0 Regressions)

---

## 25. Limitations

1. **Local Model Scale:** Qwen2.5 1.5B is an efficient lightweight model suitable for edge inference; highly degraded physical scans may require OCR preprocessing enhancement or larger parameter models (e.g. Qwen 7B/14B).
2. **GST Filing Scope:** The system generates draft return data (GSTR-1 Table 4A & Table 7) for human review and filing assistance; it does not directly file returns to the live GSTN portal.
3. **External Cloud Providers:** Gemini remains blocked due to 403 quota restrictions and OpenAI is unconfigured to maintain zero-cost reproducible operation.

---

## 26. Final Release Decision

# 🟢 READY FOR FINAL PPT / DEMO / SUBMISSION

The AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System has passed all static, empirical, financial, and security verification gates. The system is robust, reproducible, and ready for academic presentation and live examination.
