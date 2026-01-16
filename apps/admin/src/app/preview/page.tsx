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

  const getWebsiteUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    if (envUrl) return envUrl;
    if (typeof window === "undefined") return "http://localhost:3001";
    try {
      const url = new URL(window.location.origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        const currentPort = url.port || "3000";
        url.port = currentPort === "3000" ? "3001" : currentPort === "3001" ? "3000" : "3001";
        return url.toString().replace(/\/$/, "");
      }
      if (url.hostname.startsWith("admin.")) {
        url.hostname = url.hostname.replace(/^admin\./, "");
        return url.toString().replace(/\/$/, "");
      }
      return url.toString().replace(/\/$/, "");
    } catch {
      return "http://localhost:3001";
    }
  };

  // Ensure we're pointing to the root path of the website app, not /admin
  const previewUrl = `${getWebsiteUrl()}/?preview=draft&v=${previewNonce}`;
  
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
