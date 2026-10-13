# Final System Architecture Specification

**AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System**  
**Document Version:** 1.0 (Final Release)  
**Date:** October 8, 2026  
**System Status:** Core Pipeline Verified | Phase 5 Mock Architecture Isolated | Production-Ready Architecture  

---

## 1. Architectural Vision & Design Principles

The AI-Powered GST Invoice Processing System is designed to bridge the gap between unstructured document acquisition (scanned PDFs and mobile image captures) and statutory tax return drafting (GSTR-1). 

The architectural philosophy adheres to four non-negotiable principles:

1. **Separation of Extraction vs. Verification:** 
   - Optical Character Recognition (OCR) and Large Language Models (LLMs) are used strictly as probabilistic semantic parsers.
   - Deterministic financial integrity, tax rate validation, arithmetic reconciliation, and GST statutory rules are enforced purely in Python using high-precision Decimal math.
   - An LLM is **never** trusted for mathematical totals or legal compliance.
2. **Deterministic Safety Containment:**
   - Erroneous or corrupted data upstream is intercepted by multi-tier safety overrides.
   - Critical validation errors (such as grand total discrepancies or invalid seller GSTINs) permanently block GSTR-1 admission. Human approval cannot bypass critical mathematical or legal validation errors.
3. **Traceable Audit Lineage:**
   - Every downstream GSTR-1 line item and exclusion record retains an immutable `source_invoice_id` pointing directly to the original file and OCR extraction trace.
4. **Controlled Downstream Scope (Drafting, Not Filing):**
   - The system prepares structured, compliant GSTR-1 draft datasets in CSV and Excel format for accountant review. It explicitly avoids automated portal login, CAPTCHA bypass, or autonomous tax filing.

---

## 2. End-to-End System Pipeline Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. INVOICE INGESTION                            │
│  - Supported Formats: PNG, JPEG, TIFF, PDF                             │
│  - Validation: File existence, size bounds, header format validation   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    2. OPENCV IMAGE PREPROCESSING                       │
│  - Grayscale conversion (cv2.cvtColor)                                 │
│  - Bilateral noise reduction (cv2.bilateralFilter)                     │
│  - Contrast enhancement (cv2.equalizeHist / CLAHE)                     │
│  - Hough line transform deskewing (up to ±45°)                         │
│  - Adaptive text binarization (cv2.adaptiveThreshold)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        3. TESSERACT OCR ENGINE                         │
│  - Tesseract 5.5.3 CLI engine invocation                               │
│  - Output: Raw recognized UTF-8 text string + bounding box metadata   │
│  - OCR recognition confidence scoring (0-100%)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               4. STRUCTURED EXTRACTION (CANONICAL MODEL)               │
│  - ExtractionService provider abstraction                              │
│  - Active Provider: MockLLMClient (deterministic regex & heuristics)   │
│  - Extensible Interface: GeminiClient / OpenAIClient (Phase 5 paused)   │
│  - Output: CanonicalInvoice (Pydantic v2 data model)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              5. DETERMINISTIC GST & FINANCIAL VALIDATION               │
│  - GSTIN 15-char structure, state code & Modulo 36 checksum check      │
│  - Mandatory legal field presence (Inv No, Date, Seller GSTIN, Total)  │
│  - Line-item math: (Qty × Unit Price == Taxable Value)                 │
│  - Tax rate reconciliation: (Taxable × Rate == CGST + SGST or IGST)    │
│  - Grand Total check: (Taxable + Taxes == Grand Total ± ₹1.00)         │
│  - Output: ValidationResult (PASS, WARNING, FAIL)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                6. MULTI-FACTOR CONFIDENCE SCORING                      │
│  - Factor breakdown: OCR (15%), Field Completeness (15%),             │
│    Critical Fields (20%), GSTIN (20%), Math (20%), Line Items (10%)    │
│  - Hard Safety Overrides: Capped tiers & forced review on failures     │
│  - Tiers: HIGH (≥85%), MEDIUM (60-84%), LOW (<60%)                     │
│  - Recommendations: AUTO_ACCEPT, REVIEW_REQUIRED, REJECT_OR_REPROCESS  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   7. HUMAN-IN-THE-LOOP REVIEW QUEUE                    │
│  - Interactive Streamlit workspace (Side-by-side original image + form)│
│  - Actions: APPROVE, REJECT, REQUEST_REPROCESSING                      │
│  - Invariant: Human approval CANNOT override critical math errors      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  8. GSTR-1 DRAFT SCHEMA MAPPING                        │
│  - Eligibility Gate: Validated + (AUTO_ACCEPT or APPROVED)             │
│  - B2B Routing: Buyer GSTIN present → GSTR-1 Table 4A                  │
│  - B2C Routing: Unregistered Buyer → GSTR-1 Table 7 (B2CS)             │
│  - Exclusions Catalog: Detailed audit log of rejected invoices         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        9. EXPORT & REPORTING                           │
│  - Combined & Partitioned CSVs (Portal-compliant schema)               │
│  - Formatted Excel Workbook (openpyxl): Summary, Table 4A, Table 7,    │
│    Exclusions, Validation Report                                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Responsibilities and Boundaries

