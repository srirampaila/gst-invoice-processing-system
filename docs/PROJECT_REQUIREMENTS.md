# Project Requirements

## 1. Project Objective
To build a working prototype that processes invoice images/PDFs, extracts GST-related information using OCR and an LLM, validates the extracted information using deterministic rules, flags uncertain records for human review, and generates a structured GSTR-1 draft CSV/Excel output. This is a GST filing assistance and draft-generation system.

## 2. Project Scope

### IN SCOPE
- Invoice image upload (JPEG, PNG, etc.)
- PDF invoice support
- Image preprocessing
- OCR (Optical Character Recognition)
- Structured invoice extraction
- LLM-assisted information extraction
- GSTIN validation
- Invoice field validation
- Tax amount validation
- Invoice total validation
- Missing field detection
- Duplicate invoice detection
- Confidence scoring
- Human verification (Human-in-the-loop)
- GSTR-1 draft generation
- CSV export
- Excel export
- Streamlit interface
- Testing and evaluation

### OUT OF SCOPE
- Automatic GST portal submission
- Autonomous tax filing
- Legal tax advice
- Production accounting integration
- Production ERP integration
- Enterprise-scale deployment
- Guaranteed tax compliance
- Replacing accountants/tax professionals

## 3. Functional Requirements

### A. Invoice Input
- **Supported Formats:** JPEG, PNG, TIFF for images; PDF for documents.
- **Processing Scope:** Single invoice processing for review; potential batch processing support for bulk extraction.
- **Invalid file handling:** Appropriate error messaging for unsupported formats or corrupted files.

### B. Image Processing
- **Image loading:** Handling multi-page PDFs by converting them to images.
- **Resize:** Scaling to optimal DPI for OCR.
- **Grayscale conversion:** Removing color channels to simplify processing.
- **Noise reduction:** Denoising (e.g., Gaussian blur).
- **Contrast enhancement:** Histogram equalization.
- **Thresholding:** Binarization (Otsu's method or adaptive).
- **Deskewing:** Auto-rotation to correct scanned alignment.

### C. OCR
- **Extraction:** Extract all textual content.
- **Error handling:** Handling garbled text or unreadable sections.
- **Empty result:** Detecting and handling when no text is found.
- **Quality Info:** Providing an aggregate confidence score from the OCR engine if available.

### D. AI Extraction
- Using LLM to extract fields based on a canonical JSON schema. See `DATA_MODEL.md` for specific fields (e.g., Invoice Number, Date, GSTINs, Items, Taxes).

### E. Validation
- Deterministic checks to validate math, GSTIN structure, and mandatory field presence. See `VALIDATION_SPECIFICATION.md`.

### F. Human Review
- Routing invoices to a manual review queue when confidence scores fall below threshold or validation checks fail.

### G. GSTR-1 Draft Generation
- Mapping canonical data model fields to GSTR-1 formats. (B2B, B2C, HSN summary formats).

### H. Export
- Generation of .csv and .xlsx files representing the GSTR-1 drafts.

## 4. Non-Functional Requirements
- **Usability:** Simple, intuitive upload and review workflow in Streamlit.
- **Reliability:** Validation must not depend entirely on LLM output (deterministic checks are mandatory).
- **Maintainability:** Modular Python architecture to easily swap OCR engines or LLM providers.
- **Testability:** Each major component should be independently testable with unit and integration tests.
- **Explainability:** The system must visually indicate *why* an invoice was flagged for review (e.g., "Tax mismatch: CGST+SGST != Total").

## 5. Security & Privacy Requirements
- **API key handling:** Use `.env` file, loaded via `python-dotenv`.
- **Credentials:** No hardcoded credentials in source code.
- **Temporary files:** Automatically delete temporary files (uploaded PDFs, processed images) after extraction.
- **Data retention:** Do not store invoice PII beyond the session/execution lifecycle unless explicitly designed for local dev databases.
- **Access control:** Assumed local/single-user for prototype, but built with secure context separation.
- **Logging:** Ensure sensitive fields (like customer names or amounts) are redacted or omitted in application logs.
