import { cookies } from 'next/headers';

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

// Use internal API URL for server-side requests if available, otherwise fall back to public
const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchServer<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  console.log(`[SSR] Fetching: ${url}`); // Debug Log

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || 'no-store', // Default to no-store for dynamic data
  });

  if (!response.ok) {
    if (response.status !== 401) {
       console.error(`[SSR] Failed: ${url} - Status: ${response.status}`); // Debug Log
    }
    // Attempt to parse error message
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parse error if response body is not JSON
    }
    throw { status: response.status, message: errorMessage };
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

