'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { parseGreenButtonXML } from '@/lib/xmlParser';
import { validateUsageData } from '@/lib/dataValidation';
import { getWarningActions } from '@/lib/warningActions';

interface Step3FileUploadProps {
  onNext: () => void;
  onBack: () => void;
  onFileSelect: (file: File) => void;
  selectedFile?: File;
}

export const Step3FileUpload: React.FC<Step3FileUploadProps> = ({
  onNext,
  onBack,
  onFileSelect,
  selectedFile,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarningsModal, setShowWarningsModal] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');

    // Check file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setError('Please select an XML file (.xml extension required)');
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return false;
    }

    if (file.size === 0) {
      setError('File appears to be empty.');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setWarnings([]);
    setIsValid(false);

    try {
      // Read file content
      const xmlContent = await file.text();

      // Parse XML
      const usageData = parseGreenButtonXML(xmlContent);

      // Validate usage data
      const validation = validateUsageData(usageData);

      if (!validation.isValid) {
        setError(`Data validation failed: ${validation.errors.join(', ')}`);
        setIsValid(false);
        setIsProcessing(false);
        return;
      }

      // Set warnings and validation state
      setWarnings(validation.warnings);
      setIsValid(true);

      // If there are warnings, show the modal
      if (validation.warnings.length > 0) {
        setShowWarningsModal(true);
      }

      // File is valid, notify parent
      onFileSelect(file);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to process XML file. Please check the file format.'
      );
      setIsValid(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    // Reset state when choosing a new file
    setWarnings([]);
    setIsValid(false);
    setShowWarningsModal(false);
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Usage Data</h2>
      <p className="text-gray-600 mb-6" id="file-upload-description">
        Upload your Green Button XML file containing your energy usage history.
        We need at least 6 months of data for accurate recommendations.
        Supported format: XML files only, maximum 10MB.
      </p>

      <div
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${selectedFile ? 'bg-green-50 border-green-300' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="File upload area. Press Enter or Space to browse files, or drag and drop XML files here."
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleChange}
          className="hidden"
          aria-label="Upload Green Button XML file"
          aria-describedby="file-upload-description"
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="text-primary-600">
              <svg
                className="mx-auto h-12 w-12 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Processing file...</p>
              <p className="text-sm text-gray-500 mt-1">
                Validating your usage data
              </p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className={isValid ? 'text-green-600' : 'text-gray-400'}>
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
              {warnings.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-yellow-600">
                    {warnings.length} warning{warnings.length !== 1 ? 's' : ''} detected
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowWarningsModal(true)}
                    size="sm"
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    View Warnings
                  </Button>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={handleClick} size="sm">
              Choose Different File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop your XML file here
              </p>
              <p className="text-sm text-gray-500 mt-1">or</p>
              <Button onClick={handleClick} variant="outline" className="mt-2">
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              XML files only, maximum 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!selectedFile || isProcessing || !isValid}
          className="flex-1"
        >
          Continue
        </Button>
      </div>

      {/* Warnings Modal */}
      <Modal
        isOpen={showWarningsModal}
        onClose={() => setShowWarningsModal(false)}
        title="Data Quality Warnings"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Your usage data has been processed, but we detected some potential issues.
            Review the warnings below and take any recommended actions.
          </p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getWarningActions(warnings).map((item, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  item.severity === 'important'
                    ? 'border-red-200 bg-red-50'
                    : item.severity === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <p className="font-medium text-gray-900 mb-2">{item.warning}</p>
                <p className="text-sm text-gray-700">{item.action}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <Button
              onClick={() => setShowWarningsModal(false)}
              className="w-full"
            >
              Continue with Current Data
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

