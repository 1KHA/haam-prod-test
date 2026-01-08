/**
 * CSV Utility functions for Arabic text handling and export functionality
 */

export interface CSVExportOptions {
  delimiter?: string;
  includeUTF8BOM?: boolean;
  filename?: string;
  headers: string[];
  data: Array<Record<string, any>>;
}

/**
 * Escapes CSV field content and handles Arabic text properly
 */
export function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  
  const stringValue = String(value);
  
  // Handle Arabic text and special characters
  const processedValue = stringValue
    .replace(/"/g, '""') // Escape quotes
    .replace(/\r?\n/g, ' ') // Replace line breaks with spaces
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .trim();
  
  return `"${processedValue}"`;
}

/**
 * Generates CSV content with proper Arabic text support
 */
export function generateCSV(options: CSVExportOptions): string {
  const { delimiter = ',', headers, data } = options;
  
  // Create CSV rows
  const csvRows: string[] = [];
  
  // Add header row
  csvRows.push(headers.map(header => escapeCsvField(header)).join(delimiter));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const key = getFieldKey(header, row);
      return escapeCsvField(row[key]);
    });
    csvRows.push(values.join(delimiter));
  });
  
  return csvRows.join('\n');
}

/**
 * Creates a CSV download response with proper headers and encoding
 */
export function createCSVResponse(options: CSVExportOptions): Response {
  const { filename = 'export.csv', includeUTF8BOM = true } = options;
  
  // Generate CSV content
  let csvContent = generateCSV(options);
  
  // Add UTF-8 BOM for proper Arabic text encoding
  if (includeUTF8BOM) {
    const bom = '\uFEFF';
    csvContent = bom + csvContent;
  }
  
  // Set response headers
  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Cache-Control', 'no-cache');
  
  return new Response(csvContent, {
    status: 200,
    headers: headers,
  });
}

/**
 * Helper function to get field key from row data
 * This handles cases where header names don't directly match data keys
 */
function getFieldKey(header: string, row: Record<string, any>): string {
  // First try direct match
  if (row.hasOwnProperty(header)) {
    return header;
  }
  
  // Try to find English key that corresponds to Arabic header
  const headerMappings: Record<string, string> = {
    'معرف المستخدم': 'id',
    'الاسم': 'name',
    'البريد الإلكتروني': 'email',
    'الدور': 'role',
    'الحالة': 'status',
    'التخصص': 'specialization',
    'تاريخ الإنشاء': 'createdAt',
    'تاريخ التحديث': 'updatedAt',
    'معرف الشركة': 'id',
    'اسم الشركة': 'name',
    'القطاع': 'industry',
    'المرحلة': 'stage',
    'حجم الفريق': 'teamSize',
    'الوصف': 'description',
    'المشكلة': 'problem',
    'الحل': 'solution',
    'السوق المستهدف': 'targetMarket',
    'نموذج العمل': 'businessModel',
    'الميزة التنافسية': 'competitiveAdvantage',
    'احتياجات التمويل': 'fundingNeeds',
    'اسم المنشئ': 'creatorName',
    'بريد المنشئ': 'creatorEmail',
    'المسرع/البرنامج': 'accelerator',
    'معرف الإشعار': 'id',
    'العنوان': 'title',
    'الرسالة': 'message',
    'النوع': 'type',
    'الأولوية': 'priority',
    'موعد الإرسال': 'scheduledFor',
    'تم الإرسال في': 'sentAt',
    'عدد المستلمين': 'recipients',
    'عدد القراءة': 'readCount',
    'معدل التفاعل': 'engagementRate',
    'منشئ الإشعار': 'createdBy',
    'معرف البرنامج': 'id',
    'اسم البرنامج': 'name',
    'الإصدار': 'version',
    'الفئة': 'category',
    'نوع الترخيص': 'license',
    'المورد': 'vendor',
    'مستوى الدعم': 'supportLevel',
    'تاريخ التثبيت': 'installDate',
    'آخر مزامنة': 'lastSync',
    'تم الربط بواسطة': 'connectedBy',
    'إصدار API': 'apiVersion',
    'رابط Webhook': 'webhookUrl',
    'تكرار المزامنة': 'syncFrequency',
    'البيانات المتاحة': 'dataAccess'
  };
  
  const mappedKey = headerMappings[header];
  if (mappedKey && row.hasOwnProperty(mappedKey)) {
    return mappedKey;
  }
  
  // If no mapping found, try to find similar key in row
  const rowKeys = Object.keys(row);
  const similarKey = rowKeys.find(key => 
    key.toLowerCase().includes(header.toLowerCase()) ||
    header.toLowerCase().includes(key.toLowerCase())
  );
  
  return similarKey || header;
}

/**
 * Formats date for CSV export
 */
export function formatDateForCSV(dateInput: string | Date | null): string {
  if (!dateInput) return '-';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return '-';
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Formats date with time for CSV export in Arabic locale
 */
export function formatDateTimeForCSV(dateInput: string | Date | null): string {
  if (!dateInput) return '-';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Default delimiter detection based on user locale or query parameter
 */
export function getDelimiterFromRequest(searchParams: URLSearchParams): string {
  const delimiter = searchParams.get('delimiter');
  
  if (delimiter) {
    return delimiter;
  }
  
  // Default to comma, but could be enhanced to detect based on Accept-Language header
  return ',';
}
