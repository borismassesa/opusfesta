// ============================================================================
// Booking Tokens — HMAC-SHA256 signed tokens for unauthenticated client actions
// ============================================================================

import { createHmac, randomBytes } from 'crypto';

const TOKEN_SECRET = process.env.BOOKING_TOKEN_SECRET || '';

export type TokenAction = 'accept_quote' | 'sign_contract' | 'make_payment' | 'view_booking';

interface TokenPayload {
  bookingId: string;
  action: TokenAction;
  exp: number; // Unix timestamp
  nonce: string;
}

function getSecret(): string {
  if (!TOKEN_SECRET) {
    throw new Error('BOOKING_TOKEN_SECRET environment variable is required');
  }
  return TOKEN_SECRET;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function generateClientToken(
  bookingId: string,
  action: TokenAction,
  expiresInMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
): string {
  const payload: TokenPayload = {
    bookingId,
    action,
    exp: Date.now() + expiresInMs,
    nonce: randomBytes(8).toString('hex'),
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadStr);
  return `${payloadStr}.${signature}`;
}

export interface ValidatedToken {
  bookingId: string;
  action: TokenAction;
  valid: boolean;
  expired: boolean;
}

export function validateClientToken(token: string): ValidatedToken {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { bookingId: '', action: 'view_booking', valid: false, expired: false };
  }

  const [payloadStr, providedSignature] = parts;
  const expectedSignature = sign(payloadStr);

  // Constant-time comparison
  if (providedSignature.length !== expectedSignature.length) {
    return { bookingId: '', action: 'view_booking', valid: false, expired: false };
  }

  const a = Buffer.from(providedSignature);
  const b = Buffer.from(expectedSignature);
  if (!a.equals(b)) {
    return { bookingId: '', action: 'view_booking', valid: false, expired: false };
  }

  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf-8')
    );

    if (payload.exp < Date.now()) {
      return { bookingId: payload.bookingId, action: payload.action, valid: false, expired: true };
    }

    return { bookingId: payload.bookingId, action: payload.action, valid: true, expired: false };
  } catch {
    return { bookingId: '', action: 'view_booking', valid: false, expired: false };
  }
}
