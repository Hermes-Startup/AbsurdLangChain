#!/usr/bin/env node

/**
 * Quartermaster Script
 * 
 * Fetches temporary DB credentials and Gemini key from the provisioning service.
 * Writes credentials to .env.local file.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();


// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}${colors.bright}✗ ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bright}✓ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}${colors.bright}ℹ ${message}${colors.reset}`);
}

/**
 * Load environment variables from .env.local
 */
function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes if present
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  }
}

// Load env vars first
loadLocalEnv();

// Get provisioning API endpoint from environment or use default
const PROVISION_API_URL = process.env.QUARTERMASTER_API_URL || process.env.PROVISION_API_URL || 'https://api.example.com/provision';

/**
 * Fetch credentials from provisioning API
 */
async function fetchCredentials() {
  return new Promise((resolve, reject) => {
    const url = new URL(PROVISION_API_URL);
    const client = url.protocol === 'https:' ? https : http;

    logInfo(`Contacting Quartermaster at ${PROVISION_API_URL}...`);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Quartermaster-Client/1.0',
        'Accept': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const credentials = JSON.parse(data);
            resolve(credentials);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`API returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Write credentials to .env.local file
 */
function writeEnvFile(credentials) {
  const envPath = path.join(process.cwd(), '.env.local');

  // Read existing .env.local if it exists
  let existingEnv = {};
  if (fs.existsSync(envPath)) {
    const existingContent = fs.readFileSync(envPath, 'utf8');
    existingContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          existingEnv[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }

  // Merge credentials with existing env vars (credentials take precedence)
  const mergedEnv = {
    ...existingEnv,
    ...credentials,
  };

  // Build .env.local content
  const envLines = [];

  // Write credentials from provisioning
  if (credentials.OPENAI_API_KEY) {
    envLines.push(`OPENAI_API_KEY=${credentials.OPENAI_API_KEY}`);
  }
  if (credentials.OPENAI_BASE_URL) {
    envLines.push(`OPENAI_BASE_URL=${credentials.OPENAI_BASE_URL}`);
  }
  if (credentials.SUPABASE_URL) {
    envLines.push(`SUPABASE_URL=${credentials.SUPABASE_URL}`);
  }
  if (credentials.SUPABASE_PRIVATE_KEY) {
    envLines.push(`SUPABASE_PRIVATE_KEY=${credentials.SUPABASE_PRIVATE_KEY}`);
  }
  if (credentials.SUPABASE_ANON_KEY) {
    envLines.push(`SUPABASE_ANON_KEY=${credentials.SUPABASE_ANON_KEY}`);
  }

  // Add any other existing env vars that weren't overwritten
  Object.keys(existingEnv).forEach((key) => {
    if (!credentials.hasOwnProperty(key)) {
      envLines.push(`${key}=${existingEnv[key]}`);
    }
  });

  // Write to file
  fs.writeFileSync(envPath, envLines.join('\n') + '\n', 'utf8');

  return envPath;
}

/**
 * Main function
 */
async function main() {
  try {
    log(`${colors.bright}🔑 Quartermaster: Provisioning credentials...${colors.reset}\n`);

    // Fetch credentials from API
    const credentials = await fetchCredentials();

    // Validate required credentials
    if (!credentials.OPENAI_API_KEY || !credentials.OPENAI_BASE_URL) {
      throw new Error('Missing required credentials: Need OPENAI_API_KEY and OPENAI_BASE_URL');
    }

    // Write to .env.local
    const envPath = writeEnvFile(credentials);
    
    logSuccess(`Credentials written to ${envPath}`);
    
    const provided = Object.keys(credentials).filter((key) => 
      ['OPENAI_API_KEY', 'OPENAI_BASE_URL',
       'SUPABASE_URL', 'SUPABASE_PRIVATE_KEY', 'SUPABASE_ANON_KEY'].includes(key)
    );
    
    log(`\n${colors.bright}Provisioned credentials:${colors.reset}`);
    provided.forEach((key) => {
      log(`  ${colors.green}✓${colors.reset} ${key}`);
    });
    
    // Auto-configure IDEs if auto-setup module is available
    try {
      const { configureIDEs } = require('./auto-setup.js');
      configureIDEs(credentials);
    } catch (error) {
      // Auto-configuration is optional
    }
    
    log(`\n${colors.bright}${colors.green}Ready for mission!${colors.reset}\n`);

  } catch (error) {
    logError(`Failed to provision credentials: ${error.message}`);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      log(`\n${colors.yellow}Tip:${colors.reset} Make sure the provisioning API is accessible.`);
      log(`   Set QUARTERMASTER_API_URL environment variable to override the default URL.`);
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchCredentials, writeEnvFile };
