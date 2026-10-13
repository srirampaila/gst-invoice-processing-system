# Validation Specification & Confidence Scoring

## 1. GST Validation Engine

A deterministic layer independent of the LLM.

### Field Validation
- **Required fields:** Check if `invoice_number`, `invoice_date`, `seller.gstin`, `summary_totals.grand_total_amount` are non-null.
- **Data types:** Ensure all numeric fields cast correctly without errors.
- **Date checks:** Validate `invoice_date` format and logical bounds (not in the future, not decades old).

### GSTIN Validation
- Must be 15 alphanumeric characters.
- Structure: 2 digits (State Code) + 10 chars (PAN) + 1 digit (Entity Code) + 'Z' (Default) + 1 char (Checksum).
- Regex: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`

### Tax & Math Validation (Crucial)
1. **Item level:** `quantity * unit_price` roughly equals `taxable_value` (allow rounding variance).
2. **Total Taxable Value:** Sum of all `items.taxable_value` == `summary_totals.total_taxable_value`.
3. **Tax summation:**
   `total_taxable_value + total_cgst + total_sgst + total_igst + total_cess == grand_total_amount`
   *(Allowance for +/- 1 INR rounding error)*.

### Duplicate Detection
- In-memory or database check: `(seller.gstin, invoice_number, invoice_date)` must be unique across the processed batch.

### Validation Result Statuses
- `VALID`: All checks pass.
- `INVALID`: Critical non-recoverable error (e.g., Unparseable).
- `REVIEW_REQUIRED`: Math mismatch, missing mandatory fields, invalid GSTIN, or low confidence.

## 2. Confidence Scoring

Calculated using a weighted formula.

- **OCR Quality (20%):** Confidence score from Tesseract/OCR tool.
- **LLM Extraction Confidence (30%):** Based on missing/null optional fields.
- **Validation Results (50%):** Math checks passing yields max points.

**Tiers:**
- `HIGH CONFIDENCE` (90-100%): Automatically marked `VALID`.
- `MEDIUM CONFIDENCE` (70-89%): Marked `REVIEW_REQUIRED`.
- `LOW CONFIDENCE` (<70%): Marked `REVIEW_REQUIRED` with high priority alert.

## 3. GSTR-1 Draft Mapping Specification

**Target Output (B2B CSV Format example):**
- `GSTIN/UIN of Recipient` <- `buyer.gstin`
- `Receiver Name` <- `buyer.name`
- `Invoice Number` <- `invoice_number`
- `Invoice Date` <- `invoice_date` (Format DD-MMM-YY)
- `Invoice Value` <- `summary_totals.grand_total_amount`
- `Place Of Supply` <- Derived from first 2 digits of `buyer.gstin`
- `Rate` <- `items[].tax_rate`
- `Taxable Value` <- `items[].taxable_value`
- `Cess Amount` <- `items[].cess_amount`

Data formatting strictly adheres to standard GST portal CSV templates.
