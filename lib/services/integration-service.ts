import { fetchWithAuth, ApiResponse } from '@/lib/api-client';

export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  lastSync: string;
  icon: string;
  apiKey: string;
  webhookUrl: string;
  syncFrequency: string;
  dataAccess: string[];
  connectedBy: string;
  connectedDate: string;
}

export interface SyncResult {
  syncId: string;
  startTime: string;
  endTime: string;
  status: string;
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsDeleted: number;
  itemsFailed: number;
  error: string | null;
}

/**
 * Fetches all integrations with optional filtering
 */
export async function getIntegrations(filters?: {
  category?: string;
  status?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.search) queryParams.append('search', filters.search);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const response = await fetchWithAuth<any>(`/api/admin/integrations${queryString}`, {
    method: 'GET',
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data;
}

/**
 * Fetches a single integration by ID
 */
export async function getIntegration(id: string) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}`, {
    method: 'GET',
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.integration;
}

/**
 * Creates a new integration
 */
export async function createIntegration(data: Partial<Integration>) {
  const response = await fetchWithAuth<any>('/api/admin/integrations', {
    method: 'POST',
    body: JSON.stringify(data),
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.integration;
}

/**
 * Updates an existing integration
 */
export async function updateIntegration(id: string, data: Partial<Integration>) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.integration;
}

/**
 * Deletes an integration
 */
export async function deleteIntegration(id: string) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}`, {
    method: 'DELETE',
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data;
}

/**
 * Connects an integration with provided credentials
 */
export async function connectIntegration(id: string, credentials: { apiKey: string, webhookUrl?: string }) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}/connect`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.integration;
}

/**
 * Disconnects an integration
 */
export async function disconnectIntegration(id: string) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}/connect`, {
    method: 'DELETE',
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.integration;
}

/**
 * Triggers a manual sync for an integration
 */
export async function syncIntegration(id: string, options: { fullSync?: boolean } = {}) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}/sync`, {
    method: 'POST',
    body: JSON.stringify(options),
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return {
    integration: (response as ApiResponse<any>).data?.integration,
    syncResults: (response as ApiResponse<any>).data?.syncResults,
  };
}

/**
 * Gets the sync history for an integration
 */
export async function getSyncHistory(id: string) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}/sync`, {
    method: 'GET',
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.syncHistory;
}

/**
 * Copy webhook URL to clipboard
 */
export function copyWebhookUrl(webhookUrl: string): boolean {
  try {
    navigator.clipboard.writeText(webhookUrl);
    return true;
  } catch (error) {
    console.error('Failed to copy webhook URL', error);
    return false;
  }
}

/**
 * Generate a new API key (will be handled by the backend)
 */
export async function renewApiKey(id: string) {
  const response = await fetchWithAuth<any>(`/api/admin/integrations/${id}/apikey`, {
    method: 'POST',
  }, 'response');
  
  if ('error' in response && response.error) {
    throw new Error(response.error);
  }
  
  return (response as ApiResponse<any>).data?.integration;
}
