/**
 * API client utility for making authenticated requests
 */

/**
 * Makes an authenticated fetch request by adding the auth token from localStorage
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  
  // Create headers with auth token if available
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  // Return fetch with the auth headers
  return fetch(url, {
    ...options,
    headers
  });
}
