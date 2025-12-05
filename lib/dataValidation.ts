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
  for (const month of data.monthlyTotals) {
    // Check for negative values
    if (month.totalKwh < 0) {
      errors.push(`Negative usage detected for ${month.month}`);
    }

    // Check for unrealistic values (too high)
    if (month.totalKwh > 10000) {
      warnings.push(`Unusually high usage for ${month.month}: ${month.totalKwh} kWh`);
    }

    // Check for zero or very low usage
    if (month.totalKwh === 0) {
      warnings.push(`Zero usage detected for ${month.month}`);
    } else if (month.totalKwh < 50) {
      warnings.push(`Very low usage for ${month.month}: ${month.totalKwh} kWh`);
    }

    // Check data completeness
    if (month.daysWithData < 20) {
      warnings.push(`Incomplete data for ${month.month}: only ${month.daysWithData} days`);
    }
  }

  // Check for extreme variations (potential data issues)
  const totals = data.monthlyTotals.map((m) => m.totalKwh);
  const avgUsage = totals.reduce((a, b) => a + b, 0) / totals.length;
  const maxUsage = Math.max(...totals);
  const minUsage = Math.min(...totals);

  if (maxUsage > avgUsage * 3) {
    warnings.push('Extreme variation detected: some months have unusually high usage');
  }

  if (minUsage < avgUsage * 0.1 && minUsage > 0) {
    warnings.push('Extreme variation detected: some months have unusually low usage');
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

/**
 * Get confidence level based on data quality score
 */
export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) {
    return 'high';
  } else if (score >= 50) {
    return 'medium';
  } else {
    return 'low';
  }
}

