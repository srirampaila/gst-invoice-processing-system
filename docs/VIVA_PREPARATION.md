# Comprehensive Viva & Examination Preparation Guide

**Project Title:** AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System  
**Subtitle:** An Intelligent OCR and LLM-Based System for Automated Invoice Extraction, GST Validation, and Return Preparation Assistance  

---

## 1. Project Explanations by Duration

### A. 2-Minute Elevator Pitch
"Our project automates the error-prone process of converting unstructured GST invoice images into statutory GSTR-1 return drafts. The system ingests invoice photos or PDFs, cleans them using an OpenCV computer vision pipeline, extracts text with Tesseract OCR, parses the content into a canonical Pydantic model, and rigorously verifies the data using a deterministic Python validation engine. Invoices are scored across 6 confidence factors; low-confidence or mathematically flawed records are routed to an interactive human review queue. Once validated, invoices are classified into B2B Table 4A or B2C Table 7 and exported as portal-compliant CSV and Excel spreadsheets. In benchmark tests, our preprocessing reduced OCR character error rates by 75%, detected 100% of arithmetic errors, and processed invoices in ~700 milliseconds."

---

### B. 5-Minute Technical Summary
"In India, businesses spend countless hours manually keying invoice data into accounting software to file GSTR-1 returns. Direct LLM extraction often suffers from financial hallucinations, while traditional template-based OCR breaks when invoice layouts shift.

Our solution introduces a **hybrid modular pipeline** that enforces a strict architectural boundary:
1. **Computer Vision Layer:** An OpenCV pipeline applies bilateral filtering, contrast equalization, and Hough line transform deskewing (up to $\pm 45^\circ$). This boosted OCR character recognition certainty by 75% relative CER reduction.
2. **OCR & Parsing Layer:** Tesseract 5.5.3 extracts raw textual tokens, which are structured into a canonical Pydantic v2 schema.
3. **Deterministic Financial Engine:** We never trust an AI model for math. A standalone Python validation engine computes GSTIN Modulo 36 checksums, checks Place of Supply against intra/interstate tax rules, and verifies line-item and grand totals using Decimal arithmetic with a statutory ₹1.00 tolerance.
4. **Confidence & Human Review:** A 6-factor scoring engine calculates confidence (0–100%) and applies 10 hard safety overrides. Risky records trigger a human-in-the-loop review queue in our Streamlit dashboard, where reviewers see the original image and editable form side-by-side. Crucially, human approval cannot override critical math errors.
5. **GSTR-1 Downstream Export:** Validated records are automatically partitioned into B2B Table 4A (with recipient GSTIN) and B2C Table 7 (unregistered) and exported into multi-sheet Excel workbooks and combined CSVs."

---

### C. 10-Minute Deep-Dive Technical Explanation
*(Covers complete module-by-module architecture, Pydantic data schemas, Decimal precision handling, Modulo 36 checksum arithmetic, 10 safety overrides, Streamlit session state management, performance profiling, and linear batch scalability).*

---

## 2. Core Architectural Rationale ("Why" Questions)

- **Q1: Why is image preprocessing necessary before OCR?**  
  *Answer:* Standard OCR engines like Tesseract degrade significantly when text is tilted, noisy, or low-contrast. Our OpenCV pipeline applies deskewing, bilateral smoothing, and adaptive binarization, which reduced the Character Error Rate (CER) from 22.70% down to 5.67% (a 75% relative improvement).
- **Q2: Why use an LLM or structured extraction layer?**  
  *Answer:* Invoices lack a fixed layout. LLMs excel at semantic understanding—identifying that 'Tax Invoice No.', 'Bill #', and 'Inv Ref' all refer to `invoice_number` regardless of positional coordinates.
- **Q3: Why is deterministic validation required instead of relying solely on the LLM?**  
  *Answer:* Generative LLMs are probabilistic token predictors prone to subtle hallucinations and rounding errors. In tax compliance, a ₹10 error can trigger an audit. Our deterministic engine uses `Decimal` arithmetic to verify $Qty \times Price == Taxable$ and $Taxable + Taxes == Total$.
- **Q4: Why combine OCR confidence, field completeness, and validation in confidence scoring?**  
  *Answer:* An invoice might have perfect OCR quality but fail tax arithmetic, or have perfect math but unreadable vendor GSTINs. Multi-factor scoring ensures that uncertainty in any layer is transparently reflected in the final review decision.
