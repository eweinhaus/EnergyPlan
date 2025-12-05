/**
 * Maps data validation warnings to actionable items for users
 */
export interface WarningAction {
  warning: string;
  action: string;
  severity: 'info' | 'warning' | 'important';
}

export function getWarningActions(warnings: string[]): WarningAction[] {
  return warnings.map((warning) => {
    // Unusually high usage
    if (warning.includes('Unusually high usage')) {
      return {
        warning,
        action: 'Verify this usage is correct. If you have a large home, pool, or EV charging, this may be normal. If unexpected, contact your utility to verify meter readings.',
        severity: 'warning',
      };
    }

    // Zero usage
    if (warning.includes('Zero usage detected')) {
      return {
        warning,
        action: 'Check if the property was vacant during this period. If not, contact your utility to verify meter readings or check for meter issues.',
        severity: 'important',
      };
    }

    // Very low usage
    if (warning.includes('Very low usage')) {
      return {
        warning,
        action: 'Verify this usage is correct. If you have solar panels or were away, this may be normal. If unexpected, contact your utility to verify.',
        severity: 'info',
      };
    }

    // Incomplete data
    if (warning.includes('Incomplete data')) {
      return {
        warning,
        action: 'Try downloading a new XML file from your utility with complete data. More complete data will improve recommendation accuracy.',
        severity: 'important',
      };
    }

    // Extreme variation - high
    if (warning.includes('Extreme variation') && warning.includes('high')) {
      return {
        warning,
        action: 'Review seasonal patterns (e.g., summer AC usage). If this matches your expected usage patterns, recommendations should still work. If unexpected, verify the data with your utility.',
        severity: 'warning',
      };
    }

    // Extreme variation - low
    if (warning.includes('Extreme variation') && warning.includes('low')) {
      return {
        warning,
        action: 'Review seasonal patterns or periods when you were away. If this matches your expected usage patterns, recommendations should still work. If unexpected, verify the data with your utility.',
        severity: 'warning',
      };
    }

    // Default action for unknown warnings
    return {
      warning,
      action: 'Review your usage data and verify it matches your expected patterns. Contact your utility if you notice any discrepancies.',
      severity: 'info',
    };
  });
}


