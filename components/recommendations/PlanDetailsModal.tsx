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
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Rate Structure</h4>
          <p className="text-sm text-gray-700">Simple fixed-rate plan with consistent pricing throughout the year.</p>
        </div>
      );
    }

    switch (plan.rateStructure.type) {
      case 'tiered':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Tiered Rate Structure</h4>
            <div className="space-y-2">
              {plan.rateStructure.tiered?.tiers.map((tier, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>
                    Tier {index + 1}: {tier.minKwh.toLocaleString()} - {tier.maxKwh.toLocaleString()} kWh
                  </span>
                  <span className="font-medium">{tier.ratePerKwh}¢/kWh</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Your rate increases as your monthly usage crosses each tier threshold.
            </p>
          </div>
        );

      case 'tou':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Time-of-Use Rate Structure</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Peak Hours ({plan.rateStructure.tou?.peakHours.start} - {plan.rateStructure.tou?.peakHours.end})</span>
                <span className="font-medium">{plan.rateStructure.tou?.peakHours.ratePerKwh}¢/kWh</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Off-Peak Hours</span>
                <span className="font-medium">{plan.rateStructure.tou?.offPeakRatePerKwh}¢/kWh</span>
              </div>
              {plan.rateStructure.tou?.superOffPeakRatePerKwh && (
                <div className="flex justify-between items-center text-sm">
                  <span>Super Off-Peak (Overnight)</span>
                  <span className="font-medium">{plan.rateStructure.tou?.superOffPeakRatePerKwh}¢/kWh</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Higher rates during peak demand hours, lower rates during off-peak times.
            </p>
          </div>
        );

      case 'variable':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Variable Rate Structure</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Base Rate</span>
                <span className="font-medium">{plan.rateStructure.variable?.baseRatePerKwh}¢/kWh</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Market Adjustment</span>
                <span className="font-medium capitalize">{plan.rateStructure.variable?.marketAdjustment}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Rate Caps</span>
                <span className="font-medium">
                  {plan.rateStructure.variable?.caps.min}¢ - {plan.rateStructure.variable?.caps.max}¢
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Rates change based on market conditions, with minimum and maximum caps.
            </p>
          </div>
        );

      case 'seasonal':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Seasonal Rate Structure</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Summer Rate (Jun-Sep)</span>
                <span className="font-medium">{plan.rateStructure.seasonal?.summerRatePerKwh}¢/kWh</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Winter Rate (Oct-May)</span>
                <span className="font-medium">{plan.rateStructure.seasonal?.winterRatePerKwh}¢/kWh</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Different rates for summer and winter months based on seasonal demand.
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Rate Structure</h4>
            <p className="text-sm text-gray-700">Simple fixed-rate plan with consistent pricing.</p>
          </div>
        );
    }
  };

  const calculateMonthlyBreakdown = () => {
    if (!usageData || !usageData.monthlyTotals.length) return null;

    const monthlyBreakdowns = usageData.monthlyTotals.slice(0, 6).map(month => {
      const energyCost = (plan.rate / 100) * month.totalKwh;
      const deliveryFee = plan.fees.delivery;
      const adminFee = plan.fees.admin;
      const totalMonthly = energyCost + deliveryFee + adminFee;

      return {
        month: month.month,
        usage: month.totalKwh,
        energyCost,
        deliveryFee,
        adminFee,
        total: totalMonthly,
      };
    });

    return monthlyBreakdowns;
  };

  const monthlyBreakdown = calculateMonthlyBreakdown();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${plan.supplierName} - ${plan.name}`}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header with Rank and Confidence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
              #{rank}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{plan.supplierName}</h2>
              <p className="text-gray-600">{plan.name}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceColors[confidence]}`}>
            {confidenceLabels[confidence]}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Rate</p>
            <p className="text-2xl font-bold text-blue-900">{plan.rate}¢/kWh</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Annual Cost</p>
            <p className="text-2xl font-bold text-green-900">${plan.annualCost.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">Renewable</p>
            <p className="text-2xl font-bold text-purple-900">{plan.renewablePercentage}%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-sm text-orange-600 font-medium">Savings</p>
            <p className={`text-2xl font-bold ${plan.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {plan.savings >= 0 ? '+' : ''}${plan.savings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Rate Structure Details */}
        {renderRateStructureDetails()}

        {/* Monthly Cost Breakdown */}
        {monthlyBreakdown && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Estimated Monthly Costs</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Usage (kWh)</th>
                    <th className="text-right py-2">Energy Cost</th>
                    <th className="text-right py-2">Fees</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.slice(0, 6).map((month, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{month.month}</td>
                      <td className="text-right py-2">{month.usage.toFixed(0)}</td>
                      <td className="text-right py-2">${month.energyCost.toFixed(2)}</td>
                      <td className="text-right py-2">${(month.deliveryFee + month.adminFee).toFixed(2)}</td>
                      <td className="text-right py-2 font-medium">${month.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  {monthlyBreakdown.length > 6 && (
                    <tr className="border-b bg-gray-50">
                      <td className="py-2 font-medium" colSpan={4}>Average of remaining months</td>
                      <td className="text-right py-2 font-medium">
                        ${(monthlyBreakdown.slice(6).reduce((sum, m) => sum + m.total, 0) / Math.max(1, monthlyBreakdown.slice(6).length)).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Supplier Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Supplier Information</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Supplier Rating</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const supplier = suppliers.find((s) => s.id === plan.supplierId);
                  const rating = supplier ? supplier.rating : 4.0;
                  return (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  );
                })}
                <span className="text-sm text-blue-800 ml-2">
                  {(suppliers.find((s) => s.id === plan.supplierId)?.rating || 4.0).toFixed(1)}/5.0
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Supplier</span>
              <span className="text-sm font-medium text-blue-900">{plan.supplierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Plan Type</span>
              <span className="text-sm font-medium text-blue-900">{getRateStructureDescription()}</span>
            </div>
            {plan.renewablePercentage > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Renewable Energy</span>
                <span className="text-sm font-medium text-blue-900">{plan.renewablePercentage}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Plan Benefits</h4>
          <div className="space-y-2">
            {plan.savings > 0 && (
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-800">Potential annual savings of ${plan.savings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-800">Fixed delivery fee: ${plan.fees.delivery.toFixed(2)}/month</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-800">Admin fee: ${plan.fees.admin.toFixed(2)}/month</span>
            </div>
          </div>
        </div>

        {/* Recommendation Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Why This Plan?</h4>
          <p className="text-sm text-blue-800">{explanation}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              // In production, this would link to supplier signup page
              alert(`This would redirect to ${plan.supplierName} signup page with plan ${plan.name}`);
            }}
          >
            Sign Up for This Plan
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
