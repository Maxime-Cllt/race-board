import https from 'https';

/**
 * Custom HTTPS agent that accepts self-signed certificates in development
 * ⚠️ WARNING: Only use in development with local self-signed certificates
 * Never use in production as it bypasses SSL verification
 */
export const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
});

/**
 * Custom fetch wrapper that uses the HTTPS agent for server-side requests
 * This allows us to accept self-signed certificates in development
 */
export async function fetchWithAgent(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  // Only use the agent on the server side (Node.js environment)
  if (typeof window === 'undefined') {
    // @ts-ignore - agent is not in the standard fetch options but works in Node.js
    return fetch(url, { ...options, agent: httpsAgent });
  }

  // Client-side fetch doesn't support agent option
  return fetch(url, options);
}
