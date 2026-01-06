import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Creates a Gemini client that automatically routes through Hermes proxy
 * if GEMINI_BASE_URL is set in environment variables.
 * 
 * This enables "Glass Box" logging of all prompts without code changes.
 * 
 * The proxy identifies candidates via Authorization: Bearer <UUID> header,
 * where the UUID is the value of GOOGLE_API_KEY.
 * 
 * Usage:
 *   const model = createGeminiClient();
 *   const response = await model.invoke("Your prompt here");
 */
export function createGeminiClient(options?: {
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const apiKey = process.env.GOOGLE_API_KEY; // This is actually the candidate UUID
  const baseUrl = process.env.GEMINI_BASE_URL; // Your Hermes proxy URL
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  // Default model
  const modelName = options?.modelName || "gemini-2.0-flash-exp";

  // Create client configuration
  const clientConfig: any = {
    modelName,
    apiKey: apiKey, // This UUID will be sent as Bearer token to proxy
  };

  // If GEMINI_BASE_URL is set, configure to use proxy
  // LangChain's ChatGoogleGenerativeAI uses GoogleGenerativeAI client internally
  // which supports custom baseURL via the apiEndpoint option
  if (baseUrl) {
    // Clean the base URL (remove trailing slashes and /v1beta if present)
    const cleanBaseUrl = baseUrl.replace(/\/$/, '').replace(/\/v1beta.*$/, '');
    
    // For @langchain/google-genai, we can pass custom configuration
    // The underlying GoogleGenerativeAI client supports apiEndpoint
    clientConfig.configuration = {
      apiEndpoint: `${cleanBaseUrl}/v1beta`, // Proxy endpoint
    };
    
    // Note: The proxy will extract the UUID from Authorization header
    // LangChain will send: Authorization: Bearer <apiKey>
  }

  // Add optional parameters
  if (options?.temperature !== undefined) {
    clientConfig.temperature = options.temperature;
  }
  if (options?.maxOutputTokens !== undefined) {
    clientConfig.maxOutputTokens = options.maxOutputTokens;
  }

  return new ChatGoogleGenerativeAI(clientConfig);
}

/**
 * Alternative: Direct fetch to Gemini API (for non-LangChain usage)
 * This also routes through proxy if GEMINI_BASE_URL is set
 * 
 * The proxy identifies the candidate via Authorization: Bearer <UUID> header
 */
export async function callGeminiAPI(
  model: string,
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  const apiKey = process.env.GOOGLE_API_KEY; // This is the candidate UUID
  const baseUrl = process.env.GEMINI_BASE_URL || 
    'https://generativelanguage.googleapis.com/v1beta';
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set');
  }

  // Construct the API endpoint
  // If using proxy, baseUrl already includes /v1beta
  // If direct, we need to add it
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const endpoint = cleanBaseUrl.includes('/v1beta') 
    ? `${cleanBaseUrl}/models/${model}:generateContent`
    : `${cleanBaseUrl}/v1beta/models/${model}:generateContent`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: options?.temperature || 0.7,
      maxOutputTokens: options?.maxTokens || 2048,
    }
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // If using proxy (GEMINI_BASE_URL is set), use Bearer token with UUID
  // If direct API, use query parameter
  if (process.env.GEMINI_BASE_URL) {
    headers['Authorization'] = `Bearer ${apiKey}`; // UUID for proxy identification
  } else {
    // Direct API call - use query parameter
    const urlWithKey = `${endpoint}?key=${apiKey}`;
    const response = await fetch(urlWithKey, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Proxy call
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  return response.json();
}

