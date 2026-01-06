import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_OPENAI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create Supabase client if credentials are available
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

/**
 * Gemini-Powered OpenAI-Compatible Proxy Handler
 * 
 * Intercepts OpenAI-compatible API requests (used by Cursor, Continue.dev, Cody, etc.)
 * and forwards them to Gemini's OpenAI-compatible endpoint.
 * 
 * Gemini models (like gemini-1.5-flash) are used to keep usage free/low-cost.
 * 
 * Endpoint: POST /api/openai-proxy/v1/chat/completions
 * Format: OpenAI-compatible (industry standard)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  // Debug logging
  console.log('[PROXY] Request received at:', new Date().toISOString());
  console.log('[PROXY] User-Agent:', req.headers.get('user-agent'));
  console.log('[PROXY] URL:', req.url);
  
  // Check required environment variables
  if (!GEMINI_API_KEY) {
    console.error('[PROXY] ERROR: GEMINI_API_KEY not configured');
    return NextResponse.json(
      { error: { message: 'GEMINI_API_KEY is not configured' } },
      { status: 500 }
    );
  }
  
  try {
    // Extract candidate UUID from Authorization header
    const authHeader = req.headers.get('authorization');
    const candidateId = authHeader?.replace(/^Bearer\s+/i, '').trim() || null;
    console.log('[PROXY] Candidate ID:', candidateId);
    
    if (!candidateId) {
      return NextResponse.json(
        { error: { message: 'Missing or invalid Authorization header' } },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(candidateId)) {
      return NextResponse.json(
        { error: { message: 'Invalid candidate ID format' } },
        { status: 401 }
      );
    }

    // Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: { message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const promptText = extractOpenAIPrompt(body);
    
    // Force gemini-1.5-flash for free tier if no gemini model is specified
    // or if an OpenAI model name is passed that Gemini might not map correctly.
    const model = body.model?.includes('gemini') ? body.model : 'gemini-1.5-flash';
    body.model = model;
    
    const toolName = detectToolName(userAgent);
    console.log('[PROXY] Tool detected:', toolName);
    console.log('[PROXY] Model:', model);
    console.log('[PROXY] Prompt preview:', promptText.substring(0, 100));
    console.log('[PROXY] Supabase configured:', !!supabase);
    
    // Log to Supabase (async) - only if Supabase is configured
    if (supabase) {
      console.log('[PROXY] Logging prompt to Supabase...');
      logPromptAsync({
        candidateId,
        promptText,
        promptJson: body,
        provider: 'gemini-openai', // Mark as Gemini via OpenAI compatibility
        toolName,
        userAgent,
        modelRequested: model,
        requestMetadata: {
          ...body,
          messages: undefined, // Remove large messages array from metadata
        },
      });
    }

    // Forward to Gemini's OpenAI-compatible API
    const geminiUrl = `${GEMINI_OPENAI_BASE_URL}/chat/completions`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const responseTime = Date.now() - startTime;
    let responseData: any;
    let responseStatus = response.status;
    
    try {
      responseData = await response.json();
    } catch (error) {
      const text = await response.text();
      responseData = { error: { message: text }, status: response.status };
    }
    
    // Update log with response (async) - only if Supabase is configured
    if (supabase) {
      updateLogWithResponseAsync({
        candidateId,
        responseStatus,
        responseTime,
        tokensUsed: extractOpenAITokens(responseData),
        responseJson: responseData,
      });
    }

    return NextResponse.json(responseData, {
      status: responseStatus,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Gemini-proxy error:', error);
    return NextResponse.json(
      { error: { message: 'Internal proxy error', details: error.message } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    service: 'Hermes Gemini-Powered Proxy',
    status: 'operational',
    version: '1.0.0',
    format: 'OpenAI-compatible',
    endpoint: '/api/openai-proxy/v1/chat/completions',
    model: 'gemini-1.5-flash'
  });
}

function extractOpenAIPrompt(body: any): string {
  try {
    // OpenAI format: { messages: [{ role: "user", content: "..." }] }
    if (body.messages && Array.isArray(body.messages)) {
      return body.messages
        .map((m: any) => {
          if (typeof m.content === 'string') {
            return m.content;
          }
          if (Array.isArray(m.content)) {
            return m.content
              .map((c: any) => c.text || JSON.stringify(c))
              .join(' ');
          }
          return JSON.stringify(m);
        })
        .join('\n');
    }
    return JSON.stringify(body);
  } catch (error) {
    return JSON.stringify(body);
  }
}

function extractOpenAITokens(response: any): number | null {
  if (response.usage?.total_tokens) {
    return response.usage.total_tokens;
  }
  return null;
}

function detectToolName(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('cursor')) return 'Cursor';
  if (ua.includes('continue')) return 'Continue.dev';
  if (ua.includes('cody')) return 'Cody';
  if (ua.includes('vscode')) return 'VS Code';
  if (ua.includes('openai')) return 'OpenAI';
  return 'Unknown';
}

async function logPromptAsync(data: {
  candidateId: string;
  promptText: string;
  promptJson: any;
  provider: string;
  toolName: string;
  userAgent: string;
  modelRequested: string;
  requestMetadata: any;
}) {
  if (!supabase) {
    console.warn('[PROXY] Supabase not configured, skipping log');
    return; // Skip if Supabase not configured
  }
  
  (async () => {
    try {
      console.log('[PROXY] Calling log_prompt RPC for candidate:', data.candidateId);
      await supabase.rpc('log_prompt', {
        p_candidate_id: data.candidateId,
        p_prompt_text: data.promptText,
        p_prompt_json: data.promptJson,
        p_provider: data.provider,
        p_tool_name: data.toolName,
        p_user_agent: data.userAgent,
        p_model_requested: data.modelRequested,
        p_request_metadata: data.requestMetadata,
        p_response_status: null,
        p_response_time_ms: null,
        p_tokens_used: null,
        p_response_json: null,
      });
      console.log('[PROXY] Prompt logged successfully');
    } catch (error) {
      console.error('[PROXY] Failed to log prompt:', error);
    }
  })();
}

async function updateLogWithResponseAsync(data: {
  candidateId: string;
  responseStatus: number;
  responseTime: number;
  tokensUsed: number | null;
  responseJson: any;
}) {
  if (!supabase) return; // Skip if Supabase not configured
  
  (async () => {
    try {
      await supabase.rpc('update_prompt_log_response', {
        p_candidate_id: data.candidateId,
        p_response_status: data.responseStatus,
        p_response_time_ms: data.responseTime,
        p_tokens_used: data.tokensUsed,
        p_response_json: data.responseJson,
      });
    } catch (error) {
      console.error('Failed to update prompt log with response:', error);
    }
  })();
}

