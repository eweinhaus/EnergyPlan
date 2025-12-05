import React from 'react';
import { PDFOptions, PDFGenerationResult, Recommendation, EnergyPlanFormData } from './types';

/**
 * Generate PDF report using react-pdf (client-side only)
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
    const { pdf, Document, Page, Text, View } = await import('@react-pdf/renderer');

    const startTime = Date.now();

    // Create PDF blob with inline Document
    const blob = await pdf(
      React.createElement(Document, null,
        React.createElement(Page, { size: "A4" },
          React.createElement(View, null,
            React.createElement(Text, null, "Energy Plan Recommendations"),
            React.createElement(Text, null, `Generated on ${new Date().toLocaleDateString()}`),
            // Add basic recommendations content
            recommendations.map((rec, index) =>
              React.createElement(View, { key: index },
                React.createElement(Text, null, `${index + 1}. ${rec.plan.name}`),
                React.createElement(Text, null, `Savings: $${rec.plan.savings.toFixed(2)}`),
                React.createElement(Text, null, rec.explanation)
              )
            )
          )
        )
      )
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
 * Main PDF generation function (client-side only)
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
  // Only use react-pdf for client-side generation
  return await generatePDFWithReactPDF(recommendations, formData, options);
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
