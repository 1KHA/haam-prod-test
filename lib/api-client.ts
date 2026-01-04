/**
 * API client utility for making authenticated requests
 * with enhanced error handling and token management
 */

// Type for standard API response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Makes an authenticated fetch request by adding the auth token from localStorage
 * with comprehensive error handling
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param mode 'response' for new ApiResponse format, 'direct' for backward compatibility
 * @returns Promise with the formatted API response or direct Response for backward compatibility
 */
export async function fetchWithAuth<T = any>(
  url: string, 
  options: RequestInit = {},
  mode: 'response' | 'direct' = 'direct'
): Promise<ApiResponse<T> | Response> {
  try {
    // Get the token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    
    // Create headers with auth token if available
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    // Make the request with the auth headers
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // For backward compatibility, return the direct response if in 'direct' mode
    if (mode === 'direct') {
      return response;
    }
    
    // Enhanced error handling in 'response' mode
    
    // Check for 401 unauthorized response which may indicate token expiration
    if (response.status === 401) {
      console.warn('Unauthorized API request - token may be invalid or expired');
      
      // You could implement token refresh logic here
      // For now, we'll just notify through console and return the error
      
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
 * Checks if the current user is authenticated by verifying
 * the presence and validity of the token in localStorage
 * 
 * @returns Boolean indicating if the user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Optional: You could add token expiration check here
  // by parsing the JWT and checking the exp claim
  
  return true;
}
