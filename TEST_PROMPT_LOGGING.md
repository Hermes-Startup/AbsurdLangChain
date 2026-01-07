# Testing Prompt Logging with Cursor

## How to Test

1. **Make sure `.cursorrules` is in your repo root** ✅ (Already done)

2. **Open Cursor IDE** in this project

3. **Make a simple request to Cursor**, for example:
   - "Add a comment to the README file"
   - "Create a test file called test.txt"
   - "Explain what this code does"

4. **Check if Cursor created a file in `.prompts/`**:
   ```bash
   # Windows PowerShell
   Get-ChildItem .prompts
   
   # Or just look in your file explorer
   # Navigate to: C:\Users\aaron\Documents\AbsurdLangChain\.prompts
   ```

5. **If a file was created**, check its contents:
   ```bash
   Get-Content .prompts\*.md
   ```

6. **Commit your changes** to trigger the git hook:
   ```bash
   git add .
   git commit -m "Test prompt logging"
   ```

7. **Watch the console** - you should see:
   ```
   📝 Found 1 prompt(s) to log...
   ✅ Logged prompt: [filename].md
   ✅ Successfully logged 1 prompt(s) to Supabase
   ```

8. **Verify in Supabase**:
   ```sql
   SELECT * FROM admin_audit.prompt_logs 
   WHERE provider = 'cursor-git-hook' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

## What to Look For

### ✅ Success Indicators:
- File appears in `.prompts/` folder after using Cursor
- File contains your prompt/intent
- Git hook logs the prompt on commit
- Prompt appears in Supabase

### ❌ Failure Indicators:
- No file created in `.prompts/` after using Cursor
- Cursor doesn't follow `.cursorrules` instructions
- Git hook runs but finds no prompts

## Current Status

- ✅ `.cursorrules` file exists
- ✅ `.prompts/` directory exists
- ✅ Git hook is configured
- ⏳ **Waiting for Cursor to write first prompt**

## Next Steps

Try making a change with Cursor now and see if it creates a file in `.prompts/`!

