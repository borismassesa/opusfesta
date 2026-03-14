'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SignaturePad from '@/components/booking/SignaturePad';

interface ContractData {
  booking: { name: string; email: string; event_type: string };
  contract: {
    contract_number: string;
    content_html: string;
    sign_deadline: string | null;
    signed_at: string | null;
  };
}

export default function ContractSignPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/contract/view?token=${token}`);
        if (!res.ok) throw new Error('Failed to load contract');
        const json = await res.json();
        setData(json);
        if (json.contract?.signed_at) setSigned(true);
      } catch {
        setError('Unable to load contract. The link may have expired.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSign(sigData: { signatureData: string; signatureType: 'draw' | 'type'; signerName: string }) {
    setSigning(true);
    setError(null);
    try {
      const res = await fetch('/api/booking/contract/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signerName: sigData.signerName || data?.booking.name,
          signatureData: sigData.signatureData,
          signatureType: sigData.signatureType,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      setSigned(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return <div className="h-64 border-3 border-brand-border bg-white animate-pulse" />;
  }

  if (error && !data) {
    return (
      <div className="border-3 border-red-500 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Contract Unavailable</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { booking, contract } = data;

  // Contract HTML is admin-authored via TipTap rich text editor (trusted content).
  // It is NOT user-generated input. The admin creates it through the admin dashboard.
  const contractHtml = contract.content_html;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Service Contract
        </h1>
        <p className="text-brand-muted mt-1">
          Contract {contract.contract_number} for {booking.name}
        </p>
      </div>

      {signed && (
        <div className="border-3 border-green-500 bg-green-50 p-6 text-center">
          <h2 className="text-xl font-bold text-green-700">Contract Signed!</h2>
          <p className="text-green-600 mt-1">
            You&apos;ll receive a deposit payment link shortly.
          </p>
        </div>
      )}

      {contract.sign_deadline && !signed && (
        <div className="border-3 border-brand-accent bg-brand-panel p-4 text-center">
          <span className="text-sm font-bold text-brand-accent font-mono">
            SIGN BY: {new Date(contract.sign_deadline).toLocaleDateString('en-TZ', { dateStyle: 'full' })}
          </span>
        </div>
      )}

      <div className="border-3 border-brand-border bg-white">
        <div className="bg-brand-dark text-white px-6 py-3">
          <span className="font-mono font-bold text-sm uppercase tracking-wider">
            Contract — {contract.contract_number}
          </span>
        </div>
        {/* Contract content is admin-authored via TipTap editor, not user-generated */}
        <div
          className="px-6 py-8 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: contractHtml }}
        />
      </div>

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {!signed && (
        <div className="border-3 border-brand-border bg-white p-6">
          {!showSignature ? (
            <div className="text-center space-y-4">
              <p className="text-brand-muted text-sm">
                By signing below, you agree to the terms outlined in this contract.
              </p>
              <button
                onClick={() => setShowSignature(true)}
                className="border-3 border-brand-border bg-brand-dark text-white px-8 py-4 font-mono font-bold uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
              >
                PROCEED TO SIGN
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-brand-dark mb-4 font-mono uppercase tracking-wider text-sm">
                Your Signature
              </h3>
              <SignaturePad onSign={handleSign} loading={signing} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
