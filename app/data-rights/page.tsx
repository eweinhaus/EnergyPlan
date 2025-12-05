'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { performCompleteDataDeletion, requestDataDeletion } from '@/lib/dataDeletion';

export default function DataRights() {
  const [selectedRight, setSelectedRight] = useState<string>('');
  const [email, setEmail] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deletionResult, setDeletionResult] = useState<any>(null);

  const rights = [
    {
      id: 'access',
      title: 'Right to Access (Article 15)',
      description: 'Request access to your personal data that we have processed.',
      details: 'Since we do not store personal data permanently, we can confirm what types of data were processed during your session and provide information about our data processing practices.'
    },
    {
      id: 'rectification',
      title: 'Right to Rectification (Article 16)',
      description: 'Request correction of inaccurate personal data or completion of incomplete data.',
      details: 'If you provided incorrect information during your session, you can resubmit your data with corrections. We do not maintain persistent data storage.'
    },
    {
      id: 'erasure',
      title: 'Right to Erasure (Article 17)',
      description: 'Request deletion of your personal data.',
      details: 'Your data is automatically deleted after processing. If you have concerns about any residual data, please contact us for confirmation.'
    },
    {
      id: 'portability',
      title: 'Right to Data Portability (Article 20)',
      description: 'Request your personal data in a structured, commonly used format.',
      details: 'Since we do not store personal data permanently, we can provide you with information about the types of data we process and how we handle it.'
    },
    {
      id: 'restriction',
      title: 'Right to Restriction (Article 18)',
      description: 'Request limitation of processing of your personal data.',
      details: 'You can withdraw consent or limit data processing by not using our service or by adjusting your privacy preferences.'
    },
    {
      id: 'objection',
      title: 'Right to Object (Article 21)',
      description: 'Object to processing of your personal data.',
      details: 'You can withdraw consent for data processing at any time. Our service requires consent to function.'
    },
    {
      id: 'withdraw-consent',
      title: 'Withdraw Consent (Article 7)',
      description: 'Withdraw previously given consent for data processing.',
      details: 'You can withdraw your consent at any time. This will prevent you from using our service until you provide consent again.'
    },
    {
      id: 'data-deletion',
      title: 'Data Deletion & Right to Erasure (Article 17)',
      description: 'Request complete deletion of your personal data from our systems.',
      details: 'Since we do not store personal data permanently, this will clear any temporary data and confirm that no personal data is retained. You can also perform immediate local data deletion.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedRight === 'data-deletion') {
        // Perform immediate local data deletion
        const result = await performCompleteDataDeletion();
        setDeletionResult(result);

        // Then send the deletion request
        const response = await requestDataDeletion(email, requestDetails);

        if (!response.success) {
          throw new Error(response.message);
        }
      } else {
        // Handle other rights requests
        const response = await fetch('/api/data-rights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            right: selectedRight,
            email,
            details: requestDetails,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch (error) {
      setIsSubmitting(false);
      alert(`Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted</h1>
              <p className="text-lg text-gray-600 mb-6">
                {selectedRight === 'data-deletion'
                  ? 'Your data deletion request has been processed successfully. All local data has been cleared.'
                  : 'Your data rights request has been submitted successfully. We will respond within 30 days.'
                }
              </p>

              {selectedRight === 'data-deletion' && deletionResult && (
                <div className="bg-green-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Data Deletion Results</h3>
                  <div className="space-y-3">
                    <div>
                      <strong className="text-green-800">Items Deleted:</strong>
                      <ul className="list-disc list-inside mt-1 text-green-700">
                        {deletionResult.deletedItems.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    {deletionResult.errors.length > 0 && (
                      <div>
                        <strong className="text-yellow-800">Warnings:</strong>
                        <ul className="list-disc list-inside mt-1 text-yellow-700">
                          {deletionResult.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm text-green-600">
                      Timestamp: {new Date(deletionResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next?</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>You will receive a confirmation email at <strong>{email}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Our Data Protection Officer will review your request</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>We will respond within 30 days (or 72 hours for urgent requests)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>You may be asked for additional information to verify your identity</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
                Return to Home
              </Link>
              <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">
                View Privacy Policy
              </Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-6">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Data Subject Rights</h1>
          <p className="text-lg text-gray-600 mb-8">
            Under GDPR, you have several rights regarding your personal data. Select the right you wish to exercise below.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {rights.map((right) => (
              <div
                key={right.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRight === right.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRight(right.id)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{right.description}</p>
                {selectedRight === right.id && (
                  <p className="text-sm text-gray-700 bg-white p-2 rounded border">{right.details}</p>
                )}
              </div>
            ))}
          </div>

          {selectedRight && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Submit Your Request
                </h2>
                <p className="text-gray-700 mb-4">
                  Selected right: <strong>{rights.find(r => r.id === selectedRight)?.title}</strong>
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We need your email to respond to your request and verify your identity.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      id="details"
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Please provide any additional information that might help us process your request..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Our service does not permanently store personal data</li>
                  <li>• Data is processed in memory and automatically deleted after use</li>
                  <li>• We may need to verify your identity before processing certain requests</li>
                  <li>• Response time: 30 days (72 hours for urgent data protection matters)</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!email || isSubmitting}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedRight('');
                    setEmail('');
                    setRequestDetails('');
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about your data rights or need assistance, please contact our Data Protection Officer:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@energyplan.com<br />
                <strong>Response Time:</strong> Within 30 days<br />
                <strong>Emergency Contact:</strong> For urgent data protection matters, we respond within 72 hours
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">
              View Full Privacy Policy
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
