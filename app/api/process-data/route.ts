import { NextRequest, NextResponse } from 'next/server';
import { parseGreenButtonXML } from '@/lib/xmlParser';
import { validateUsageData, calculateDataQualityScore, getConfidenceLevel } from '@/lib/dataValidation';
import { generateRecommendations } from '@/lib/recommendationEngine';
import { getPlans } from '@/lib/apiClients';
import { CurrentPlanData, UserPreferences, ParsedUsageData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form data
    const currentPlanJson = formData.get('currentPlan') as string;
    const preferencesJson = formData.get('preferences') as string;
    const xmlFile = formData.get('xmlFile') as File;

    if (!currentPlanJson || !preferencesJson || !xmlFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const currentPlan: CurrentPlanData = JSON.parse(currentPlanJson);
    const preferences: UserPreferences = JSON.parse(preferencesJson);

    // Validate preferences sum to 100
    if (Math.abs(preferences.costPriority + preferences.renewablePriority - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Cost and renewable priorities must sum to 100' },
        { status: 400 }
      );
    }

    // Read and parse XML file
    const xmlContent = await xmlFile.text();
    let usageData: ParsedUsageData;
    
    try {
      usageData = parseGreenButtonXML(xmlContent);
    } catch (error) {
      return NextResponse.json(
        { error: `XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Validate usage data
    const validation = validateUsageData(usageData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Data validation failed: ${validation.errors.join(', ')}` },
        { status: 400 }
      );
    }

    // Get API keys from environment
    const utilityApiKey = process.env.UTILITY_API_KEY || '';
    const arcadiaApiKey = process.env.ARCADIA_API_KEY || utilityApiKey; // Fallback to same key for MVP

    // Get available plans
    let plans;
    try {
      plans = await getPlans(arcadiaApiKey);
    } catch (error) {
      console.error('Error fetching plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch available plans. Please try again later.' },
        { status: 500 }
      );
    }

    if (plans.length === 0) {
      return NextResponse.json(
        { error: 'No plans available at this time' },
        { status: 500 }
      );
    }

    // Generate recommendations
    let recommendations;
    try {
      recommendations = await generateRecommendations(
        currentPlan,
        usageData,
        preferences,
        plans,
        utilityApiKey
      );

      // Update confidence based on data quality
      const qualityScore = calculateDataQualityScore(usageData);
      const confidence = getConfidenceLevel(qualityScore);
      recommendations = recommendations.map((rec) => ({
        ...rec,
        confidence,
      }));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return NextResponse.json(
        { error: 'Failed to generate recommendations. Please try again.' },
        { status: 500 }
      );
    }

    // Return success with recommendations
    return NextResponse.json({
      success: true,
      recommendations,
      dataQuality: usageData.dataQuality,
      qualityScore: calculateDataQualityScore(usageData),
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Error processing data:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

