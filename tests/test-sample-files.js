const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

// Simple parser to understand the structure
function analyzeXML(filePath) {
  const xmlContent = fs.readFileSync(filePath, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: true,
  });

  const xmlObj = parser.parse(xmlContent);
  
  // Extract entries
  let entries = [];
  if (xmlObj.feed?.entry) {
    entries = Array.isArray(xmlObj.feed.entry) ? xmlObj.feed.entry : [xmlObj.feed.entry];
  } else if (xmlObj.entry) {
    entries = Array.isArray(xmlObj.entry) ? xmlObj.entry : [xmlObj.entry];
  }

  console.log(`\n=== Analyzing ${filePath} ===`);
  console.log(`Total entries: ${entries.length}`);

  const usageData = [];
  const monthlyMap = new Map();

  for (const entry of entries) {
    let meterReading = entry.content?.['espi:MeterReading'] || entry.content?.MeterReading;
    if (!meterReading) continue;

    let intervalBlocks = meterReading['espi:IntervalBlock'] || meterReading.IntervalBlock;
    if (!intervalBlocks) continue;

    intervalBlocks = Array.isArray(intervalBlocks) ? intervalBlocks : [intervalBlocks];

    for (const intervalBlock of intervalBlocks) {
      const interval = intervalBlock['espi:interval'] || intervalBlock.interval;
      if (!interval) continue;

      const start = interval['espi:start'] || interval.start;
      if (!start) continue;

      const startTimestamp = parseInt(String(start), 10);
      const date = new Date(startTimestamp * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      let readings = intervalBlock['espi:IntervalReading'] || intervalBlock.IntervalReading;
      if (!readings) continue;

      readings = Array.isArray(readings) ? readings : [readings];

      for (const reading of readings) {
        const value = reading['espi:value'] || reading.value;
        if (!value) continue;

        const valueWh = parseInt(String(value), 10);
        const valueKwh = valueWh / 1000;

        if (!isNaN(startTimestamp) && !isNaN(valueKwh) && valueKwh > 0) {
          usageData.push({
            timestamp: startTimestamp,
            value: valueKwh,
            date: date.toISOString().split('T')[0],
          });

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { total: 0, days: new Set(), readings: 0 });
          }

          const monthData = monthlyMap.get(monthKey);
          monthData.total += valueKwh;
          monthData.days.add(dayKey);
          monthData.readings += 1;
        }
      }
    }
  }

  // Sort by timestamp
  usageData.sort((a, b) => a.timestamp - b.timestamp);
  
  const startDate = new Date(usageData[0].timestamp * 1000);
  const endDate = new Date(usageData[usageData.length - 1].timestamp * 1000);
  
  console.log(`\nDate Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  console.log(`Total readings: ${usageData.length}`);
  
  const totalDays = Math.ceil((usageData[usageData.length - 1].timestamp - usageData[0].timestamp) / (24 * 60 * 60));
  const expectedReadings = totalDays * 24; // Assuming hourly
  const completeness = (usageData.length / expectedReadings) * 100;
  
  console.log(`Total days: ${totalDays}`);
  console.log(`Expected readings (hourly): ${expectedReadings}`);
  console.log(`Actual readings: ${usageData.length}`);
  console.log(`Completeness: ${completeness.toFixed(2)}%`);
  console.log(`Data Quality: ${completeness >= 80 ? 'good' : completeness >= 50 ? 'fair' : 'poor'}`);

  console.log(`\nMonthly Breakdown:`);
  const monthlyTotals = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      totalKwh: Math.round(data.total * 100) / 100,
      daysWithData: data.days.size,
      readings: data.readings,
      averageDaily: Math.round((data.total / data.days.size) * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  monthlyTotals.forEach(month => {
    const warnings = [];
    if (month.totalKwh > 10000) warnings.push('HIGH USAGE');
    if (month.totalKwh === 0) warnings.push('ZERO USAGE');
    if (month.totalKwh < 50 && month.totalKwh > 0) warnings.push('LOW USAGE');
    if (month.daysWithData < 20) warnings.push(`INCOMPLETE (${month.daysWithData} days)`);
    
    console.log(`  ${month.month}: ${month.totalKwh.toFixed(2)} kWh, ${month.daysWithData} days, ${month.readings} readings${warnings.length > 0 ? ' ⚠️ ' + warnings.join(', ') : ''}`);
  });

  // Check for extreme variations
  const totals = monthlyTotals.map(m => m.totalKwh);
  const avgUsage = totals.reduce((a, b) => a + b, 0) / totals.length;
  const maxUsage = Math.max(...totals);
  const minUsage = Math.min(...totals);

  console.log(`\nUsage Statistics:`);
  console.log(`  Average: ${avgUsage.toFixed(2)} kWh`);
  console.log(`  Min: ${minUsage.toFixed(2)} kWh`);
  console.log(`  Max: ${maxUsage.toFixed(2)} kWh`);
  
  if (maxUsage > avgUsage * 3) {
    console.log(`  ⚠️  Extreme variation: Max is ${(maxUsage / avgUsage).toFixed(2)}x the average`);
  }
  if (minUsage < avgUsage * 0.1 && minUsage > 0) {
    console.log(`  ⚠️  Extreme variation: Min is ${(minUsage / avgUsage).toFixed(2)}x the average`);
  }
}

// Analyze all three sample files
['sample-1-complete.xml', 'sample-2-partial.xml', 'sample-3-minimal.xml'].forEach(file => {
  try {
    analyzeXML(`samples/${file}`);
  } catch (error) {
    console.error(`Error analyzing ${file}:`, error.message);
  }
});

