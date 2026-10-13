# System Architecture

## 1. Logical Layers

```text
┌─────────────────────────────┐
│       Streamlit UI          │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│     Application Layer       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Invoice Processing Pipeline │
└──────────────┬──────────────┘
               ↓
      ┌────────┴─────────┐
      ↓                  ↓
┌───────────┐      ┌─────────────┐
│ OCR Layer │      │ LLM Layer   │
└─────┬─────┘      └──────┬──────┘
      └────────┬───────────┘
               ↓
┌─────────────────────────────┐
│     Validation Engine       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Confidence / Review Engine  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ GSTR-1 Draft / Export Layer │
└─────────────────────────────┘
```

## 2. Processing Pipeline Workflow (OCR → LLM)

1. **Invoice Input:** User uploads file.
2. **Preprocessing:** Convert to image (if PDF), grayscale, deskew, threshold.
3. **OCR Layer:** Text extraction (e.g., Tesseract or cloud OCR). Outputs Raw Text.
4. **Text Cleaning:** Remove unnecessary whitespaces, normalize basic artifacts.
5. **LLM Layer:** Prompt the LLM with Raw Text and canonical JSON Schema. It extracts structured information (Not meant for final math validation).
6. **Structured JSON:** Output from LLM parsed into a Pydantic/dataclass model.
7. **Schema Validation:** Ensure the output conforms to expected types and structures.

## 3. Human-in-the-loop Workflow

```text
Invoice
   ↓
Extraction
   ↓
Validation
   ↓
Confidence
   ↓
 ┌─────────────┐
 │             │
PASS         REVIEW
 │             │
 ↓             ↓
Output     Human edits (Streamlit UI)
               ↓
           Re-validation
               ↓
             Output
```
- **What reviewer sees:** Original invoice image side-by-side with extracted data forms.
- **What fields can be edited:** All extracted fields.
- **What errors are displayed:** Explicit validation failures (e.g., "Tax Amount mismatch").
- **After correction:** Triggers re-validation to ensure manual edits didn't introduce new errors.

## 4. Project Folder Architecture

```text
gst-invoice-ai/
│
├── app/                  # Streamlit application UI
├── src/                  # Core application logic
│   ├── preprocessing/    # Image manipulation and cleanup
│   ├── ocr/              # OCR engine wrappers
│   ├── extraction/       # LLM prompting and structured parsing
│   ├── validation/       # Deterministic GST and math validation
│   ├── confidence/       # Confidence scoring logic
│   ├── gst/              # GSTR-1 formatting and specific tax logic
│   ├── export/           # CSV/Excel generation
│   └── utils/            # Shared utilities (logging, config)
│
├── data/                 # Development data (not for repo commit if sensitive)
│   ├── raw/
│   ├── processed/
│   ├── samples/
│   └── outputs/
│
├── tests/                # Pytest suites
│
├── docs/                 # Project documentation
│
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
├── .gitignore            # Ignore data/, .env, __pycache__, etc.
└── README.md             # Project overview
```
