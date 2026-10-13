import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#EFEFEA] border-t border-[#E2E0D8] mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#246B50]" />
            <div>
              <p className="text-xs font-semibold text-[#20251F]">
                Deterministic GST Verification Engine &amp; GSTR-1 Draft Preparation System
              </p>
              <p className="text-[11px] text-[#60695C]">
                Designed for qualified accountants and tax audit professionals. Enforces Python Decimal precision.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-[#E2E0D8] text-[11px] text-[#60695C]">
            <AlertCircle className="w-3.5 h-3.5 text-[#B87928]" />
            <span>Statutory Notice: Generates draft data only; no autonomous portal filing.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
