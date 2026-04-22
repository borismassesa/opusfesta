import { BsCashCoin } from 'react-icons/bs';
import ComingSoon from '@/components/admin/ui/ComingSoon';

export const metadata = { title: 'Payments | OpusStudio Admin' };

export default function PaymentsPage() {
  return (
    <ComingSoon
      title="Payments"
      tagline="Collect deposits fast, track balances, and never chase the same client twice."
      icon={<BsCashCoin className="w-5 h-5" />}
      slice="P1 · next"
      capabilities={[
        'Flutterwave integration for Tanzania mobile money (Airtel · HaloPesa · Tigo · Vodacom) and cards.',
        'Selcom as a secondary pay-by-link / QR option for invoices.',
        'Every booking auto-generates a deposit invoice with a share-ready payment link.',
        'Dashboard of pending, paid, and overdue balances at a glance.',
        'Automated receipts; admin-reviewed refunds with audit log.',
      ]}
    />
  );
}
