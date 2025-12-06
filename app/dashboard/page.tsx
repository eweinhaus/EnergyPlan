'use client';

// Force dynamic rendering to avoid SSR issues with Firebase
export const runtime = 'edge';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getUserRecommendations, deleteRecommendation } from '@/lib/firestore';
import { SavedRecommendation } from '@/lib/types';
import { ConsentManager } from '@/components/privacy/ConsentManager';
import { DataManagement } from '@/components/privacy/DataManagement';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<SavedRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'privacy' | 'settings'>('recommendations');

  const loadRecommendations = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingRecommendations(true);
      const userRecommendations = await getUserRecommendations(user.uid);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadRecommendations();
    }
  }, [user, loading, router, loadRecommendations]);

  const handleDeleteRecommendation = async (recommendationId: string) => {
    if (!confirm('Are you sure you want to delete this recommendation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(recommendationId);
      await deleteRecommendation(recommendationId);
      setRecommendations(recommendations.filter(rec => rec.id !== recommendationId));
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      alert('Failed to delete recommendation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user.displayName || user.email}! Manage your saved energy plan recommendations.
              </p>
            </div>
            <Link href="/">
              <Button>New Recommendation</Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Privacy & Data
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'recommendations' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
                  <div className="text-gray-600">Saved Recommendations</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${recommendations.reduce((total, rec) =>
                      total + rec.recommendations.reduce((sum, r) => sum + r.plan.savings, 0), 0
                    ).toFixed(0)}
                  </div>
                  <div className="text-gray-600">Total Potential Savings</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {recommendations.length > 0 ?
                      Math.round(recommendations.reduce((total, rec) =>
                        total + rec.recommendations[0].plan.savings, 0
                      ) / recommendations.length) : 0}
                  </div>
                  <div className="text-gray-600">Avg Monthly Savings</div>
                </div>
              </Card>
            </div>

            {/* Recommendations List */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Saved Recommendations</h2>

              {loadingRecommendations ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading your recommendations...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved recommendations yet</h3>
                  <p className="text-gray-600 mb-6">Get personalized energy plan recommendations and save them here for easy access.</p>
                  <Link href="/">
                    <Button>Get Your First Recommendation</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {recommendation.formData.currentPlan.supplier} Plan Comparison
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {recommendation.recommendations.length} recommendations
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Current Plan</p>
                              <p className="font-medium">{recommendation.formData.currentPlan.supplier}</p>
                              <p className="text-sm text-gray-500">{recommendation.formData.currentPlan.rate}¢/kWh</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Top Recommendation</p>
                              <p className="font-medium">{recommendation.recommendations[0]?.plan.name}</p>
                               <p className="text-sm text-green-600">Save ${recommendation.recommendations[0]?.plan.savings.toFixed(0)}/year</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date Saved</p>
                              <p className="font-medium">{formatDate(recommendation.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement view recommendation details
                              alert('View details coming soon!');
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement PDF export for individual recommendations
                              alert('PDF export coming soon!');
                            }}
                          >
                            Export PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            color="red"
                            disabled={deletingId === recommendation.id}
                            onClick={() => handleDeleteRecommendation(recommendation.id)}
                          >
                            {deletingId === recommendation.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {activeTab === 'privacy' && (
          <DataManagement />
        )}

        {activeTab === 'settings' && (
          <ConsentManager />
        )}
      </div>
    </div>
  );
}
