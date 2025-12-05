'use client';

import React, { useState, useEffect } from 'react';

// Force dynamic rendering for Firebase Functions
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConsentBanner, ConsentState } from '@/components/ui/ConsentBanner';
import { DataProcessingTransparency } from '@/components/ui/DataProcessingTransparency';
import { UserStatus } from '@/components/auth/UserStatus';
import { Step1Welcome } from '@/components/form/Step1Welcome';
import { Step2CurrentPlan } from '@/components/form/Step2CurrentPlan';
import { Step3FileUpload } from '@/components/form/Step3FileUpload';
import { Step4Preferences } from '@/components/form/Step4Preferences';
import { Step5Review } from '@/components/form/Step5Review';
import { RecommendationList } from '@/components/recommendations/RecommendationList';
import { EnergyPlanFormData, Recommendation } from '@/lib/types';
import { setupUnloadDataDeletion } from '@/lib/dataDeletion';
import { useAuth } from '@/lib/auth';
import { saveRecommendation, createUserProfile } from '@/lib/firestore';

const TOTAL_STEPS = 5;

export default function Home() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [dataQuality, setDataQuality] = useState<'good' | 'fair' | 'poor' | undefined>();
  const [qualityScore, setQualityScore] = useState<number | undefined>();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [savingToAccount, setSavingToAccount] = useState(false);
  const [formData, setFormData] = useState<EnergyPlanFormData>({
    currentPlan: {
      supplier: '',
      rate: 0,
    },
    preferences: {
      costPriority: 50,
      renewablePriority: 50,
    },
  });

  // Clear localStorage on mount to ensure fresh start and setup data deletion
  useEffect(() => {
    localStorage.removeItem('energyPlanFormData');
    setupUnloadDataDeletion();
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (currentStep > 1) {
      const toSave = {
        ...formData,
        xmlFile: undefined, // Don't save File object
        currentStep,
      };
      localStorage.setItem('energyPlanFormData', JSON.stringify(toSave));
    }
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleCurrentPlanChange = (plan: EnergyPlanFormData['currentPlan']) => {
    setFormData({ ...formData, currentPlan: plan });
  };

  const handleFileSelect = (file: File) => {
    setFormData({ ...formData, xmlFile: file });
  };

  const handlePreferencesChange = (preferences: EnergyPlanFormData['preferences']) => {
    setFormData({ ...formData, preferences });
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Create FormData for API submission
      const submitData = new FormData();
      submitData.append('currentPlan', JSON.stringify(formData.currentPlan));
      submitData.append('preferences', JSON.stringify(formData.preferences));
      if (formData.xmlFile) {
        submitData.append('xmlFile', formData.xmlFile);
      }

      const response = await fetch('/api/process-data', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process data');
      }

      const result = await response.json();

      if (result.success && result.recommendations) {
        setRecommendations(result.recommendations);
        setDataQuality(result.dataQuality);
        setQualityScore(result.qualityScore);
        setWarnings(result.warnings || []);

        // Save to Firestore if user is authenticated
        if (user) {
          setSavingToAccount(true);
          try {
            // Create user profile if it doesn't exist
            await createUserProfile(user.uid, user.email!, user.displayName || undefined);

            // Save the recommendation
            await saveRecommendation(
              user.uid,
              formData,
              result.recommendations
            );
          } catch (saveError) {
            console.error('Error saving to account:', saveError);
            // Don't block the UI flow for save errors
          } finally {
            setSavingToAccount(false);
          }
        }

        setCurrentStep(6); // Move to results view
      } else {
        throw new Error('Invalid response from server');
      }

      // Clear localStorage after successful submission
      localStorage.removeItem('energyPlanFormData');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setRecommendations(null);
    setDataQuality(undefined);
    setQualityScore(undefined);
    setWarnings([]);
    setError(null);
    setCurrentStep(1);
    setFormData({
      currentPlan: {
        supplier: '',
        rate: 0,
      },
      preferences: {
        costPriority: 50,
        renewablePriority: 50,
      },
    });
    localStorage.removeItem('energyPlanFormData');
  };

  const handleConsentChange = (newConsent: ConsentState) => {
    setConsent(newConsent);
  };

  const renderStep = () => {
    // Show results if available
    if (currentStep === 6 && recommendations) {
      return (
        <div className="space-y-6">
          <RecommendationList
            recommendations={recommendations}
            dataQuality={dataQuality}
            qualityScore={qualityScore}
            savingToAccount={savingToAccount}
            formData={formData}
          />
          <div className="text-center pt-4">
            <button
              onClick={handleStartOver}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }

    // Show error if present
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setError(null);
                setCurrentStep(5);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
            <button
              onClick={handleStartOver}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Step1Welcome
              onNext={handleNext}
            />
            <DataProcessingTransparency currentStep={currentStep} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Step2CurrentPlan
              onNext={handleNext}
              onBack={handleBack}
              currentPlan={formData.currentPlan}
              onCurrentPlanChange={handleCurrentPlanChange}
            />
            <DataProcessingTransparency currentStep={currentStep} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Step3FileUpload
              onNext={handleNext}
              onBack={handleBack}
              onFileSelect={handleFileSelect}
              selectedFile={formData.xmlFile}
            />
            <DataProcessingTransparency currentStep={currentStep} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <Step4Preferences
              onNext={handleNext}
              onBack={handleBack}
              preferences={formData.preferences}
              onPreferencesChange={handlePreferencesChange}
            />
            <DataProcessingTransparency currentStep={currentStep} />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <Step5Review
              onBack={handleBack}
              formData={formData}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
            />
            <DataProcessingTransparency currentStep={currentStep} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with User Status */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Energy Plan Recommendation Agent
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered energy plan recommendations for Texas residential customers
              </p>
            </div>
            <div className="ml-4">
              <UserStatus />
            </div>
          </div>

          {currentStep > 1 && currentStep <= TOTAL_STEPS && (
            <div className="mb-8">
              <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                © 2025 AI Energy Plan Recommendation Agent. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy-policy" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/data-rights" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Data Rights
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
      <ConsentBanner onConsent={handleConsentChange} />
    </>
  );
}

// Deployment trigger
