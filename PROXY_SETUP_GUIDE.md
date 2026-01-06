# Proxy Server Setup & Testing Guide

## ✅ Prerequisites Checklist

Before testing, make sure you have:

1. **Environment Variables** in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Database Migration** - Run the prompt logs migration in Supabase

## 🗄️ Step 1: Run Database Migration

You need to create the `admin_audit.prompt_logs` table and RPC functions in Supabase.

### Option A: Using Supabase Dashboard (Easiest)
n
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/004_prompt_logs.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db reset

# Or run the specific migration
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase/migrations/004_prompt_logs.sql
```

### Option C: Using Connection String

```bash
psql "your_supabase_connection_string" -f supabase/migrations/004_prompt_logs.sql
```

**Verify Migration:**
Run this in Supabase SQL Editor:
```sql
-- Check if table exists
SELECT * FROM admin_audit.prompt_logs LIMIT 1;

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('log_prompt', 'update_prompt_log_response', 'get_prompt_text');
```

## 🚀 Step 2: Start the Development Server

```bash
yarn dev
```

The server should start on `http://localhost:3000`

## 🧪 Step 3: Test the Proxy

### Test 1: Basic Proxy Health Check

```bash
curl http://localhost:3000/api/openai-proxy/v1/chat/completions
```

**Expected Response:**
```json
{
  "service": "Hermes Gemini-Powered Proxy",
  "status": "operational",
  "version": "1.0.0",
  "format": "OpenAI-compatible",
  "endpoint": "/api/openai-proxy/v1/chat/completions",
  "model": "gemini-1.5-flash"
}
```

### Test 2: Send a Test Prompt

Use a test candidate UUID (any valid UUID format):

```bash
curl -X POST http://localhost:3000/api/openai-proxy/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "model": "gemini-1.5-flash",
    "messages": [{"role": "user", "content": "Hello, this is a test prompt"}]
  }'
```

**Expected:**
- ✅ Response from Gemini API (JSON with choices array)
- ✅ No errors in console
- ✅ Prompt logged to Supabase (check next step)

## 📊 Step 4: Verify Prompts Are Stored

### Check in Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Table Editor**
3. Find `admin_audit` schema → `prompt_logs` table
4. You should see your test entry with:
   - `candidate_id`: `123e4567-e89b-12d3-a456-426614174000`
   - `prompt_text_preview`: `Hello, this is a test prompt`
   - `tool_name`: `Unknown` (or detected tool name)
   - `provider`: `gemini-openai`
   - `response_status`: `200` (if successful)

### Query in SQL Editor

Run this query in Supabase SQL Editor:

```sql
-- View recent logs
SELECT 
  id,
  candidate_id,
  provider,
  tool_name,
  model_requested,
  prompt_text_preview,
  response_status,
  response_time_ms,
  tokens_used,
  created_at
FROM admin_audit.prompt_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Get Full Prompt Text (Decompressed)

```sql
-- Get full prompt text for a specific log entry
SELECT 
  id,
  candidate_id,
  get_prompt_text(id) as full_prompt_text,
  created_at
FROM admin_audit.prompt_logs
WHERE candidate_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY created_at DESC
LIMIT 1;
```

## 🔍 Troubleshooting

### Issue: "Function log_prompt does not exist"

**Solution:** Run the migration file `004_prompt_logs.sql` in Supabase SQL Editor

### Issue: "Missing or invalid Authorization header"

**Solution:** Make sure you're sending the `Authorization: Bearer <uuid>` header with a valid UUID format

### Issue: "Failed to log prompt" in console

**Solution:** 
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
- Verify the service role key has permissions to write to `admin_audit` schema
- Check Supabase logs for detailed error messages

### Issue: No response from Gemini

**Solution:**
- Verify `GEMINI_API_KEY` is set correctly
- Check if the API key is valid and has quota remaining
- Look at the proxy server console for error messages

### Issue: Prompts not appearing in Supabase

**Solution:**
- Check the proxy server console for errors
- Verify the migration ran successfully
- Make sure `SUPABASE_SERVICE_ROLE_KEY` (not anon key) is being used
- Check Supabase logs for any permission errors

## ✅ Success Criteria

You're ready when:
- ✅ Proxy responds to health check
- ✅ Test prompt returns Gemini response
- ✅ Prompt appears in `admin_audit.prompt_logs` table
- ✅ Response data is updated in the log entry
- ✅ No errors in console or Supabase logs

## 🎯 Next Steps

Once the proxy is working:
1. Deploy to production (Vercel, Railway, etc.)
2. Update your Hermes provisioning endpoint to return the proxy URL
3. Test with actual Cursor requests
4. Monitor prompt logs in Supabase

