import React from 'react';
import { PDFOptions, PDFGenerationResult, Recommendation, EnergyPlanFormData } from './types';

/**
 * Generate PDF report using react-pdf (client-side)
 */
export async function generatePDFWithReactPDF(
  recommendations: Recommendation[],
  formData: EnergyPlanFormData,
  options: PDFOptions = {
    includeCharts: true,
    includeBranding: true,
    format: 'A4',
    orientation: 'portrait'
  }
): Promise<PDFGenerationResult> {
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const { RecommendationPDF } = await import('@/components/pdf/RecommendationPDF');

    const startTime = Date.now();

    // Create PDF blob
    const blob = await pdf(
      <RecommendationPDF
        recommendations={recommendations}
        formData={formData}
        options={options}
      />
    ).toBlob();

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    // Create download URL
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      url,
      generationTime,
    };
  } catch (error) {
    console.error('Error generating PDF with react-pdf:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      generationTime: 0,
    };
  }
}

/**
 * Generate PDF report using puppeteer (server-side fallback)
 * Note: This function should only be called from server-side code
 */
export async function generatePDFWithPuppeteer(
  recommendations: Recommendation[],
  formData: EnergyPlanFormData,
  options: PDFOptions = {
    includeCharts: true,
    includeBranding: true,
    format: 'A4',
    orientation: 'portrait'
  }
): Promise<PDFGenerationResult> {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    return {
      success: false,
      error: 'Puppeteer PDF generation is not available in browser environment',
      generationTime: 0,
    };
  }

  try {
    // Dynamic import to avoid bundling puppeteer in client-side code
    const { default: puppeteer } = await import('puppeteer');
    const startTime = Date.now();

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Generate HTML content
    const htmlContent = generatePDFHTML(recommendations, formData, options);

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '30px',
        right: '30px',
        bottom: '30px',
        left: '30px',
      },
    });

    await browser.close();

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    // Create blob URL
    const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      url,
      generationTime,
    };
  } catch (error) {
    console.error('Error generating PDF with puppeteer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      generationTime: 0,
    };
  }
}

/**
 * Main PDF generation function with fallback
 */
export async function generatePDFReport(
  recommendations: Recommendation[],
  formData: EnergyPlanFormData,
  options: PDFOptions = {
    includeCharts: true,
    includeBranding: true,
    format: 'A4',
    orientation: 'portrait'
  }
): Promise<PDFGenerationResult> {
  // Try react-pdf first (client-side)
  let result = await generatePDFWithReactPDF(recommendations, formData, options);

  // Fallback to puppeteer if react-pdf fails (only on server-side)
  if (!result.success && typeof window === 'undefined') {
    console.log('React-pdf failed, trying puppeteer fallback...');
    result = await generatePDFWithPuppeteer(recommendations, formData, options);
  }

  return result;
}

/**
 * Generate HTML content for puppeteer PDF generation
 */
function generatePDFHTML(
  recommendations: Recommendation[],
  formData: EnergyPlanFormData,
  options: PDFOptions
): string {
  const styles = `
    <style>
      body {
        font-family: 'Helvetica', sans-serif;
        margin: 0;
        padding: 30px;
        color: #333;
        line-height: 1.6;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: #2563eb;
        margin-bottom: 10px;
      }
      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .subtitle {
        color: #666;
        font-size: 14px;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #2563eb;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 5px;
      }
      .recommendation {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background: #f9fafb;
      }
      .rec-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .rec-title {
        font-size: 16px;
        font-weight: bold;
      }
      .rec-badge {
        background: #dbeafe;
        color: #1e40af;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
      }
      .rec-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 10px;
      }
      .metric {
        text-align: center;
      }
      .metric-value {
        font-size: 18px;
        font-weight: bold;
        color: #2563eb;
      }
      .metric-label {
        font-size: 12px;
        color: #666;
      }
      .explanation {
        font-size: 14px;
        color: #374151;
        font-style: italic;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
      }
      .table th, .table td {
        border: 1px solid #e5e7eb;
        padding: 8px;
        text-align: left;
      }
      .table th {
        background: #f3f4f6;
        font-weight: bold;
      }
    </style>
  `;

  const recommendationsHTML = recommendations.map((rec, index) => `
    <div class="recommendation">
      <div class="rec-header">
        <div class="rec-title">${rec.plan.name}</div>
        <div class="rec-badge">#${index + 1} Recommendation</div>
      </div>

      <div class="rec-metrics">
        <div class="metric">
          <div class="metric-value">$${rec.plan.annualCost.toFixed(2)}</div>
          <div class="metric-label">Annual Cost</div>
        </div>
        <div class="metric">
          <div class="metric-value ${rec.plan.savings >= 0 ? 'text-green-600' : 'text-red-600'}">
            ${rec.plan.savings >= 0 ? '+' : ''}$${rec.plan.savings.toFixed(2)}
          </div>
          <div class="metric-label">Yearly Savings</div>
        </div>
      </div>

      <div class="explanation">${rec.explanation}</div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Energy Plan Recommendations - ${new Date().toLocaleDateString()}</title>
      ${styles}
    </head>
    <body>
      <div class="header">
        <div class="logo">Arbor Energy</div>
        <div class="title">Personalized Energy Plan Recommendations</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
      </div>

      <div class="section">
        <div class="section-title">Your Current Plan</div>
        <table class="table">
          <tr>
            <th>Supplier</th>
            <th>Rate</th>
            <th>Contract</th>
          </tr>
          <tr>
            <td>${formData.currentPlan.supplier}</td>
            <td>${formData.currentPlan.rate}¢/kWh</td>
            <td>${formData.currentPlan.contractLength ? `${formData.currentPlan.contractLength} months` : 'Month-to-month'}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Your Preferences</div>
        <table class="table">
          <tr>
            <th>Cost Priority</th>
            <th>Renewable Priority</th>
          </tr>
          <tr>
            <td>${formData.preferences.costPriority}%</td>
            <td>${formData.preferences.renewablePriority}%</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Top Recommendations</div>
        ${recommendationsHTML}
      </div>

      <div class="footer">
        <p>This report was generated by the AI Energy Plan Recommendation Agent.</p>
        <p>Recommendations are based on your provided usage data and preferences.</p>
        <p>Actual costs may vary based on your specific usage patterns and market conditions.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Download PDF file
 */
export function downloadPDF(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `EnergyPlan-Recommendations-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
