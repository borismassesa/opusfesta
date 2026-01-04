'use client';

import { useState, useEffect } from 'react';
import { useContent } from '@/context/ContentContext';
import { ResponsivePreview } from '@/components/preview/ResponsivePreview';

export default function PreviewPage() {
  const { loadAdminContent } = useContent();
  const [previewNonce, setPreviewNonce] = useState(0);

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  // Refresh preview when content is saved
  useEffect(() => {
    const handleContentSaved = () => {
      setPreviewNonce(prev => prev + 1);
    };

    window.addEventListener('content-saved', handleContentSaved);
    return () => {
      window.removeEventListener('content-saved', handleContentSaved);
    };
  }, []);

  // Get the preview URL - this should point to your website app homepage (not vendor-portal or admin)
  // The website app runs on port 3002 (Next.js will use next available port if 3000 is taken)
  // Set NEXT_PUBLIC_WEBSITE_URL to override (e.g., http://localhost:3002)
  // IMPORTANT: This must point to the website app's homepage (/) with ?preview=draft
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002';
  // Ensure we're pointing to the root path of the website app, not /admin
  const previewUrl = `${websiteUrl.replace(/\/$/, '')}/?preview=draft&v=${previewNonce}`;
  
  // Debug: Log the preview URL to help troubleshoot
  useEffect(() => {
    console.log('[Admin Preview] ===========================================');
    console.log('[Admin Preview] Preview URL:', previewUrl);
    console.log('[Admin Preview] Website URL env var:', process.env.NEXT_PUBLIC_WEBSITE_URL || 'not set (using default: localhost:3002)');
    console.log('[Admin Preview] Expected: Website homepage with draft content');
    console.log('[Admin Preview] ===========================================');
  }, [previewUrl]);

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden p-6">
        <ResponsivePreview 
          previewUrl={previewUrl} 
          previewNonce={previewNonce}
          onRefresh={() => setPreviewNonce(prev => prev + 1)}
        />
      </div>
    </div>
  );
}
