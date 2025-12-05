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
    const element = React.createElement(RecommendationPDF, {
      recommendations,
      formData,
      options,
    }) as any; // Type assertion for react-pdf compatibility
    const blob = await pdf(element).toBlob();

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
 * Main PDF generation function
 * Uses react-pdf for PDF generation (works in both client and server environments)
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
  // Use react-pdf for PDF generation
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
