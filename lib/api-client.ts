/**
 * API client utility for making authenticated requests
 * with enhanced error handling
 * 
 * Note: Authentication is now handled via HTTP-only cookies.
 * The browser automatically sends the cookie with each request.
 */

// Type for standard API response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Makes an authenticated fetch request
 * with comprehensive error handling
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param mode 'response' for new ApiResponse format, 'direct' for backward compatibility
 * @returns Promise with the formatted API response or direct Response for backward compatibility
 */
export async function fetchWithAuth<T = any>(url: string, options?: RequestInit): Promise<Response>; // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function fetchWithAuth<T = any>(url: string, options: RequestInit, mode: 'direct'): Promise<Response>; // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function fetchWithAuth<T = any>(url: string, options: RequestInit, mode: 'response'): Promise<ApiResponse<T>>; // eslint-disable-line @typescript-eslint/no-explicit-any
export async function fetchWithAuth<T = any>( // eslint-disable-line @typescript-eslint/no-explicit-any
  url: string, 
  options: RequestInit = {},
  mode: 'response' | 'direct' = 'direct'
): Promise<ApiResponse<T> | Response> {
  try {
    // Create headers - cookie is sent automatically by browser
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
    
    // Make the request - browser sends HTTP-only cookie automatically
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important: include cookies in cross-origin requests
    });
    
    // For backward compatibility, return the direct response if in 'direct' mode
    if (mode === 'direct') {
      return response;
    }
    
    // Enhanced error handling in 'response' mode
    
    // Check for 401 unauthorized response which may indicate token expiration
    if (response.status === 401) {
      console.warn('Unauthorized API request - token may be invalid or expired');
      
      return {
        error: 'Unauthorized - Please log in again',
        status: 401
      };
    }
    
    // Handle other error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        // Try to parse as JSON
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, use the raw text
        errorData = { error: errorText };
      }
      
      return {
        error: errorData.error || 'An error occurred',
        status: response.status
      };
    }
    
    // For no-content responses
    if (response.status === 204) {
      return { 
        status: 204 
      };
    }
    
    // Parse JSON response for successful requests
    let data: T;
    try {
      const responseClone = response.clone(); // Clone to avoid consuming the response
      data = await responseClone.json();
    } catch (e) {
      console.warn('Failed to parse JSON response', e);
      return {
        error: 'Invalid response format',
        status: 200
      };
    }
    
    return {
      data,
      status: response.status
    };
  } catch (error) {
    console.error('API request failed:', error);
    
    if (mode === 'direct') {
      // Return a mock Response object for compatibility
      return new Response(JSON.stringify({ error: 'Network request failed' }), { 
        status: 0, 
        statusText: error instanceof Error ? error.message : 'Network request failed' 
      });
    }
    
    return {
      error: error instanceof Error ? error.message : 'Network request failed',
      status: 0 // 0 indicates network error
    };
  }
}

/**
 * Checks if the current user is authenticated
 * Note: With HTTP-only cookies, we can't check client-side directly.
 * This function now returns a placeholder. Use /api/auth/me to verify auth.
 * 
 * @returns Boolean indicating if the user is likely authenticated (based on previous auth check)
 */
export function isAuthenticated(): boolean {
  // With HTTP-only cookies, we can't access the token client-side
  // The actual auth check is done server-side via the cookie
  // This function is kept for API compatibility but should not be relied upon
  if (typeof window === "undefined") return false;
  
  // Check for a client-side flag that indicates user was previously authenticated
  // This is not security-critical, just for UI state
  return document.cookie.includes('token=');
}
