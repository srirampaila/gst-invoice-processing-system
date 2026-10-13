# Final Project Engineering & Evaluation Report

**AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System**  
**Subtitle:** An Intelligent OCR and LLM-Based System for Automated Invoice Extraction, GST Validation, and Return Preparation Assistance  
**Project Date:** October 8, 2026  
**Final Release Version:** 1.0  
**Phase State:** Phases 0–4, 6–11 COMPLETE | Phase 5 PAUSED / ISOLATED | Phase 12 FINAL RELEASE  

---

## 1. Abstract

Managing Goods and Services Tax (GST) compliance in India requires accurate extraction of multi-line invoice metadata, validation of 15-character Goods and Services Tax Identification Numbers (GSTIN), reconciliation of tax rates (CGST, SGST, IGST), and preparation of statutory return draft forms (GSTR-1). Manual entry is error-prone and time-consuming. 

This project presents an end-to-end automated software pipeline that ingests invoice images/PDFs, applies OpenCV computer vision preprocessing (denoising, deskewing, contrast adjustment), extracts textual tokens via Tesseract 5.5.3 OCR, maps tokens to a canonical Pydantic data model, validates legal and financial arithmetic via a deterministic Python engine, scores uncertainty through a 6-factor confidence engine with safety overrides, provides an interactive human review queue, and compiles structured GSTR-1 draft datasets in CSV and Excel formats. 

Evaluated across a controlled 25-invoice benchmark dataset, image preprocessing improved character-level OCR recognition certainty by 75.0% relative reduction in CER (22.70% $\rightarrow$ 5.67%) and 51.81% relative reduction in WER (80.71% $\rightarrow$ 38.90%). The deterministic validation engine achieved 100% detection of intentional mathematical discrepancies, and the pipeline achieved single-invoice processing latency of ~702 ms and throughput of ~78.7 invoices/minute in single-threaded sequential execution.

---

## 2. Introduction

The Indian Goods and Services Tax (GST) regime mandates that registered businesses report outward supplies of goods and services on a periodic basis via GSTR-1 returns. Each transaction requires accurate categorization into Business-to-Business (B2B Table 4A) or Business-to-Consumer (B2C Table 7), accurate attribution of Place of Supply (POS), correct application of tax slabs (0%, 5%, 12%, 18%, 28%), and strict equality between taxable values, item tax breakdowns, and grand totals.

Small and Medium Enterprises (SMEs) and accounting professionals face substantial challenges processing physical and scanned invoices from diverse suppliers with varying layouts, fonts, noise artifacts, and rotational skews.

---

## 3. Problem Statement

1. **Format Heterogeneity:** Invoices lack a standardized layout, appearing as physical paper receipts, mobile camera photographs, or digital PDFs.
2. **OCR Degradation:** Standard OCR engines suffer from misread characters when encountering rotational tilt, low contrast, or noise.
3. **LLM Hallucination Risk:** Generative AI models applied directly to invoices frequently generate subtle mathematical discrepancies, miscalculate tax sums, or invent plausible check characters.
4. **Compliance Penalty:** Submitting inaccurate GST filings results in audit notices, tax mismatch penalties, and blocked Input Tax Credits (ITC) for buyers.

---

## 4. Motivation

By marrying modern computer vision preprocessing, OCR extraction, canonical structured parsing, and strict zero-tolerance deterministic Python validation, businesses can automate ~80% of routine invoice processing while maintaining human-in-the-loop oversight for degraded or ambiguous documents.

---

## 5. Objectives

1. Build a robust image preprocessing pipeline using OpenCV.
2. Implement OCR text extraction with Tesseract.
3. Establish a canonical Pydantic v2 data schema for GST invoices.
4. Implement a deterministic GST validation engine for GSTIN structure, Modulo 36 checksums, state codes, line-item arithmetic, and statutory ₹1.00 tolerance totals.
5. Create a multi-factor confidence scoring engine with hard regulatory overrides.
6. Provide an interactive Streamlit human-in-the-loop review interface.
7. Map validated invoices to GSTR-1 Table 4A (B2B) and Table 7 (B2CS) draft exports in CSV and multi-tab Excel format.
8. Empirically benchmark accuracy, latency, memory, and scalability on a reproducible dataset.

---

## 6. Existing System Analysis

Traditional accounting workflows rely on:
- **Manual Data Entry:** Operators manually key in invoice numbers, dates, GSTINs, and line items into ERPs (Tally, SAP). Error rate: 3–7%.
- **Template-Based OCR:** Rigid coordinate-based extractors fail when invoice layouts shift by even a few millimeters.
- **Direct LLM Extraction:** Sending raw images to cloud LLMs without deterministic post-validation leads to undetected financial hallucinations.

