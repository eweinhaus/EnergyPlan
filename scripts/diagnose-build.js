#!/usr/bin/env node

/**
 * Build Diagnostic Script
 * Helps identify potential deployment issues before pushing to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildDiagnostic {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);

    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
  }

  async runDiagnostics() {
    console.log('🔍 Running build diagnostics...\n');

    await this.checkNodeVersion();
    await this.checkDependencies();
    await this.checkEnvironmentVariables();
    await this.checkBuildFiles();
    await this.testBuildLocally();

    this.printSummary();
  }

  async checkNodeVersion() {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredVersion = packageJson.engines?.node || 'Not specified';

      this.log(`Node.js version: ${nodeVersion}`);
      this.log(`Required version: ${requiredVersion}`);

      // Check if version matches
      const currentMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
      const requiredMatch = requiredVersion.match(/(\d+)\.x/);
      if (requiredMatch) {
        const requiredMajor = parseInt(requiredMatch[1]);
        if (currentMajor !== requiredMajor) {
          this.log(`Version mismatch! Local: ${currentMajor}, Required: ${requiredMajor}`, 'warning');
        }
      }
    } catch (error) {
      this.log(`Failed to check Node version: ${error.message}`, 'error');
    }
  }

  async checkDependencies() {
    try {
      this.log('Checking dependencies...');
      execSync('npm ls --depth=0', { stdio: 'pipe' });
      this.log('Dependencies look good');
    } catch (error) {
      this.log(`Dependency issues found: ${error.message}`, 'warning');
    }
  }

  async checkEnvironmentVariables() {
    this.log('Checking environment variables...');

    const requiredVars = ['EIA_API_KEY', 'NEXT_PUBLIC_APP_URL'];
    const optionalVars = ['VERCEL_URL', 'NODE_ENV'];

    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        this.log(`Required env var missing locally: ${varName}`, 'warning');
      }
    });

    this.log('Note: Make sure these are set in your Vercel project settings!');
  }

  async checkBuildFiles() {
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'tailwind.config.ts'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log(`Found: ${file}`);
      } else {
        this.log(`Missing: ${file}`, 'error');
      }
    });
  }

  async testBuildLocally() {
    try {
      this.log('Testing local build...');
      execSync('npm run build', { stdio: 'pipe' });
      this.log('Local build successful ✅');
    } catch (error) {
      this.log(`Local build failed: ${error.message}`, 'error');
      console.log('Build output:', error.stdout?.toString() || 'No output');
    }
  }

  printSummary() {
    console.log('\n📋 === DIAGNOSTIC SUMMARY ===');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All checks passed! Ready for deployment.');
    } else {
      if (this.errors.length > 0) {
        console.log(`❌ ${this.errors.length} error(s) found:`);
        this.errors.forEach(error => console.log(`   - ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log(`⚠️  ${this.warnings.length} warning(s) found:`);
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Fix any errors/warnings above');
    console.log('2. Set environment variables in Vercel dashboard');
    console.log('3. Push to trigger deployment: git push origin main');
    console.log('4. Check Vercel deployment logs for any remaining issues');
  }
}

// Run diagnostics
if (require.main === module) {
  const diagnostic = new BuildDiagnostic();
  diagnostic.runDiagnostics().catch(error => {
    console.error('Diagnostic failed:', error);
    process.exit(1);
  });
}

module.exports = BuildDiagnostic;

