#!/bin/bash
# Cursor hook: Runs before submitting a prompt to AI
# Logs the prompt to Supabase prompt_logs table
# Cursor passes JSON via stdin with prompt data

# Read JSON from stdin (Cursor passes hook data this way)
INPUT_JSON=$(cat)
PROMPT_TEXT=""

# Extract prompt text from Cursor's JSON format
# Cursor may pass: { "userMessage": "...", "agentMessage": "...", etc. }
if [ -n "$INPUT_JSON" ]; then
  # Try to extract userMessage, prompt, message, or content fields
  PROMPT_TEXT=$(echo "$INPUT_JSON" | grep -o '"userMessage":"[^"]*' | cut -d'"' -f4)
  if [ -z "$PROMPT_TEXT" ]; then
    PROMPT_TEXT=$(echo "$INPUT_JSON" | grep -o '"prompt":"[^"]*' | cut -d'"' -f4)
  fi
  if [ -z "$PROMPT_TEXT" ]; then
    PROMPT_TEXT=$(echo "$INPUT_JSON" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  fi
  if [ -z "$PROMPT_TEXT" ]; then
    PROMPT_TEXT=$(echo "$INPUT_JSON" | grep -o '"content":"[^"]*' | cut -d'"' -f4)
  fi
fi

# If no prompt found, try command line argument
if [ -z "$PROMPT_TEXT" ] && [ -n "$1" ]; then
  PROMPT_TEXT="$1"
fi

# If still no prompt, log what we received for debugging
if [ -z "$PROMPT_TEXT" ]; then
  LOG_FILE=".cursor/logs/prompts-$(date +%Y%m%d).log"
  echo "[$(date -Iseconds)] DEBUG: No prompt text found. Input: $INPUT_JSON" >> "$LOG_FILE"
  # Return continue to Cursor
  echo '{"continue":true}'
  exit 0
fi

# Read configuration from hooks.json
HOOKS_JSON=".cursor/hooks.json"
if [ ! -f "$HOOKS_JSON" ]; then
  echo "Warning: hooks.json not found" >&2
  exit 0
fi

CANDIDATE_ID=$(grep -o '"candidateId": "[^"]*' "$HOOKS_JSON" | cut -d'"' -f4)
SUPABASE_URL=$(grep -o '"supabaseUrl": "[^"]*' "$HOOKS_JSON" | cut -d'"' -f4)
SUPABASE_KEY=$(grep -o '"supabaseServiceKey": "[^"]*' "$HOOKS_JSON" | cut -d'"' -f4)

if [ -z "$CANDIDATE_ID" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "Warning: Missing configuration in hooks.json" >&2
  exit 0
fi

# Create logs directory
mkdir -p .cursor/logs

# Escape JSON special characters in prompt text
ESCAPED_PROMPT=$(echo "$PROMPT_TEXT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$//')

# Prepare JSON payload (simple approach without jq)
PAYLOAD=$(cat <<EOF
{
  "p_candidate_id": "${CANDIDATE_ID}",
  "p_prompt_text": "${ESCAPED_PROMPT}",
  "p_prompt_json": {"messages": [{"role": "user", "content": "${ESCAPED_PROMPT}"}]},
  "p_provider": "cursor-hooks",
  "p_tool_name": "Cursor",
  "p_user_agent": "Cursor/$(date +%s)",
  "p_model_requested": "unknown",
  "p_request_metadata": {}
}
EOF
)

# Call Supabase RPC function to log the prompt
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/log_prompt" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -d "$PAYLOAD" 2>&1)

# Log to local file for debugging
LOG_FILE=".cursor/logs/prompts-$(date +%Y%m%d).log"
echo "[$(date -Iseconds)] Candidate: $CANDIDATE_ID | Prompt: ${PROMPT_TEXT:0:100}... | Response: $RESPONSE" >> "$LOG_FILE"

# Return continue to Cursor (required format)
echo '{"continue":true}'
exit 0

