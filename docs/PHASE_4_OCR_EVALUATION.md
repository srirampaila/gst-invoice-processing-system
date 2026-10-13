# Phase 4 OCR Evaluation Report

**Project:** AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System  
**Phase:** Phase 4 — OCR Engine & Empirical Preprocessing Evaluation  
**Date:** 2026-10-06  
**Status:** COMPLETE  

---

## 1. Objective
The primary objective of Phase 4 is to integrate an Optical Character Recognition (OCR) engine into the invoice processing pipeline, execute batch extraction across the canonical dataset, and empirically evaluate the impact of Phase 3 image preprocessing (upscaling, denoising, CLAHE contrast enhancement, and deskewing) against raw, unprocessed invoice images.

---

## 2. OCR Architecture
The OCR layer is housed in `src/ocr/` and follows a modular separation of concerns:
- **`src/ocr/config.py` (`OCRConfig`):** Encapsulates language selection, page segmentation mode (PSM), OCR engine mode (OEM), timeout limits, and confidence reporting thresholds.
- **`src/ocr/models.py` (`OCRResult`):** Standard dataclass modeling output metadata including `source_file`, `raw_text`, `processing_time`, `average_confidence`, `word_count`, `character_count`, `success`, and `error`.
- **`src/ocr/exceptions.py`:** Explicit domain exceptions (`OCRError`, `OCREngineNotAvailableError`, `OCRProcessingError`).
- **`src/ocr/engine.py` (`TesseractEngine`):** Direct interface to the underlying `pytesseract` and system `tesseract` binary, encapsulating binary availability verification, text extraction, and character/word-level data extraction.
- **`src/ocr/service.py` (`extract_text`):** High-level entry point that loads image arrays via OpenCV, manages lifecycle exceptions, calculates word/character metrics, derives average word confidences, and returns structured `OCRResult` records.

---

## 3. Tesseract Configuration
- **Engine:** Tesseract OCR `5.5.3` (Leptonica `1.87.0`)
- **Python Binding:** `pytesseract 0.3.10`
- **Language:** English (`eng`)
- **Page Segmentation Mode (PSM):** `6` (Assume a single uniform block of text)
- **OCR Engine Mode (OEM):** `3` (Default based on what is available / LSTM neural net mode)
- **Timeout:** 30 seconds per invoice

---

## 4. Dataset
The evaluation dataset consists of 25 synthetic invoice images and accompanying JSON ground-truth definitions located in `data/raw/invoices/`:
- **Clean Invoices (5):** `INV_CLEAN_001` – `005` (Standard baseline single-item invoices)
- **Multi-Item Invoices (5):** `INV_MULTI_001` – `005` (Invoices containing 3 distinct line items)
- **Noisy Invoices (4):** `INV_NOISY_001` – `004` (Invoices with Gaussian blur degradation)
- **Rotated Invoices (3):** `INV_ROT_001` – `003` (Invoices rotated by 5°, 10°, and 15°)
- **Missing Fields (3):** `INV_MISS_001` – `003` (B2C invoices lacking Buyer GSTIN)
- **Invalid Math (3):** `INV_INV_001` – `003` (Invoices with mismatched totals for validation testing)
- **Duplicate Invoices (2):** `INV_DUP_001` – `002` (Duplicate copies of earlier clean invoices)

Both raw images (`data/raw/invoices/`) and preprocessed final images (`data/processed/final/`) were processed through identical OCR configurations.

---

## 5. Batch Processing
Batch execution is orchestrated by `src/utils/process_ocr_batch.py`:
- Processes all 25 raw invoice images (`data/raw/invoices/*.png`).
- Processes all 25 preprocessed invoice images (`data/processed/final/*.png`).
- Extracts raw text, computes latency, and aggregates token-level confidence scores.
- Persists raw text outputs and JSON metadata per invoice stage.
- Generates a consolidated CSV report in `data/outputs/ocr/evaluation_results.csv`.

---

## 6. Output Structure
Artifacts are systematically organized under `data/outputs/ocr/`:
- **Raw Text Artifacts (`data/outputs/ocr/original/`):** 25 uncleaned `.txt` files from original images.
- **Preprocessed Text Artifacts (`data/outputs/ocr/preprocessed/`):** 25 uncleaned `.txt` files from preprocessed images.
- **Execution Metadata (`data/outputs/ocr/metadata/`):** 50 JSON metadata records (`{invoice_id}_original.json` and `{invoice_id}_preprocessed.json`) documenting exact engine parameters, confidence, word count, character count, and latency.
- **Per-Invoice Evaluation Matrix (`data/outputs/ocr/evaluation_results.csv`):** Per-record comparative metrics table.

---

## 7. Ground-Truth Reference Methodology
Because synthetic invoice images were rendered from structured JSON ground truth, deterministic reference texts are constructed by standardizing field keys in canonical order:
```text
INVOICE NUMBER: {invoice_number}
DATE: {invoice_date}
SELLER GSTIN: {seller.gstin}
BUYER GSTIN: {buyer.gstin} (if present)
ITEM {i}: {taxable_value} (Taxable), CGST: {cgst}, SGST: {sgst}
TOTAL TAXABLE: {taxable_value}
CGST: {cgst}
SGST: {sgst}
IGST: {igst} (if > 0)
GRAND TOTAL: {grand_total}
```
Whitespace is normalized during metric comparisons to ensure that formatting differences do not distort character/word distance measurements.

