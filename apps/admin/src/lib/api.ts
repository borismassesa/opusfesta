/**
 * Get the admin API URL with basePath included
 * @param path - API path (e.g., '/api/admin/careers/jobs')
 * @returns Full URL including basePath (e.g., 'http://localhost:3002/admin/api/admin/careers/jobs')
 */
export function getAdminApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use environment variable if set, otherwise use current origin
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002');
  
  // Include basePath '/admin' in the URL
  return `${baseUrl}/admin/${cleanPath}`;
}
