# Developer & Architecture Guide

**AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System**  
**Audience:** Software Engineers, ML Engineers, GST System Architects  
**Python Version:** 3.12+  

---

## 1. Environment Setup & Installation

### 1.1 Prerequisites
- **Python 3.12**
- **Tesseract OCR 5.x** (Required for text extraction)
  - macOS: `brew install tesseract`
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
  - Windows: Download installer from official UB Mannheim repository

### 1.2 Local Setup
```bash
# Clone or navigate to the workspace
cd "TT project"

# Create and activate virtual environment
python3.12 -m venv .venv
source .venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 2. Directory Structure & Key Modules

```
├── app/
│   └── dashboard.py               # Streamlit Multi-View Application UI
├── src/
│   ├── preprocessing/             # OpenCV Image Enhancement & Deskew
│   │   ├── pipeline.py            # Main preprocess_image() entry point
│   │   ├── deskew.py              # Hough transform rotation correction
│   │   └── config.py              # PreprocessingConfig dataclass
│   ├── ocr/                       # Tesseract OCR Wrapper
│   │   ├── engine.py              # TesseractEngine process invocation
│   │   ├── service.py             # extract_text() with confidence metrics
│   │   └── models.py              # OCRResult Pydantic model
│   ├── extraction/                # LLM / Canonical Parsing Layer
│   │   ├── models.py              # CanonicalInvoice, Party, LineItem, TaxSummary
│   │   ├── service.py             # ExtractionService orchestrator
│   │   └── llm_client.py          # MockLLMClient, GeminiClient, OpenAIClient
│   ├── validation/                # Deterministic GST & Financial Rules
│   │   ├── service.py             # ValidationService orchestrator
│   │   ├── rules.py               # Rule evaluation engine (Decimal math)
│   │   └── gstin.py               # 15-char structure & Modulo 36 checksum
│   ├── confidence/                # Multi-Factor Scoring & Review Engine
│   │   ├── service.py             # ConfidenceService orchestrator
│   │   ├── scoring.py             # 6 weighted factor evaluation functions
│   │   └── rules.py               # 10 deterministic safety override rules
│   ├── gst/                       # GSTR-1 Draft Mapper & Generator
│   │   ├── gstr1_models.py        # GSTR1Draft, GSTR1B2BInvoice, GSTR1B2CSInvoice
│   │   ├── gstr1_mapper.py        # Canonical to GSTR-1 mapping logic
│   │   └── gstr1_generator.py     # Batch draft compilation engine
│   ├── export/                    # CSV & Formatted Excel Generators
│   │   ├── gstr1_csv.py           # Combined and partitioned CSV writers
│   │   └── gstr1_excel.py         # Openpyxl 5-sheet styled workbook generator
│   └── utils/                     # Benchmarks & Batch Evaluation Scripts
│       ├── evaluate_phase10.py    # Phase 10 Scientific evaluation runner
│       └── evaluate_phase11_performance.py # Phase 11 Performance profiler
├── data/
│   ├── raw/invoices/              # 25 Canonical test invoice PNG images
│   ├── raw/metadata/              # Catalog CSV and JSON manifest
│   └── outputs/                   # Generated evaluation & performance artifacts
└── tests/                         # Pytest test suites (108 automated tests)
```

---

## 3. Core Data Contracts (Pydantic v2)

### 3.1 `CanonicalInvoice` (`src/extraction/models.py`)
The central internal data model representing extracted invoice content:
```python
class CanonicalInvoice(BaseModel):
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    seller: Party = Field(default_factory=Party)
    buyer: Party = Field(default_factory=Party)
    place_of_supply: Optional[str] = None
    items: List[InvoiceItem] = Field(default_factory=list)
    tax_summary: TaxSummary = Field(default_factory=TaxSummary)
    grand_total: Optional[float] = None
    currency: Optional[str] = "INR"
    extraction_metadata: ExtractionMetadata = Field(default_factory=ExtractionMetadata)
```

### 3.2 `ValidationResult` (`src/validation/models.py`)
Output of deterministic GST and arithmetic checks:
```python
class ValidationResult(BaseModel):
    invoice_id: str
    status: str = Field(description="PASS, WARNING, or FAIL")
    passed: bool = True
    requires_review: bool = False
    error_count: int = 0
    warning_count: int = 0
    issues: List[ValidationIssue] = Field(default_factory=list)
    calculated_values: CalculatedFinancials = Field(default_factory=CalculatedFinancials)
```

---

## 4. Running Tests & Benchmarks

### 4.1 Running the Full Test Suite
```bash
pytest -v
```
Expected output: `108 passed, 4 warnings in ~58s`.

### 4.2 Running the Scientific Evaluation Engine (Phase 10)
```bash
python src/utils/evaluate_phase10.py
```
Regenerates accuracy metrics, CER/WER statistics, and confusion matrices in `data/outputs/evaluation/`.

### 4.3 Running the Performance & Profiling Engine (Phase 11)
```bash
python src/utils/evaluate_phase11_performance.py
```
Regenerates latency, batch throughput, memory profiling, and bottleneck analysis in `data/outputs/performance/`.

---

## 5. Security & LLM Provider Configuration (Phase 5)

- **Default State:** `ExtractionConfig(provider="mock")` is active. No external network requests are made.
- **Enabling Real LLM Providers (End-of-Roadmap Step):**
  1. Add your API key to `.env`:
     ```env
     GEMINI_API_KEY="your-gemini-api-key"
     # or
     OPENAI_API_KEY="your-openai-api-key"
     ```
  2. Instantiate the service with the desired provider:
     ```python
     from src.extraction.config import ExtractionConfig
     from src.extraction.service import ExtractionService
     
     service = ExtractionService(ExtractionConfig(provider="gemini", model_name="gemini-2.0-flash"))
     ```
  3. Never commit `.env` or credentials to version control.