---

## 7. Proposed System Architecture

The proposed system adopts a hybrid modular architecture:
- **Preprocessing Layer:** OpenCV deskewing, noise filtering, contrast enhancement.
- **OCR Layer:** Local Tesseract OCR generating raw text with word-level certainty metrics.
- **Extraction Layer:** Decoupled LLM provider interface parsing raw text into a strict `CanonicalInvoice` schema.
- **Validation Engine:** Deterministic Python layer using `Decimal` math to verify legal, arithmetic, and statutory rules.
- **Confidence & Review Layer:** Multi-factor scoring with hard safety overrides routing risky records to human reviewers.
- **GSTR-1 Draft Generator:** Downstream transformer producing portal-compliant CSV and formatted Excel outputs.

---

## 8. System Architecture Diagram

*(See [FINAL_SYSTEM_ARCHITECTURE.md](file:///Users/srirampaila/Desktop/TT%20project/docs/FINAL_SYSTEM_ARCHITECTURE.md) for full topology diagram).*

---

## 9. Functional Requirements

- Ingestion of JPEG, PNG, TIFF, and PDF files.
- Automated angle correction up to $\pm 45^\circ$.
- 15-character GSTIN structure, state code, and Modulo 36 checksum validation.
- Line-item and summary total reconciliation with ₹1.00 rounding tolerance.
- Automated B2B vs. B2C classification based on buyer GSTIN presence.
- Generation of portal-compliant CSVs and styled Excel workbooks with Summary, Table 4A, Table 7, Exclusions, and Validation Report worksheets.

---

## 10. Non-Functional Requirements

- **Reliability:** Zero silent numerical mutations; financial validation is strictly read-only.
- **Performance:** End-to-end processing time under 1.0 second per single-page invoice on standard hardware.
- **Security:** Zero credential leakage; `.env` isolation; no PII persistence beyond local execution.
- **Auditability:** Complete lineage tracing from exported spreadsheet rows back to source invoice images.

---

## 11. Technology Stack

- **Python:** 3.12.15 (CPython 64-bit)
- **Computer Vision:** OpenCV (`opencv-python-headless 4.13.0.92`)
- **OCR:** Tesseract 5.5.3 (`pytesseract 0.3.13`)
- **Data Schemas:** Pydantic v2 (`2.12.5`)
- **Data Manipulation:** NumPy (`2.4.3`), Pandas (`2.3.3`)
- **Excel Writer:** Openpyxl (`3.1.5`)
- **Web UI:** Streamlit (`1.32.2`)
- **Test Suite:** Pytest (`8.1.1`)

---

## 12. Dataset Strategy

A controlled 25-invoice benchmark dataset was created across 7 realistic categories:
1. `CLEAN` (5 invoices): Standard high-contrast, clean 2-item invoices.
2. `MULTI_ITEM` (5 invoices): Complex 5-item invoices with dense tables.
3. `NOISY` (4 invoices): Invoices with simulated salt-and-pepper noise and Gaussian blur.
4. `ROTATED` (3 invoices): Invoices with physical skews of $+5^\circ$, $-8^\circ$, $+15^\circ$.
5. `MISSING_FIELDS` (3 invoices): B2C invoices lacking buyer GSTIN and buyer name.
6. `INVALID` (3 invoices): Invoices with intentional grand total math discrepancies.
7. `DUPLICATE` (2 invoices): Re-issued invoices with identical content to test lineage.

---

## 13. Image Preprocessing Implementation

The OpenCV pipeline executes sequential transformations:
1. **Grayscale Conversion:** Reduces channel depth from 3 to 1.
2. **Bilateral Filtering:** Preserves high-contrast character edges while smoothing background noise.
3. **Contrast Adjustment:** Histogram equalization / CLAHE.
4. **Deskewing:** Inverts text mask, extracts bounding contours via `cv2.minAreaRect`, and applies affine rotation (`cv2.warpAffine`) to correct rotational skew.
5. **Adaptive Thresholding:** Gaussian adaptive binarization separating ink from background.

---

## 14. OCR Pipeline Implementation

Tesseract 5.5.3 is executed via `pytesseract.image_to_string` and `image_to_data`. The engine extracts full raw text and calculates the mean confidence across all non-whitespace character tokens.

---

## 15. LLM Extraction Architecture (Phase 5 Status)

- **Design:** Decoupled `ExtractionService` consuming raw text and outputting `CanonicalInvoice`.
- **Status:** **PAUSED / MOCK ACTIVE**. To prevent uncontrolled API billing and maintain deterministic benchmark reproducibility, the pipeline currently uses `MockLLMClient` (heuristic extraction).
- **Extensibility:** `GeminiClient` and `OpenAIClient` classes are fully implemented with structured JSON prompting and will be empirically evaluated in the final roadmap phase.

---

## 16. GST Validation Engine

The deterministic validation engine executes zero-tolerance rules:
- **`GSTIN-001` / `GSTIN-002`:** Seller and Buyer GSTIN structure (2 digits state + 10 alphanumeric PAN + 1 entity + 'Z' + 1 checksum).
- **`GSTIN-003`:** Modulo 36 checksum validation (configurable via `VALIDATION_STRICT_GSTIN_CHECKSUM`).
- **`STATE-001..003`:** Place of Supply consistency with intra-state (CGST+SGST) vs. inter-state (IGST) tax logic.
- **`MATH-001`:** Item-level arithmetic ($Qty \times Price = Taxable$).
- **`TAX-001..003`:** Tax rate application ($Taxable \times Rate = Tax$).
- **`TOTAL-001`:** Grand total reconciliation ($Taxable + Taxes = Grand Total \pm ₹1.00$).

---

## 17. Confidence Scoring Engine

A composite 0–100 score is computed from 6 weighted factors:
1. OCR Quality ($15\%$)
2. General Field Completeness ($15\%$)
3. Critical Field Presence ($20\%$)
4. GSTIN Structure & State Validation ($20\%$)
5. Financial Arithmetic Reconciliation ($20\%$)
6. Line Item Quality ($10\%$)

**Safety Overrides:** 10 deterministic override rules immediately downgrade confidence tiers and force human review upon critical failures (e.g., `TOTAL-001` failure forces tier to `LOW` and recommendation to `REVIEW_REQUIRED`).

---

## 18. Human Review Workflow

Uncertain invoices (confidence $< 85\%$ or validation errors) are routed to an interactive Streamlit workspace:
- Original invoice displayed side-by-side with editable fields.
- Field modifications trigger immediate live re-validation.
- Reviewers can `APPROVE`, `REJECT`, or `REQUEST_REPROCESSING`.
- **Crucial Invariant:** Human approval **cannot** force admission of an invoice containing uncorrected critical financial or GST errors.

---

## 19. GSTR-1 Draft Generation

- **Eligibility Gate:** Requires `ValidationStatus == VALID` and `ReviewDecision in [AUTO_ACCEPT, APPROVED]`.
- **Table 4A (B2B):** Maps invoices with valid buyer GSTIN to statutory B2B outward supply schema.
- **Table 7 (B2CS):** Maps invoices without buyer GSTIN to B2C Small supplies by Place of Supply and tax rate.
- **Exclusions:** Ineligible invoices generate an audit record with explicit failure reasons.

---

## 20. Streamlit Application Architecture

The application (`app/dashboard.py`) provides 9 dedicated views:
1. Executive Overview & KPIs
2. Live Processing Pipeline (Upload & Process)
3. OCR & Preprocessing Inspector
4. Structured Extraction Viewer
5. GST & Financial Validation Hub
6. Confidence & Human Review Queue
7. GSTR-1 Draft Generator & Downloader
8. Performance Evaluation Analytics
9. Testing & Scientific Evaluation Hub

---

## 21. Testing Strategy

The repository maintains an automated Pytest test suite covering:
- Smoke tests (imports, environment)
- Preprocessing pipeline & deskewing
- OCR engine availability and text extraction
- Canonical schema defaults & extraction parsing
- Deterministic arithmetic, GSTIN regex, and tolerance
- Confidence scoring factors & safety overrides
- GSTR-1 mapping, B2B/B2C classification, and export writers
- Performance benchmarks & invariant assertions

---

## 22. Evaluation Methodology

Evaluations were conducted using high-resolution timers (`time.perf_counter()`), character/word error rate metrics (Levenshtein distance), and memory profilers (`resource` RSS and `tracemalloc`).

---

## 23. Experimental Results

### OCR Accuracy (Phase 10 Scientific Findings)
- **Raw Image OCR:** Mean CER = $22.70\%$, Mean WER = $80.71\%$, Mean Confidence = $52.79\%$.
- **Preprocessed OCR:** Mean CER = $5.67\%$, Mean WER = $38.90\%$, Mean Confidence = $80.74\%$.
- **Accuracy Improvement:** **75.0% relative reduction in CER**; **51.81% relative reduction in WER**.

### GSTR-1 Draft Generation (25 Invoices)
- **Input:** 25 synthetic invoices
- **Admitted:** 15 invoices (12 Table 4A B2B, 3 Table 7 B2CS)
- **Excluded:** 10 invoices (4 Noisy, 3 Rotated, 3 Invalid)
- **Admitted Value:** Taxable = ₹40,000.00, Tax = ₹7,200.00, Grand Total = ₹47,200.00.

---

## 24. Error Analysis

- **Noisy Invoices (`INV_NOISY_001..004`):** Heavy background artifacts caused token misreads, correctly caught by validation and confidence overrides.
- **Rotated Invoices (`INV_ROT_001..003`):** Deskew corrected primary axis, but residual character distortions triggered OCR quality guardrails, safely routing them to review/reprocessing.
- **Invalid Arithmetic (`INV_INV_001..003`):** Grand total mismatches were 100% intercepted by Rule `TOTAL-001`.

---

## 25. Performance Evaluation (Phase 11 Findings)

- **Single Clean Invoice Latency (`INV_CLEAN_001`):** Mean = **`0.702 s` (~702 ms)**.
  - File Loading: $0.005\text{ s}$ ($0.71\%$)
  - Preprocessing: $0.022\text{ s}$ ($3.08\%$)
  - OCR Text Extraction: $0.666\text{ s}$ ($94.88\%$) — **Primary Bottleneck**
  - Extraction + Validation + Confidence + Mapping: $< 0.001\text{ s}$ ($< 0.1\%$)
  - Export (openpyxl + CSV): $0.009\text{ s}$ ($1.23\%$)
- **25-Invoice Dataset End-to-End Latency:** Mean = **`0.742 s`**, Median = **`0.718 s`**, P95 = **`0.911 s`**.
- **Batch Throughput:** **78.7 invoices/minute** (1.31 invoices/sec) in single-threaded sequential execution.
- **Memory Profile:** Peak heap = $14.96\text{ MB}$, process RSS = $248.77\text{ MB}$, with zero unbounded memory growth.

---

## 26. Security Considerations

- API credentials stored exclusively in local `.env` (gitignored).
- No PII persistence beyond active runtime.
- Excel string sanitization prevents formula injection attacks.

---

## 27. Limitations

1. **Synthetic Dataset Scope:** Evaluated on 25 synthetic invoice images; real-world documents with cursive handwriting or physical tears may exhibit higher error rates.
2. **Phase 5 Real LLM Pending:** Real Gemini/OpenAI cloud extraction latency and cost remains unmeasured and deferred to the final roadmap phase.
3. **Complex Tables:** Multi-page nested tables or non-standard ledger layouts require human review.
4. **Draft Only:** Does not autonomously file returns or authenticate with the GST portal.

---

## 28. Future Enhancements

- Resumption of Phase 5 live Gemini 2.0 Flash / OpenAI GPT-4o empirical benchmarking.
- Asynchronous Celery/Redis queue for high-concurrency enterprise batch processing.
- Direct C-API `libtesseract` integration to eliminate subprocess process spawn overhead.

---

## 29. Phase Status Table

| Phase | Module / Milestone | Status |
| :--- | :--- | :--- |
| **Phase 0** | Requirements & System Architecture | **COMPLETE** |
| **Phase 1** | Project Foundation & Scaffolding | **COMPLETE** |
| **Phase 2** | Dataset & Ground Truth Generation | **COMPLETE** |
| **Phase 3** | OpenCV Image Preprocessing | **COMPLETE** |
| **Phase 4** | Tesseract OCR Integration & Evaluation | **COMPLETE** |
| **Phase 5** | LLM Structured Extraction | **PAUSED (Mock Active)** |
| **Phase 6** | Deterministic GST & Financial Validation | **COMPLETE** |
| **Phase 7** | Multi-Factor Confidence Scoring & Human Review | **COMPLETE** |
| **Phase 8** | GSTR-1 Draft Preparation & Export Layer | **COMPLETE** |
| **Phase 9** | Streamlit Dashboard & UI Integration | **COMPLETE** |
| **Phase 10**| Testing & Scientific Evaluation | **COMPLETE** |
| **Phase 11**| Performance Evaluation & Resource Profiling | **COMPLETE** |
| **Phase 12**| Documentation, Consistency & Release Finalization | **CURRENT (COMPLETE)** |

---

## 30. Conclusion

The AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System establishes an accurate, auditable, and mathematically safe pipeline for automating GST return preparation. By enforcing strict separation between AI semantic parsing and deterministic financial validation, the system eliminates hallucination risk while reducing character error rates by 75.0% and delivering reliable sub-second invoice processing. The repository is structurally complete, reproducible, and ready for final submission and demonstration.
