'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { EnergyPlanFormData } from '@/lib/types';

interface Step5ReviewProps {
  onBack: () => void;
  formData: EnergyPlanFormData;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  onBack,
  formData,
  onSubmit,
  isProcessing,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Information</h2>
      <p className="text-gray-600 mb-6">
        Please review your information before submitting. You can go back to make changes.
      </p>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Plan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Supplier:</span>
              <span className="font-medium">{formData.currentPlan.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rate:</span>
              <span className="font-medium">{formData.currentPlan.rate}¢/kWh</span>
            </div>
            {formData.currentPlan.contractEndDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contract End Date:</span>
                <span className="font-medium">
                  {new Date(formData.currentPlan.contractEndDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {formData.currentPlan.contractLength && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Length:</span>
                <span className="font-medium">
                  {formData.currentPlan.contractLength} months
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Data</h3>
          {formData.xmlFile && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">File:</span>
                <span className="font-medium">{formData.xmlFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{formatFileSize(formData.xmlFile.size)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cost Savings Priority:</span>
              <span className="font-medium">{formData.preferences.costPriority}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Renewable Energy Priority:</span>
              <span className="font-medium">{formData.preferences.renewablePriority}%</span>
            </div>
          </div>
        </div>

        {isProcessing && (
          <Alert variant="info">
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing your data and generating recommendations...
            </div>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Get Recommendations'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

