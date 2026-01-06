# Testing & Deployment Checklist

## ✅ Completed
- [x] SQL migration (`004_prompt_logs.sql`) - Table exists in Supabase
- [x] OpenAI-compatible proxy route (`/api/openai-proxy/v1/chat/completions`) - For Cursor only
- [x] Provisioning script (`scripts/provision-key.js`)
- [x] Auto-setup script (`scripts/auto-setup.js`)

## 🔧 Next Steps

### 1. Set Up Environment Variables (Local Testing)

Create or update `.env.local` in the project root with:

```env
# Gemini API Key (for forwarding to Gemini API)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (for logging prompts)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For local development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Important:** 
- `GEMINI_API_KEY` is YOUR real Google AI/Gemini API key (not candidate UUID)
- `SUPABASE_SERVICE_ROLE_KEY` is required to write to `admin_audit` schema
- These should be kept secret and only used on your proxy server
- The proxy forces **gemini-1.5-flash** to ensure free tier usage.

### 2. Test the Proxy Locally

#### Start the Next.js dev server:
```bash
yarn dev
```

#### Test Gemini-Powered Proxy (for Cursor):
```bash
curl -X POST http://localhost:3000/api/openai-proxy/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "model": "gemini-1.5-flash",
    "messages": [{"role": "user", "content": "Hello, this is a test"}]
  }'
```

**Expected:**
- ✅ Response from Gemini API (via OpenAI-compatible endpoint)
- ✅ Prompt logged in `admin_audit.prompt_logs` table
- ✅ Check Supabase dashboard to verify the log entry

### 3. Verify Logging in Supabase

Run this query in Supabase SQL Editor:

```sql
-- Check recent logs
SELECT 
  id,
  candidate_id,
  provider,
  tool_name,
  prompt_text_preview,
  response_status,
  response_time_ms,
  created_at
FROM admin_audit.prompt_logs
ORDER BY created_at DESC
LIMIT 10;

-- Get full prompt text (decompressed)
SELECT get_prompt_text(id) as full_prompt
FROM admin_audit.prompt_logs
WHERE id = '<prompt-id-from-above>';
```

### 4. Deploy Proxy Server

Deploy your Next.js app to production:

**Vercel (Recommended):**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - GEMINI_API_KEY
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
```

**Other Options:**
- Railway
- Render
- Your own server

**Important:** Make sure to set all environment variables in your deployment platform.

### 5. Update Your Provisioning Endpoint

Your Hermes provisioning endpoint should return:

```json
{
  "OPENAI_API_KEY": "<candidate_uuid>",
  "OPENAI_BASE_URL": "https://your-app.vercel.app/api/openai-proxy/v1",
  "SUPABASE_URL": "your_supabase_url",
  "SUPABASE_PRIVATE_KEY": "your_supabase_private_key"
}
```

**Key Points:**
- `OPENAI_API_KEY` = candidate's UUID (not real key!)
- `OPENAI_BASE_URL` = `/api/openai-proxy/v1` (Cursor appends `/chat/completions`)
- Only Cursor prompts are logged (OpenAI-compatible format)

### 6. Test End-to-End Flow

1. **Simulate candidate experience:**
   ```bash
   # Set provisioning endpoint URL
   export QUARTERMASTER_API_URL=https://your-provisioning-endpoint.com/provision
   
   # Run provisioning script
   yarn mission:start
   ```

2. **Verify `.env.local` was created** with candidate UUIDs and proxy URLs

3. **Test with Cursor:**
   - Open Cursor
   - Configure custom API endpoint: `https://your-app.vercel.app/api/openai-proxy/v1`
   - Set API key to the UUID from `OPENAI_API_KEY` in `.env.local`
   - Make a request in Cursor
   - Check Supabase to see if prompt was logged

4. **Verify in Supabase:**
   - Check `admin_audit.prompt_logs` table
   - Confirm prompts are logged with `provider: 'openai-compatible'`
   - Verify `tool_name` shows 'Cursor' when using Cursor

### 7. Monitor & Debug

**Check Proxy Logs:**
- Vercel: Dashboard → Your Project → Functions → View logs
- Look for errors in `logPromptAsync` or `updateLogWithResponseAsync`

**Common Issues:**
- ❌ "Missing or invalid Authorization header" → Candidate UUID not in header
- ❌ "Invalid candidate ID format" → UUID format incorrect
- ❌ "Failed to log prompt" → Check Supabase connection and service role key
- ❌ "Function not found" → SQL migration not run or RPC function missing

**Debug Queries:**
```sql
-- Check if functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('log_prompt', 'update_prompt_log_response');

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'admin_audit' 
  AND table_name = 'prompt_logs';
```

## 🎯 Success Criteria

You're ready when:
- ✅ Proxy routes respond correctly
- ✅ Prompts are logged to `admin_audit.prompt_logs`
- ✅ Responses are forwarded correctly
- ✅ Candidate UUIDs are extracted from headers
- ✅ Compression is working (check blob sizes)
- ✅ End-to-end flow works with Cursor/Claude Code

## 📊 Next: Analysis

Once logging works, you can analyze:
- Prompt maturity (quick fixes vs architectural thinking)
- Tool usage patterns (which IDE/tool candidates prefer)
- Response times and token usage
- Shipping velocity (prompt turns to completion)

