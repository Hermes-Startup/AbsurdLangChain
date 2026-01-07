# Prompt Shadowing via Git Hooks

## Overview

This approach uses Git hooks to capture prompts that Cursor AI processes, working around Cursor's unreliable configuration mechanism. Prompts are automatically logged to Supabase when you commit code.

## How It Works

1. **`.cursorrules` file** instructs Cursor to write prompts to `.prompts/` folder
2. **Pre-commit hook** runs before each commit
3. **Hook script** (`scripts/log-prompts.js`) reads all prompts from `.prompts/`
4. **Logs to Supabase** using the `log_prompt` RPC function
5. **Cleans up** processed prompt files
6. **Commit proceeds** normally

## Setup

### Prerequisites

1. **Environment Variables** in `.env.local`:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CANDIDATE_ID=your_candidate_uuid  # Optional, falls back to git user.email
   ```

2. **Database Migration**: Ensure `004_prompt_logs.sql` has been run in Supabase

### Installation

The setup is already complete! The following files are in place:

- ✅ `.cursorrules` - Instructs Cursor to write prompts
- ✅ `.git/hooks/pre-commit` - Git hook that runs on commit
- ✅ `scripts/log-prompts.js` - Script that processes prompts
- ✅ `.gitignore` - Ignores `.prompts/` folder

### Manual Testing

Test the prompt logging without committing:

```bash
# Create a test prompt file
echo "# Test prompt" > .prompts/test-$(date +%Y-%m-%d-%H%M%S).md

# Run the logging script manually
yarn test:prompt-log
# or
node scripts/log-prompts.js
```

## How Cursor Uses This

When you use Cursor AI:

1. You type a prompt (e.g., "Add a button to the homepage")
2. Cursor reads `.cursorrules` and sees it must log prompts
3. Cursor writes to `.prompts/YYYY-MM-DD-HHMMSS-hash.md` with:
   - Your prompt/intent
   - Context
   - Execution plan
4. Cursor executes the changes
5. When you commit, the hook runs automatically
6. Prompt is logged to Supabase
7. Prompt file is removed

## What Gets Logged

Each prompt file contains:
- **User Intent**: What you asked for
- **Context**: Relevant files/code mentioned
- **Plan**: Cursor's execution plan
- **Actions**: What Cursor will do

This is logged to `admin_audit.prompt_logs` with:
- `candidate_id`: Your UUID (from env or git config)
- `provider`: `cursor-git-hook`
- `tool_name`: `Cursor`
- `prompt_text`: Full prompt content
- `prompt_json`: Metadata about the prompt

## Verification

Check if prompts are being logged:

```sql
-- In Supabase SQL Editor
SELECT 
  id,
  candidate_id,
  tool_name,
  provider,
  prompt_text_preview,
  created_at
FROM admin_audit.prompt_logs
WHERE provider = 'cursor-git-hook'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Prompts Not Being Logged

1. **Check `.cursorrules` exists**: Cursor must see this file
2. **Check Supabase config**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
3. **Check candidate ID**: Set `CANDIDATE_ID` or `OPENAI_API_KEY` in `.env.local`
4. **Check hook is executable**: Run `git config core.hooksPath .git/hooks`
5. **Manual test**: Run `yarn test:prompt-log` to test without committing

### Cursor Not Writing Prompts

- Cursor may not always follow `.cursorrules` (~95% reliability)
- If prompts aren't being written, Cursor isn't following the rules
- This is a limitation of the approach

### Hook Not Running

- Verify `.git/hooks/pre-commit` exists
- Check `git config core.hooksPath` points to `.git/hooks`
- Try running the script manually: `node scripts/log-prompts.js`

## Limitations

1. **Only captures committed prompts**: Prompts that don't lead to commits aren't captured
2. **Depends on Cursor following rules**: ~95% reliable, not 100%
3. **Not real-time**: Only logs when you commit
4. **Requires git workflow**: Won't work for non-committed work
5. **⚠️ Users can see their prompts**: The `.prompts/` folder is visible in the file system
   - Files are readable markdown
   - Users can see what's being logged
   - This is not "stealth" logging - it's transparent

## Comparison with Proxy Approach

| Aspect | Git Hook | Proxy |
|--------|----------|-------|
| **Setup** | ✅ Zero config | ❌ Needs Cursor config |
| **Coverage** | ⚠️ Only committed | ✅ All requests |
| **Real-time** | ❌ No | ✅ Yes |
| **Reliability** | ~95% | 100% (if configured) |
| **Works offline** | ✅ Yes | ❌ No |
| **User Visibility** | ⚠️ Users can see prompts | ✅ Transparent (users don't see) |
| **Stealth** | ❌ Not stealth | ✅ True stealth logging |

## Next Steps

1. **Test it**: Make a change with Cursor and commit
2. **Verify in Supabase**: Check that prompts appear in `prompt_logs` table
3. **Monitor**: Watch for prompts being logged on each commit
4. **If it works well**: Consider removing the proxy approach

## Files

- `.cursorrules` - Instructions for Cursor AI
- `.git/hooks/pre-commit` - Git hook script
- `scripts/log-prompts.js` - Prompt processing script
- `.gitignore` - Excludes `.prompts/` folder