---

## 8. CER Methodology
Character Error Rate (CER) is calculated using Levenshtein edit distance at the character level:
$$\text{CER} = \frac{\text{LevenshteinDistance}(\text{ReferenceText}, \text{ActualText})}{\max(\text{len}(\text{ReferenceText}), 1)}$$
A CER closer to `0.0` represents higher character fidelity.

---

## 9. WER Methodology
Word Error Rate (WER) is calculated using Levenshtein edit distance on whitespace-tokenized word sequences:
$$\text{WER} = \frac{\text{WordLevenshteinDistance}(\text{ReferenceTokens}, \text{ActualTokens})}{\max(\text{len}(\text{ReferenceTokens}), 1)}$$
A WER closer to `0.0` represents higher lexical accuracy.

---

## 10. Confidence Methodology
Average OCR confidence is calculated directly from Tesseract's `image_to_data` tabular output by filtering out non-word whitespace rows (`conf != -1`) and averaging the remaining token confidence scores:
$$\text{Average Confidence} = \frac{1}{N} \sum_{i=1}^{N} \text{conf}_i$$
*Note:* OCR confidence reflects Tesseract's internal pattern-matching certainty and is not synonymous with downstream semantic extraction correctness.

---

## 11. Processing Time Methodology
Processing time is measured in seconds per image, spanning disk read, array validation, Tesseract execution, dataframe conversion, and confidence aggregation.

---

## 12. Field Presence Methodology
Field presence verifies whether crucial invoice tokens appear within the raw OCR string. In accordance with validation rules, optional fields (such as `buyer_gstin` on missing-field invoices or `igst` on intra-state invoices) are only evaluated when expected in the ground truth:
- `invoice_number`: Exact match of invoice identifier.
- `invoice_date`: Exact match of ISO date string (`2026-08-15`).
- `seller_gstin`: Exact match of 15-character GSTIN.
- `buyer_gstin`: Exact match of buyer GSTIN (evaluated on 22 applicable invoices).
- `taxable_value`: Exact match of total taxable amount.
- `cgst`: Exact match of CGST amount.
- `sgst`: Exact match of SGST amount.
- `igst`: Exact match of IGST amount (evaluated when > 0).
- `grand_total`: Exact match of final invoice total.

---

## 13. Original (Unprocessed) Results

- **Attempted:** 25 | **Successful:** 25 (100.0%)
- **Processing Time:**
  - Mean: `0.342s` | Median: `0.319s` | Min: `0.302s` | Max: `0.435s` | Total: `8.562s`
- **OCR Confidence:**
  - Mean: `52.79%` | Median: `57.41%` | Min: `21.05%` | Max: `59.98%`
- **Character Error Rate (CER):**
  - Mean: `0.2270` (22.70%) | Median: `0.1528` | Min: `0.1366` | Max: `0.8843`
- **Word Error Rate (WER):**
  - Mean: `0.8071` (80.71%) | Median: `0.7586` | Min: `0.7308` | Max: `1.0000`
- **Field Presence Rates:**
  - `invoice_number`: `0/25` (0.0%)
  - `invoice_date`: `23/25` (92.0%)
  - `seller_gstin`: `0/25` (0.0%)
  - `buyer_gstin`: `0/22` (0.0%)
  - `taxable_value`: `18/25` (72.0%)
  - `cgst`: `13/25` (52.0%)
  - `sgst`: `13/25` (52.0%)
  - `igst`: `0/0` (N/A)
  - `grand_total`: `0/25` (0.0%)

---

## 14. Preprocessed Results

- **Attempted:** 25 | **Successful:** 25 (100.0%)
- **Processing Time:**
  - Mean: `0.719s` | Median: `0.686s` | Min: `0.645s` | Max: `0.880s` | Total: `17.979s`
- **OCR Confidence:**
  - Mean: `80.74%` | Median: `84.85%` | Min: `60.17%` | Max: `87.48%`
- **Character Error Rate (CER):**
  - Mean: `0.0568` (5.68%) | Median: `0.0231` | Min: `0.0124` | Max: `0.1606`
- **Word Error Rate (WER):**
  - Mean: `0.3889` (38.89%) | Median: `0.2759` | Min: `0.1333` | Max: `0.8966`
- **Field Presence Rates:**
  - `invoice_number`: `19/25` (76.0%)
  - `invoice_date`: `25/25` (100.0%)
  - `seller_gstin`: `18/25` (72.0%)
  - `buyer_gstin`: `15/22` (68.2%)
  - `taxable_value`: `25/25` (100.0%)
  - `cgst`: `21/25` (84.0%)
  - `sgst`: `21/25` (84.0%)
  - `igst`: `0/0` (N/A)
  - `grand_total`: `21/25` (84.0%)

