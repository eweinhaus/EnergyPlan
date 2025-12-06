import { ParsedUsageData, MonthlyUsage } from './types';

/**
 * Validate usage data for realistic patterns
 */
export function validateUsageData(data: ParsedUsageData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum data requirement
  if (data.monthlyTotals.length < 6) {
    errors.push('At least 6 months of data are required');
  }

  // Validate monthly totals
  // Filter out partial months (< 5 days) for variation calculations
  const completeMonths = data.monthlyTotals.filter((m) => m.daysWithData >= 5);
  
  // Identify edge months (first and last in the dataset)
  // These often have partial data which is normal and expected
  const sortedMonths = [...data.monthlyTotals].sort((a, b) => a.month.localeCompare(b.month));
  const firstMonth = sortedMonths[0]?.month;
  const lastMonth = sortedMonths[sortedMonths.length - 1]?.month;
  
  for (const month of data.monthlyTotals) {
    // Check for negative values
    if (month.totalKwh < 0) {
      errors.push(`Negative usage detected for ${month.month}`);
    }

    // Check for unrealistic values (too high) - adjusted for Texas summer usage
    // 12,000 kWh is more reasonable threshold for large homes with AC in hot climates
    if (month.totalKwh > 12000) {
      warnings.push(`Unusually high usage for ${month.month}: ${month.totalKwh} kWh`);
    }

    // Check for zero or very low usage (only for months with sufficient data)
    if (month.totalKwh === 0) {
      warnings.push(`Zero usage detected for ${month.month}`);
    } else if (month.totalKwh < 50 && month.daysWithData >= 20) {
      // Only warn about low usage if the month has enough days to be meaningful
      warnings.push(`Very low usage for ${month.month}: ${month.totalKwh} kWh`);
    }

    // Check data completeness
    // Edge months (first/last) often have partial data which is normal
    // Only warn about incomplete data if:
    // 1. It's NOT an edge month, OR
    // 2. It's an edge month but has significant data (5-19 days) suggesting it should be more complete
    const isEdgeMonth = month.month === firstMonth || month.month === lastMonth;
    const isVerySmallPartial = month.daysWithData > 0 && month.daysWithData < 5;
    
    if (month.daysWithData > 0 && month.daysWithData < 20) {
      // Don't warn about very small partial months at edges (normal for utility data exports)
      if (!isEdgeMonth || !isVerySmallPartial) {
        warnings.push(`Incomplete data for ${month.month}: only ${month.daysWithData} days`);
      }
    }
  }

  // Check for extreme variations (only using complete months to avoid false positives)
  if (completeMonths.length >= 3) {
    const totals = completeMonths.map((m) => m.totalKwh);
    const avgUsage = totals.reduce((a, b) => a + b, 0) / totals.length;
    const maxUsage = Math.max(...totals);
    const minUsage = Math.min(...totals);

    if (maxUsage > avgUsage * 3) {
      warnings.push('Extreme variation detected: some months have unusually high usage');
    }

    // Only check for low variation if we have enough complete months
    if (minUsage < avgUsage * 0.1 && minUsage > 0 && completeMonths.length >= 6) {
      warnings.push('Extreme variation detected: some months have unusually low usage');
    }
  }

  // Validate date range
  const startDate = new Date(data.dateRange.start);
  const endDate = new Date(data.dateRange.end);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 180) {
    errors.push('Date range must cover at least 6 months (180 days)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate data quality score (0-100)
 */
export function calculateDataQualityScore(data: ParsedUsageData): number {
  let score = 100;

  // Deduct for data quality rating
  if (data.dataQuality === 'poor') {
    score -= 30;
  } else if (data.dataQuality === 'fair') {
    score -= 15;
  }

  // Deduct for incomplete months
  const incompleteMonths = data.monthlyTotals.filter((m) => m.daysWithData < 25).length;
  score -= incompleteMonths * 5;

  // Deduct for data gaps
  const months = data.monthlyTotals.length;
  if (months < 12) {
    score -= (12 - months) * 3;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

