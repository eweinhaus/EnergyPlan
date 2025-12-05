'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
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

