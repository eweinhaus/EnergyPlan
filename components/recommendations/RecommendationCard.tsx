'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { PlanDetailsModal } from './PlanDetailsModal';
import { Recommendation, CurrentPlanData, ParsedUsageData, PlanWithScenarios } from '@/lib/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  rank: number;
  suppliers?: { id: string; rating: number }[];
  currentPlan?: CurrentPlanData;
  usageData?: ParsedUsageData;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank,
  suppliers = [],
  currentPlan,
  usageData,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { plan, explanation } = recommendation;

  return (
    <>
      <div
        className="relative h-full flex flex-col overflow-visible cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white rounded-lg shadow-md p-6"
        onClick={() => setIsModalOpen(true)}
      >
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg z-10">
        {rank}
      </div>

      <div className="flex-1 flex flex-col gap-4 pt-8">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{plan.supplierName}</h3>
          <p className="text-sm text-gray-600 mt-1">{plan.name}</p>
        </div>

        {/* Cost Scenarios or Legacy Savings */}
        {'scenarios' in plan && plan.scenarios ? (
          <div className="space-y-3">
            {/* Savings Display */}
            {(() => {
              const recommendedScenario = plan.scenarios.find(s => s.type === plan.recommendedScenario?.type) || plan.scenarios[0];
              return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Estimated Annual Savings
                    </span>
                    <span className={`text-2xl font-bold ${
                      recommendedScenario.netSavings > 0 ? 'text-green-600' :
                      recommendedScenario.netSavings < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {recommendedScenario.netSavings > 0 ? '+' : ''}${recommendedScenario.netSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-green-700 mt-2">
                    Annual cost: ${recommendedScenario.annualCost.toFixed(2)}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* Legacy Savings Display (for backward compatibility) */
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {plan.rate}¢/kWh
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Annual Cost</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${plan.annualCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Savings */}
            {plan.savings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    Estimated Annual Savings
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${plan.savings.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {plan.savings <= 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    Annual Cost Difference
                  </span>
                  <span className="text-2xl font-bold text-gray-600">
                    {plan.savings < 0 ? '+' : ''}${Math.abs(plan.savings).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Renewable Energy */}
        {plan.renewablePercentage > 0 && (
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-700">
              {plan.renewablePercentage}% Renewable Energy
            </span>
          </div>
        )}

        {/* Explanation */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
        </div>

      </div>
    </div>

    <PlanDetailsModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      recommendation={recommendation}
      rank={rank}
      suppliers={suppliers}
      currentPlan={currentPlan}
      usageData={usageData}
    />
    </>
  );
};

