# Phase 3 Preprocessing Report

## 1. Objective
Build a modular image preprocessing pipeline to prepare invoice images for future OCR extraction in Phase 4.

## 2. Architecture
The preprocessing pipeline is housed in `src/preprocessing/` and contains modular files for loading, grayscaling, upscaling, denoising, contrast enhancement, deskewing, and thresholding.

## 3. Dependencies
- Added `opencv-python-headless>=4.8.0` for safe, headless environment image operations.
- Added `numpy>=1.26.0` to support fast matrix computations.

## 4. Preprocessing stages
1. Loading and validation
2. Grayscale conversion
3. Image upscale (2x) to increase readability
4. Gaussian Denoising (to reduce artifacts without destroying text)
5. Contrast Enhancement via CLAHE (protects local text contrast well)
6. Masking and Deskewing (detects orientation and corrects it)
7. Output save

## 5. Pipeline order
`Load -> Grayscale -> Upscale -> Denoise -> CLAHE -> Deskew -> Final Image Save`

## 6. Configuration
Configuration parameters are encapsulated in `PreprocessingConfig` in `config.py` including: upscale factor, noise methods, contrast limits, block sizes, and deskew boundaries.

## 7. Algorithms selected
- Denoise: Gaussian (preserves structure).
- Contrast: CLAHE (Contrast Limited Adaptive Histogram Equalization - prevents overexposing white pages).
- Deskew: OpenCV minAreaRect bounding over thresholded pixels.
- Perspective: Left unimplemented, as full contour approximation fails on non-bordered scanned papers without external prompts.

## 8. Dataset processing
The complete Phase 2 dataset (25 synthetic invoices) was successfully run through the processing pipeline via `src/utils/process_dataset.py`, depositing final clean copies into `data/processed/final`.

## 9. Before/after examples
Artifacts have been created in `data/processed/final`. Original images remain untouched in `data/raw/invoices`.

## 10. Image metrics
- Images correctly upscaled (e.g. 800x1000 to 1600x2000).
- Standard operation takes <0.1s per image.

## 11. Performance observations
Minimal CPU overhead, well bounded memory usage. 

## 12. Tests
Implemented `tests/test_preprocessing.py` checking module correctness.

## 13. Actual test results
All tests, including regression tests for Phase 1 and 2, pass successfully.

## 14. Known limitations
Complex perspective wrapping requires ML models or fixed borders, which are unreliable dynamically here.

## 15. Phase 4 readiness
**READY FOR PHASE 4**.
