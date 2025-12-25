import { fetchWithAgent } from '@/lib/fetch-agent';

/**
 * SSE (Server-Sent Events) Proxy Route
 *
 * This route proxies SSE connections from the frontend to the backend API.
 * It's necessary because:
 * 1. EventSource doesn't support custom headers (for Authorization)
 * 2. We need to accept self-signed SSL certificates in development
 * 3. We need to properly forward the streaming response
 */

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

export async function GET() {
  // Create a TransformStream for the SSE connection
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Construct the backend SSE URL
  const backendUrl = `${BACKEND_API_URL}/api/speeds/stream`;

  // Prepare headers
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
  };

  // Add Bearer token if configured
  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  // Start the SSE connection to backend
  (async () => {
    try {
      // Use fetchWithAgent which properly handles HTTPS certificates in development
      const response = await fetchWithAgent(backendUrl, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Backend SSE connection failed: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      // Forward the streaming response
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          await writer.close();
          break;
        }

        // Forward the chunk as-is
        const chunk = decoder.decode(value, { stream: true });
        await writer.write(encoder.encode(chunk));
      }
    } catch (error) {
      console.error('SSE proxy error:', error);

      // Send error event to client
      const errorMessage = `event: error\ndata: ${JSON.stringify({
        error: 'SSE connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      })}\n\n`;

      await writer.write(encoder.encode(errorMessage));
      await writer.close();
    }
  })();

  // Return the streaming response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
