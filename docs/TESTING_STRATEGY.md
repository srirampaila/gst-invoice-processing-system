# Testing Strategy

## 1. Unit Tests (pytest)
- **GSTIN Validation:** Tests for valid formats, invalid checksums, wrong lengths.
- **Amount Calculation:** Tests for rounding variations (e.g., `18.005` rounding to `18.01`), missing taxes.
- **Date Parsing:** Tests for various date formats (`DD/MM/YYYY`, `YYYY-MM-DD`, `DD-MMM-YYYY`) being mapped correctly.
- **Duplicate Detection:** Test the logic that flags identical `(GSTIN, InvNum, Date)` tuples.

## 2. Integration Tests
- **Pipeline Flow:** `Invoice Input (Mocked Image) → Mock OCR text → Extraction → Validation`.
- Test if a known input string results in the exact structured JSON via the LLM (using low-temperature or deterministic mock LLMs).

## 3. End-to-End Tests
- File Upload -> Preprocessing -> OCR -> LLM -> Validation -> Generate CSV.
- Validate that the final output CSV matches a pre-verified golden template.

## 4. Edge Cases to Test
- Blurry invoice (OCR fails completely).
- Rotated 90/180 degrees.
- Missing Seller GSTIN.
- Missing taxes.
- Math error in total (system must flag).
- LLM outputs malformed JSON (system must handle JSON parse exceptions gracefully and flag for review).
