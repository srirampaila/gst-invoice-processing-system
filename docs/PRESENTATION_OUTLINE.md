# Final Presentation Slide Outline

**Project:** AI-Powered GST Invoice Processing and GSTR-1 Draft Generation System  
**Suggested Format:** 17-Slide Pitch Deck  

---

- **Slide 1: Title & Overview**  
  - Project Title & Subtitle
  - Student Names, Supervisor, Academic Institution, Date
- **Slide 2: The Industry Problem**  
  - Heterogeneous invoice formats (scanned paper, photos, digital PDFs)
  - The manual data-entry bottleneck in GST compliance
  - Real-world cost of tax mismatch notices and blocked Input Tax Credits (ITC)
- **Slide 3: Motivation & Objectives**  
  - Overcoming LLM financial hallucinations through deterministic validation
  - Automating the end-to-end pipeline: Ingestion $\rightarrow$ GSTR-1 Draft
  - Maintaining Human-in-the-Loop oversight for degraded documents
- **Slide 4: Existing vs. Proposed System**  
  - Comparison table: Manual Entry vs. Template OCR vs. Direct LLM vs. Proposed Modular Pipeline
- **Slide 5: High-Level Architecture Topology**  
  - Architectural diagram showing layer separation (OpenCV $\rightarrow$ Tesseract $\rightarrow$ Canonical Pydantic $\rightarrow$ Deterministic Validation $\rightarrow$ Confidence $\rightarrow$ GSTR-1)
- **Slide 6: Computer Vision Preprocessing (OpenCV)**  
  - Visual before/after: Noise filtering, contrast equalization, Hough transform deskewing (up to $\pm 45^\circ$)
  - 75% relative reduction in Character Error Rate (CER)
- **Slide 7: OCR & Canonical Data Model**  
  - Tesseract 5.5.3 integration
  - Pydantic v2 `CanonicalInvoice` schema definition
- **Slide 8: Deterministic GST & Financial Validation**  
  - Zero-tolerance rule engine: GSTIN structure, Modulo 36 checksum, line math, statutory ₹1.00 tolerance
  - 100% detection rate on intentional arithmetic discrepancies
- **Slide 9: Multi-Factor Confidence Scoring & Safety Overrides**  
  - 6 weighted scoring factors (OCR, Completeness, Critical Fields, GSTIN, Math, Line Items)
  - 10 deterministic override guardrails routing risky records to human review
- **Slide 10: Human-in-the-Loop Review Queue**  
  - Streamlit review workspace: side-by-side image and live re-validating form
  - The Core Safety Invariant: Human approval cannot override critical math errors
- **Slide 11: Statutory GSTR-1 Draft Generation**  
  - Automated B2B Table 4A vs. B2C Table 7 classification
  - Exclusions audit catalog with explainable failure reasons
- **Slide 12: Streamlit Interactive Dashboard**  
  - Screenshots of the 9 application views (Pipeline, OCR Inspector, Review Station, Performance Hub)
- **Slide 13: Benchmark Dataset & Methodology**  
  - 25 synthetic ground-truth invoices across 7 realistic categories
  - Absolute privacy guarantee (zero real PII)
- **Slide 14: Scientific Accuracy Results**  
  - CER dropped from 22.70% $\rightarrow$ 5.67%; WER dropped from 80.71% $\rightarrow$ 38.90%
  - 15 invoices admitted (12 B2B, 3 B2C), 10 excluded
- **Slide 15: Performance, Latency & Scalability**  
  - Mean latency: 702 ms/invoice; batch throughput: 78.7 invoices/min
  - Linear scalability ($R^2 > 0.999$); memory stability (peak heap: 14.96 MB)
- **Slide 16: Limitations & Future Scope**  
  - Phase 5 real-LLM cloud benchmarking roadmap
  - Limitations: Synthetic scope, multi-page tables, draft assistance vs autonomous filing
- **Slide 17: Conclusion & Summary**  
  - Key achievements, academic takeaways, live demonstration & Q&A
