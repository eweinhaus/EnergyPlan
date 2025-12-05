import {
  Plan,
  PlanWithCosts,
  Recommendation,
  ParsedUsageData,
  CurrentPlanData,
  UserPreferences,
} from './types';
import { getSuppliers } from './apiClients';

/**
 * Calculate annual cost for a plan based on usage data
 */
export function calculateAnnualCost(
  plan: Plan,
  usageData: ParsedUsageData
): number {
  let totalCost = 0;

  for (const month of usageData.monthlyTotals) {
    // Energy cost (rate * kWh)
    const energyCost = (plan.rate / 100) * month.totalKwh; // Convert cents to dollars

    // Fixed fees (delivery + admin)
    const fixedFees = plan.fees.delivery + plan.fees.admin;

    // Monthly total
    totalCost += energyCost + fixedFees;
  }

  return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate savings compared to current plan
 */
export function calculateSavings(
  currentPlan: CurrentPlanData,
  recommendedPlan: Plan,
  usageData: ParsedUsageData
): number {
  const currentAnnualCost = calculateAnnualCost(
    {
      ...recommendedPlan,
      rate: currentPlan.rate,
      fees: {
        delivery: 3.5, // Default delivery fee
        admin: 5.0, // Default admin fee
      },
    },
    usageData
  );

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

  // Weighted score
  const costScore = costWeight * normalizedSavings;
  const renewableScore = renewableWeight * normalizedRenewable;
  const supplierScore = 0.1 * supplierRating; // 10% weight for supplier rating

  return costScore + renewableScore + supplierScore;
}

/**
 * Select diverse recommendations (budget, balanced, premium)
 */
export function selectDiverseRecommendations(
  scoredPlans: PlanWithCosts[]
): PlanWithCosts[] {
  if (scoredPlans.length <= 3) {
    return scoredPlans.slice(0, 3);
  }

  // Sort by score (highest first)
  const sorted = [...scoredPlans].sort((a, b) => b.score - a.score);

  const selected: PlanWithCosts[] = [];
  const usedSupplierIds = new Set<string>();

  // Strategy: Select top-scoring plans with diversity constraints
  // 1. First, pick the highest scoring plan
  selected.push(sorted[0]);
  usedSupplierIds.add(sorted[0].supplierId);

  // 2. Then pick plans that add diversity (different suppliers, different price points)
  for (const plan of sorted.slice(1)) {
    if (selected.length >= 3) break;

    // Prefer plans from different suppliers
    const isNewSupplier = !usedSupplierIds.has(plan.supplierId);

    // Prefer plans with different characteristics
    const hasDifferentPrice = selected.every(
      (selectedPlan) =>
        Math.abs(selectedPlan.rate - plan.rate) > 1.0 // At least 1 cent difference
    );

    const hasDifferentRenewable = selected.every(
      (selectedPlan) =>
        Math.abs(selectedPlan.renewablePercentage - plan.renewablePercentage) > 20
    );

    if (isNewSupplier || hasDifferentPrice || hasDifferentRenewable) {
      selected.push(plan);
      usedSupplierIds.add(plan.supplierId);
    }
  }

  // If we still don't have 3, fill with highest remaining scores
  while (selected.length < 3 && sorted.length > selected.length) {
    const remaining = sorted.filter((p) => !selected.includes(p));
    if (remaining.length > 0) {
      selected.push(remaining[0]);
    } else {
      break;
    }
  }

  return selected.slice(0, 3);
}

/**
 * Generate explanation for a recommendation
 */
export function generateExplanation(
  plan: PlanWithCosts,
  preferences: UserPreferences
): string {
  const parts: string[] = [];

  if (plan.savings > 0) {
    parts.push(`Save $${plan.savings.toFixed(2)} per year`);
  } else if (plan.savings < 0) {
    parts.push(`Costs $${Math.abs(plan.savings).toFixed(2)} more per year`);
  } else {
    parts.push('Similar cost to your current plan');
  }

  if (plan.renewablePercentage === 100) {
    parts.push('100% renewable energy');
  } else if (plan.renewablePercentage >= 50) {
    parts.push(`${plan.renewablePercentage}% renewable energy`);
  }

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

  // Select diverse top 3
  const topPlans = selectDiverseRecommendations(plansWithCosts);

  // Generate recommendations with explanations
  const recommendations: Recommendation[] = topPlans.map((plan) => ({
    plan,
    explanation: generateExplanation(plan, preferences),
    confidence: 'high', // Will be adjusted based on data quality later
  }));

  return recommendations;
}

