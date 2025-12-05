'use client';

import React, { useState } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Recommendation, EnergyPlanFormData } from '@/lib/types';
import { generatePDFReport, downloadPDF } from '@/lib/pdfGenerator.client';

interface RecommendationListProps {
  recommendations: Recommendation[];
  dataQuality?: 'good' | 'fair' | 'poor';
  qualityScore?: number;
  savingToAccount?: boolean;
  formData?: EnergyPlanFormData;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  dataQuality,
  qualityScore,
  savingToAccount = false,
  formData,
}) => {
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    if (!formData) {
      alert('Unable to generate PDF: Form data not available');
      return;
    }

    setGeneratingPDF(true);
    try {
      const result = await generatePDFReport(recommendations, formData);

      if (result.success && result.url) {
        downloadPDF(result.url);
      } else {
        alert(`Failed to generate PDF: ${result.error}`);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };
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
        <p className="text-gray-600 mb-6">
          Based on your usage data and preferences, here are the top 3 energy plans for you.
        </p>

        {/* PDF Export Button */}
        {formData && (
          <div className="mb-6">
            <Button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="inline-flex items-center"
            >
              {generatingPDF ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF Report
                </>
              )}
            </Button>
          </div>
        )}

        {/* Saving Status */}
        {savingToAccount && (
          <Alert variant="info" className="mb-4">
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
              Saving recommendations to your account...
            </div>
          </Alert>
        )}
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

