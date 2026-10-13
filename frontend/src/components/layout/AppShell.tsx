import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
  selectedProvider: string;
  onProviderChange: (p: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  selectedProvider,
  onProviderChange,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#20251F]">
      <Navbar
        selectedProvider={selectedProvider}
        onProviderChange={onProviderChange}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
        {children}
      </main>
      <Footer />
    </div>
  );
};
