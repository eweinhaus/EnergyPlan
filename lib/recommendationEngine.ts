import {
  Plan,
  PlanWithCosts,
  Recommendation,
  ParsedUsageData,
  CurrentPlanData,
  UserPreferences,
  RateStructure,
  MonthlyUsage,
} from './types';
import { getSuppliers } from './apiClients';

/**
 * Calculate annual cost for a plan based on usage data and rate structure
 */
export function calculateAnnualCost(
  plan: Plan,
  usageData: ParsedUsageData
): number {
  let totalCost = 0;

  for (const month of usageData.monthlyTotals) {
    // Calculate energy cost based on rate structure
    const energyCost = calculateMonthlyEnergyCost(plan, month);

    // Fixed fees (delivery + admin)
    const fixedFees = plan.fees.delivery + plan.fees.admin;

    // Monthly total
    totalCost += energyCost + fixedFees;
  }

  return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate monthly energy cost based on plan's rate structure
 */
export function calculateMonthlyEnergyCost(plan: Plan, month: MonthlyUsage): number {
  if (!plan.rateStructure) {
    // Backward compatibility: use simple fixed rate
    return (plan.rate / 100) * month.totalKwh;
  }

  switch (plan.rateStructure.type) {
    case 'fixed':
      return calculateFixedRateCost(plan.rateStructure, month.totalKwh);

    case 'tiered':
      return calculateTieredRateCost(plan.rateStructure, month.totalKwh);

    case 'tou':
      // For TOU rates, we need hourly data. Fall back to average rate if not available
      return calculateFixedRateCost({ type: 'fixed', fixed: { ratePerKwh: plan.rate } }, month.totalKwh);

    case 'variable':
      return calculateVariableRateCost(plan.rateStructure, month, new Date());

    case 'seasonal':
      return calculateSeasonalRateCost(plan.rateStructure, month, new Date());

    default:
      // Fallback to fixed rate
      return (plan.rate / 100) * month.totalKwh;
  }
}

/**
 * Calculate cost for fixed rate structure
 */
function calculateFixedRateCost(rateStructure: RateStructure, totalKwh: number): number {
  if (!rateStructure.fixed) return 0;
  return (rateStructure.fixed.ratePerKwh / 100) * totalKwh;
}

/**
 * Calculate cost for tiered rate structure
 */
function calculateTieredRateCost(rateStructure: RateStructure, totalKwh: number): number {
  if (!rateStructure.tiered) return 0;

  let remainingKwh = totalKwh;
  let totalCost = 0;

  for (const tier of rateStructure.tiered.tiers) {
    if (remainingKwh <= 0) break;

    const tierUsage = Math.min(remainingKwh, tier.maxKwh - tier.minKwh);
    totalCost += tierUsage * (tier.ratePerKwh / 100); // Convert cents to dollars
    remainingKwh -= tierUsage;
  }

  return totalCost;
}

/**
 * Calculate cost for time-of-use rate structure
 * Note: This is a simplified version. Full TOU requires hourly usage data.
 */
function calculateTOURateCost(rateStructure: RateStructure, hourlyUsage: any[]): number {
  if (!rateStructure.tou || !hourlyUsage) return 0;

  let totalCost = 0;

  for (const hour of hourlyUsage) {
    const hourOfDay = hour.timestamp.getHours();
    const isPeak = isInPeakHours(hourOfDay, rateStructure.tou.peakHours);

    let rate = rateStructure.tou.offPeakRatePerKwh;
    if (isPeak) {
      rate = rateStructure.tou.peakHours.ratePerKwh;
    } else if (rateStructure.tou.superOffPeakRatePerKwh && isInSuperOffPeakHours(hourOfDay)) {
      rate = rateStructure.tou.superOffPeakRatePerKwh;
    }

    totalCost += hour.kwh * (rate / 100);
  }

  return totalCost;
}

/**
 * Calculate cost for variable rate structure
 */
function calculateVariableRateCost(rateStructure: RateStructure, month: MonthlyUsage, date: Date): number {
  if (!rateStructure.variable) return 0;

  let adjustedRate = rateStructure.variable.baseRatePerKwh;

  // Apply seasonal multiplier if defined
  if (rateStructure.variable.seasonalMultipliers) {
    const monthNum = date.getMonth();
    const isSummer = [5, 6, 7, 8].includes(monthNum); // June-September
    const multiplier = isSummer
      ? rateStructure.variable.seasonalMultipliers.summer
      : rateStructure.variable.seasonalMultipliers.winter;
    adjustedRate *= multiplier;
  }

  // Apply market adjustment (simplified - would need real ERCOT data)
  // For now, add a small random variation to simulate market fluctuations
  const marketAdjustment = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
  adjustedRate *= marketAdjustment;

  // Apply caps/floors
  adjustedRate = Math.max(
    rateStructure.variable.caps.min,
    Math.min(rateStructure.variable.caps.max, adjustedRate)
  );

  return (adjustedRate / 100) * month.totalKwh;
}

/**
 * Calculate cost for seasonal rate structure
 */
function calculateSeasonalRateCost(rateStructure: RateStructure, month: MonthlyUsage, date: Date): number {
  if (!rateStructure.seasonal) return 0;

  const monthNum = date.getMonth();
  const isSummer = rateStructure.seasonal.seasonalMonths.summer.includes(monthNum);
  const rate = isSummer
    ? rateStructure.seasonal.summerRatePerKwh
    : rateStructure.seasonal.winterRatePerKwh;

  return (rate / 100) * month.totalKwh;
}

/**
 * Check if hour is in peak hours
 */
function isInPeakHours(hourOfDay: number, peakHours: { start: string; end: string }): boolean {
  const [startHour] = peakHours.start.split(':').map(Number);
  const [endHour] = peakHours.end.split(':').map(Number);

  if (startHour <= endHour) {
    // Same day peak hours (e.g., 16:00-21:00)
    return hourOfDay >= startHour && hourOfDay < endHour;
  } else {
    // Overnight peak hours (unlikely but handled)
    return hourOfDay >= startHour || hourOfDay < endHour;
  }
}

/**
 * Check if hour is in super off-peak hours (typically overnight)
 */
function isInSuperOffPeakHours(hourOfDay: number): boolean {
  // Assuming super off-peak is 10 PM to 6 AM
  return hourOfDay >= 22 || hourOfDay < 6;
}

/**
 * Calculate savings compared to current plan
 */
export function calculateSavings(
  currentPlan: CurrentPlanData,
  recommendedPlan: Plan,
  usageData: ParsedUsageData
): number {
  // Create a mock plan object for current plan (assuming fixed rate)
  const currentPlanMock: Plan = {
    id: 'current',
    supplierId: 'current',
    supplierName: currentPlan.supplier,
    name: 'Current Plan',
    rate: currentPlan.rate,
    renewablePercentage: 0, // Assume current plan has no renewable component
    fees: {
      delivery: 3.5, // Default delivery fee
      admin: 5.0, // Default admin fee
    },
    // No rateStructure - defaults to fixed rate
  };

  const currentAnnualCost = calculateAnnualCost(currentPlanMock, usageData);
  const recommendedAnnualCost = calculateAnnualCost(recommendedPlan, usageData);

  return Math.round((currentAnnualCost - recommendedAnnualCost) * 100) / 100;
}

/**
 * Calculate score for a plan based on user preferences
 */
export function calculatePlanScore(
  plan: PlanWithCosts,
  preferences: UserPreferences,
  suppliers: { id: string; rating: number }[]
): number {
  const costWeight = preferences.costPriority / 100;
  const renewableWeight = preferences.renewablePriority / 100;

  // Normalize savings (cap at $500 for scoring)
  const normalizedSavings = Math.min(Math.max(plan.savings / 500, 0), 1);

  // Normalize renewable percentage
  const normalizedRenewable = plan.renewablePercentage / 100;

  // Get supplier rating (normalize to 0-1)
  const supplier = suppliers.find((s) => s.id === plan.supplierId);
  const supplierRating = supplier ? supplier.rating / 5 : 3 / 5; // Default to 3/5 if not found

  // Base weighted score (cost and renewable preferences)
  const costScore = costWeight * normalizedSavings;
  const renewableScore = renewableWeight * normalizedRenewable;

  // Additional preference scoring (with lower weights to not override main preferences)
  let additionalScore = 0;

  // Supplier reputation preference (0.05 weight)
  if (preferences.supplierReputation === 'high-only') {
    additionalScore += 0.05 * supplierRating;
  } else if (preferences.supplierReputation === 'any-ok') {
    additionalScore += 0.05 * 0.5; // Neutral boost
  }

  // Price stability preference (0.03 weight)
  const isFixedRate = !plan.rateStructure || plan.rateStructure.type === 'fixed';
  if (preferences.priceStability === 'fixed-only') {
    additionalScore += isFixedRate ? 0.03 : -0.03; // Boost fixed, penalize variable
  } else if (preferences.priceStability === 'variable-ok') {
    additionalScore += 0.03 * 0.5; // Neutral boost for flexibility
  }

  // Plan complexity preference (0.02 weight)
  const isSimplePlan = !plan.rateStructure || plan.rateStructure.type === 'fixed';
  if (preferences.planComplexity === 'simple-only') {
    additionalScore += isSimplePlan ? 0.02 : -0.02; // Boost simple, penalize complex
  } else if (preferences.planComplexity === 'complex-ok') {
    additionalScore += 0.02 * 0.5; // Neutral boost for sophistication
  }

  // Supplier diversity preference (handled separately in selection, not scoring)
  // This preference affects which plans get selected, not their individual scores

  // Final score combines base preferences with additional criteria
  return costScore + renewableScore + additionalScore;
}

/**
 * Select top 3 highest-scoring recommendations based on user preferences
 */
export function selectTopRecommendations(
  scoredPlans: PlanWithCosts[]
): PlanWithCosts[] {
  // Sort by score (highest first) and return top 3
  const sorted = [...scoredPlans].sort((a, b) => b.score - a.score);
  return sorted.slice(0, 3);
}

/**
 * Generate explanation for a recommendation
 */
export function generateExplanation(
  plan: PlanWithCosts,
  preferences: UserPreferences
): string {
  const parts: string[] = [];

  // Cost savings explanation
  if (plan.savings > 0) {
    parts.push(`Save $${plan.savings.toFixed(2)} per year`);
  } else if (plan.savings < 0) {
    parts.push(`Costs $${Math.abs(plan.savings).toFixed(2)} more per year`);
  } else {
    parts.push('Similar cost to your current plan');
  }

  // Rate structure explanation
  if (plan.rateStructure) {
    switch (plan.rateStructure.type) {
      case 'tiered':
        parts.push('Tiered pricing - lower rates for lower usage');
        break;
      case 'tou':
        parts.push('Time-of-use pricing - lower rates during off-peak hours');
        break;
      case 'variable':
        parts.push('Variable pricing - rates may change with market conditions');
        break;
      case 'seasonal':
        parts.push('Seasonal pricing - different rates for summer and winter');
        break;
    }
  }

  // Renewable energy explanation
  if (plan.renewablePercentage === 100) {
    parts.push('100% renewable energy');
  } else if (plan.renewablePercentage >= 50) {
    parts.push(`${plan.renewablePercentage}% renewable energy`);
  }

  // Preference-based explanation
  if (preferences.costPriority > preferences.renewablePriority) {
    parts.push('Great value for cost-conscious customers');
  } else if (preferences.renewablePriority > preferences.costPriority) {
    parts.push('Excellent choice for eco-conscious customers');
  } else {
    parts.push('Balanced option for your preferences');
  }

  return parts.join('. ') + '.';
}

/**
 * Generate recommendations based on usage data and preferences
 */
export async function generateRecommendations(
  currentPlan: CurrentPlanData,
  usageData: ParsedUsageData,
  preferences: UserPreferences,
  allPlans: Plan[],
  utilityApiKey: string
): Promise<Recommendation[]> {
  // Get suppliers for rating information
  const suppliers = await getSuppliers(utilityApiKey);

  // Calculate costs for all plans
  const plansWithCosts: PlanWithCosts[] = allPlans.map((plan) => {
    const annualCost = calculateAnnualCost(plan, usageData);
    const savings = calculateSavings(currentPlan, plan, usageData);
    const score = calculatePlanScore(
      { ...plan, annualCost, savings, score: 0 },
      preferences,
      suppliers
    );

    return {
      ...plan,
      annualCost,
      savings,
      score,
    };
  });

  // Select top 3 highest-scoring plans
  const topPlans = selectTopRecommendations(plansWithCosts);

  // Generate recommendations with explanations
  const recommendations: Recommendation[] = topPlans.map((plan) => ({
    plan,
    explanation: generateExplanation(plan, preferences),
    confidence: 'high', // Will be adjusted based on data quality later
  }));

  return recommendations;
}

