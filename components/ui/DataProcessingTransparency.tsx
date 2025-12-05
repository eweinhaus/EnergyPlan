'use client';

import React, { useState } from 'react';
import { Card } from './Card';

interface DataProcessingTransparencyProps {
  currentStep: number;
}

export const DataProcessingTransparency: React.FC<DataProcessingTransparencyProps> = ({
  currentStep,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStepDataInfo = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Welcome & Consent",
          dataCollected: [
            "No personal data collected at this step"
          ],
          processing: [
            "Display consent information",
            "Record consent preferences in localStorage"
          ],
          legalBasis: "Consent (Article 6(1)(a))",
          retention: "Consent preferences stored in browser localStorage until consent is withdrawn"
        };
      case 2:
        return {
          title: "Current Plan Information",
          dataCollected: [
            "Energy supplier name (text input)",
            "Current rate in cents per kWh (numeric input)",
            "Contract end date (optional date input)",
            "Contract length in months (optional numeric input)"
          ],
          processing: [
            "Validate input format and ranges",
            "Store temporarily in browser localStorage",
            "Use for cost comparison calculations"
          ],
          legalBasis: "Consent (Article 6(1)(a)) for data processing",
          retention: "Data stored temporarily in localStorage during session, cleared after processing or when browser closes"
        };
      case 3:
        return {
          title: "Energy Usage Data Upload",
          dataCollected: [
            "Green Button XML file (energy usage data)",
            "File contains: hourly energy consumption readings",
            "File contains: meter readings and timestamps",
            "File contains: service point information"
          ],
          processing: [
            "Parse XML file using fast-xml-parser",
            "Extract hourly usage data and aggregate to monthly totals",
            "Validate data quality and completeness",
            "Assess data reliability and confidence scores"
          ],
          legalBasis: "Consent (Article 6(1)(a)) - explicit consent required for processing personal energy data",
          retention: "File processed in server memory, deleted immediately after recommendations generated. No permanent storage."
        };
      case 4:
        return {
          title: "Usage Preferences",
          dataCollected: [
            "Cost savings priority (percentage 0-100)",
            "Renewable energy priority (percentage 0-100)",
            "Must sum to 100% for validation"
          ],
          processing: [
            "Validate percentages sum to 100%",
            "Store in browser localStorage",
            "Use as weights in recommendation algorithm"
          ],
          legalBasis: "Consent (Article 6(1)(a)) for processing preferences",
          retention: "Stored temporarily in localStorage during session"
        };
      case 5:
        return {
          title: "Review & Processing",
          dataCollected: [
            "All previously collected data for final review",
            "Processing confirmation"
          ],
          processing: [
            "Validate all collected data",
            "Send data to API for processing",
            "Generate personalized recommendations",
            "Display results with cost savings"
          ],
          legalBasis: "Consent (Article 6(1)(a)) for all data processing activities",
          retention: "All data processed in memory and deleted after recommendations generated"
        };
      default:
        return null;
    }
  };

  const stepInfo = getStepDataInfo(currentStep);
  if (!stepInfo) return null;

  return (
    <Card className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Data Processing Transparency</span>
        </div>
        <span className="text-xs text-gray-500">
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{stepInfo.title}</h4>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Data Collected:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {stepInfo.dataCollected.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">How We Process It:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {stepInfo.processing.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <h5 className="font-medium text-blue-900 mb-1">Legal Basis:</h5>
              <p className="text-sm text-blue-800">{stepInfo.legalBasis}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <h5 className="font-medium text-green-900 mb-1">Data Retention:</h5>
              <p className="text-sm text-green-800">{stepInfo.retention}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h5 className="font-medium text-yellow-900">Your Rights:</h5>
                  <p className="text-sm text-yellow-800">
                    You can withdraw consent, request data deletion, or access your data at any time.
                    <a href="/data-rights" className="underline ml-1">Learn more about your rights</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
