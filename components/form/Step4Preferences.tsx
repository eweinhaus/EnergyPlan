'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { UserPreferences } from '@/lib/types';

interface Step4PreferencesProps {
  onNext: () => void;
  onBack: () => void;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

export const Step4Preferences: React.FC<Step4PreferencesProps> = ({
  onNext,
  onBack,
  preferences,
  onPreferencesChange,
}) => {
  const [error, setError] = useState<string>('');

  const handleCostChange = (value: number) => {
    const newCost = Math.max(0, Math.min(100, value));
    const newRenewable = 100 - newCost;
    onPreferencesChange({
      ...preferences,
      costPriority: newCost,
      renewablePriority: newRenewable,
    });
    setError('');
  };

  const handleRenewableChange = (value: number) => {
    const newRenewable = Math.max(0, Math.min(100, value));
    const newCost = 100 - newRenewable;
    onPreferencesChange({
      ...preferences,
      costPriority: newCost,
      renewablePriority: newRenewable,
    });
    setError('');
  };

  const handlePriceStabilityChange = (value: string) => {
    onPreferencesChange({
      ...preferences,
      priceStability: value as 'fixed-only' | 'variable-ok' | 'no-preference',
    });
  };

  const handlePlanComplexityChange = (value: string) => {
    onPreferencesChange({
      ...preferences,
      planComplexity: value as 'simple-only' | 'complex-ok' | 'no-preference',
    });
  };

  const handleSupplierReputationChange = (value: string) => {
    onPreferencesChange({
      ...preferences,
      supplierReputation: value as 'high-only' | 'any-ok' | 'no-preference',
    });
  };

  const validate = (): boolean => {
    const total = preferences.costPriority + preferences.renewablePriority;
    if (Math.abs(total - 100) > 0.01) {
      setError('Cost and renewable priorities must sum to 100%');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Preferences</h2>
      <p className="text-gray-600 mb-6">
        Tell us what matters most to you. Start by adjusting the sliders to prioritize cost savings
        versus renewable energy options. Then answer the optional questions below for more personalized recommendations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Cost Savings Priority
            </label>
            <span className="text-lg font-semibold text-primary-600">
              {preferences.costPriority.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={preferences.costPriority}
            onChange={(e) => handleCostChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Prioritize plans with lower costs and better savings
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Renewable Energy Priority
            </label>
            <span className="text-lg font-semibold text-green-600">
              {preferences.renewablePriority.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={preferences.renewablePriority}
            onChange={(e) => handleRenewableChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Prioritize plans with higher renewable energy percentages
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span
              className={`text-lg font-semibold ${
                Math.abs(preferences.costPriority + preferences.renewablePriority - 100) < 0.01
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {(preferences.costPriority + preferences.renewablePriority).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Additional Preferences</h3>
          <p className="text-sm text-gray-600">These optional preferences help refine your recommendations further.</p>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Price Stability
            </label>
            <p className="text-xs text-gray-500 mb-3">
              How much does predictable pricing matter to you?
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priceStability"
                  value="fixed-only"
                  checked={preferences.priceStability === 'fixed-only'}
                  onChange={(e) => handlePriceStabilityChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Prefer fixed rates (predictable costs)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priceStability"
                  value="variable-ok"
                  checked={preferences.priceStability === 'variable-ok'}
                  onChange={(e) => handlePriceStabilityChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Open to variable rates (potential savings)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priceStability"
                  value="no-preference"
                  checked={!preferences.priceStability || preferences.priceStability === 'no-preference'}
                  onChange={(e) => handlePriceStabilityChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">No preference</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Plan Complexity
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Do you prefer simple billing or are complex rate structures okay?
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="planComplexity"
                  value="simple-only"
                  checked={preferences.planComplexity === 'simple-only'}
                  onChange={(e) => handlePlanComplexityChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Simple plans only (fixed rates)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="planComplexity"
                  value="complex-ok"
                  checked={preferences.planComplexity === 'complex-ok'}
                  onChange={(e) => handlePlanComplexityChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Complex plans okay (tiered, time-of-use)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="planComplexity"
                  value="no-preference"
                  checked={!preferences.planComplexity || preferences.planComplexity === 'no-preference'}
                  onChange={(e) => handlePlanComplexityChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">No preference</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Supplier Reputation
            </label>
            <p className="text-xs text-gray-500 mb-3">
              How important are highly-rated suppliers to you?
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="supplierReputation"
                  value="high-only"
                  checked={preferences.supplierReputation === 'high-only'}
                  onChange={(e) => handleSupplierReputationChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Prefer highly-rated suppliers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="supplierReputation"
                  value="any-ok"
                  checked={preferences.supplierReputation === 'any-ok'}
                  onChange={(e) => handleSupplierReputationChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Any reputable supplier is fine</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="supplierReputation"
                  value="no-preference"
                  checked={!preferences.supplierReputation || preferences.supplierReputation === 'no-preference'}
                  onChange={(e) => handleSupplierReputationChange(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">No preference</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="error">
            {error}
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

