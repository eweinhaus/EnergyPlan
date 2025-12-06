import { NextRequest, NextResponse } from 'next/server';
import { parseGreenButtonXML } from '@/lib/xmlParser';
import { validateUsageData, calculateDataQualityScore } from '@/lib/dataValidation';
import { generateRecommendations } from '@/lib/recommendationEngine';
import { getPlans, getSuppliers } from '@/lib/apiClients';
import { CurrentPlanData, UserPreferences, ParsedUsageData, ContractTerms } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form data
    const currentPlanJson = formData.get('currentPlan') as string;
    const preferencesJson = formData.get('preferences') as string;
    const xmlFile = formData.get('xmlFile') as File;
    const earlyTerminationFeeJson = formData.get('earlyTerminationFee') as string | null;
    const contractEndDateJson = formData.get('contractEndDate') as string | null;

    if (!currentPlanJson || !preferencesJson || !xmlFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const currentPlan: CurrentPlanData = JSON.parse(currentPlanJson);
    const preferences: UserPreferences = JSON.parse(preferencesJson);

    // Parse contract terms (optional)
    let contractTerms: ContractTerms | undefined;
    if (earlyTerminationFeeJson) {
      const earlyTerminationFee = parseInt(earlyTerminationFeeJson);
      if (!isNaN(earlyTerminationFee) && earlyTerminationFee >= 0 && earlyTerminationFee <= 2000) {
        contractTerms = {
          earlyTerminationFee,
          contractEndDate: contractEndDateJson || undefined,
        };
      }
    }

    // Ensure cost priority is always 100% (default behavior)
    preferences.costPriority = 100;
    preferences.renewablePriority = 0;

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
    // EIA API key is used for energy statistics
    const eiaApiKey = process.env.EIA_API_KEY || '';

    // Genability API key is preferred for supplier/plan data
    // Fallback to UtilityAPI key, then EIA key, then empty string
    const genabilityApiKey = process.env.GENABILITY_API_KEY || '';
    const utilityApiKey = process.env.UTILITY_API_KEY || '';
    const apiKey = genabilityApiKey || utilityApiKey || eiaApiKey;

    // Get available plans (uses official Texas data)
    const plans = await getPlans(apiKey);

    if (plans.length === 0) {
      return NextResponse.json(
        { error: 'No plans available at this time' },
        { status: 500 }
      );
    }

    // Get suppliers for rating information
    const suppliers = await getSuppliers(apiKey);

    // Generate recommendations
    let recommendations;
    try {
      recommendations = await generateRecommendations(
        currentPlan,
        usageData,
        preferences,
        plans,
        eiaApiKey,
        contractTerms
      );
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return NextResponse.json(
        { error: 'Failed to generate recommendations. Please try again.' },
        { status: 500 }
      );
    }

    // Return success with recommendations and suppliers
    return NextResponse.json({
      success: true,
      recommendations,
      suppliers: suppliers.map(s => ({ id: s.id, rating: s.rating })),
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

