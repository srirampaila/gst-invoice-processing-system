import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { api } from '../../lib/api';

interface FileUploadZoneProps {
  onFileUploaded: (fileData: { file_name: string; invoice_id: string; file_size_kb: number; image_url: string }) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|pdf)$/i)) {
      setError(`Unsupported file type: ${file.name}. Allowed formats: PNG, JPG, JPEG, PDF.`);
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadInvoice(file);
      onFileUploaded(res);
    } catch (err: any) {
      setError(err.message || 'Failed to upload invoice file.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#246B50] bg-[#E6F0E9]/50'
            : 'border-[#E2E0D8] hover:border-[#CBC8BD] bg-[#FAFAF8]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#E6F0E9] text-[#246B50] flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#20251F]">
              Drag &amp; drop an invoice scan here, or <span className="text-[#246B50] underline">browse files</span>
            </p>
            <p className="text-xs text-[#60695C] mt-0.5">
              Supports PNG, JPG, JPEG, and PDF documents up to 25 MB
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-[#60695C] bg-[#FAFAF8] p-3 rounded border border-[#E2E0D8]">
          <div className="w-4 h-4 rounded-full border-2 border-[#246B50] border-t-transparent animate-spin" />
          <span>Uploading and caching document buffer...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#8F342D] bg-[#FCECEB] p-3 rounded border border-[#F3BDB9]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
