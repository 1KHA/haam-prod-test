/**
 * Frontend export utility functions for CSV delimiter detection and URL building
 */

/**
 * Detects if the current environment should use semicolon delimiter for CSV exports
 * This is especially important for Excel in Arabic environments
 */
export function shouldUseSemicolonDelimiter(): boolean {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return false;
  }

  // Get user's locale from browser
  const userLocale = navigator.language || 'en-US';
  const locales = navigator.languages || [userLocale];
  
  // Arabic locales that commonly use semicolon delimiters in Excel
  const arabicLocales = [
    'ar', 'ar-SA', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 
    'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA',
    'ar-OM', 'ar-QA', 'ar-SY', 'ar-TN', 'ar-YE'
  ];

  // Check if any of the user's preferred locales are Arabic
  const isArabicLocale = locales.some(locale => 
    arabicLocales.some(arabicLocale => 
      locale.toLowerCase().startsWith(arabicLocale.toLowerCase())
    )
  );

  // Also check timezone for Gulf region (common Excel semicolon usage)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const gulfTimezones = [
    'Asia/Riyadh', 'Asia/Kuwait', 'Asia/Qatar', 'Asia/Bahrain',
    'Asia/Dubai', 'Asia/Muscat', 'Asia/Baghdad'
  ];
  
  const isGulfTimezone = gulfTimezones.includes(timezone);

  // Return true if Arabic locale or Gulf timezone detected
  return isArabicLocale || isGulfTimezone;
}

/**
 * Builds export URL with proper delimiter parameter for current environment
 */
export function buildExportURL(baseUrl: string, queryParams: URLSearchParams = new URLSearchParams()): string {
  // Add delimiter parameter if needed for Arabic/Gulf environments
  if (shouldUseSemicolonDelimiter() && !queryParams.has('delimiter')) {
    queryParams.set('delimiter', ';');
  }

  // Build final URL
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Creates a comprehensive export function that handles authentication, URL building, and download
 */
export async function exportCSV(options: {
  baseUrl: string;
  filename?: string;
  queryParams?: URLSearchParams;
  token?: string | null;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}): Promise<void> {
  const {
    baseUrl,
    filename,
    queryParams = new URLSearchParams(),
    token,
    successMessage = 'تم تصدير البيانات بنجاح',
    errorMessage = 'فشل في تصدير البيانات',
    onSuccess,
    onError
  } = options;

  try {
    // Build the export URL with proper delimiter
    const exportUrl = buildExportURL(baseUrl, queryParams);

    // Create fetch request with authentication
    const response = await fetch(exportUrl, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Read as raw bytes and wrap with explicit charset so the browser does
    // not re-encode the content.  The file is already UTF-16 LE with BOM.
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'text/csv;charset=utf-16le' });
    const downloadUrl = window.URL.createObjectURL(blob);

    // Create and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `export-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    window.URL.revokeObjectURL(downloadUrl);

    // Success callback
    if (onSuccess) {
      onSuccess();
    }

  } catch (error) {
    console.error('Export error:', error);
    const errorMsg = error instanceof Error ? error.message : errorMessage;
    
    if (onError) {
      onError(errorMsg);
    } else {
      throw error; // Re-throw if no error handler provided
    }
  }
}

/**
 * Gets the current authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
}

/**
 * Helper to add common query parameters for filtering
 */
export function addFilterParams(params: URLSearchParams, filters: {
  search?: string;
  status?: string;
  role?: string;
  industry?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}): URLSearchParams {
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.set(key, value.trim());
    }
  });
  
  return params;
}

/**
 * Pre-configured export function for common use cases
 */
export const exportPresets = {
  /**
   * Export users with standard filtering
   */
  async users(filters: {
    search?: string;
    role?: string;
    status?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/users/export',
      filename: `users-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات المستخدمين بنجاح',
      errorMessage: 'فشل في تصدير بيانات المستخدمين',
      ...customOptions
    });
  },

  /**
   * Export startups with standard filtering
   */
  async startups(filters: {
    search?: string;
    status?: string;
    industry?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/startups/export',
      filename: `startups-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات الشركات الناشئة بنجاح',
      errorMessage: 'فشل في تصدير بيانات الشركات الناشئة',
      ...customOptions
    });
  },

  /**
   * Export events with standard filtering
   */
  async events(filters: {
    search?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/events/export',
      filename: `events-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات الفعاليات بنجاح',
      errorMessage: 'فشل في تصدير بيانات الفعاليات',
      ...customOptions
    });
  },

  /**
   * Export payments with standard filtering
   */
  async payments(filters: {
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/payments/export',
      filename: `payments-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات المدفوعات بنجاح',
      errorMessage: 'فشل في تصدير بيانات المدفوعات',
      ...customOptions
    });
  },

  /**
   * Export programs with standard filtering
   */
  async programs(filters: {
    search?: string;
    status?: string;
    type?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/programs/export',
      filename: `programs-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات البرامج بنجاح',
      errorMessage: 'فشل في تصدير بيانات البرامج',
      ...customOptions
    });
  },

  /**
   * Export security logs with standard filtering
   */
  async securityLogs(filters: {
    search?: string;
    level?: string;
    dateFrom?: string;
    dateTo?: string;
    ids?: string;
    [key: string]: string | undefined;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/security/logs/export',
      filename: `security-logs-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير سجلات الأمان بنجاح',
      errorMessage: 'فشل في تصدير سجلات الأمان',
      ...customOptions
    });
  },

  /**
   * Export notifications with standard filtering
   */
  async notifications(filters: {
    search?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/notifications/export',
      filename: `notifications-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات الإشعارات بنجاح',
      errorMessage: 'فشل في تصدير بيانات الإشعارات',
      ...customOptions
    });
  },

  /**
   * Export reports with standard filtering
   */
  async reports(filters: {
    search?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    ids?: string;
    category?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/reports/export',
      filename: `reports-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات التقارير بنجاح',
      errorMessage: 'فشل في تصدير بيانات التقارير',
      ...customOptions
    });
  },

  /**
   * Export funding with standard filtering
   */
  async funding(filters: {
    search?: string;
    status?: string;
    fundingType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/financing/funding/export',
      filename: `funding-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير بيانات التمويل بنجاح',
      errorMessage: 'فشل في تصدير بيانات التمويل',
      ...customOptions
    });
  },

  /**
   * Export financing (combined funding and payments) with standard filtering
   */
  async financing(filters: {
    search?: string;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    startupId?: string;
  } = {}, customOptions: Partial<Parameters<typeof exportCSV>[0]> = {}) {
    const queryParams = new URLSearchParams();
    addFilterParams(queryParams, filters);
    
    return exportCSV({
      baseUrl: '/api/admin/financing/export',
      filename: `financing-export-${new Date().toISOString().split('T')[0]}.csv`,
      queryParams,
      token: getAuthToken(),
      successMessage: 'تم تصدير البيانات المالية بنجاح',
      errorMessage: 'فشل في تصدير البيانات المالية',
      ...customOptions
    });
  }
};

/**
 * Export configuration for different data types
 */
export const exportConfig = {
  delimiters: {
    comma: ',',
    semicolon: ';',
    tab: '\t',
    pipe: '|'
  },
  
  defaultDelimiter: shouldUseSemicolonDelimiter() ? ';' : ',',
  
  fileExtensions: {
    csv: '.csv',
    xlsx: '.xlsx',
    json: '.json'
  }
};
