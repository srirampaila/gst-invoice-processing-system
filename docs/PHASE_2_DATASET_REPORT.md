# Phase 2 Dataset Report

## 1. Objective
Create a controlled development/evaluation dataset of synthetic Indian GST invoices and corresponding ground-truth annotations to support future phases of OCR and AI extraction without exposing real user data.

## 2. Dataset composition
Generated 25 synthetic invoice images (PNG) and their corresponding JSON ground-truth metadata.

## 3. Category distribution
- CLEAN: 5
- MULTI_ITEM: 5
- NOISY: 4
- ROTATED: 3
- MISSING_FIELDS: 3
- INVALID: 3
- DUPLICATE: 2

## 4. Ground-truth schema
The canonical schema is used. It represents the accurate state of the invoice text as generated, avoiding any "correction" of intentionally invalid math in ground truth.

## 5. Synthetic data generation approach
A python script utilizing `Pillow` (PIL) generated the invoice representations and their corresponding json files programmatically, ensuring clean mappings to bounding boxes and textual representations.

## 6. Data quality controls
The generation script is deterministic, avoiding hallucinatory errors and strictly abiding by the defined structures. Validated programmatically via `DatasetValidator`.

## 7. Dataset manifest
Located in `data/raw/metadata/dataset_manifest.json`, counting 25 records and linking to all constraints.

## 8. Dataset catalog
Located in `data/raw/metadata/dataset_catalog.csv`, capturing tabular data across all 25 images.

## 9. Duplicate strategy
Records `INV_DUP_001` and `INV_DUP_002` are explicitly duplicated from clean samples and properly annotated in `duplicate_of`.

## 10. Missing-field strategy
The buyer GSTIN field was explicitly removed from 3 records, mimicking typical B2C transactions.

## 11. Invalid-data strategy
3 records have intentionally tampered grand totals, simulating arithmetic mismatches that the GST Validation Engine must detect in Phase 6.

## 12. Privacy/licensing considerations
Fully synthetic. No real people, GSTINs, or addresses exist in this dataset.

## 13. Tests performed
Smoke tests (`test_smoke.py`), and Integrity validation (`test_dataset_integrity.py`).

## 14. Actual test results
All Python testing and metadata linkage validations passed successfully.

## 15. Known limitations
The synthetic generation uses clear fonts, limiting edge-case OCR testing typical of heavily degraded real-world documents.

## 16. Phase 3 readiness
**READY FOR PHASE 3**.
