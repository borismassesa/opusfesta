"use client";

import { useParams } from "next/navigation";
import { VendorCollectionView } from "@/components/vendors/VendorCollectionView";

export default function VendorCollectionPage() {
  const params = useParams<{ slug: string }>();

  return <VendorCollectionView collectionKey={params?.slug ?? ""} />;
}
