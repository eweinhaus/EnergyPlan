'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlanDetailsModal } from './PlanDetailsModal';
import { Recommendation, CurrentPlanData, ParsedUsageData } from '@/lib/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  rank: number;
  currentPlan?: CurrentPlanData;
  usageData?: ParsedUsageData;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank,
  currentPlan,
  usageData,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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

      {/* Confidence Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceColors[confidence]}`}
        >
          {confidenceLabels[confidence]}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-4 pt-8">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{plan.supplierName}</h3>
          <p className="text-sm text-gray-600 mt-1">{plan.name}</p>
        </div>

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

        {/* Cost Breakdown */}
        <div className="border-t pt-4">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium text-gray-700 hover:text-primary-600">
              View Cost Breakdown
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Cost (${plan.rate}/kWh)</span>
                <span className="font-medium">
                  ${((plan.rate / 100) * 1000).toFixed(2)} per 1000 kWh
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">${plan.fees.delivery.toFixed(2)}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Fee</span>
                <span className="font-medium">${plan.fees.admin.toFixed(2)}/month</span>
              </div>
            </div>
          </details>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              // In production, this would link to supplier signup page
              alert(`This would redirect to ${plan.supplierName} signup page`);
            }}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>

    <PlanDetailsModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      recommendation={recommendation}
      rank={rank}
      currentPlan={currentPlan}
      usageData={usageData}
    />
    </>
  );
};

