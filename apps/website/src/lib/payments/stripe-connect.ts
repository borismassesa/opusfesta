/**
 * Stripe Connect Integration
 * Handles vendor onboarding, payment splits, and transfers
 */

let Stripe: any;
let stripe: any;

try {
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

export interface CreateConnectedAccountRequest {
  vendorId: string;
  email: string;
  businessName: string;
  country?: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface CreateConnectedAccountResponse {
  success: boolean;
  accountId?: string;
  onboardingUrl?: string;
  error?: string;
}

export interface TransferToVendorRequest {
  paymentIntentId: string;
  vendorStripeAccountId: string;
  amount: number; // Amount in cents (vendor's share)
  currency: string;
  metadata?: Record<string, string>;
}

export interface TransferToVendorResponse {
  success: boolean;
  transferId?: string;
  error?: string;
}

class StripeConnectService {
  /**
   * Create a Stripe Connect account for a vendor
   */
  async createConnectedAccount(
    request: CreateConnectedAccountRequest
  ): Promise<CreateConnectedAccountResponse> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      // Create Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: request.country || 'TZ',
        email: request.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          vendor_id: request.vendorId,
          business_name: request.businessName,
        },
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: request.refreshUrl,
        return_url: request.returnUrl,
        type: 'account_onboarding',
      });

      return {
        success: true,
        accountId: account.id,
        onboardingUrl: accountLink.url,
      };
    } catch (error: any) {
      console.error('Stripe Connect account creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create connected account',
      };
    }
  }

  /**
   * Get account status
   */
  async getAccountStatus(accountId: string): Promise<{
    success: boolean;
    detailsSubmitted?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    error?: string;
  }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      const account = await stripe.accounts.retrieve(accountId);

      return {
        success: true,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      };
    } catch (error: any) {
      console.error('Error retrieving account status:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve account status',
      };
    }
  }

  /**
   * Create payment intent with application fee (for Stripe Connect)
   * This is the old way - we'll use direct charges with transfers instead
   */
  async createPaymentIntentWithFee(
    amount: number,
    currency: string,
    vendorAccountId: string,
    applicationFeeAmount: number,
    metadata: Record<string, string>
  ): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    error?: string;
  }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      // Create payment intent on platform account
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: vendorAccountId,
        },
        metadata,
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
      };
    }
  }

  /**
   * Transfer funds to vendor after payment succeeds
   * This is the recommended approach for Stripe Connect
   */
  async transferToVendor(
    request: TransferToVendorRequest
  ): Promise<TransferToVendorResponse> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      // Create transfer to vendor's connected account
      const transfer = await stripe.transfers.create({
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        destination: request.vendorStripeAccountId,
        metadata: {
          payment_intent_id: request.paymentIntentId,
          ...request.metadata,
        },
      });

      return {
        success: true,
        transferId: transfer.id,
      };
    } catch (error: any) {
      console.error('Transfer creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create transfer',
      };
    }
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: string): Promise<{
    success: boolean;
    status?: string;
    amount?: number;
    error?: string;
  }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      const transfer = await stripe.transfers.retrieve(transferId);

      return {
        success: true,
        status: transfer.status,
        amount: transfer.amount,
      };
    } catch (error: any) {
      console.error('Error retrieving transfer:', error);
      return {
        success: false,
        error: error.message || 'Failed to retrieve transfer',
      };
    }
  }

  /**
   * Create account link for re-onboarding or updating account
   */
  async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !stripe) {
        return {
          success: false,
          error: 'Stripe is not configured',
        };
      }

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return {
        success: true,
        url: accountLink.url,
      };
    } catch (error: any) {
      console.error('Account link creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create account link',
      };
    }
  }
}

export const stripeConnectService = new StripeConnectService();
