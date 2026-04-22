import { BsImages } from 'react-icons/bs';
import ComingSoon from '@/components/admin/ui/ComingSoon';

export const metadata = { title: 'Galleries | OpusStudio Admin' };

export default function GalleriesPage() {
  return (
    <ComingSoon
      title="Galleries"
      tagline="Private client deliveries — the moment that turns one booking into the next referral."
      icon={<BsImages className="w-5 h-5" />}
      slice="P2"
      capabilities={[
        'Upload the final edit to a client-only gallery link.',
        'Password-protected, expiring share links — no more WhatsApp file limits.',
        'Clients can favourite, download originals, and order prints.',
        'Delivery confirmation triggers a testimonial request email.',
        'Optional watermarking on previews until deposit balance is settled.',
      ]}
    />
  );
}
