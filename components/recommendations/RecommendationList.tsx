'use client';

import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { Alert } from '../ui/Alert';
import { Recommendation } from '@/lib/types';

interface RecommendationListProps {
  recommendations: Recommendation[];
  dataQuality?: 'good' | 'fair' | 'poor';
  qualityScore?: number;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  dataQuality,
  qualityScore,
}) => {
  if (recommendations.length === 0) {
    return (
      <Alert variant="warning">
        No recommendations available. Please check your input data and try again.
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Personalized Recommendations
        </h2>
        <p className="text-gray-600">
          Based on your usage data and preferences, here are the top 3 energy plans for you.
        </p>
      </div>

      {/* Data Quality Warning */}
      {dataQuality && dataQuality !== 'good' && (
        <Alert
          variant={dataQuality === 'fair' ? 'warning' : 'error'}
          title="Data Quality Notice"
        >
          <p>
            Your usage data quality is {dataQuality}. Recommendations are based on available
            data, but accuracy may be improved with more complete usage history.
            {qualityScore !== undefined && ` (Quality Score: ${qualityScore}/100)`}
          </p>
        </Alert>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.plan.id}
            recommendation={recommendation}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>
          These recommendations are estimates based on your provided usage data.
          Actual costs may vary based on your specific usage patterns and market conditions.
        </p>
      </div>
    </div>
  );
};