### 3.1 `src/preprocessing/`
- **Purpose:** Enhances low-quality, noisy, or rotated invoice captures before OCR.
- **Key Files:** `image_loader.py`, `grayscale.py`, `denoise.py`, `contrast.py`, `deskew.py`, `threshold.py`, `pipeline.py`.
- **Invariants:** Does not mutate original image files; returns new processed numpy arrays or saves to designated cache targets.

### 3.2 `src/ocr/`
- **Purpose:** Extracts raw UTF-8 text and word-level confidence distributions.
- **Key Files:** `engine.py`, `service.py`, `models.py`, `config.py`.
- **Invariants:** Gracefully returns `OCRResult(success=False, error=...)` when files are missing or unreadable; never crashes the pipeline.

### 3.3 `src/extraction/`
- **Purpose:** Transforms unstructured text into the canonical Pydantic data model.
- **Key Files:** `models.py` (`CanonicalInvoice`, `Party`, `InvoiceItem`, `TaxSummary`), `service.py`, `llm_client.py`, `prompts.py`, `parser.py`.
- **Invariants:** Decoupled provider factory (`mock`, `gemini`, `openai`). Phase 5 real-API clients are safely isolated behind environment variable guards.

### 3.4 `src/validation/`
- **Purpose:** Executes zero-tolerance deterministic mathematical and GST regulatory checks.
- **Key Files:** `service.py`, `rules.py`, `gstin.py`, `arithmetic.py`, `fields.py`, `models.py`, `config.py`.
- **Invariants:** Purely read-only evaluation. Extracted numeric values are never altered, guessed, or auto-corrected.

### 3.5 `src/confidence/`
- **Purpose:** Computes weighted reliability scores and triggers deterministic review overrides.
- **Key Files:** `service.py`, `scoring.py`, `rules.py`, `models.py`, `config.py`.
- **Invariants:** 6 factor weights strictly sum to 1.0 (100%). Hard overrides immediately supersede composite numerical scores.

### 3.6 `src/gst/` & `src/export/`
- **Purpose:** Maps validated canonical models to statutory GSTR-1 structures and exports CSV/Excel files.
- **Key Files:** `gstr1_models.py`, `gstr1_mapper.py`, `gstr1_generator.py`, `gstr1_validator.py`, `gstr1_csv.py`, `gstr1_excel.py`.
- **Invariants:** Ineligible records are excluded into audit logs; no recipient GSTIN is ever fabricated for B2C records.

---

## 4. Technology Stack & Execution Environment

- **Language:** Python 3.12.15 (CPython 64-bit)
- **Computer Vision:** OpenCV (`opencv-python-headless 4.13.0.92`)
- **OCR Engine:** Tesseract 5.5.3 via `pytesseract 0.3.13`
- **Data Validation & Schemas:** Pydantic v2 (`2.12.5`)
- **Numeric & Tabular Data:** NumPy (`2.4.3`), Pandas (`2.3.3`)
- **Spreadsheet Generation:** Openpyxl (`3.1.5`)
- **User Interface:** Streamlit (`1.32.2`)
- **Test Architecture:** Pytest (`8.1.1`)
- **Host OS:** macOS Darwin 25.3.0 (Apple Silicon arm64)
