import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Scale,
  Download,
  Activity,
  Cpu,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../common/Badge';
import { api } from '../../lib/api';
import { SystemHealth, ProvidersResponse } from '../../types';

interface NavbarProps {
  selectedProvider: string;
  onProviderChange: (providerId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedProvider, onProviderChange }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
    api.getProviders().then(setProviders).catch(console.error);
  }, []);

  const navLinks = [
    { path: '/', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { path: '/studio', label: 'Invoice Studio', icon: <Sparkles className="w-4 h-4" /> },
    { path: '/extraction', label: 'OCR & AI', icon: <FileText className="w-4 h-4" /> },
    { path: '/validation', label: 'GST Validation', icon: <ShieldCheck className="w-4 h-4" /> },
    { path: '/review', label: 'Human Review', icon: <Scale className="w-4 h-4" /> },
    { path: '/gstr1', label: 'GSTR-1 Draft', icon: <Download className="w-4 h-4" /> },
    { path: '/evaluation', label: 'Evaluation', icon: <Activity className="w-4 h-4" /> },
    { path: '/architecture', label: 'Architecture', icon: <Cpu className="w-4 h-4" /> },
  ];

  const currentProvider = providers?.providers.find((p) => p.id === selectedProvider);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E0D8]">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-[#246B50] flex items-center justify-center text-white shadow-fine group-hover:bg-[#1B523D] transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-[#20251F] tracking-tight block">
                  GST Intelligence
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#60695C] tracking-widest block -mt-1">
                  Tax Verification Engine
                </span>
              </div>
            </NavLink>

            {/* System Status Pill */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E2E0D8]">
              <Badge variant="emerald" size="sm" dot>
                SYSTEM READY
              </Badge>
              {health?.ollama_ready && (
                <Badge variant="slate" size="sm">
                  Ollama Active ({health.ollama_model})
                </Badge>
              )}
            </div>
          </div>

          {/* Engine Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProviderOpen(!isProviderOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF8] hover:bg-[#F0EFEA] border border-[#E2E0D8] rounded-lg text-xs font-medium text-[#20251F] transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-[#246B50]" />
              <div className="text-left">
                <span className="text-[10px] text-[#60695C] block font-normal -mb-0.5">Active Engine</span>
                <span className="font-semibold">{currentProvider?.name || 'Mock Extractor'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#60695C] ml-1" />
            </button>

            {isProviderOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProviderOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-elevated border border-[#E2E0D8] py-2 z-20 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-[#E2E0D8]">
                    <span className="text-[11px] font-bold text-[#60695C] uppercase tracking-wider">
                      Select Extraction Provider
                    </span>
                  </div>
                  {providers?.providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onProviderChange(p.id);
                        setIsProviderOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-[#FAFAF8] transition-colors',
                        selectedProvider === p.id && 'bg-[#E6F0E9] hover:bg-[#E6F0E9]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#20251F]">{p.name}</span>
                        {p.is_local ? (
                          <span className="text-[10px] bg-[#E8EAE6] text-[#40483C] px-1.5 rounded">Local</span>
                        ) : (
                          <span className="text-[10px] bg-[#DFDDD5] text-[#60695C] px-1.5 rounded">Cloud</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#60695C] line-clamp-1">{p.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Workspace Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-1 border-t border-[#F0EFEA]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#246B50] text-white shadow-fine font-semibold'
                    : 'text-[#60695C] hover:text-[#20251F] hover:bg-[#EFEFEA]'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
