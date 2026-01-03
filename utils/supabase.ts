import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Get candidate-specific Supabase client with schema "jailing"
 * 
 * The search_path parameter "jails" the candidate into their specific schema.
 * When they query `SELECT * FROM video_scripts`, they only see their own data.
 * But they can still JOIN against `public.viral_benchmarks` for reference data.
 * 
 * Implementation Note:
 * - The Supabase JS client doesn't support search_path directly in the connection
 * - For production, you would use a Postgres client with search_path in the connection string
 * - For now, we set search_path via a Postgres function call at the start of queries
 * - Alternatively, use schema-qualified table names: `${schemaName}.video_scripts`
 * 
 * @param candidateId - The candidate identifier (e.g., "aidan")
 * @returns Object with Supabase client and schema name for table references
 */
export async function getCandidateSupabaseClient(candidateId: string): Promise<{
  client: SupabaseClient;
  schemaName: string;
}> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PRIVATE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PRIVATE_KEY must be set in environment variables"
    );
  }

  // Generate schema name: sandbox_{candidate_id}
  const schemaName = `sandbox_${candidateId.toLowerCase().replace(/-/g, "_")}`;

  // Create Supabase client
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });

  // Set search_path for this connection/session
  // This "jails" the candidate to their schema
  // Note: In edge runtime, each request may use a new connection,
  // so we set it per-request. For production with connection pooling,
  // you'd set this once per connection.
  try {
    await client.rpc("set_candidate_search_path", {
      candidate_id: candidateId,
    });
  } catch (error) {
    // If the function doesn't exist or fails, we'll use schema-qualified names
    // This is a fallback for development/testing
    console.warn(
      `Could not set search_path for candidate ${candidateId}, using schema-qualified names instead`
    );
  }

  return { client, schemaName };
}

/**
 * Get public Supabase client for shared reference data
 * Used for reading viral_benchmarks, global_templates, etc.
 * 
 * Note: Use schema-qualified table names: `public.viral_benchmarks`
 */
export function getPublicSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PRIVATE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PRIVATE_KEY must be set in environment variables"
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Ensure candidate schema exists
 * Creates the schema and tables if they don't exist
 */
export async function ensureCandidateSchema(
  candidateId: string
): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PRIVATE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PRIVATE_KEY must be set in environment variables"
    );
  }

  // Use admin client to create schema
  const adminClient = createClient(supabaseUrl, supabaseKey);

  // Call the create_candidate_schema function
  const { data, error } = await adminClient.rpc("create_candidate_schema", {
    candidate_id: candidateId,
  });

  if (error) {
    // If schema already exists, that's fine
    if (error.message.includes("already exists")) {
      return `sandbox_${candidateId.toLowerCase().replace(/-/g, "_")}`;
    }
    throw error;
  }

  return data || `sandbox_${candidateId.toLowerCase().replace(/-/g, "_")}`;
}

/**
 * Extract candidate ID from request
 * Checks headers, query params, or environment variable
 */
export function getCandidateIdFromRequest(
  req: Request
): string | null {
  // Try to get from X-Candidate-Id header (set by proxy/middleware)
  const headerCandidateId = req.headers.get("x-candidate-id");
  if (headerCandidateId) {
    return headerCandidateId;
  }

  // Try to get from query parameter
  const url = new URL(req.url);
  const queryCandidateId = url.searchParams.get("candidate_id");
  if (queryCandidateId) {
    return queryCandidateId;
  }

  // Fallback to environment variable (for development/testing)
  const envCandidateId = process.env.CANDIDATE_ID;
  if (envCandidateId) {
    return envCandidateId;
  }

  return null;
}

