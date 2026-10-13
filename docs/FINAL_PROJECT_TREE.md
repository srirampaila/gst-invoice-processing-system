# Final Project Directory Structure

```text
TT project/
├── .env.example                          # Environment template (API key placeholders)
├── .gitignore                            # Git exclusion rules (ignoring .env, data/raw, __pycache__)
├── README.md                             # Primary project overview, architecture & setup guide
├── requirements.txt                      # Project dependency manifest (Python 3.12 compatible)
│
├── app/                                  # Streamlit Web Application
│   ├── __init__.py
│   └── dashboard.py                      # Multi-view Streamlit UI (9 dedicated workspaces)
│
├── src/                                  # Core Application Source Code
│   ├── __init__.py
│   ├── preprocessing/                    # Image manipulation, contrast & deskew
│   │   ├── __init__.py
│   │   ├── config.py                     # PreprocessingConfig dataclass
│   │   ├── contrast.py                   # CLAHE & histogram contrast equalizer
│   │   ├── denoise.py                    # Bilateral filter edge-preserving denoiser
│   │   ├── deskew.py                     # Hough transform angle deskewer (±45°)
│   │   ├── grayscale.py                  # Channel reduction helper
│   │   ├── image_loader.py               # Safe image I/O loaders
│   │   ├── pipeline.py                   # preprocess_image() master orchestrator
│   │   ├── resize.py                     # DPI & scaling utilities
│   │   └── threshold.py                  # Otsu & Gaussian adaptive binarizer
│   │
│   ├── ocr/                              # Optical Character Recognition Engine
│   │   ├── __init__.py
│   │   ├── config.py                     # OCRConfig settings (psm, oem)
│   │   ├── engine.py                     # Tesseract CLI subprocess wrapper
│   │   ├── exceptions.py                 # OCREngineNotAvailableError, OCRProcessingError
│   │   ├── models.py                     # OCRResult Pydantic schema
│   │   └── service.py                    # extract_text() with word confidence calculation
│   │
│   ├── extraction/                       # Structured Canonical Parsing Layer
│   │   ├── __init__.py
│   │   ├── config.py                     # ExtractionConfig (provider selection)
│   │   ├── exceptions.py                 # MissingAPIKeyError, ExtractionError
│   │   ├── llm_client.py                 # MockLLMClient, GeminiClient, OpenAIClient
│   │   ├── models.py                     # CanonicalInvoice, Party, InvoiceItem, TaxSummary
│   │   ├── parser.py                     # JSON fence stripping and AST parsing
│   │   ├── prompts.py                    # System prompt templates & JSON schemas
│   │   └── service.py                    # ExtractionService orchestrator
│   │
│   ├── validation/                       # Deterministic GST & Financial Rules
│   │   ├── __init__.py
│   │   ├── arithmetic.py                 # Decimal math sum & discrepancy calculators
│   │   ├── config.py                     # ValidationConfig (amount_tolerance, strict_gstin)
│   │   ├── exceptions.py                 # ValidationError, RuleConfigurationError
│   │   ├── fields.py                     # Mandatory legal field validators
│   │   ├── gstin.py                      # 15-char structure & Modulo 36 checksum engine
│   │   ├── models.py                     # ValidationResult, ValidationIssue, GSTINResult
│   │   ├── rules.py                      # Comprehensive rule evaluation orchestrator
│   │   └── service.py                    # ValidationService API
│   │
│   ├── confidence/                       # Multi-Factor Scoring & Review Routing
│   │   ├── __init__.py
│   │   ├── config.py                     # ConfidenceConfig (weights, thresholds, penalties)
│   │   ├── exceptions.py                 # ConfidenceConfigError
│   │   ├── models.py                     # ConfidenceResult, ReviewRecord, TriggeredRule
│   │   ├── rules.py                      # 10 deterministic safety override rules
│   │   ├── scoring.py                    # 6 weighted factor score calculators
│   │   └── service.py                    # ConfidenceService API
│   │
│   ├── gst/                              # Statutory GSTR-1 Mapping & Generation
│   │   ├── __init__.py
│   │   ├── exceptions.py                 # GSTR1MappingError
│   │   ├── gstr1_generator.py            # GSTR1DraftGenerator batch orchestrator
│   │   ├── gstr1_mapper.py               # Canonical to B2B/B2C mapping logic
│   │   ├── gstr1_models.py               # GSTR1Draft, GSTR1B2BInvoice, GSTR1B2CSInvoice
│   │   └── gstr1_validator.py            # Draft integrity validator
│   │
│   ├── export/                           # Spreadsheet & CSV Export Engines
│   │   ├── __init__.py
│   │   ├── gstr1_csv.py                  # Combined, B2B, B2C, Exclusions CSV writers
│   │   └── gstr1_excel.py                # Openpyxl 5-sheet styled workbook generator
│   │
│   └── utils/                            # Shared Utilities & Evaluation Runners
│       ├── __init__.py
│       ├── dataset_validator.py          # Dataset integrity verification script
│       ├── evaluate_phase10.py           # Phase 10 Scientific evaluation runner
│       ├── evaluate_phase11_performance.py # Phase 11 Performance profiler runner
│       ├── generate_dataset.py           # Synthetic ground-truth generator script
│       └── logger.py                     # Centralized colorized logging setup
│
├── data/                                 # Datasets & Generated Artifacts
│   ├── raw/
│   │   ├── invoices/                     # 25 Synthetic benchmark PNG invoices
│   │   └── metadata/                     # dataset_catalog.csv & dataset_manifest.json
│   ├── processed/                        # Preprocessed image cache
│   └── outputs/                          # Persisted machine-readable evaluation outputs
│       ├── evaluation/                   # Phase 10 accuracy & confusion metrics
│       ├── performance/                  # Phase 11 latency, throughput & memory metrics
│       └── gstr1/                        # Sample exported GSTR-1 CSV & Excel files
│
├── tests/                                # Automated Pytest Test Suite (108 Tests)
│   ├── __init__.py
│   ├── test_smoke.py                     # Basic environment & import tests (3 tests)
│   ├── test_preprocessing.py             # OpenCV pipeline & deskew tests (5 tests)
│   ├── test_ocr.py                       # Tesseract engine & service tests (4 tests)
│   ├── test_extraction.py                # Canonical schema & parser tests (15 tests)
│   ├── test_validation.py                # GSTIN, PAN & arithmetic tests (14 tests)
│   ├── test_confidence.py                # Multi-factor weights & overrides (20 tests)
│   ├── test_gstr1.py                     # Table 4A/7 mapping & exports (24 tests)
│   ├── test_app_integration.py           # Streamlit session & state tests (5 tests)
│   ├── test_evaluation_phase10.py        # Phase 10 Scientific evaluation tests (10 tests)
│   ├── test_performance_phase11.py       # Phase 11 Performance tests (7 tests)
│   └── test_dataset_integrity.py         # Dataset catalog vs file test (1 test)
│
└── docs/                                 # Project Documentation & Phase Reports
    ├── PROJECT_REQUIREMENTS.md           # Scope, functional & non-functional requirements
    ├── SYSTEM_ARCHITECTURE.md            # Initial logical layer architecture
    ├── FINAL_SYSTEM_ARCHITECTURE.md      # Final comprehensive architecture specification
    ├── DATA_MODEL.md                     # Canonical invoice schema specification
    ├── VALIDATION_SPECIFICATION.md       # GST & financial validation rule specifications
    ├── DEVELOPMENT_ROADMAP.md            # Multi-phase milestone roadmap
    ├── DATASET_DOCUMENTATION.md          # 25-invoice benchmark documentation
    ├── EVALUATION_SUMMARY.md             # Summary of scientific and performance metrics
    ├── USER_GUIDE.md                     # Application operational walkthrough
    ├── DEVELOPER_GUIDE.md                # Technical developer reference
    ├── CROSS_PHASE_SYSTEM_AUDIT.md       # Pre-release cross-phase audit report
    ├── FINAL_PROJECT_REPORT.md           # 30-section final project report
    ├── VIVA_PREPARATION.md               # Presentation & viva examination material
    ├── PRESENTATION_OUTLINE.md           # Suggested 17-slide deck structure
    ├── FINAL_RELEASE_CHECKLIST.md        # Pre-release verification checklist
    ├── PHASE_12_FINALIZATION_REPORT.md   # Phase 12 milestone completion report
    └── (Historical Phase 1–11 Reports)   # Immutable historical audit trail
```
