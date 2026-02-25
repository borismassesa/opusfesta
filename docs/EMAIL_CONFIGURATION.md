# Email Configuration (Resend)

This document describes how to configure email for the OpusFesta platform. Email is used for booking inquiry notifications, career application notifications, and other transactional emails. The stack uses [Resend](https://resend.com).

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key. Get it from the [Resend dashboard](https://resend.com/api-keys). Without this variable, email sending is disabled and you may see "Email service not configured" where emails are required. |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_FROM_EMAIL` | Override the default "From" address for outgoing emails. | Dev: `OpusFesta <onboarding@resend.dev>`; Prod: `OpusFesta <noreply@thefestaevents.com>` |
| `PLATFORM_ADMIN_EMAIL` | Email address that receives platform notifications (e.g. new booking inquiries). | `admin@opusfesta.com` |
| `STUDIO_NOTIFICATION_EMAIL` | Email address that receives Studio "New Booking" notifications. | `ibadatt.aulakh@opusfesta.com` |

## Where Email Is Used

- **Website** (`apps/website`): Booking inquiry confirmations (customer, vendor, platform admin), career application notifications.
- **Vendor portal** (`apps/vendor-portal`): Vendor-related email notifications.
- **Studio** (`apps/studio`): Studio booking form notifications (to studio and confirmation to customer). The notification recipient is controlled by `STUDIO_NOTIFICATION_EMAIL`.

Set the variables in the environment for each app that sends email (e.g. in `.env` or your deployment config).

### Development Behavior

If `RESEND_FROM_EMAIL` is not set in non-production environments, the apps automatically use `onboarding@resend.dev` to avoid domain verification errors while developing locally.

## Domain and DNS

To send from a custom domain (e.g. `noreply@thefestaevents.com`), verify your domain in Resend and add the required DNS records. See [Resend DNS Setup for thefestaevents.com](./RESEND_DNS_SETUP.md) for DKIM, SPF, and optional MX setup.

## Quick Setup

1. Create a Resend account and get an API key.
2. Add to your `.env`: `RESEND_API_KEY=re_xxxxxxxxxxxxx`
3. (Optional) Set `RESEND_FROM_EMAIL`, `PLATFORM_ADMIN_EMAIL`, and/or `STUDIO_NOTIFICATION_EMAIL` if you need different values.
4. For local development, you can rely on the default sender (`onboarding@resend.dev`) or set `RESEND_FROM_EMAIL` explicitly to that value.
5. For production, verify your sending domain and configure DNS as in [RESEND_DNS_SETUP.md](./RESEND_DNS_SETUP.md).
