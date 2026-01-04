/**
 * Stripe Payment Integration
 * Handles Stripe payment processing for international customers
 */

// Stripe integration - will be installed as dependency
// For now, we'll use a conditional import
let Stripe: any;
let stripe: any;

try {
  // Try to import Stripe if available
  if (process.env.STRIPE_SECRET_KEY) {
    Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
} catch (error) {
  console.warn('Stripe package not installed. Run: npm install stripe');
}

export interface StripePaymentIntentRequest {
  amount: number; // Amount in cents (or smallest currency unit)
  currency: string;
  invoiceId: string;
  inquiryId: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Stripe.PaymentIntent | Stripe.Charge;
  };
}

class StripePaymentService {
  /**
   * Create a payment intent for an invoice
   */
  async createPaymentIntent(
    request: StripePaymentIntentRequest
  ): Promise<StripePaymentIntentResponse> {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      if (!stripe) {
        return {
          success: false,
          error: 'Stripe is not configured or package not installed',
        };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        description: request.description || `Payment for invoice ${request.invoiceId}`,
        metadata: {
          invoice_id: request.invoiceId,
          inquiry_id: request.inquiryId,
          ...request.metadata,
        },
        receipt_email: request.customerEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
      };
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return null;
      }

      if (!stripe) {
        return null;
      }

      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  }

  /**
   * Process Stripe webhook event
   */
  async processWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<StripeWebhookEvent | null> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Stripe webhook secret not configured');
        return null;
      }

      if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
        return null;
      }

      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return {
        type: event.type,
        data: {
          object: event.data.object as Stripe.PaymentIntent | Stripe.Charge,
        },
      };
    } catch (error: any) {
      console.error('Stripe webhook verification error:', error.message);
      return null;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      if (!stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount, // Amount in cents, undefined for full refund
      });

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create refund',
      };
    }
  }
}

export const stripePaymentService = new StripePaymentService();
