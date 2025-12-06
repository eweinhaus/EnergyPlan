'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export const DataManagement: React.FC = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportData = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to export data.' });
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(`/api/data-export?userId=${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // The API returns a downloadable file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energy-plan-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Your data has been exported successfully.' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletionCode = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to request account deletion.' });
      return;
    }

    try {
      const response = await fetch(`/api/data-deletion?userId=${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to generate confirmation code');
      }

      const data = await response.json();
      setConfirmationCode(data.confirmationCode);
      setShowDeleteConfirm(true);
      setMessage({
        type: 'success',
        text: 'Confirmation code generated. Please save this code and use it below to confirm deletion.'
      });
    } catch (error) {
      console.error('Deletion code request error:', error);
      setMessage({ type: 'error', text: 'Failed to generate confirmation code. Please try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirmationCode) {
      setMessage({ type: 'error', text: 'Missing user information or confirmation code.' });
      return;
    }

    // Final confirmation
    if (!confirm(
      'WARNING: This action cannot be undone. All your data including saved recommendations, usage data, and account information will be permanently deleted. Are you absolutely sure?'
    )) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          confirmationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      const result = await response.json();
      setMessage({
        type: 'success',
        text: 'Your account has been permanently deleted. You will be redirected shortly.'
      });

      // Redirect after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (error) {
      console.error('Deletion error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete account. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </Alert>
      )}

      {/* Data Export */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
            <p className="text-gray-600 text-sm">
              Download a copy of all your personal data including recommendations, usage data, and account information in JSON format.
            </p>
          </div>

          <Button
            onClick={handleExportData}
            disabled={exporting || !user}
            variant="outline"
          >
            {exporting ? 'Exporting...' : 'Export Data (JSON)'}
          </Button>
        </div>
      </Card>

      {/* Account Deletion */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Your Account</h3>
            <p className="text-gray-600 text-sm mb-2">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-red-700 text-sm mt-1 ml-4 list-disc">
                <li>Your account and profile information</li>
                <li>All saved recommendations and analysis</li>
                <li>Usage data and processing history</li>
                <li>All audit logs and activity records</li>
              </ul>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              onClick={handleRequestDeletionCode}
              disabled={!user}
              variant="outline"
              color="red"
            >
              Request Account Deletion
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Confirmation Required</h4>
                <p className="text-yellow-800 text-sm mb-3">
                  To confirm account deletion, enter the following confirmation code:
                </p>
                <div className="bg-gray-100 p-2 rounded font-mono text-sm mb-3">
                  {confirmationCode}
                </div>
                <p className="text-yellow-800 text-sm">
                  Save this code. You will need to enter it exactly as shown to proceed with deletion.
                </p>
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Enter confirmation code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting || confirmationCode.length === 0}
                  color="red"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* GDPR Information */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your GDPR Rights</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Right to Access:</strong> You can request a copy of all personal data we hold about you using the export feature above.
            </p>
            <p>
              <strong>Right to Erasure:</strong> You can request complete deletion of your account and all associated data using the account deletion feature.
            </p>
            <p>
              <strong>Right to Rectification:</strong> You can update your personal information and preferences in your account settings.
            </p>
            <p>
              <strong>Right to Data Portability:</strong> Your data is exported in machine-readable JSON format for easy transfer to other services.
            </p>
          </div>

          <div className="pt-4 border-t text-xs text-gray-500">
            <p>
              For additional assistance with your GDPR rights or privacy concerns, contact us at{' '}
              <a href="mailto:privacy@arbor.energy" className="text-blue-600 hover:underline">
                privacy@arbor.energy
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};


