'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '@/lib/auth';
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
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleCreateAccount = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
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

        {/* Account Creation Prompt */}
        {!user && !isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Your Recommendations
            </h3>
            <p className="text-blue-700 mb-3">
              Create a free account to save and revisit your recommendations anytime, compare plans over time, and export professional PDF reports.
            </p>
            <Button
              type="button"
              onClick={handleCreateAccount}
              className="w-full sm:w-auto"
            >
              Create Free Account
            </Button>
          </div>
        )}

        {/* User Status Message */}
        {user && !isProcessing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Welcome back, {user.displayName || user.email}!
                </h3>
                <p className="text-green-700">
                  Your recommendations will be automatically saved to your account.
                </p>
              </div>
            </div>
          </div>
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </Card>
  );
};

