# Canonical Invoice Data Model

## 1. Schema Definition

The canonical data model is the central structure that the LLM extracts and the validation engine evaluates.

```json
{
  "invoice_number": "string (Required)",
  "invoice_date": "string (YYYY-MM-DD) (Required)",
  "seller": {
    "name": "string (Required)",
    "gstin": "string (Required)"
  },
  "buyer": {
    "name": "string (Optional/Nullable)",
    "gstin": "string (Optional/Nullable)"
  },
  "items": [
    {
      "description": "string",
      "hsn_sac": "string (Optional)",
      "quantity": "float (Required)",
      "unit_price": "float (Required)",
      "taxable_value": "float (Required)",
      "tax_rate": "float (Required - e.g., 18.0)",
      "cgst_amount": "float (Optional)",
      "sgst_amount": "float (Optional)",
      "igst_amount": "float (Optional)",
      "cess_amount": "float (Optional)"
    }
  ],
  "summary_totals": {
    "total_taxable_value": "float (Required)",
    "total_cgst": "float (Required - 0 if NA)",
    "total_sgst": "float (Required - 0 if NA)",
    "total_igst": "float (Required - 0 if NA)",
    "total_cess": "float (Required - 0 if NA)",
    "grand_total_amount": "float (Required)"
  },
  "metadata": {
    "source_file": "string",
    "extraction_confidence": "float",
    "validation_status": "string (VALID | INVALID | REVIEW_REQUIRED)",
    "review_required": "boolean"
  }
}
```

## 2. Analysis and Improvements

- **Data Types:** Financial amounts must be floats (or Decimal for strict precision). Dates must be normalized to standard ISO format (YYYY-MM-DD).
- **Mandatory vs Optional:** Buyer GSTIN is optional (B2C invoices exist). Seller GSTIN is mandatory. `hsn_sac` is optional for basic extraction but needed for full GSTR-1 compliance depending on turnover.
- **Normalization:** The `items` array includes specific tax amounts per item to support mixed-rate invoices, rather than just global tax rates.
- **Nullable fields:** If the LLM cannot find a value, it should explicitly output `null` rather than guessing or leaving it out, allowing the validation engine to detect "Missing Information".
