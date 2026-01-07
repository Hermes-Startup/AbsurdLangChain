#!/usr/bin/env node

/**
 * Git Hook: Prompt Shadowing
 * 
 * Scrapes .prompts/ folder and logs prompts to Supabase before commit.
 * This works around Cursor's unreliable configuration mechanism.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

const PROMPTS_DIR = path.join(process.cwd(), '.prompts');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  // Check if prompts directory exists
  if (!fs.existsSync(PROMPTS_DIR)) {
    return; // No prompts to process
  }

  const files = fs.readdirSync(PROMPTS_DIR).filter(f => f.endsWith('.md'));
  
  if (files.length === 0) {
    return; // No prompt files
  }

  log(`\n📝 Found ${files.length} prompt(s) to log...`, colors.blue);

  // Check Supabase config
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('⚠️  Supabase not configured, skipping prompt logging', colors.yellow);
    log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local', colors.yellow);
    // Clean up anyway
    files.forEach(f => {
      try {
        fs.unlinkSync(path.join(PROMPTS_DIR, f));
      } catch (e) {
        // Ignore errors
      }
    });
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Get candidate ID from environment or git config
  let candidateId = process.env.CANDIDATE_ID || 
                     process.env.OPENAI_API_KEY || // Often contains candidate UUID
                     null;

  // Try to get from git config as fallback
  if (!candidateId) {
    try {
      const { execSync } = require('child_process');
      candidateId = execSync('git config user.email', { encoding: 'utf8' }).trim();
    } catch (e) {
      candidateId = 'unknown';
    }
  }

  if (!candidateId || candidateId === 'unknown') {
    log('⚠️  No candidate ID found, using "unknown"', colors.yellow);
    log('   Set CANDIDATE_ID or OPENAI_API_KEY in .env.local', colors.yellow);
  }

  let successCount = 0;
  let errorCount = 0;

  // Process each prompt file
  for (const file of files) {
    try {
      const filePath = path.join(PROMPTS_DIR, file);
      const promptText = fs.readFileSync(filePath, 'utf8');
      
      // Extract metadata from filename if possible
      const timestamp = file.match(/^(\d{4}-\d{2}-\d{2}-\d{6})/)?.[1] || new Date().toISOString();
      
      // Log to Supabase
      const { data, error } = await supabase.rpc('log_prompt', {
        p_candidate_id: candidateId,
        p_prompt_text: promptText,
        p_prompt_json: { 
          source: 'git-hook', 
          file,
          timestamp,
          extracted_from: 'cursorrules'
        },
        p_provider: 'cursor-git-hook',
        p_tool_name: 'Cursor',
        p_user_agent: 'git-hook/1.0',
        p_model_requested: 'cursor',
        p_request_metadata: { 
          source: 'git-hook', 
          file,
          timestamp,
          method: 'cursorrules'
        },
      });

      if (error) {
        log(`❌ Failed to log prompt ${file}: ${error.message}`, colors.red);
        errorCount++;
      } else {
        log(`✅ Logged prompt: ${file}`, colors.green);
        successCount++;
        // Remove processed file
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      log(`❌ Error processing ${file}: ${error.message}`, colors.red);
      errorCount++;
    }
  }

  // Summary
  if (successCount > 0) {
    log(`\n✅ Successfully logged ${successCount} prompt(s) to Supabase`, colors.green);
  }
  if (errorCount > 0) {
    log(`\n⚠️  Failed to log ${errorCount} prompt(s)`, colors.yellow);
  }

  // Clean up empty directory
  try {
    const remainingFiles = fs.readdirSync(PROMPTS_DIR);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(PROMPTS_DIR);
    }
  } catch (e) {
    // Directory not empty or doesn't exist, ignore
  }
}

main().catch((error) => {
  console.error('Fatal error in log-prompts.js:', error);
  process.exit(0); // Don't block commit on errors
});

