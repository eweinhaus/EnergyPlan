import { XMLParser } from 'fast-xml-parser';
import { ParsedUsageData, MonthlyUsage } from './types';

interface XMLIntervalReading {
  'espi:value': string | number;
}

interface XMLInterval {
  'espi:start': string | number;
  'espi:duration'?: string | number;
}

interface XMLIntervalBlock {
  'espi:interval': XMLInterval;
  'espi:IntervalReading': XMLIntervalReading | XMLIntervalReading[];
}

// Type definitions for parsed XML structure
interface XMLIntervalReading {
  value: string | number;
}

interface XMLInterval {
  start: string | number;
  duration?: string | number;
}

interface XMLIntervalBlock {
  interval: XMLInterval;
  IntervalReading: XMLIntervalReading | XMLIntervalReading[];
}

interface XMLMeterReading {
  IntervalBlock: XMLIntervalBlock | XMLIntervalBlock[];
}

interface XMLEntry {
  content: {
    MeterReading: XMLMeterReading;
  };
}

/**
 * Parse Green Button ESPI XML format and extract usage data
 */
export function parseGreenButtonXML(xmlContent: string): ParsedUsageData {
  const parser = new XMLParser({
    ignoreAttributes: true, // Ignore XML attributes for simplicity
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    parseTrueNumberOnly: true,
    // Don't ignore namespaces initially to see the structure
    ignoreNameSpace: false,
  });

  let xmlObj: any;
  try {
    xmlObj = parser.parse(xmlContent);
  } catch (error) {
    throw new Error('Invalid XML format: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  // Extract entries
  let entries: any[] = [];

  if (xmlObj.feed?.entry) {
    entries = Array.isArray(xmlObj.feed.entry) ? xmlObj.feed.entry : [xmlObj.feed.entry];
  } else if (xmlObj.entry) {
    entries = Array.isArray(xmlObj.entry) ? xmlObj.entry : [xmlObj.entry];
  } else {
    throw new Error('No entry elements found in XML. Expected structure: feed.entry or root.entry');
  }

  // Extract usage data with timestamps
  const usageData: Array<{ timestamp: number; value: number }> = [];

  for (const entry of entries) {
    // Try both namespaced and non-namespaced elements
    let meterReading = entry.content?.['espi:MeterReading'] || entry.content?.MeterReading;
    if (!meterReading) continue;

    // Get IntervalBlocks (try both namespaced and non-namespaced)
    let intervalBlocks = meterReading['espi:IntervalBlock'] || meterReading.IntervalBlock;
    if (!intervalBlocks) continue;

    intervalBlocks = Array.isArray(intervalBlocks) ? intervalBlocks : [intervalBlocks];

    for (const intervalBlock of intervalBlocks) {
      // Get interval (try both namespaced and non-namespaced)
      const interval = intervalBlock['espi:interval'] || intervalBlock.interval;
      if (!interval) continue;

      const start = interval['espi:start'] || interval.start;
      if (!start) continue;

      const startTimestamp = parseInt(String(start), 10);

      // Get IntervalReadings (try both namespaced and non-namespaced)
      let readings = intervalBlock['espi:IntervalReading'] || intervalBlock.IntervalReading;
      if (!readings) continue;

      readings = Array.isArray(readings) ? readings : [readings];

      for (const reading of readings) {
        const value = reading['espi:value'] || reading.value;
        if (!value) continue;

        const valueWh = parseInt(String(value), 10);
        const valueKwh = valueWh / 1000; // Convert watt-hours to kWh

        if (!isNaN(startTimestamp) && !isNaN(valueKwh) && valueKwh > 0) {
          usageData.push({
            timestamp: startTimestamp,
            value: valueKwh,
          });
        }
      }
    }
  }

  if (usageData.length === 0) {
    throw new Error('No valid usage readings found in XML file');
  }

  // Sort by timestamp
  usageData.sort((a, b) => a.timestamp - b.timestamp);

  // Aggregate into monthly totals
  const monthlyMap = new Map<string, { total: number; days: Set<string> }>();

  for (const reading of usageData) {
    const date = new Date(reading.timestamp * 1000);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { total: 0, days: new Set() });
    }

    const monthData = monthlyMap.get(monthKey)!;
    monthData.total += reading.value;
    monthData.days.add(dayKey);
  }

  // Convert to array format
  const monthlyTotals: MonthlyUsage[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      totalKwh: Math.round(data.total * 100) / 100, // Round to 2 decimal places
      daysWithData: data.days.size,
      averageDaily: Math.round((data.total / data.days.size) * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calculate date range
  const timestamps = usageData.map((d) => d.timestamp);
  const startTimestamp = Math.min(...timestamps);
  const endTimestamp = Math.max(...timestamps);

  const dateRange = {
    start: new Date(startTimestamp * 1000).toISOString().split('T')[0],
    end: new Date(endTimestamp * 1000).toISOString().split('T')[0],
  };

  // Calculate data quality
  const totalDays = Math.ceil(
    (endTimestamp - startTimestamp) / (24 * 60 * 60)
  );
  const expectedReadings = totalDays * 24; // Assuming hourly readings
  const actualReadings = usageData.length;
  const completeness = (actualReadings / expectedReadings) * 100;

  let dataQuality: 'good' | 'fair' | 'poor';
  if (completeness >= 80) {
    dataQuality = 'good';
  } else if (completeness >= 50) {
    dataQuality = 'fair';
  } else {
    dataQuality = 'poor';
  }

  // Validate minimum 6 months of data
  const monthsCount = monthlyTotals.length;
  if (monthsCount < 6) {
    throw new Error(
      `Insufficient data: Found ${monthsCount} months, but at least 6 months are required`
    );
  }

  return {
    monthlyTotals,
    dataQuality,
    dateRange,
  };
}

/**
 * Validate XML file before parsing
 */
export function validateXMLFile(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new XMLParser({
          ignoreAttributes: false,
          parseNodeValue: true,
          parseAttributeValue: true,
          trimValues: true,
          parseTrueNumberOnly: true,
        });

        // Try to parse the XML - if it fails, it's invalid
        parser.parse(content);
        resolve(true);
      } catch (error) {
        reject(new Error('Invalid XML format: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

