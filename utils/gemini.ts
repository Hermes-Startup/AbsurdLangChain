/// <reference types="node" />

/**
 * Gemini Client Utility
 * 
 * Handles communication with Gemini API.
 * Supports both direct Google API (via Key) and Custom Proxy/Base URL (via Bearer Token).
 */

const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SUPABASE_PRIVATE_KEY = process.env.SUPABASE_PRIVATE_KEY;

/**
 * Generates content using Gemini model.
 * Automatically selects between Custom Base URL or Direct Google API based on environment variables.
 * 
 * @param prompt The text prompt to send
 * @param model The model to use (default: gemini-pro)
 * @returns The generated text response
 */
export async function generateGeminiContent(
    prompt: string,
    model: string = "gemini-pro"
) {
    // Construct request body for Gemini API standard format
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    let url = "";
    let headers: Record<string, string> = {
        "Content-Type": "application/json"
    };

    if (GEMINI_BASE_URL && SUPABASE_PRIVATE_KEY) {
        // New Configuration: Use Custom Base URL with Supabase Private Key as Bearer Token
        const cleanBaseUrl = GEMINI_BASE_URL.replace(/\/$/, "");
        url = `${cleanBaseUrl}/v1beta/models/${model}:generateContent`;
        headers["Authorization"] = `Bearer ${SUPABASE_PRIVATE_KEY}`;

        // Note: When using proxy, the API Key might not be needed in query params 
        // if the proxy handles auth via the Bearer token.
    } else if (GOOGLE_API_KEY) {
        // Old/Fallback Configuration: Direct Google API call
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
    } else {
        throw new Error("Gemini Configuration Error: Missing 'GEMINI_BASE_URL' + 'SUPABASE_PRIVATE_KEY' or 'GOOGLE_API_KEY'");
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Gemini API Error: ${response.status} ${response.statusText}`;
            try {
                // Try to parse error details if JSON
                const errorJson = JSON.parse(errorText);
                if (errorJson.error?.message) {
                    errorMessage += ` - ${errorJson.error.message}`;
                }
            } catch (e) {
                errorMessage += ` - ${errorText.substring(0, 200)}`; // Truncate if long html
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Extract text from Gemini response structure
        const candidate = data.candidates?.[0];
        if (!candidate) {
            // Sometimes response is empty or filtered
            if (data.promptFeedback?.blockReason) {
                throw new Error(`Generation blocked: ${data.promptFeedback.blockReason}`);
            }
            return "";
        }

        const part = candidate.content?.parts?.[0];
        return part?.text || "";

    } catch (error: any) {
        console.error("Error generating content with Gemini:", error);
        throw error;
    }
}
