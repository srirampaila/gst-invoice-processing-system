# Evaluation & Benchmarking Summary

**AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System**  
**Evaluation Scope:** Phases 4, 6, 7, 8, 10, and 11  
**Artifact Storage:** `data/outputs/evaluation/` and `data/outputs/performance/`  

---

## 1. Executive Summary of Evaluation Results

The AI-Powered GST Invoice Processing System underwent multi-dimensional scientific evaluation across accuracy, statutory compliance, classification precision/recall, runtime latency, throughput scalability, and memory consumption using the canonical 25-invoice benchmark dataset.

---

## 2. OCR Accuracy & Preprocessing Impact (Phases 4 & 10)

| Metric | Raw Image (No Preprocessing) | Preprocessed Image (OpenCV Pipeline) | Absolute Change | Relative Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Character Error Rate (CER)** | 22.70% | **5.67%** | -17.03% | **75.00% reduction** |
| **Word Error Rate (WER)** | 80.71% | **38.90%** | -41.81% | **51.81% reduction** |
| **OCR Mean Confidence** | 52.79% | **80.74%** | +27.95% | **+52.95% boost** |

**Scientific Conclusion:** OpenCV bilateral noise reduction, contrast equalization, and deskewing eliminate salt-and-pepper noise and angular distortions, ensuring critical 15-character alphanumeric tax identifiers (GSTINs) and financial numbers are recognized with high fidelity.

---

## 3. GST Validation & Arithmetic Discrepancy Detection (Phase 6 & 10)

| Evaluation Parameter | Result | Evaluation Notes |
| :--- | :--- | :--- |
| **Total Invoices Evaluated** | 25 | 22 valid invoices, 3 intentionally invalid invoices (`INV_INV_001..003`) |
| **Intentional Error Detection Rate** | **100.0%** (3/3) | 100% of arithmetic discrepancies caught by Rule `TOTAL-001` |
| **GSTIN Regex & PAN Extraction** | **100.0%** | Validated across 22 clean/multi-item/duplicate seller GSTINs |
| **False Positive Error Rate** | **0.0%** on clean | Clean invoices (`INV_CLEAN_001..005`) passed with zero errors |
| **Statutory ₹1.00 Rounding Tolerance** | Verified | Allowed standard rounding variations $\le ₹1.00$; blocked larger offsets |

---

## 4. GSTR-1 Draft Eligibility & Classification (Phase 8 & 10)

| Category | Invoices Ingested | Admitted to GSTR-1 | Excluded from GSTR-1 | Destination Table |
| :--- | :--- | :--- | :--- | :--- |
| **CLEAN** | 5 | 5 | 0 | Table 4A (B2B Regular) |
| **MULTI_ITEM** | 5 | 5 | 0 | Table 4A (B2B Regular) |
| **DUPLICATE** | 2 | 2 | 0 | Table 4A (B2B Regular) |
| **MISSING_FIELDS (B2C)**| 3 | 3 | 0 | Table 7 (B2C Small) |
| **NOISY** | 4 | 0 | 4 | Excluded (OCR Quality Degraded) |
| **ROTATED** | 3 | 0 | 3 | Excluded (Residual OCR Misreads) |
| **INVALID** | 3 | 0 | 3 | Excluded (Grand Total Mismatch) |
| **Total Pipeline** | **25** | **15 (12 B2B, 3 B2C)**| **10 Excluded** | **100% Ground-Truth Alignment** |

---

## 5. Performance & Resource Profiling (Phase 11)

### 5.1 Single-Invoice Latency Breakdown (`INV_CLEAN_001`)
- **Mean End-to-End Latency:** **`0.702 s` (~702 ms)**
- **Stage Breakdown:**
  - File Loading: $0.005\text{ s}$ ($0.71\%$)
  - OpenCV Preprocessing: $0.022\text{ s}$ ($3.08\%$)
  - Tesseract OCR: $0.666\text{ s}$ (**$94.88\%$ — Dominant Bottleneck**)
  - Extraction + Validation + Confidence + Mapping: $< 0.001\text{ s}$ ($< 0.1\%$)
  - CSV + Excel Export: $0.009\text{ s}$ ($1.23\%$)

### 5.2 25-Invoice Dataset End-to-End Latency
- **Mean:** `0.742 s` | **Median:** `0.718 s` | **P95:** `0.911 s` | **Min:** `0.668 s` | **Max:** `0.949 s`

### 5.3 Batch Scalability & Throughput
| Batch Size | Total Time (s) | Avg Latency / Invoice (s) | Throughput (inv/min) | Peak Heap Memory | Peak Process RSS |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1 Invoice** | 0.735 s | 0.735 s | 81.6 inv/min | 9.48 MB | 248.77 MB |
| **5 Invoices** | 3.731 s | 0.746 s | 80.4 inv/min | 9.60 MB | 248.77 MB |
| **10 Invoices** | 7.144 s | 0.714 s | 84.0 inv/min | 9.75 MB | 248.77 MB |
| **25 Invoices** | **19.069 s** | **0.763 s** | **78.7 inv/min** | **14.96 MB** | **248.77 MB** |

- **Linearity:** Scalability is approximately linear ($R^2 > 0.999$) across tested batch sizes.
- **Memory Safety:** No material memory growth or memory leaks were observed across the 25-invoice batch.

---

## 6. List of Generated Evaluation Artifacts

- Accuracy & Confusion Matrices: `data/outputs/evaluation/`
  - `phase10_evaluation_report.json`
  - `ocr_metrics.csv`
  - `validation_metrics.csv`
  - `confidence_distribution.csv`
  - `gstr1_reconciliation.csv`
  - `error_analysis_catalog.csv`
- Performance & Scalability: `data/outputs/performance/`
  - `phase11_summary.json`
  - `stage_latency.csv`
  - `category_latency.csv`
  - `batch_throughput.csv`
  - `bottleneck_analysis.csv`
  - `invoice_latency_distribution.csv`
