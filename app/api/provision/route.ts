import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * GET /api/provision
 *
 * Provisions credentials for new candidates.
 * Called automatically by yarn postinstall via auto-setup.js
 *
 * Returns:
 * - CANDIDATE_ID: Unique identifier for the candidate
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for prompt logging
 */
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PRIVATE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server not configured: missing Supabase credentials' },
      { status: 500 }
    );
  }

  // Generate a unique candidate ID
  const candidateId = `candidate-${randomUUID()}`;

  return NextResponse.json({
    CANDIDATE_ID: candidateId,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey,
  });
}
