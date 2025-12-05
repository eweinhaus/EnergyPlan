'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Step1WelcomeProps {
  onNext: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Perfect Energy Plan
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Upload your Green Button XML usage data and get personalized recommendations
          for the best fixed-rate energy plans in Texas.
        </p>

        <div className="bg-primary-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works:</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              <span>Enter your current plan details</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              <span>Upload your Green Button XML file</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              <span>Set your preferences (cost vs renewable energy)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              <span>Get your top 3 personalized recommendations</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={onNext}
          size="lg"
          className="w-full sm:w-auto"
        >
          Get Started
        </Button>
      </div>
    </Card>
  );
};

