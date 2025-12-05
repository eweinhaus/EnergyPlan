/* eslint-disable react/no-unescaped-entities */
'use client';

// Force dynamic rendering to avoid SSR issues
export const runtime = 'edge';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-6">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: December 2025</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to AI Energy Plan Recommendation Agent (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
              <p className="text-gray-700">
                This privacy policy applies to the use of our energy plan recommendation service and website. By using our service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Controller</h2>
              <p className="text-gray-700">
                For the purposes of the General Data Protection Regulation (GDPR) and other applicable data protection laws, the data controller is:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>AI Energy Plan Recommendation Agent</strong><br />
                  Email: privacy@energyplan.com<br />
                  Data Protection Officer: privacy@energyplan.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information We Collect</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Personal Data</h3>
              <p className="text-gray-700 mb-4">
                We collect the following personal data to provide our energy plan recommendation service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Current Plan Information:</strong> Your current energy supplier name, rate (in cents per kWh), and optional contract details</li>
                <li><strong>Usage Data:</strong> Energy consumption data from your Green Button XML file, including hourly usage readings and monthly totals</li>
                <li><strong>Preferences:</strong> Your preferences for cost savings versus renewable energy (expressed as percentages)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Technical Data</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain technical information when you use our service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>IP address</li>
                <li>Time zone setting</li>
                <li>Device information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Data Processing Location</h3>
              <p className="text-gray-700">
                All data processing occurs in memory on our servers and is not stored permanently. Your data is processed temporarily during your session and deleted immediately after processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Purpose of Processing</h3>
              <p className="text-gray-700 mb-4">
                We use your information solely for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>To generate personalized energy plan recommendations based on your usage patterns</li>
                <li>To calculate cost savings estimates for different energy plans</li>
                <li>To provide accurate projections based on your actual energy consumption data</li>
                <li>To ensure the security and proper functioning of our service</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Legal Basis for Processing</h3>
              <p className="text-gray-700 mb-4">
                Under GDPR, our legal basis for processing your personal data is:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Consent (Article 6(1)(a)):</strong> You provide explicit consent to process your energy usage data for the purpose of generating recommendations</li>
                <li><strong>Legitimate Interest (Article 6(1)(f)):</strong> For technical data processing necessary to provide the service and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Third Parties</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Third-Party Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We use the following third-party services to provide our recommendation engine:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>UtilityAPI:</strong> Provides Texas energy supplier and utility data</li>
                <li><strong>Arcadia API:</strong> Supplies current energy plan catalog information</li>
                <li><strong>Render:</strong> Hosting platform for our web application</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Data Sharing</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal data to third parties for marketing purposes. Your energy usage data is never shared with energy suppliers or any other third parties.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-2">International Data Transfers</h3>
              <p className="text-gray-700">
                All data processing occurs within the United States. We do not transfer personal data outside the EU/EEA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention and Deletion</h2>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Data Retention Policy</h3>
              <p className="text-gray-700 mb-4">
                Our data retention practices are designed to minimize data storage:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Session Data:</strong> Form data is stored temporarily in your browser&apos;s localStorage during your session and is automatically deleted when you close your browser</li>
                <li><strong>Processing Data:</strong> XML files and usage data are processed in server memory and deleted immediately after recommendations are generated</li>
                <li><strong>Server Logs:</strong> Technical logs are retained for 30 days for security and debugging purposes</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-2">Data Deletion</h3>
              <p className="text-gray-700">
                Your data is automatically deleted in the following scenarios:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>When you close your browser (localStorage data)</li>
                <li>Immediately after processing your request (server-side data)</li>
                <li>Upon request (see Your Rights section below)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Data Protection Rights</h2>

              <p className="text-gray-700 mb-4">
                Under GDPR, you have the following rights regarding your personal data:
              </p>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Access (Article 15)</h4>
                  <p className="text-gray-700">You have the right to request access to your personal data. Since we don&apos;t store your data permanently, we can confirm what data was processed during your session.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Rectification (Article 16)</h4>
                  <p className="text-gray-700">You have the right to have inaccurate personal data rectified or incomplete personal data completed. Since data processing happens in real-time, you can simply resubmit your information.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Erasure (Article 17)</h4>
                  <p className="text-gray-700">You have the right to request erasure of your personal data. Since we don't retain your data after processing, your data is automatically deleted.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Data Portability (Article 20)</h4>
                  <p className="text-gray-700">You have the right to receive your personal data in a structured, commonly used format. Since we don't store your data, we can provide information about what was processed.</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Right to Withdraw Consent (Article 7)</h4>
                  <p className="text-gray-700">You have the right to withdraw your consent at any time. You can do this by not proceeding with the service or by contacting us.</p>
                </div>
              </div>

              <p className="text-gray-700 mt-4">
                To exercise any of these rights, please contact us at: <a href="mailto:privacy@energyplan.com" className="text-primary-600 hover:text-primary-700">privacy@energyplan.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>

              <p className="text-gray-700 mb-4">
                Our service uses minimal tracking:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>localStorage:</strong> Used temporarily to save your form progress during your session</li>
                <li><strong>No Third-Party Cookies:</strong> We do not use third-party cookies or tracking pixels</li>
                <li><strong>No Analytics:</strong> We do not use Google Analytics or similar tracking services</li>
              </ul>

              <p className="text-gray-700">
                Your localStorage data is automatically cleared when you close your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Security</h2>

              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>TLS Encryption:</strong> All data transmission is encrypted using HTTPS</li>
                <li><strong>In-Memory Processing:</strong> Data is processed in server memory and not written to disk</li>
                <li><strong>No Persistent Storage:</strong> Data is not stored in databases or files</li>
                <li><strong>Automatic Deletion:</strong> Data is automatically deleted after processing</li>
                <li><strong>Access Controls:</strong> Server access is restricted and monitored</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data Breach Notification</h2>

              <p className="text-gray-700">
                In the event of a data breach that poses a risk to individuals' rights and freedoms, we will notify the relevant supervisory authority within 72 hours and affected individuals without undue delay. Since we don't store personal data permanently, the risk of data breaches is minimal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>

              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. Changes will be effective immediately upon posting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>

              <p className="text-gray-700 mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@energyplan.com<br />
                  <strong>Data Protection Officer:</strong> privacy@energyplan.com<br />
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 30 days
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Supervisory Authority</h2>

              <p className="text-gray-700">
                If you believe our processing of your personal data violates GDPR, you have the right to lodge a complaint with a supervisory authority. In the United States, you can contact relevant data protection authorities or the Federal Trade Commission.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
