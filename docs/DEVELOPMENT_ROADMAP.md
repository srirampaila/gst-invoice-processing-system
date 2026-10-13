# Development Roadmap & Risk Register

## Development Phase Plan

### Phase 0: Requirements & Architecture
- **Goal:** Define system scope and design.
- **Output:** All architecture docs (Current Phase).

### Phase 1: Project Foundation
- **Goal:** Setup repo, environments, dependencies, and folder structure.
- **Completion Criteria:** Basic CLI structure runs without errors.

### Phase 2: Dataset & Ground Truth
- **Goal:** Collect and annotate sample invoices.
- **Completion Criteria:** Dev and Test datasets available locally.

### Phase 3: Image Preprocessing
- **Goal:** Implement image loading, grayscale, deskew, and binarization.
- **Completion Criteria:** Preprocessing script outputs clean images.

### Phase 4: OCR Engine
- **Goal:** Extract text using Tesseract/Cloud OCR.
- **Completion Criteria:** Raw text files generated for test images.

### Phase 5: LLM Extraction
- **Goal:** Map OCR text to JSON using prompt engineering.
- **Completion Criteria:** Valid JSON outputs conforming to Schema.

### Phase 6: GST Validation Engine
- **Goal:** Implement deterministic checks (math, GSTIN logic).
- **Completion Criteria:** Engine correctly flags synthetic errors.

### Phase 7: Confidence + Human Review
- **Goal:** Implement scoring and state transitions (VALID/REVIEW).
- **Completion Criteria:** Confidence function scores invoices accurately.

### Phase 8: GSTR-1 Draft Generator
- **Goal:** Map structured JSON to CSV/Excel.
- **Completion Criteria:** Valid GSTR-1 CSV format produced.

### Phase 9: Streamlit Dashboard
- **Goal:** Build UI for upload and Human-in-the-loop review.
- **Completion Criteria:** Working local web app handling full flow.

### Phase 10: Testing
- **Goal:** Write unit and integration tests.
- **Completion Criteria:** Code coverage > 80% on core logic.

### Phase 11: Evaluation
- **Goal:** Run test set and compute metrics.
- **Completion Criteria:** Final metric report generated.

### Phase 12: Documentation + Demo
- **Goal:** Finalize README, user guide, and demo video.

---

## Risk Register

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Poor OCR Quality** | Low extraction accuracy due to missed text. | Apply robust pre-processing (deskew, binarization); test multiple OCR engines. |
| **LLM Hallucination** | Invented invoice numbers or tax amounts. | Enforce strict structured JSON outputs; rely entirely on Validation Engine to catch discrepancies. |
| **Tax Calculation Edge Cases** | False positives in math validation due to rounding. | Implement tolerance thresholds (e.g., +/- 1 INR) in math validation. |
| **API Failures (LLM)** | System downtime. | Implement retries with exponential backoff; gracefully degrade to manual review queue. |
| **Sensitive Data Exposure** | PII leak in code repository. | Use `.gitignore` for data folders; never commit logs or invoice samples. |
| **Different Layouts** | LLM struggles to associate items with taxes in weird tables. | Use advanced prompting techniques (e.g., few-shot) providing examples of complex layouts. |
