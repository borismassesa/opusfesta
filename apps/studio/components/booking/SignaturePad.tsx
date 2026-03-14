'use client';

import { useRef, useState, useEffect } from 'react';

interface Props {
  onSign: (data: { signatureData: string; signatureType: 'draw' | 'type'; signerName: string }) => void;
  loading?: boolean;
}

export default function SignaturePad({ onSign, loading }: Props) {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function endDraw() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function handleSign() {
    if (mode === 'draw') {
      if (!hasDrawn) return;
      const data = canvasRef.current?.toDataURL('image/png') || '';
      onSign({ signatureData: data, signatureType: 'draw', signerName: '' });
    } else {
      if (!typedName.trim()) return;
      onSign({ signatureData: typedName.trim(), signatureType: 'type', signerName: typedName.trim() });
    }
  }

  const canSign = mode === 'draw' ? hasDrawn : typedName.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('draw')}
          className={`flex-1 border-3 px-4 py-2 font-mono text-sm font-bold transition-colors ${
            mode === 'draw'
              ? 'border-brand-accent bg-brand-accent text-white'
              : 'border-brand-border bg-white hover:bg-brand-bg'
          }`}
        >
          DRAW
        </button>
        <button
          onClick={() => setMode('type')}
          className={`flex-1 border-3 px-4 py-2 font-mono text-sm font-bold transition-colors ${
            mode === 'type'
              ? 'border-brand-accent bg-brand-accent text-white'
              : 'border-brand-border bg-white hover:bg-brand-bg'
          }`}
        >
          TYPE
        </button>
      </div>

      {mode === 'draw' ? (
        <div>
          <canvas
            ref={canvasRef}
            width={560}
            height={150}
            className="w-full border-3 border-brand-border bg-white cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <button
            onClick={clearCanvas}
            className="mt-2 text-sm font-bold text-brand-muted hover:text-brand-dark font-mono"
          >
            CLEAR
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={typedName}
            onChange={e => setTypedName(e.target.value)}
            placeholder="Type your full name as signature"
            className="w-full border-3 border-brand-border bg-white px-4 py-4 text-2xl font-serif italic text-brand-dark focus:border-brand-accent focus:outline-none"
          />
        </div>
      )}

      <button
        onClick={handleSign}
        disabled={!canSign || loading}
        className="w-full border-3 border-brand-border bg-brand-dark text-white px-6 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'SIGNING...' : 'SIGN CONTRACT'}
      </button>
    </div>
  );
}
