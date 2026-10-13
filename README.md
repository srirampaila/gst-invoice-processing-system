# AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System

**Subtitle:** An Intelligent OCR and LLM-Based System for Automated Invoice Extraction, GST Validation, and Return Preparation Assistance  
**Release Version:** 1.0 (Phase 12 Final Release)  
**Status:** Phases 0–4, 6–12 COMPLETE | Phase 5 PAUSED (Mock Extraction Active; Real LLM Validation at Roadmap Completion)  

---

## 1. Project Overview

This project is an end-to-end intelligent document processing system designed to assist businesses, accounting professionals, and tax practitioners in automating Indian GST invoice digitization, deterministic mathematical verification, human-in-the-loop review, and statutory GSTR-1 return preparation.

### Core Architectural Separation of Concerns
1. **Unstructured Data Acquisition & Vision (OpenCV + Tesseract):** Ingests diverse invoice captures (PDF, PNG, JPEG), removes noise, corrects rotational tilt (up to $\pm 45^\circ$), and extracts text tokens.
2. **Semantic Structuring (Canonical Schema):** Maps text into a standardized Pydantic v2 `CanonicalInvoice` schema.
3. **Deterministic Financial Verification (Python Decimal Engine):** Enforces zero-tolerance validation for GSTIN structure, Modulo 36 checksums, Place of Supply tax exclusivity (CGST+SGST vs. IGST), and line-item/grand total arithmetic with statutory ₹1.00 tolerance.
4. **Multi-Factor Confidence & Risk Overrides:** Scores uncertainty across 6 dimensions and applies 10 hard safety overrides to protect downstream data integrity.
5. **Human-in-the-Loop Review Queue (Streamlit):** Enables visual side-by-side editing with live re-validation. **Human approval cannot bypass critical mathematical errors.**
6. **GSTR-1 Draft Preparation & Export:** Classifies transactions into Table 4A (B2B) and Table 7 (B2CS) and exports formatted Excel workbooks and portal-compliant CSVs.

---

## 2. High-Level Pipeline Architecture

```text
Invoice Image / PDF
       │
       ▼
[OpenCV Preprocessing] ── (Grayscale, Bilateral Denoise, CLAHE, Hough Deskew)
       │
       ▼
[Tesseract OCR 5.5.3]  ── (Raw UTF-8 Text Tokens & Confidence Scoring)
       │
       ▼
[Extraction Service]   ── (Decoupled Provider Factory → Canonical Pydantic Schema)
       │
       ▼
[GST & Math Engine]    ── (Deterministic Decimal Math, GSTIN Mod-36, ₹1.00 Tolerance)
       │
       ▼
[Confidence Scoring]   ── (6 Weighted Factors + 10 Hard Regulatory Overrides)
       │
       ├───> [Streamlit Human Review Queue] (If Score < 85% or Overrides Triggered)
       │
       ▼
[GSTR-1 Draft Mapper]  ── (Table 4A B2B vs. Table 7 B2CS Classification)
       │
       ▼
[Export Engine]        ── (5-Sheet Excel Workbook + Portal-Compliant CSVs)
```

---

## 3. Quick Start & Installation

### 3.1 Prerequisites
- **Python 3.12**
- **Tesseract OCR 5.x**
  - macOS: `brew install tesseract`
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
  - Windows: Download UB Mannheim installer

### 3.2 Environment Setup
```bash
# Clone or navigate to the repository root
cd "TT project"

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 3.3 Running the Streamlit Web Application
```bash
streamlit run app/dashboard.py
```
Open your browser at `http://localhost:8501` to access the 9 interactive workspaces.

### 3.4 Running Automated Tests & Verification
```bash
# Run full Pytest test suite (108 tests)
pytest -v

# Run Phase 10 Scientific Evaluation Engine
python src/utils/evaluate_phase10.py

# Run Phase 11 Performance & Profiling Engine
python src/utils/evaluate_phase11_performance.py
```

---

## 4. Key Experimental Results (25-Invoice Benchmark Dataset)

