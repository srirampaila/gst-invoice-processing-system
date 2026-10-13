import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ExecutiveOverview } from '../features/overview/ExecutiveOverview';
import { InvoiceStudio } from '../features/invoices/InvoiceStudio';
import { ExtractionInspector } from '../features/extraction/ExtractionInspector';
import { GSTValidationView } from '../features/validation/GSTValidationView';
import { ConfidenceReviewView } from '../features/review/ConfidenceReviewView';
import { GSTR1DraftView } from '../features/gstr1/GSTR1DraftView';
import { TestingEvaluationView } from '../features/evaluation/TestingEvaluationView';
import { PerformanceProfilingView } from '../features/evaluation/PerformanceProfilingView';
import { PipelineExecutionResult } from '../types';
import { api } from '../lib/api';

export const App: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('mock');
  const [activeResult, setActiveResult] = useState<PipelineExecutionResult | null>(null);

  useEffect(() => {
    api.getProviders().then((res) => {
      setSelectedProvider(res.default_provider);
    }).catch(console.error);
  }, []);

  return (
    <AppShell
      selectedProvider={selectedProvider}
      onProviderChange={setSelectedProvider}
    >
      <Routes>
        <Route path="/" element={<ExecutiveOverview />} />
        <Route
          path="/studio"
          element={
            <InvoiceStudio
              selectedProvider={selectedProvider}
              activeResult={activeResult}
              onResultGenerated={setActiveResult}
            />
          }
        />
        <Route
          path="/extraction"
          element={<ExtractionInspector activeResult={activeResult} />}
        />
        <Route
          path="/validation"
          element={<GSTValidationView activeResult={activeResult} />}
        />
        <Route
          path="/review"
          element={
            <ConfidenceReviewView
              activeResult={activeResult}
              onResultUpdated={setActiveResult}
            />
          }
        />
        <Route path="/gstr1" element={<GSTR1DraftView />} />
        <Route path="/evaluation" element={<TestingEvaluationView />} />
        <Route path="/performance" element={<PerformanceProfilingView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};
