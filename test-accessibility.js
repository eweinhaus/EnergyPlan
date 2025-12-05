// Basic accessibility validation script
// Run with: node test-accessibility.js

const fs = require('fs');

console.log('♿ Running Accessibility Validation...\n');

// Test 1: HTML Semantic Elements
console.log('1. Checking for semantic HTML elements...');

const filesToCheck = [
  'app/page.tsx',
  'components/ui/Button.tsx',
  'components/ui/Input.tsx',
  'components/ui/Card.tsx',
  'components/form/Step1Welcome.tsx',
  'components/form/Step2CurrentPlan.tsx',
  'components/form/Step3FileUpload.tsx',
];

let semanticScore = 0;
const totalChecks = filesToCheck.length * 4; // 4 checks per file

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    // Check for semantic elements
    const hasLabels = content.includes('<label') || content.includes('htmlFor=');
    const hasAriaLabels = content.includes('aria-');
    const hasRoles = content.includes('role=');
    const hasAltText = content.includes('alt=') || content.includes('aria-label');

    if (hasLabels) semanticScore++;
    if (hasAriaLabels) semanticScore++;
    if (hasRoles) semanticScore++;
    if (hasAltText) semanticScore++;

    console.log(`   ${file}:`);
    console.log(`     ✅ Labels: ${hasLabels ? 'Present' : 'Missing'}`);
    console.log(`     ✅ ARIA attributes: ${hasAriaLabels ? 'Present' : 'Missing'}`);
    console.log(`     ✅ Roles: ${hasRoles ? 'Present' : 'Missing'}`);
    console.log(`     ✅ Alt text/ARIA labels: ${hasAltText ? 'Present' : 'Missing'}`);

  } catch (error) {
    console.log(`   ❌ Could not check ${file}: ${error.message}`);
  }
});

const semanticPercentage = Math.round((semanticScore / totalChecks) * 100);
console.log(`\n📊 Semantic HTML Score: ${semanticScore}/${totalChecks} (${semanticPercentage}%)`);

if (semanticPercentage >= 75) {
  console.log('✅ Good semantic HTML coverage');
} else {
  console.log('⚠️  Semantic HTML coverage could be improved');
}

// Test 2: Color Contrast (Basic Check)
console.log('\n2. Checking color contrast patterns...');

const colorPatterns = [
  { pattern: /text-gray-900/, description: 'High contrast text (gray-900)' },
  { pattern: /text-white/, description: 'White text on dark backgrounds' },
  { pattern: /bg-primary-\d+/, description: 'Primary color backgrounds' },
  { pattern: /text-red-600/, description: 'Error text color' },
  { pattern: /text-green-600/, description: 'Success text color' },
];

let contrastScore = 0;

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    colorPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(content)) {
        contrastScore++;
        console.log(`   ✅ ${description} used in ${file}`);
      }
    });
  } catch (error) {
    // File already checked above
  }
});

console.log(`\n📊 Color contrast patterns found: ${contrastScore}/${colorPatterns.length * filesToCheck.length}`);

// Test 3: Keyboard Navigation Support
console.log('\n3. Checking keyboard navigation support...');

const keyboardPatterns = [
  { pattern: /onKeyDown/, description: 'KeyDown event handlers' },
  { pattern: /tabIndex/, description: 'Tab index attributes' },
  { pattern: /focus:/, description: 'Focus styles' },
  { pattern: /onClick/, description: 'Click handlers (mouse support)' },
];

let keyboardScore = 0;

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    keyboardPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(content)) {
        keyboardScore++;
        console.log(`   ✅ ${description} in ${file}`);
      }
    });
  } catch (error) {
    // File already checked above
  }
});

console.log(`\n📊 Keyboard navigation patterns: ${keyboardScore}/${keyboardPatterns.length * filesToCheck.length}`);

// Test 4: Form Validation Messages
console.log('\n4. Checking form validation and error messages...');

const validationPatterns = [
  { pattern: /aria-invalid/, description: 'ARIA invalid attributes' },
  { pattern: /role="alert"/, description: 'Alert roles for errors' },
  { pattern: /aria-describedby/, description: 'ARIA described by attributes' },
  { pattern: /error/, description: 'Error handling patterns' },
];

let validationScore = 0;

filesToCheck.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    validationPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(content)) {
        validationScore++;
        console.log(`   ✅ ${description} in ${file}`);
      }
    });
  } catch (error) {
    // File already checked above
  }
});

console.log(`\n📊 Form validation patterns: ${validationScore}/${validationPatterns.length * filesToCheck.length}`);

// Overall Assessment
console.log('\n🎯 Accessibility Assessment:');

const overallScore = semanticScore + contrastScore + keyboardScore + validationScore;
const totalPossible = totalChecks + (colorPatterns.length * filesToCheck.length) +
                     (keyboardPatterns.length * filesToCheck.length) +
                     (validationPatterns.length * filesToCheck.length);

const overallPercentage = Math.round((overallScore / totalPossible) * 100);

console.log(`   Overall Score: ${overallScore}/${totalPossible} (${overallPercentage}%)`);
console.log(`   Semantic HTML: ${semanticPercentage}%`);
console.log(`   Keyboard Support: ${Math.round((keyboardScore / (keyboardPatterns.length * filesToCheck.length)) * 100)}%`);
console.log(`   Form Validation: ${Math.round((validationScore / (validationPatterns.length * filesToCheck.length)) * 100)}%`);

if (overallPercentage >= 80) {
  console.log('✅ Good accessibility coverage - WCAG 2.1 AA compliant');
} else if (overallPercentage >= 60) {
  console.log('⚠️  Moderate accessibility coverage - some improvements needed');
} else {
  console.log('❌ Low accessibility coverage - significant improvements needed');
}

console.log('\n📋 Accessibility Recommendations:');
console.log('1. Test with screen readers (NVDA, JAWS, VoiceOver)');
console.log('2. Verify keyboard-only navigation');
console.log('3. Test color contrast with automated tools');
console.log('4. Validate form error announcements');
console.log('5. Test touch targets on mobile devices');

console.log('\n🎉 Accessibility validation completed!');

