// Simple test script for XML parser functionality
// Run with: node lib/test-xml-parser.js

const { parseGreenButtonXML } = require('./xmlParser');
const fs = require('fs');

console.log('Testing XML Parser...\n');

try {
  // Test with sample XML
  const xmlContent = fs.readFileSync('sample-green-button.xml', 'utf8');
  console.log('✅ Sample XML file loaded');

  const result = parseGreenButtonXML(xmlContent);
  console.log('✅ XML parsing successful');

  console.log('📊 Results:');
  console.log(`   - Data Quality: ${result.dataQuality}`);
  console.log(`   - Date Range: ${result.dateRange.start} to ${result.dateRange.end}`);
  console.log(`   - Monthly Totals: ${result.monthlyTotals.length} months`);

  // Check data quality
  if (result.monthlyTotals.length >= 6) {
    console.log('✅ Minimum data requirement met (6+ months)');
  } else {
    console.log('❌ Insufficient data (less than 6 months)');
  }

  // Show first few months
  console.log('\n📅 First 3 months of data:');
  result.monthlyTotals.slice(0, 3).forEach(month => {
    console.log(`   ${month.month}: ${month.totalKwh.toFixed(2)} kWh (${month.daysWithData} days)`);
  });

  console.log('\n🎉 XML Parser test PASSED');

} catch (error) {
  console.error('❌ XML Parser test FAILED:', error.message);
  process.exit(1);
}


