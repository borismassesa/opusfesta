'use client';

import { useState, useEffect, useMemo } from 'react';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponsivePreviewProps {
  previewUrl: string;
  previewNonce?: number;
  onRefresh?: () => void;
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

export function ResponsivePreview({ previewUrl, previewNonce = 0, onRefresh }: ResponsivePreviewProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceSize>('desktop');
  const [containerWidth, setContainerWidth] = useState(0);
  const [manualScale, setManualScale] = useState<number | null>(null);
  const [iframeKey, setIframeKey] = useState(`${previewUrl}-${previewNonce}`);

  // Update iframe key when previewNonce changes to force reload
  useEffect(() => {
    const newKey = `${previewUrl}-${previewNonce}-${Date.now()}`;
    console.log('[ResponsivePreview] Updating iframe key:', newKey);
    setIframeKey(newKey);
  }, [previewNonce, previewUrl]);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('preview-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate auto scale separately
  const autoScale = useMemo(() => {
    const baseConfig = {
      desktop: { width: 1280 },
      tablet: { width: 768 },
      mobile: { width: 375 },
    };
    const config = baseConfig[activeDevice];
    const padding = 64;
    const availableWidth = containerWidth > 0 ? containerWidth - padding : 1200;
    const calculated = Math.min(1, (availableWidth - 20) / config.width);
    return Math.max(0.2, Math.min(2, calculated));
  }, [activeDevice, containerWidth]);

  const deviceConfig = useMemo(() => {
    const baseConfig = {
      desktop: {
        width: 1280,
        height: 800,
        label: 'Desktop',
        icon: Monitor,
      },
      tablet: {
        width: 768,
        height: 1024,
        label: 'Tablet',
        icon: Tablet,
      },
      mobile: {
        width: 375,
        height: 667,
        label: 'Mobile',
        icon: Smartphone,
      },
    };

    const config = baseConfig[activeDevice];
    
    // Use manual scale if set, otherwise use auto scale
    const scale = manualScale !== null ? manualScale : autoScale;
    
    return {
      ...config,
      scale: Math.max(0.2, Math.min(2, scale)), // Clamp between 0.2 and 2
    };
  }, [activeDevice, autoScale, manualScale]);

  const handleZoomIn = () => {
    const currentScale = manualScale ?? autoScale;
    const newScale = Math.min(2, currentScale + 0.1);
    setManualScale(newScale);
  };

  const handleZoomOut = () => {
    const currentScale = manualScale ?? autoScale;
    const newScale = Math.max(0.2, currentScale - 0.1);
    setManualScale(newScale);
  };

  const handleReset = () => {
    setManualScale(null);
  };

  const handleScaleChange = (value: number) => {
    setManualScale(value);
  };

  const Icon = deviceConfig.icon;

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-background">
      {/* Device Selector and Zoom Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-border flex-shrink-0 bg-background">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Preview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            See how your content appears on different devices
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={deviceConfig.scale <= 0.2}
              className="h-8 w-8 p-0"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-[80px] max-w-[120px]">
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.05"
                value={deviceConfig.scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((deviceConfig.scale - 0.2) / 1.8) * 100}%, hsl(var(--muted)) ${((deviceConfig.scale - 0.2) / 1.8) * 100}%, hsl(var(--muted)) 100%)`
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={deviceConfig.scale >= 2}
              className="h-8 w-8 p-0"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={manualScale === null}
              className="h-8 w-8 p-0"
              title="Reset to auto scale"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-2 min-w-[45px]">
              <span className="text-xs font-medium text-foreground">
                {Math.round(deviceConfig.scale * 100)}%
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-border mx-1"></div>

          {/* Refresh Button */}
          {onRefresh && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
                title="Refresh preview"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <div className="h-5 w-px bg-border mx-1"></div>
            </>
          )}

          {/* Device Size Switchers */}
          <div className="flex items-center gap-1.5">
            {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((device) => {
              const DeviceIcon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
              const isActive = activeDevice === device;
              return (
                <Button
                  key={device}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveDevice(device)}
                  className="flex items-center gap-2"
                >
                  <DeviceIcon className="w-4 h-4" />
                  <span className="hidden xs:inline">
                    {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile'}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div 
        id="preview-container"
        className="flex items-start justify-center bg-muted/30 p-4 overflow-x-auto overflow-y-auto w-full h-full flex-1 min-h-0"
      >
        <div
          className="relative bg-background rounded-lg shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0"
          style={{
            width: `${deviceConfig.width}px`,
            height: `${deviceConfig.height}px`,
            transform: `scale(${deviceConfig.scale})`,
            transformOrigin: 'top center',
            border: '1px solid hsl(var(--border))',
            marginBottom: `${(deviceConfig.height * (1 - deviceConfig.scale))}px`,
            marginTop: activeDevice === 'mobile' ? '16px' : '24px',
          }}
        >
          {/* Device Frame Header */}
          <div 
            className="absolute flex items-center gap-1.5 bg-muted text-foreground px-2.5 py-1 rounded-t-md z-50 whitespace-nowrap border border-b-0 border-border"
            style={{
              top: activeDevice === 'mobile' ? '-24px' : '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <Icon className="w-3 h-3" />
            <span className="text-[10px] font-medium">{deviceConfig.label}</span>
          </div>

          {/* Browser Bar (Desktop) */}
          {activeDevice === 'desktop' && (
            <div className="h-10 bg-surface border-b border-border flex items-center gap-2 px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-xs text-muted-foreground mx-4 truncate">
                {previewUrl}
              </div>
            </div>
          )}

          {/* Mobile Status Bar */}
          {activeDevice === 'mobile' && (
            <div className="h-7 bg-foreground flex items-center justify-between px-4 text-background text-[10px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-background rounded-sm">
                  <div className="w-3 h-1.5 bg-background rounded-sm m-0.5"></div>
                </div>
                <div className="w-1 h-1.5 bg-background rounded-full"></div>
              </div>
            </div>
          )}

          {/* Tablet Status Bar */}
          {activeDevice === 'tablet' && (
            <div className="h-8 bg-foreground flex items-center justify-between px-5 text-background text-xs font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-2.5 border border-background rounded-sm">
                  <div className="w-4 h-2 bg-background rounded-sm m-0.5"></div>
                </div>
                <div className="w-1.5 h-2 bg-background rounded-full"></div>
              </div>
            </div>
          )}

          {/* Preview Content - Scrollable */}
          <div
            className="overflow-auto bg-background relative"
            style={{
              height: activeDevice === 'desktop' 
                ? 'calc(100% - 2.5rem)' 
                : activeDevice === 'tablet' 
                ? 'calc(100% - 2rem)' 
                : 'calc(100% - 1.75rem)',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div 
              className="relative"
              style={{ 
                width: `${deviceConfig.width}px`,
                height: `${deviceConfig.height}px`,
              }}
            >
              <iframe
                key={iframeKey}
                src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`}
                className="w-full h-full bg-white border-0"
                title="Preview"
                // Ensure the iframe uses an absolute URL and doesn't inherit basePath
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                style={{
                  width: `${deviceConfig.width}px`,
                  height: activeDevice === 'desktop' 
                    ? `${deviceConfig.height - 40}px` 
                    : activeDevice === 'tablet' 
                    ? `${deviceConfig.height - 32}px` 
                    : `${deviceConfig.height - 28}px`,
                }}
                onLoad={(e) => {
                  console.log('[ResponsivePreview] Iframe loaded, sending reload message');
                  // When iframe loads, try to send a message to reload content
                  const iframe = e.currentTarget as HTMLIFrameElement;
                  if (iframe?.contentWindow) {
                    try {
                      // Small delay to ensure iframe is fully ready
                      setTimeout(() => {
                        iframe.contentWindow?.postMessage({ type: 'reload-content', timestamp: Date.now() }, '*');
                        console.log('[ResponsivePreview] Reload message sent to iframe');
                      }, 100);
                    } catch (e) {
                      console.warn('[ResponsivePreview] Could not postMessage to iframe:', e);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
