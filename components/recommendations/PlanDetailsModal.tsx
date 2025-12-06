'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Recommendation, CurrentPlanData, ParsedUsageData } from '@/lib/types';

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation;
  rank: number;
  currentPlan?: CurrentPlanData;
  usageData?: ParsedUsageData;
  suppliers?: { id: string; rating: number }[];
}

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  rank,
  currentPlan,
  usageData,
  suppliers = [],
}) => {
  const { plan, explanation, confidence } = recommendation;

  const confidenceColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };

  const confidenceLabels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  };

  const getRateStructureDescription = () => {
    if (!plan.rateStructure) {
      return 'Fixed Rate Plan';
    }

    switch (plan.rateStructure.type) {
      case 'fixed':
        return `Fixed Rate: ${plan.rateStructure.fixed?.ratePerKwh}¢/kWh`;
      case 'tiered':
        return `Tiered Rate: ${plan.rateStructure.tiered?.tiers.length} pricing tiers`;
      case 'tou':
        return 'Time-of-Use Rate (Peak/Off-Peak pricing)';
      case 'variable':
        return 'Variable Rate (changes with market conditions)';
      case 'seasonal':
        return 'Seasonal Rate (different rates for summer/winter)';
      default:
        return 'Fixed Rate Plan';
    }
  };

  const renderRateStructureDetails = () => {
        if (!plan.rateStructure) {
      return (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">Rate Structure</h4>
          <p className="text-xs text-gray-700 break-words">Simple fixed-rate plan with consistent pricing throughout the year.</p>
        </div>
      );
    }

    switch (plan.rateStructure.type) {
      case 'tiered':
        return (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Tiered Rate Structure</h4>
            <div className="space-y-1.5">
              {plan.rateStructure.tiered?.tiers.map((tier, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="break-words pr-2">
                    Tier {index + 1}: {tier.minKwh.toLocaleString()} - {tier.maxKwh.toLocaleString()} kWh
                  </span>
                  <span className="font-medium flex-shrink-0">{tier.ratePerKwh}¢/kWh</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1.5 break-words">
              Your rate increases as your monthly usage crosses each tier threshold.
            </p>
          </div>
        );

      case 'tou':
        return (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Time-of-Use Rate Structure</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Peak Hours ({plan.rateStructure.tou?.peakHours.start} - {plan.rateStructure.tou?.peakHours.end})</span>
                <span className="font-medium flex-shrink-0">{plan.rateStructure.tou?.peakHours.ratePerKwh}¢/kWh</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Off-Peak Hours</span>
                <span className="font-medium flex-shrink-0">{plan.rateStructure.tou?.offPeakRatePerKwh}¢/kWh</span>
              </div>
              {plan.rateStructure.tou?.superOffPeakRatePerKwh && (
                <div className="flex justify-between items-center text-xs">
                  <span className="break-words pr-2">Super Off-Peak (Overnight)</span>
                  <span className="font-medium flex-shrink-0">{plan.rateStructure.tou?.superOffPeakRatePerKwh}¢/kWh</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1.5 break-words">
              Higher rates during peak demand hours, lower rates during off-peak times.
            </p>
          </div>
        );

      case 'variable':
        return (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Variable Rate Structure</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Base Rate</span>
                <span className="font-medium flex-shrink-0">{plan.rateStructure.variable?.baseRatePerKwh}¢/kWh</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Market Adjustment</span>
                <span className="font-medium flex-shrink-0 capitalize">{plan.rateStructure.variable?.marketAdjustment}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Rate Caps</span>
                <span className="font-medium flex-shrink-0">
                  {plan.rateStructure.variable?.caps.min}¢ - {plan.rateStructure.variable?.caps.max}¢
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 break-words">
              Rates change based on market conditions, with minimum and maximum caps.
            </p>
          </div>
        );

      case 'seasonal':
        return (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Seasonal Rate Structure</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Summer Rate (Jun-Sep)</span>
                <span className="font-medium flex-shrink-0">{plan.rateStructure.seasonal?.summerRatePerKwh}¢/kWh</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="break-words pr-2">Winter Rate (Oct-May)</span>
                <span className="font-medium flex-shrink-0">{plan.rateStructure.seasonal?.winterRatePerKwh}¢/kWh</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 break-words">
              Different rates for summer and winter months based on seasonal demand.
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Rate Structure</h4>
            <p className="text-xs text-gray-700 break-words">Simple fixed-rate plan with consistent pricing.</p>
          </div>
        );
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${plan.supplierName} - ${plan.name}`}
      className="max-w-6xl"
    >
      <div className="space-y-3 max-h-[70vh] overflow-y-auto">
        {/* Header with Rank and Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-base flex-shrink-0">
              #{rank}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900 truncate">{plan.supplierName}</h2>
              <p className="text-sm text-gray-600 truncate">{plan.name}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${confidenceColors[confidence]}`}>
            {confidenceLabels[confidence]}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Rate</p>
            <p className="text-lg font-bold text-blue-900 break-words">{plan.rate}¢/kWh</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium">Annual Cost</p>
            <p className="text-lg font-bold text-green-900 break-words">${plan.annualCost.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600 font-medium">Renewable</p>
            <p className="text-lg font-bold text-purple-900 break-words">{plan.renewablePercentage}%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600 font-medium">Savings</p>
            <p className={`text-lg font-bold break-words ${plan.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {plan.savings >= 0 ? '+' : ''}${plan.savings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Rate Structure Details */}
        {renderRateStructureDetails()}

        {/* Supplier Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Supplier Information</h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-800">Supplier Rating</span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((star) => {
                  const supplier = suppliers.find((s) => s.id === plan.supplierId);
                  const rating = supplier ? supplier.rating : 4.0;
                  return (
                    <svg
                      key={star}
                      className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  );
                })}
                <span className="text-xs text-blue-800 ml-1">
                  {(suppliers.find((s) => s.id === plan.supplierId)?.rating || 4.0).toFixed(1)}/5.0
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-800">Supplier</span>
              <span className="text-xs font-medium text-blue-900 truncate ml-2">{plan.supplierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-800">Plan Type</span>
              <span className="text-xs font-medium text-blue-900 truncate ml-2">{getRateStructureDescription()}</span>
            </div>
            {plan.renewablePercentage > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-800">Renewable Energy</span>
                <span className="text-xs font-medium text-blue-900">{plan.renewablePercentage}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-semibold text-sm text-green-900 mb-2">Plan Benefits</h4>
          <div className="space-y-1.5">
            {plan.savings > 0 && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-green-800 break-words">Potential annual savings of ${plan.savings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-green-800 break-words">Fixed delivery fee: ${plan.fees.delivery.toFixed(2)}/month</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-green-800 break-words">Admin fee: ${plan.fees.admin.toFixed(2)}/month</span>
            </div>
          </div>
        </div>

        {/* Recommendation Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Why This Plan?</h4>
          <p className="text-xs text-blue-800 break-words">{explanation}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
          <Button
            variant="primary"
            className="flex-1 text-sm py-2"
            onClick={() => {
              // In production, this would link to supplier signup page
              alert(`This would redirect to ${plan.supplierName} signup page with plan ${plan.name}`);
            }}
          >
            Sign Up for This Plan
          </Button>
          <Button
            variant="outline"
            className="text-sm py-2"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
