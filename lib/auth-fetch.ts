/**
 * Helper for making authenticated fetch requests with HTTP-only cookies
 * The browser automatically sends the cookie - no manual token needed
 */

export interface FetchOptions extends RequestInit {
  // Add any custom options here
}

/**
 * Makes an authenticated fetch request using HTTP-only cookies
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise<Response>
 */
export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include', // Important: sends HTTP-only cookies automatically
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Legacy compatibility - returns empty string since token is in cookie
 * Kept for backward compatibility with existing code
 */
export function getAuthToken(): string {
  return '';
}