---

## 15. Original vs. Preprocessed Comparison

| Metric | Original (Raw) | Preprocessed | Delta / Difference | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **OCR Success Rate** | 25/25 (100.0%) | 25/25 (100.0%) | 0.0% | Identical |
| **Mean CER** | 0.2270 | 0.0568 | **-0.1702** | **Massive Improvement (-75.0%)** |
| **Median CER** | 0.1528 | 0.0231 | **-0.1297** | **Massive Improvement (-84.9%)** |
| **Mean WER** | 0.8071 | 0.3889 | **-0.4181** | **Substantial Improvement (-51.8%)** |
| **Median WER** | 0.7586 | 0.2759 | **-0.4827** | **Substantial Improvement (-63.6%)** |
| **Mean Confidence** | 52.79% | 80.74% | **+27.95%** | **Significant Boost** |
| **Median Confidence** | 57.41% | 84.85% | **+27.44%** | **Significant Boost** |
| **Mean Latency** | 0.342s | 0.719s | +0.377s | Increased (due to 2x upscale) |
| **Invoice Number Presence** | 0/25 (0.0%) | 19/25 (76.0%) | **+76.0%** | Critical Recovery |
| **Invoice Date Presence** | 23/25 (92.0%) | 25/25 (100.0%) | **+8.0%** | 100% Capture |
| **Seller GSTIN Presence** | 0/25 (0.0%) | 18/25 (72.0%) | **+72.0%** | Critical Recovery |
| **Buyer GSTIN Presence** | 0/22 (0.0%) | 15/22 (68.2%) | **+68.2%** | Critical Recovery |
| **Taxable Value Presence** | 18/25 (72.0%) | 25/25 (100.0%) | **+28.0%** | 100% Capture |
| **CGST / SGST Presence** | 13/25 (52.0%) | 21/25 (84.0%) | **+32.0%** | High Capture |
| **Grand Total Presence** | 0/25 (0.0%) | 21/25 (84.0%) | **+84.0%** | Critical Recovery |

---

## 16. Failure Analysis

1. **Rotated Images (`INV_ROT_001`, `INV_ROT_002`, `INV_ROT_003`):**
   - *Original:* High rotation angles (5°, 10°, 15°) caused Tesseract's single uniform block mode (`PSM 6`) to completely misalign text baselines, yielding CERs of `0.375`, `0.755`, and `0.884`, confidence down to `21.05%`, and WER of `100.0%`.
   - *Preprocessed:* OpenCV `minAreaRect` deskewing successfully normalized the text orientation, dropping CER to `0.120 – 0.143` and recovering confidence to `60.2% – 71.3%`.
2. **Noisy Images (`INV_NOISY_001` – `004`):**
   - *Original:* Gaussian blur degradation smeared character edges, resulting in low confidence (`48.1% – 49.2%`) and high word error rate (`93.1%`).
   - *Preprocessed:* Gaussian denoising coupled with CLAHE contrast enhancement sharpened character boundaries, raising confidence to `65.5% – 70.0%` and lowering CER from `0.234` to `0.160`.
3. **Clean / Multi-Item Invoices (`INV_CLEAN_*`, `INV_MULTI_*`):**
   - *Original:* Because raw images were rendered at 800x1000 DPI without upscaling, Tesseract fused adjacent words (e.g. `SELLERGSTIN:` instead of `SELLER GSTIN:`), leading to 0% presence for GSTIN fields.
   - *Preprocessed:* The 2x upscale step allowed clean character separation, resulting in pristine CERs of `0.0124 – 0.0229` (1.2% – 2.3% error) and confidence exceeding `87%`.

---

## 17. Interpretation
- Image preprocessing is **essential** for high-accuracy OCR on invoice documents.
- 2x image upscaling resolved character conflation issues in standard DPI scans.
- CLAHE contrast enhancement and deskewing prevented catastrophic OCR failures on skewed documents.
- While latency increased by ~0.38s per image due to higher pixel dimensions, the 75% reduction in Character Error Rate and 28% gain in OCR confidence represent an optimal trade-off for document extraction accuracy.

---

## 18. Limitations
- **Colons in Field Labels:** Tesseract occasionally merges colons directly with adjacent labels (e.g., `CGST:90.0` or `SELLERGSTIN: 29ABCDE...`). This will be seamlessly addressed in Phase 5 via flexible LLM prompt engineering and fuzzy parsing.
- **Complex Multi-column Grids:** Extreme layouts may require fine-tuning PSM modes (e.g. PSM 3 vs PSM 6) or adaptive bounding boxes.

---

## 19. Phase 4 Status
**PHASE 4 COMPLETE**  
All OCR engine modules, configurations, batch execution scripts, raw text outputs, metadata JSONs, comparative evaluation tables, and test suites are fully implemented and verified.

---

## 20. Phase 5 Readiness
**READY FOR PHASE 5 (LLM EXTRACTION)**  
Clean, preprocessed raw OCR text is persisted and ready to be ingested by Phase 5 LLM prompt engineering for structured canonical JSON extraction.
