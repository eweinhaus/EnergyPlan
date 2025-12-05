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
      costPriority: newCost,
      renewablePriority: newRenewable,
    });
    setError('');
  };

  const handleRenewableChange = (value: number) => {
    const newRenewable = Math.max(0, Math.min(100, value));
    const newCost = 100 - newRenewable;
    onPreferencesChange({
      costPriority: newCost,
      renewablePriority: newRenewable,
    });
    setError('');
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
        Tell us what matters most to you. Adjust the sliders to prioritize cost savings
        versus renewable energy options. The total must equal 100%.
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