- **OCR Accuracy:** OpenCV preprocessing reduced Character Error Rate (CER) from **22.70% $\rightarrow$ 5.67%** (a **75.0% relative improvement**) and Word Error Rate (WER) from **80.71% $\rightarrow$ 38.90%** (a **51.81% relative improvement**).
- **Arithmetic Error Detection:** **100.0% (3/3)** detection of intentional grand total arithmetic discrepancies (`TOTAL-001`).
- **GSTR-1 Return Gating:** 15 compliant invoices admitted (12 Table 4A B2B, 3 Table 7 B2CS); 10 non-compliant invoices quarantined with full lineage.
- **Latency & Throughput:** Single clean invoice latency of **0.702 seconds** (~702 ms); batch throughput of **78.7 invoices/minute** in single-threaded execution.
- **Memory Stability:** Peak heap memory of 14.96 MB with zero unbounded memory growth.
- **Test Coverage:** **108 of 108 automated tests passing (100% success rate)**.

---

## 5. Phase Status & Roadmap

| Phase | Milestone | Status | Description |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Requirements & System Architecture | **COMPLETE** | System specifications and scope definition. |
| **Phase 1** | Project Foundation & Scaffolding | **COMPLETE** | Directory structure, logging, and environment. |
| **Phase 2** | Dataset & Ground Truth Generation | **COMPLETE** | 25 synthetic benchmark invoices across 7 categories. |
| **Phase 3** | OpenCV Image Preprocessing | **COMPLETE** | Denoising, contrast adjustment, and Hough deskewing. |
| **Phase 4** | Tesseract OCR Integration | **COMPLETE** | OCR text extraction and CER/WER benchmarking. |
| **Phase 5** | LLM Structured Extraction | **PAUSED** | Mock extraction active; real Gemini/OpenAI deferred to final step. |
| **Phase 6** | Deterministic GST Validation Engine | **COMPLETE** | Decimal math, GSTIN structure, and ₹1.00 tolerance. |
| **Phase 7** | Confidence Scoring & Human Review | **COMPLETE** | 6-factor weighted scoring and 10 safety overrides. |
| **Phase 8** | GSTR-1 Draft Generation & Export | **COMPLETE** | B2B/B2C mapping, CSV, and 5-sheet Excel workbook. |
| **Phase 9** | Streamlit Dashboard Integration | **COMPLETE** | 9 interactive UI workspaces and review queues. |
| **Phase 10**| Testing & Scientific Evaluation | **COMPLETE** | Evaluation engine and 10 machine-readable artifacts. |
| **Phase 11**| Performance Evaluation & Profiling | **COMPLETE** | Sub-microsecond latency, throughput, and CPU profiling. |
| **Phase 12**| Documentation & Release Finalization| **COMPLETE** | Comprehensive report suite and developer manuals. |
| **Phase 5 Resumption** | Real Cloud LLM Benchmarking | **FINAL** | Empirical Gemini 2.0 Flash / OpenAI GPT-4o validation. |

---

## 6. Comprehensive Documentation Index

- [Final Project Report (30 Sections)](docs/FINAL_PROJECT_REPORT.md)
- [Final System Architecture Specification](docs/FINAL_SYSTEM_ARCHITECTURE.md)
- [User Operational Guide](docs/USER_GUIDE.md)
- [Developer & Architecture Guide](docs/DEVELOPER_GUIDE.md)
- [Dataset & Ground Truth Documentation](docs/DATASET_DOCUMENTATION.md)
- [Evaluation & Benchmarking Summary](docs/EVALUATION_SUMMARY.md)
- [Pre-Release Cross-Phase System Audit](docs/CROSS_PHASE_SYSTEM_AUDIT.md)
- [Viva & Examination Preparation Guide](docs/VIVA_PREPARATION.md)
- [Final Presentation Slide Outline](docs/PRESENTATION_OUTLINE.md)
- [Final Pre-Release Verification Checklist](docs/FINAL_RELEASE_CHECKLIST.md)
- [Final Project Directory Tree](docs/FINAL_PROJECT_TREE.md)

---

## 7. Important Statutory Notice & Scope Boundaries

> **STATUTORY DISCLAIMER:** This system is an automated draft preparation tool designed to assist qualified accountants. It **does not file tax returns** autonomously with the GST portal, does not bypass authentication, and does not provide legal tax advisory. All generated GSTR-1 CSV and Excel files must be reviewed by an authorized signatory prior to official filing.
