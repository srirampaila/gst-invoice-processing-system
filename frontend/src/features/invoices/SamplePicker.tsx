import React, { useState } from 'react';
import { SampleInvoice } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Check, Filter, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SamplePickerProps {
  samples: SampleInvoice[];
  selectedSample: string | null;
  onSelectSample: (sample: SampleInvoice) => void;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  samples,
  selectedSample,
  onSelectSample,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(samples.map((s) => s.category)))];

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.file_name.toLowerCase().includes(search.toLowerCase()) ||
      s.invoice_id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#60695C] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search benchmark samples..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E0D8] rounded-lg text-xs text-[#20251F] focus:outline-none focus:border-[#246B50] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#60695C] shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-all whitespace-nowrap cursor-pointer',
                selectedCategory === cat
                  ? 'bg-[#246B50] text-white font-medium shadow-fine'
                  : 'bg-[#FAFAF8] text-[#60695C] hover:bg-[#EFEFEA] border border-[#E2E0D8]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
        {filteredSamples.map((sample) => {
          const isSelected = selectedSample === sample.file_name;
          return (
            <div
              key={sample.file_name}
              onClick={() => onSelectSample(sample)}
              className={cn(
                'p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2',
                isSelected
                  ? 'bg-[#E6F0E9] border-[#246B50] shadow-fine ring-1 ring-[#246B50]'
                  : 'bg-white border-[#E2E0D8] hover:border-[#CBC8BD] hover:bg-[#FAFAF8]'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#20251F] block">
                  {sample.invoice_id}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-[#246B50] text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#60695C]">
                <Badge variant="outline" size="sm">
                  {sample.category}
                </Badge>
                <span>{sample.file_size_kb} KB</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
