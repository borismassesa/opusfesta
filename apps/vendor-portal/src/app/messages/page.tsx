'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessagesPage } from '@/components/messages/MessagesPage';
import { supabase } from '@/lib/supabase/client';
import { getVendorByUserId, type Vendor } from '@/lib/supabase/vendor';
import { Loader2 } from 'lucide-react';

function MessagesContent() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user ID from Supabase auth
  useEffect(() => {
    let mountedRef = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mountedRef) return;
      
      if (error || !session) {
        setIsLoading(false);
        return;
      }

      setUserId(session.user.id);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef) return;

      if (!session) {
        setUserId(null);
      } else {
        setUserId(session.user.id);
      }
    });

    return () => {
      mountedRef = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch vendor data
  useEffect(() => {
    if (!userId) return;

    const fetchVendor = async () => {
      setIsLoading(true);
      const vendorData = await getVendorByUserId(userId);
      if (vendorData) {
        setVendor(vendorData);
      } else {
        // If no vendor profile exists, redirect to storefront to create one
        router.push('/storefront');
      }
      setIsLoading(false);
    };

    fetchVendor();
  }, [userId, router]);

  if (isLoading) {
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
