import { NextRequest, NextResponse } from 'next/server';
import { fetchWithAgent } from '@/lib/fetch-agent';

/**
 * API Proxy Route
 *
 * This route acts as a proxy between the frontend and the backend API.
 * It allows us to:
 * 1. Accept self-signed SSL certificates in development (via NODE_TLS_REJECT_UNAUTHORIZED=0)
 * 2. Avoid CORS issues
 * 3. Keep the API URL server-side only
 *
 * All requests to /api/proxy/* will be forwarded to the backend API
 * Example: /api/proxy/speeds/latest -> https://backend-api.com/api/speeds/latest
 */

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:8080';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

async function proxyRequest(request: NextRequest, method: string) {
  try {
    // Extract the path from the URL
    const { pathname, search } = new URL(request.url);
    const apiPath = pathname.replace('/api/proxy', '');

    // Construct the full backend URL
    const backendUrl = `${BACKEND_API_URL}${apiPath}${search}`;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Bearer token if configured
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    // Copy relevant headers from the original request
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      headers['X-Forwarded-For'] = forwardedFor;
    }

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
      const body = await request.json();
      options.body = JSON.stringify(body);
    }

    // Make the request using our custom fetch with HTTPS agent
    const response = await fetchWithAgent(backendUrl, options);

    // Get the response data
    const contentType = response.headers.get('content-type');

    // Handle different content types
    let data;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.arrayBuffer();
    }

    // Return the response with the same status code
    return new NextResponse(
      typeof data === 'string' || data instanceof ArrayBuffer ? data : JSON.stringify(data),
      {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle all HTTP methods
export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
