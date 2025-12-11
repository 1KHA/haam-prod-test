# Reports API Usage Guide

This document outlines how to use the enhanced Reports API endpoints with token authentication support in the URL parameters.

## Overview

The Reports API has been updated to support token-based authentication via URL parameters. This enhancement allows direct browser access to certain endpoints (like download, print, export) while maintaining security through JWT tokens.

## API Endpoints with Token Support

The following endpoints now support token authentication through URL parameters:

### 1. Download Report

```
GET /api/admin/reports/download?id={reportId}&token={jwtToken}
```

- **Purpose**: Download a report file
- **Parameters**:
  - `id` - The ID of the report to download
  - `token` - JWT token for authentication
- **Response**: File download response

### 2. Print Report

```
GET /api/admin/reports/print?id={reportId}&token={jwtToken}
```

- **Purpose**: Display a printable version of a report
- **Parameters**:
  - `id` - The ID of the report to print
  - `token` - JWT token for authentication
- **Response**: HTML page with print formatting

### 3. Export Reports

```
GET /api/admin/reports/export?exportFormat={format}&token={jwtToken}
```

- **Purpose**: Export reports in bulk in specified format
- **Parameters**:
  - `exportFormat` - Format for export (csv, xlsx)
  - `token` - JWT token for authentication
  - Additional filter parameters supported: `search`, `category`, `status`, `format`
- **Response**: File download of exported data

### 4. View Report

```
GET /api/admin/reports/view?id={reportId}&token={jwtToken}
```

- **Purpose**: View report details and metadata
- **Parameters**:
  - `id` - The ID of the report to view
  - `token` - JWT token for authentication
  - `skipViewIncrement` - Optional boolean to prevent incrementing view count
- **Response**: JSON with report details

### 5. Share Report History

```
GET /api/admin/reports/share?reportId={reportId}&token={jwtToken}
```

- **Purpose**: View share history for a report
- **Parameters**:
  - `reportId` - The ID of the report 
  - `token` - JWT token for authentication
- **Response**: JSON with share history

## Implementation Details

### How Token Authentication Works

1. **Token in URL**: When a token is provided in the URL as a query parameter, the API extracts it and uses it for authentication.
2. **Header Creation**: The token is placed into an Authorization header (`Bearer {token}`) for authentication processing.
3. **Fallback**: If no token is provided in the URL, the API falls back to using the Authorization header that was sent with the request.

### Security Considerations

- The token in URL is primarily intended for direct browser access scenarios like downloads, prints, and exports.
- For programmatic API access, the standard Authorization header is still preferred.
- Tokens in URLs may be logged in server logs, so this approach should be used with appropriate consideration.

## Testing

A test interface is available to easily test the Reports API:

1. Start the Next.js development server with `npm run dev`
2. In a separate terminal, run the test server with `node test-reports-server.js`
3. Open `http://localhost:3001` in your browser
4. Enter your JWT token in the provided field and test the various endpoints

## Example Usage

### Browser Direct Link to Download

```html
<a href="/api/admin/reports/download?id=report-123&token=eyJhbGciOiJIUzI1NiIsInR..." target="_blank">Download Report</a>
```

### Email Template with Print Link

```html
<p>Your report is ready. <a href="/api/admin/reports/print?id=report-123&token=eyJhbGciOiJIUzI1NiIsInR..." target="_blank">Click here to print</a></p>
```

### Export Button with Token

```javascript
function exportReports(token) {
  window.open(`/api/admin/reports/export?exportFormat=xlsx&token=${encodeURIComponent(token)}`);
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- 400 - Bad Request (missing parameters)
- 401 - Unauthorized (invalid token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found (report doesn't exist)
- 500 - Internal Server Error
