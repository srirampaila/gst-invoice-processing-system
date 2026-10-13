# Dataset & Evaluation Strategy

## 1. Dataset Strategy

### Categories of Invoices Needed
1. Clear, standard digital PDFs (Baseline)
2. Low-quality / scanned images
3. Rotated / skewed invoices
4. Multi-item / multi-page invoices
5. Different tabular layouts
6. Invoices with missing fields (e.g., missing buyer GSTIN - B2C)
7. Invalid GST data (synthetic errors)
8. Tax mismatch / Math calculation errors (synthetic errors)

### Dataset Splits
- **Development (Dev):** 20-30 invoices for building the LLM prompts and OCR tuning.
- **Validation (Val):** 20 invoices to tune the confidence threshold parameters.
- **Test (Hold-out):** 50+ invoices to evaluate the final system performance.

### Ground-Truth Format
Manual annotation into the canonical JSON schema (`DATA_MODEL.md`) for the Test set.

## 2. Evaluation Metrics

### Extraction Accuracy
- Field-level exact match percentage.
- String distance (Levenshtein) for names/descriptions.

### Validation Accuracy
- Precision/Recall of identifying `INVALID` or `REVIEW_REQUIRED` correctly.
- False Positive rate for human review (invoices that were perfect but flagged).

### Processing Time
- Average End-to-End time per invoice (OCR + LLM latency).

### Review Rate
- Percentage of total processed invoices requiring human intervention (Target: minimize this).

### Duplicate Detection
- Recall on synthetically injected duplicates.
