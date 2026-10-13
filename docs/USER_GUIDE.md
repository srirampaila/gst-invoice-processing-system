# User Guide: AI-Powered GST Invoice System

**System:** AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System  
**Interface:** Streamlit Web Application  
**Access URL:** `http://localhost:8501`  

---

## 1. Quick Start

### Starting the Web Application
Open your terminal in the project root directory and execute:
```bash
source .venv/bin/activate
streamlit run app/dashboard.py
```
The application will launch in your default web browser at `http://localhost:8501`.

---

## 2. Navigating the Dashboard

The sidebar provides 9 specialized workspaces:

1. **🏠 Executive Overview:** High-level project KPIs, architecture overview, and quick stats.
2. **🚀 Live Processing Pipeline:** The primary workflow for processing single or batch invoices.
3. **🔍 OCR & Preprocessing:** Deep inspection of OpenCV image filters and Tesseract raw text tokens.
4. **📐 Structured Extraction:** View the extracted Canonical JSON schema and raw LLM payload.
5. **🛡️ GST & Financial Validation:** Rule-by-rule breakdown of arithmetic and statutory checks.
6. **🎯 Confidence & Review Queue:** Human-in-the-loop review station for correcting flagged invoices.
7. **📊 GSTR-1 Draft Generator:** View Table 4A (B2B), Table 7 (B2CS), and download Excel/CSV files.
8. **⚡ Performance Evaluation:** Interactive performance metrics, latency percentiles, and resource usage.
9. **🧪 Test & Evaluation Hub:** Scientific metrics (CER, WER), confusion matrices, and test runner.

---

## 3. Step-by-Step Invoice Processing Workflow

```
Upload Invoice ──> Preprocess ──> OCR ──> Extract ──> Validate ──> Score Confidence ──> Review (If Flagged) ──> Export GSTR-1
```

### Step 1: Uploading an Invoice
1. Navigate to **🚀 Live Processing Pipeline**.
2. Drag and drop an invoice image (PNG, JPG, TIFF) or select **Load Sample Invoice** from the benchmark library (e.g. `INV_CLEAN_001.png` or `INV_MULTI_001.png`).
3. Click **⚡ Run Full End-to-End Pipeline**.

### Step 2: Reviewing Pipeline Output
- **Status Banner:** Displays whether the invoice was `AUTO_ACCEPTED`, sent to `REVIEW_REQUIRED`, or `REJECTED`.
- **Validation Card:** Summarizes error count, warning count, and GSTIN check status.
- **Financial Breakdown:** Shows extracted Taxable Value, CGST, SGST, IGST, and Grand Total.

### Step 3: Handling Flagged Invoices (Human Review Queue)
If an invoice is flagged with **REVIEW_REQUIRED** or **REJECT_OR_REPROCESS**:
1. Open **🎯 Confidence & Review Queue**.
2. Compare the original image on the left with the editable form fields on the right.
3. Modify any misread invoice numbers, dates, or tax values.
4. Click **🔄 Re-Validate Data** to ensure your corrections resolve all arithmetic errors.
5. Click **✅ Approve Invoice** to mark it eligible for GSTR-1 draft generation.

### Step 4: Generating and Downloading GSTR-1 Drafts
1. Navigate to **📊 GSTR-1 Draft Generator**.
2. View the compiled tables:
   - **Table 4A (B2B):** Registered business supplies with buyer GSTIN.
   - **Table 7 (B2CS):** Consumer supplies without buyer GSTIN.
   - **Exclusions:** Invoices excluded due to unresolved validation failures.
3. Click **📥 Download GSTR-1 Excel (.xlsx)** or **📥 Download GSTR-1 CSV (.csv)** to save the return draft to your computer.

---

## 4. Important Legal Disclaimer
> **IMPORTANT NOTICE:** This application is an automated draft preparation tool designed to assist accounting professionals. It **does not file tax returns** directly with the GST portal, does not authenticate with government servers, and does not replace professional tax advisory. Always verify generated GSTR-1 spreadsheets before official statutory submission.
