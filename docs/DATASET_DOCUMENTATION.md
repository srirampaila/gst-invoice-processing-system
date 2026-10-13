# Dataset & Ground Truth Documentation

**Dataset Name:** GST Invoice Intelligence Benchmark Dataset (Synthetic v1.0)  
**Creation Date:** October 3, 2026  
**Total Invoices:** 25  
**Source Type:** 100% Synthetic Ground Truth (Zero Real PII)  
**Location:** `data/raw/invoices/`  
**Metadata Manifest:** `data/raw/metadata/dataset_manifest.json` & `data/raw/metadata/dataset_catalog.csv`  

---

## 1. Privacy & Synthetic Data Statement

> **CRITICAL DATA INTEGRITY & PRIVACY NOTICE:**  
> All 25 invoices in this dataset are **entirely synthetic**. All company names, buyer identities, GST numbers (GSTINs), addresses, phone numbers, and financial transactions are generated programmatically for scientific evaluation and validation testing. No real-world taxpayer information or confidential commercial data is contained in this repository.

---

## 2. Category Distribution & Design Rationale

| Category | File Count | Target Filenames | Injected Conditions & Objectives | Expected Decision | Expected Table |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`clean`** | 5 | `INV_CLEAN_001.png` .. `005.png` | Standard high-contrast, perfectly aligned 2-item B2B invoices. Baseline accuracy. | `AUTO_ACCEPT` | Table 4A (B2B) |
| **`multi_item`**| 5 | `INV_MULTI_001.png` .. `005.png` | Complex 5-line-item invoices with dense tables to test multi-row tax reconciliation. | `AUTO_ACCEPT` | Table 4A (B2B) |
| **`noisy`** | 4 | `INV_NOISY_001.png` .. `004.png` | Simulated background speckle, low contrast, and blur. Tests bilateral filtering. | `REJECT_OR_REPROCESS` | Excluded |
| **`rotated`** | 3 | `INV_ROT_001.png` .. `003.png` | Skewed at $+5^\circ$, $-8^\circ$, and $+15^\circ$ angles. Tests Hough transform deskewing. | `REJECT_OR_REPROCESS` | Excluded |
| **`missing_fields`**| 3 | `INV_MISS_001.png` .. `003.png` | Valid B2C consumer invoices lacking buyer GSTIN and address. Tests B2C routing. | `AUTO_ACCEPT` | Table 7 (B2CS) |
| **`invalid`** | 3 | `INV_INV_001.png` .. `003.png` | Invoices with intentional mathematical discrepancies (Grand total mismatch ₹1881). | `REVIEW_REQUIRED` | Excluded |
| **`duplicate`** | 2 | `INV_DUP_001.png`, `002.png` | Re-issued invoices identical to Clean 002/003. Tests lineage preservation. | `AUTO_ACCEPT` | Table 4A (B2B) |

---

## 3. Ground Truth Totals & Reconciliation Baseline

When processed across the entire 25-invoice dataset:
- **Total Ingested Invoices:** 25
- **Admitted to GSTR-1 Draft:** 15
  - Table 4A (B2B): 12 invoices (5 Clean + 5 Multi-item + 2 Duplicate)
  - Table 7 (B2CS): 3 invoices (3 Missing Fields / B2C)
- **Excluded from GSTR-1 Draft:** 10
  - 4 Noisy (OCR quality below threshold)
  - 3 Rotated (Residual character distortion)
  - 3 Invalid (Arithmetic grand total mismatch)
- **Cumulative Admitted Financials:**
  - Total Taxable Value: **₹40,000.00**
  - Total CGST: **₹3,600.00**
  - Total SGST: **₹3,600.00**
  - Total IGST: **₹0.00**
  - Total Grand Value: **₹47,200.00**

---

## 4. Limitations of the Benchmark Dataset

1. **Synthetic Regularity:** Invoices share a consistent digital font and rectangular table geometry; real-world thermal paper receipts with fading ink are not represented.
2. **Dataset Size:** 25 documents establish baseline statistical and functional validation; enterprise deployments should evaluate hundreds of multi-page invoices.
3. **Language Scope:** Invoices are printed in English; multi-lingual regional invoices (Hindi, Marathi, Tamil) are not included.
