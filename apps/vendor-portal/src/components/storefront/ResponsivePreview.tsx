'use client';

import { useState, useEffect, useMemo } from 'react';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorDetailsPreview } from './VendorDetailsPreview';
import { type Vendor } from '@/lib/supabase/vendor';

interface ResponsivePreviewProps {
  vendor: Vendor | null;
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

export function ResponsivePreview({ vendor }: ResponsivePreviewProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceSize>('desktop');
  const [containerWidth, setContainerWidth] = useState(0);
  const [manualScale, setManualScale] = useState<number | null>(null);

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
    <div className="flex flex-col h-full w-full">
      {/* Device Selector and Zoom Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Device Preview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Switch between desktop, tablet, and mobile views
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2 min-w-[100px] max-w-[150px]">
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.05"
                value={deviceConfig.scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
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
              className="h-8 w-8 p-0 sm:w-auto sm:px-3"
              title="Reset to auto scale"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Reset</span>
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm font-medium text-foreground">
                {Math.round(deviceConfig.scale * 100)}%
              </span>
              {manualScale !== null && (
                <span className="text-xs text-muted-foreground">(m)</span>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-border"></div>

          {/* Device Size Switchers */}
          <div className="flex items-center gap-2">
            {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((device) => {
              const config = deviceConfig;
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
        className="flex items-start justify-center bg-gradient-to-br from-muted/50 to-muted/30 p-2 sm:p-4 md:p-6 rounded-lg border border-border overflow-x-auto overflow-y-auto w-full flex-1 min-h-0"
      >
        <div
          className="relative bg-background rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl transition-all duration-300 overflow-hidden flex-shrink-0"
          style={{
            width: `${deviceConfig.width}px`,
            height: `${deviceConfig.height}px`,
            transform: `scale(${deviceConfig.scale})`,
            transformOrigin: 'top center',
            border: '6px solid hsl(var(--foreground))',
            marginBottom: `${Math.max(0, (deviceConfig.height * (1 - deviceConfig.scale)) * 0.3)}px`,
            marginTop: activeDevice === 'mobile' ? '10px' : '20px',
          }}
        >
          {/* Device Frame Header */}
          <div 
            className="absolute flex items-center gap-2 bg-foreground text-background px-3 sm:px-4 py-1.5 sm:py-2 rounded-t-lg z-50 whitespace-nowrap"
            style={{
              top: activeDevice === 'mobile' ? '-28px' : '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-medium">{deviceConfig.label}</span>
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
                thefesta.com/vendors/{vendor?.slug || 'your-vendor'}
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
                minHeight: '100%',
              }}
            >
              {/* Wrap in a container that ensures proper rendering */}
              <div style={{ position: 'relative', width: '100%' }}>
                <VendorDetailsPreview vendor={vendor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
