'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { CurrentPlanData } from '@/lib/types';

interface Step2CurrentPlanProps {
  onNext: () => void;
  onBack: () => void;
  currentPlan: CurrentPlanData;
  onCurrentPlanChange: (plan: CurrentPlanData) => void;
}

export const Step2CurrentPlan: React.FC<Step2CurrentPlanProps> = ({
  onNext,
  onBack,
  currentPlan,
  onCurrentPlanChange,
}) => {
  const [errors, setErrors] = useState<Partial<Record<keyof CurrentPlanData, string>>>({});
  const [showHelp, setShowHelp] = useState(false);
  const [contractError, setContractError] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CurrentPlanData, string>> = {};

    if (!currentPlan.supplier.trim()) {
      newErrors.supplier = 'Supplier name is required';
    }

    if (!currentPlan.rate || currentPlan.rate <= 0) {
      newErrors.rate = 'Rate is required and must be greater than 0';
    } else if (currentPlan.rate < 5 || currentPlan.rate > 50) {
      newErrors.rate = 'Rate must be between 5 and 50 cents per kWh';
    }

    // Early termination fee is optional but if provided must be valid
    if (currentPlan.earlyTerminationFee !== undefined && (currentPlan.earlyTerminationFee < 0 || currentPlan.earlyTerminationFee > 2000)) {
      newErrors.earlyTerminationFee = 'Early termination fee must be between $0 and $2000';
    }

    // If contract end date is provided, validate it's not in the past
    if (currentPlan.contractEndDate) {
      const contractDate = new Date(currentPlan.contractEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (contractDate < today) {
        newErrors.contractEndDate = 'Contract end date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleChange = (field: keyof CurrentPlanData, value: string | number | undefined) => {
    onCurrentPlanChange({
      ...currentPlan,
      [field]: value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    if (contractError) {
      setContractError('');
    }
  };

  const handleFeeChange = (value: string) => {
    const fee = value === '' ? undefined : parseInt(value);
    if (fee !== undefined && (fee < 0 || fee > 2000)) {
      setContractError('Early termination fee must be between $0 and $2000');
      return;
    }
    setContractError('');
    handleChange('earlyTerminationFee', fee);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Plan Details</h2>
      <p className="text-gray-600 mb-6">
        Tell us about your current energy plan so we can calculate potential savings.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Current Supplier"
          value={currentPlan.supplier}
          onChange={(e) => handleChange('supplier', e.target.value)}
          error={errors.supplier}
          placeholder="e.g., Reliant Energy"
          required
        />

        <Input
          label="Current Rate (cents per kWh)"
          type="number"
          step="0.01"
          min="5"
          max="50"
          value={currentPlan.rate || ''}
          onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
          error={errors.rate}
          placeholder="e.g., 12.5"
          helperText="Enter your current rate in cents per kWh (typically 5-50 cents)"
          required
        />

        <Input
          label="Contract End Date (Optional)"
          type="date"
          value={currentPlan.contractEndDate || ''}
          onChange={(e) => handleChange('contractEndDate', e.target.value)}
          helperText="If you have a contract, when does it expire?"
        />

        <Input
          label="Contract Length in Months (Optional)"
          type="number"
          min="1"
          max="60"
          value={currentPlan.contractLength || ''}
          onChange={(e) => handleChange('contractLength', parseInt(e.target.value) || undefined)}
          helperText="How many months is your current contract?"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Early Termination Fee (Optional)
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="ml-2 text-primary-600 hover:text-primary-700 text-xs underline"
            >
              What&apos;s this?
            </button>
          </label>

          {showHelp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-3">Understanding Early Termination Fees</h4>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>What it is:</strong> A fee charged by your current supplier if you end your contract before the agreed-upon date.
                </p>
                <p>
                  <strong>Typical amounts:</strong> $50-$300 for most Texas residential contracts, though some can be $500+.
                </p>
                <p>
                  <strong>Where to find it:</strong> Check your contract paperwork, recent bills, or contact your supplier. Look for terms like &ldquo;early termination fee,&rdquo; &ldquo;cancellation fee,&rdquo; or &ldquo;ETF.&rdquo;
                </p>
                <p>
                  <strong>Why it matters:</strong> This fee affects the true cost of switching plans. Our calculations will show you exactly how it impacts your decision.
                </p>
                <p className="text-blue-700 font-medium">
                  Tip: If you&apos;re unsure, you can skip this and we&apos;ll use an industry average estimate for cost calculations.
                </p>
              </div>
            </div>
          )}

          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              max="2000"
              step="1"
              value={currentPlan.earlyTerminationFee ?? ''}
              onChange={(e) => handleFeeChange(e.target.value)}
              placeholder="150"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave blank if unknown - we&apos;ll use an industry average estimate
          </p>
          {errors.earlyTerminationFee && (
            <p className="text-xs text-red-600 mt-1">{errors.earlyTerminationFee}</p>
          )}
        </div>

        {(contractError || errors.contractEndDate) && (
          <Alert variant="error">
            {contractError || errors.contractEndDate}
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </Card>
  );
};

