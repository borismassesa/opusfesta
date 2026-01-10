/**
 * Get the admin API URL
 * @param path - API path (e.g., '/api/admin/careers/jobs')
 * @returns Full URL (e.g., 'http://localhost:3002/api/admin/careers/jobs' or 'https://admin.opusfestaevents.com/api/admin/careers/jobs')
 */
export function getAdminApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use environment variable if set, otherwise use current origin
  // With subdomains, the origin already points to the admin subdomain, so no basePath needed
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002');
  
  // No basePath needed with subdomain routing
  return `${baseUrl}/${cleanPath}`;
}
