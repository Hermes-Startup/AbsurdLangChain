#!/usr/bin/env node

/**
 * Auto-Setup Script
 * 
 * Runs automatically after yarn install to provision credentials
 * and configure IDE settings. Zero-friction setup for candidates.
 */

const fs = require('fs');
const path = require('path');
const { fetchCredentials, writeEnvFile } = require('./provision-key.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

/**
 * Check if .env.local exists
 */
function envFileExists() {
  const envPath = path.join(process.cwd(), '.env.local');
  return fs.existsSync(envPath);
}

/**
 * Auto-provision credentials
 */
async function autoProvision() {
  try {
    logInfo('Auto-provisioning credentials...');
    const credentials = await fetchCredentials();
    
    // Check if OpenAI credentials are configured
    if (!credentials.OPENAI_API_KEY || !credentials.OPENAI_BASE_URL) {
      logWarning('Provisioning endpoint did not return required credentials');
      logWarning('Candidates will need to run: yarn mission:start');
      return false;
    }
    
    writeEnvFile(credentials);
    logSuccess('Credentials provisioned automatically');
    return true;
  } catch (error) {
    // Don't fail the install if provisioning fails
    logWarning(`Auto-provisioning failed: ${error.message}`);
    logWarning('Candidates can manually run: yarn mission:start');
    return false;
  }
}

/**
 * Configure IDEs automatically
 * Cursor uses OpenAI-compatible format
 */
function configureIDEs(credentials) {
  // Print setup instructions for Cursor (can't auto-configure Cursor's AI settings)
  if (credentials.OPENAI_BASE_URL) {
    log('\n' + colors.bright + '═══════════════════════════════════════════════════════' + colors.reset);
    log(colors.bright + '  🎯 CURSOR SETUP (One-time, takes 30 seconds)' + colors.reset);
    log(colors.bright + '═══════════════════════════════════════════════════════' + colors.reset);
    log('\n1. Open Cursor Settings (Ctrl+,)');
    log('2. Search for "OpenAI" in settings');
    log('3. Set these values:\n');
    log(colors.green + '   OpenAI Base URL: ' + colors.reset + credentials.OPENAI_BASE_URL);
    log(colors.green + '   OpenAI API Key:  ' + colors.reset + credentials.OPENAI_API_KEY);
    log('\n' + colors.gray + '   (The API key is your candidate ID - this is correct!)' + colors.reset);
    log(colors.bright + '═══════════════════════════════════════════════════════\n' + colors.reset);
  }
}

/**
 * Configure Cursor IDE
 */
function configureCursor(credentials, provider = 'openai') {
  const cursorDir = path.join(process.cwd(), '.cursor');
  const configPath = path.join(cursorDir, 'config.json');
  
  // Create .cursor directory if it doesn't exist
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }
  
  // Read existing config or create new one
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      // If config is invalid, start fresh
      config = {};
    }
  }
  
  // Update AI configuration (Cursor uses OpenAI-compatible format)
  if (provider === 'openai' && credentials.OPENAI_BASE_URL) {
    config.ai = {
      ...config.ai,
      apiEndpoint: credentials.OPENAI_BASE_URL,
      apiKey: credentials.OPENAI_API_KEY,
      provider: 'openai', // OpenAI-compatible format
    };
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  logInfo('Cursor configuration updated');
}


/**
 * Main setup function
 */
async function main() {
  // Check if already configured
  if (envFileExists()) {
    logSuccess('Environment already configured');
    return;
  }
  
  log('\n🔧 Auto-Setup: Configuring your environment...\n');
  
  // Try to auto-provision
  const provisioned = await autoProvision();
  
  if (provisioned) {
    // Read credentials to configure IDEs
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const credentials = {};
    
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          credentials[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    // Configure IDEs
    configureIDEs(credentials);
    
    log('\n✅ Auto-setup complete! You can start coding now.\n');
  } else {
    log('\n⚠️  Auto-setup incomplete. Run: yarn mission:start\n');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Auto-setup error:', error);
    process.exit(1);
  });
}

module.exports = { main, configureIDEs, configureCursor };

