// ============================================================================
// Flutterwave API Client — Standard Payment Integration for Tanzania
// Supports Card + Mobile Money (Airtel, HaloPesa, Tigo, Vodacom)
// ============================================================================

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

interface FlutterwavePaymentOptions {
  amount: number;
  currency?: string;
  email: string;
  name: string;
  phone?: string;
  bookingId: string;
  paymentType: string;
  redirectUrl: string;
  meta?: Record<string, string>;
}

interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    customer: {
      email: string;
      name: string;
      phone_number: string;
    };
    created_at: string;
  };
}

function getHeaders(): Record<string, string> {
  if (!FLUTTERWAVE_SECRET_KEY) {
    throw new Error('FLUTTERWAVE_SECRET_KEY environment variable is required');
  }
  return {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

function generateTxRef(bookingId: string, paymentType: string): string {
  const timestamp = Date.now();
  return `OF-${bookingId.slice(0, 8)}-${paymentType}-${timestamp}`;
}

export async function initiatePayment(options: FlutterwavePaymentOptions): Promise<{
  success: boolean;
  paymentLink?: string;
  txRef?: string;
  error?: string;
}> {
  const txRef = generateTxRef(options.bookingId, options.paymentType);

  try {
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        tx_ref: txRef,
        amount: options.amount,
        currency: options.currency || 'TZS',
        redirect_url: options.redirectUrl,
        payment_options: 'card,mobilemoneytanzania',
        customer: {
          email: options.email,
          name: options.name,
          phonenumber: options.phone || '',
        },
        customizations: {
          title: 'OpusFesta Studio',
          description: `${options.paymentType} payment for booking`,
          logo: 'https://thefestaevents.com/logo.png',
        },
        meta: {
          booking_id: options.bookingId,
          payment_type: options.paymentType,
          ...options.meta,
        },
      }),
    });

    const data: FlutterwavePaymentResponse = await response.json();

    if (data.status === 'success') {
      return { success: true, paymentLink: data.data.link, txRef };
    }

    return { success: false, error: data.message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment initiation failed',
    };
  }
}

export async function verifyPayment(transactionId: string): Promise<{
  success: boolean;
  data?: FlutterwaveVerifyResponse['data'];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      { method: 'GET', headers: getHeaders() }
    );

    const result: FlutterwaveVerifyResponse = await response.json();

    if (result.status === 'success' && result.data.status === 'successful') {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      error: result.data?.status || result.message || 'Verification failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification request failed',
    };
  }
}

export function validateWebhookHash(
  requestHash: string | null,
  expectedHash?: string
): boolean {
  const hash = expectedHash || process.env.FLUTTERWAVE_WEBHOOK_HASH || '';
  if (!hash || !requestHash) return false;
  return requestHash === hash;
}
