'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessagesPage } from '@/components/messages/MessagesPage';
import { useClerkSupabaseClient, useOpusFestaAuth } from '@opusfesta/auth';
import { getVendorByUserId, type Vendor } from '@/lib/supabase/vendor';
import { Loader2 } from 'lucide-react';

function MessagesContent() {
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const { user: authUser, isLoaded } = useOpusFestaAuth();
  const userId = authUser?.id || null;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vendor data
  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchVendor = async () => {
      setIsLoading(true);
      const vendorData = await getVendorByUserId(userId, supabase);
      if (vendorData) {
        setVendor(vendorData);
      } else {
        // If no vendor profile exists, redirect to storefront to create one
        router.push('/storefront');
      }
      setIsLoading(false);
    };

    fetchVendor();
  }, [userId, isLoaded, router, supabase]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  return <MessagesPage vendor={vendor} />;
}

export default function MessagesRoute() {
  return <MessagesContent />;
}