- **Q5: Why is Phase 5 (Real LLM Validation) marked as PAUSED?**  
  *Answer:* To ensure reproducible, deterministic scientific evaluation across all 25 benchmark invoices without external network variability or recurring API costs. The real Gemini/OpenAI client architectures are fully implemented and ready to be unpaused for cloud benchmarking at the end of the project roadmap.

---

## 3. 20 Frequent Viva / Examiner Questions with Model Answers

1. **What is the difference between GSTR-1 Table 4A and Table 7?**  
   *Answer:* Table 4A contains B2B outward supplies made to registered businesses (requires a valid 15-character recipient GSTIN). Table 7 contains B2C Small supplies to unregistered consumers (no recipient GSTIN).
2. **How is the GSTIN checksum calculated?**  
   *Answer:* Indian GSTINs use a Modulo 36 check character algorithm based on weighted character values across the first 14 characters.
3. **What happens if a reviewer approves an invoice that still has an arithmetic error?**  
   *Answer:* The system enforces a strict safety invariant: GSTR-1 mapper checks critical validation errors directly; an invoice with an uncorrected `TOTAL-001` or `MATH-001` error remains permanently blocked from GSTR-1 draft admission even if marked `APPROVED`.
4. **How does the system prevent IEEE-754 floating-point errors?**  
   *Answer:* The validation engine casts all financial amounts to Python's `decimal.Decimal` before executing addition and multiplication.
5. **What is the statutory rounding tolerance allowed in GST?**  
   *Answer:* Under Indian GST law, fractional currency amounts may be rounded to the nearest whole Rupee ($\pm ₹1.00$). Our system permits $\le ₹1.00$ discrepancies while rejecting larger errors.
6. **What was the primary performance bottleneck identified during profiling?**  
   *Answer:* Tesseract OCR process execution accounted for 94.88% of total runtime (~666 ms out of 702 ms). Preprocessing took 3.08% and validation took $<0.1\%$.
7. **Does the system file taxes autonomously?**  
   *Answer:* No. The system strictly acts as a preparation and draft-generation assistant. It generates CSV/Excel files for human accountant review and does not connect to the government GST portal.
8. **How does the system handle multi-item invoices?**  
   *Answer:* The canonical model supports a list of `InvoiceItem` objects, validating individual line math ($Qty \times Price$) and verifying that the sum of line items equals the summary taxable value.
9. **How are duplicate invoices handled?**  
   *Answer:* The pipeline assigns an immutable `source_invoice_id` to each record, preserving duplicate lineage links while enabling independent tracking in draft tables.
10. **What computer vision algorithms are used for deskewing?**  
    *Answer:* The inverted threshold text mask is analyzed using `cv2.minAreaRect` to calculate the dominant text angle, and `cv2.warpAffine` rotates the image up to $\pm 45^\circ$.
11. **How does the system classify B2B vs. B2C invoices?**  
    *Answer:* Invoices with a non-empty, structurally valid `buyer.gstin` map to Table 4A; invoices lacking a buyer GSTIN map to Table 7 without fabricating tax IDs.
12. **What are the 6 factors in confidence scoring?**  
    *Answer:* OCR quality (15%), field completeness (15%), critical fields (20%), GSTIN validation (20%), financial validation (20%), and line item quality (10%).
13. **What is the P95 latency of the pipeline?**  
    *Answer:* 0.911 seconds on the 25-invoice benchmark dataset.
14. **What is the batch throughput of the system?**  
    *Answer:* ~78.7 invoices per minute in single-threaded sequential execution on macOS.
15. **What memory growth was observed during batch processing?**  
    *Answer:* Zero material memory growth or unbounded accumulation; peak heap was 14.96 MB.
16. **Why is OpenCV bilateral filter used instead of standard Gaussian blur?**  
    *Answer:* Bilateral filtering smooths background noise while preserving sharp character edges, preventing OCR text degradation.
17. **What happens if an uploaded file is corrupted?**  
    *Answer:* The image loader and OCR service catch file decoding exceptions and return structured failure responses without crashing the web app.
18. **How does Streamlit handle state leakage between invoices?**  
    *Answer:* Uploading a new invoice triggers an explicit session state reset, clearing stale review forms and validation results.
19. **What Excel worksheets are generated in the export?**  
    *Answer:* 5 sheets: `Summary`, `B2B_Table_4A`, `B2C_Table_7`, `Exclusions`, and `Validation_Report`.
20. **Is any real taxpayer PII stored in the repository?**  
    *Answer:* No. 100% of the dataset is synthetically generated.
