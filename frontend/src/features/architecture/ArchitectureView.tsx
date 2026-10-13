import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Shield,
  Layers,
  HelpCircle,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { api } from '../../lib/api';

export const ArchitectureView: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getArchitectureSummary().then(setData).catch(console.error);
  }, []);

  const principles = data?.principles || [];
  const stages = data?.stages || [];
  const vivaQA = data?.viva_qa || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2E0D8] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#246B50]">
              System Architecture
            </span>
            <Badge variant="slate" size="sm">
              Design Specifications &amp; Defense Manual
            </Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#20251F] tracking-tight">
            Architecture &amp; Technical Viva Reference
          </h1>
          <p className="text-sm text-[#60695C] mt-1 max-w-2xl">
            Core principles of regulatory separation of concerns, non-authoritative LLM roles,
            Python Decimal mathematical authority, and viva defense questions.
          </p>
        </div>
      </div>

      {/* 1. Separation of Concerns Principles */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-[#20251F]">
          1. Foundational Architectural Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((p: any, idx: number) => (
            <Card
              key={idx}
              variant="white"
              header={
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#246B50]" />
                  <span className="font-serif font-bold text-sm text-[#20251F]">{p.title}</span>
                </div>
              }
            >
              <p className="text-xs text-[#60695C] leading-relaxed py-1">{p.detail}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Pipeline Stages Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-[#20251F]">
          2. Multi-Stage Pipeline Execution Specification
        </h2>
        <Card variant="white" padding="none">
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E0D8] bg-[#FAFAF8] text-[#60695C]">
                  <th className="py-2.5 px-3 font-semibold">Stage</th>
                  <th className="py-2.5 px-3 font-semibold">Stage Name</th>
                  <th className="py-2.5 px-3 font-semibold">Technology Stack</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Runtime Contribution</th>
                  <th className="py-2.5 px-3 font-semibold">Quality &amp; Accuracy Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {stages.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#FAFAF8]">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#60695C]">Stage {s.stage}</td>
                    <td className="py-2.5 px-3 font-bold text-[#20251F]">{s.name}</td>
                    <td className="py-2.5 px-3 font-mono text-[#60695C]">{s.tech}</td>
                    <td className="py-2.5 px-3 font-mono text-right text-[#20251F]">{s.latency_contribution}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1B523D]">{s.gain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 3. Viva Defense Q&A */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-[#20251F]">
          3. Viva Examination Questions &amp; Architectural Answers
        </h2>
        <div className="space-y-4">
          {vivaQA.map((qa: any, idx: number) => (
            <div key={idx} className="bg-white border border-[#E2E0D8] rounded-xl p-5 shadow-fine space-y-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#246B50] shrink-0 mt-0.5" />
                <h4 className="font-serif font-bold text-sm text-[#20251F]">
                  Q: {qa.question}
                </h4>
              </div>
              <p className="text-xs text-[#60695C] leading-relaxed pl-6 border-l-2 border-[#E6F0E9] ml-2">
                <strong className="text-[#20251F]">A:</strong> {qa.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
