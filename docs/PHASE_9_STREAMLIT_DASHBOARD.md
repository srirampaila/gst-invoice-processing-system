# Phase 9 — Streamlit Dashboard & Full Application Integration

## 1. Executive Summary & Objective

Phase 9 integrates all prior engineering phases (Phases 1–8) into a unified, professional, and interactive **AI GST Invoice Intelligence Application** built on Streamlit.

The application serves as a complete, end-to-end demonstrator and evaluation studio, illustrating the full lifecycle of an invoice:
$$\text{Invoice Upload} \rightarrow \text{OpenCV Preprocessing} \rightarrow \text{Tesseract OCR} \rightarrow \text{LLM Extraction (Demo Mode)} \rightarrow \text{Deterministic Validation} \rightarrow \text{Confidence Scoring} \rightarrow \text{Human Review} \rightarrow \text{GSTR-1 Draft} \rightarrow \text{CSV / Excel Export}$$

### Non-Negotiable Operational Principles:
1. **Phase 5 Paused**: The extraction engine defaults to `MockLLMClient` with clear UI labeling (`"Extraction Mode: Demo / Mock"`). Live Gemini/OpenAI providers remain optional and handled gracefully if keys are missing.
2. **Draft Only (No Portal Filing)**: Prominent statutory disclaimer: `"GSTR-1 DRAFT — NOT FILED"` / `"This system prepares GSTR-1 draft data only. It does not file returns with the GST portal."`
3. **LLM vs Deterministic Separation**: The LLM is strictly for text parsing/structuring; Python's deterministic validation engine is the sole authority on financial calculations and GST compliance.

---

## 2. Integrated UI Architecture & Navigation

The application is structured into eight high-cohesion views accessible via the sidebar navigation:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STREAMLIT DASHBOARD (app/dashboard.py)               │
├───────────────────┬────────────────────────────────────────────────────┤
│ SIDEBAR           │ MAIN CONTENT AREA                                  │
│ - System Status   │ 1. 🏠 Executive Overview (Batch Metrics, Flow)     │
│ - Provider Toggle │ 2. 🚀 Single Invoice Processing Studio             │
│ - Threshold Sliders│ 3. 🔍 OCR & Structured Extraction Inspector       │
│ - Mode Selector   │ 4. 🛡️ Deterministic GST Validation Engine          │
│ - Sample Selector │ 5. ⚖️ Confidence Scoring & Human Review Action     │
│ - Reset Action    │ 6. 📑 GSTR-1 Draft & Compliance Mapping            │
│                   │ 7. 📊 25-Invoice Benchmark Analytics               │
│                   │ 8. ℹ️ System Architecture & Viva Reference         │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 3. Detailed View Specifications

### View 1: 🏠 Executive Overview
- High-level KPIs: Total Invoices Processed (25), Valid Invoices (15), Invalid/Rejected (10), Admitted into GSTR-1 (15), Total Taxable Sum (₹40,000.00), Total Tax Liability (₹7,200.00), Grand Total (₹47,200.00).
- Visual pipeline diagram and architecture highlights.

### View 2: 🚀 Single Invoice Studio (Primary Workflow)
- **Upload Mechanism**: File uploader (`.png`, `.jpg`, `.jpeg`) + Quick Sample Selector (choose any of the 25 benchmark invoices: Clean, Invalid Math, Noisy, Rotated, Multi-Item, B2C).
- **Interactive Execution**: Step-by-step pipeline trigger with real-time spinners and stage latency tracking.
- **Stage Badges**: Real-time status indicators (✓ Preprocessed, ✓ OCR Extracted, ✓ Validated, ✓ Confidence Scored, ✓ GSTR-1 Mapped).

### View 3: 🔍 OCR & Extraction Deep-Dive
- Side-by-side view of raw OCR text and canonical structured JSON.
- Extraction metadata inspection (Model, Confidence %, Processing time).
- Visual highlighting separating *Extracted Raw Values* from *Independently Validated Values*.

### View 4: 🛡️ Deterministic GST Validation
- Full rule execution log (`TOTAL-001`, `MATH-001`, `TAX-*`, `FIELD-*`, `GSTIN-*`, `STATE-*`).
- Recomputed financial reconciliation cards (Item taxable sum, CGST/SGST/IGST recalculations, discrepancy alerts).
- GSTIN breakdown (State code mapping, PAN structure, Luhn Mod-36 checksum).

### View 5: ⚖️ Confidence & Human Review
- Multi-factor score gauge and breakdown (OCR Quality 15%, Field Completeness 15%, Critical Fields 20%, GST Validation 20%, Financials 20%, Line Items 10%).
- Safety Overrides banner (e.g. `OVERRIDE_TOTAL_001_FAILED` capping tier to `LOW`).
- Authoritative Review Action Panel (`✅ Approve`, `❌ Reject`, `🔄 Request Reprocessing`) with reviewer notes and persistent audit trail recording.

### View 6: 📑 GSTR-1 Draft & Compliance
- GSTR-1 Admission badge: Table 4A (B2B) vs Table 7 (B2C) vs Ineligible Exclusions.
- Previews of Table 4A and Table 7 records with exact tax rates.
- Direct download buttons for `gstr1_draft.csv`, `b2b_table_4a.csv`, `b2c_table_7.csv`, and `gstr1_draft.xlsx`.

### View 7: 📊 25-Invoice Benchmark Analytics
- Interactive dataset explorer across all 25 benchmark invoices.
- Filtering by category (Clean, Duplicate, Invalid Math, Missing Fields, Multi-Item, Noisy, Rotated).
- Summary distributions (High/Low confidence distribution, Auto-Accept vs Review vs Reprocess counts).

### View 8: ℹ️ System Architecture & Viva Reference
- Comprehensive project summary tailored for academic defense and technical viva.
- Clear explanation of the separation of concerns: LLM as parser vs Python as financial authority.

---

## 4. Session State & Error Handling Strategy

1. **State Persistence**:
   - `st.session_state["pipeline_data"]` retains current invoice extraction, validation, confidence, and GSTR-1 results across view switches.
   - `st.session_state["active_view"]` preserves user navigation context.
   - Safe `"🔄 Reset / Process New Invoice"` button to clear state cleanly.
2. **Graceful Error Recovery**:
   - Degraded OCR or malformed files display clear user-friendly warnings rather than raw Python tracebacks.
   - API key absences for live LLM modes display actionable configuration guides without crashing.

---

## 5. Testing & Verification Strategy

- **Integration Tests (`tests/test_app_integration.py`)**:
  - Test module imports, pipeline data flow, mock extraction, validation integration, confidence integration, GSTR-1 integration, export downloads, and invalid invoice handling.
- **Streamlit Startup Test**:
  - Headless dry-run execution using `streamlit run` to verify clean server initialization.
