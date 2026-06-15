'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCallerEmail, requirePermission } from '@/lib/admin-auth'
import { isEmailConfigured, sendEmail } from '@/lib/email'
import { renderEmail, plaintextLines } from '@/lib/email-shell'
import type { InvitationPaymentStatus } from './queries'

type PaymentEmailRow = {
  id: string
  ref: string
  user_id: string | null
  status: InvitationPaymentStatus
  amount_total: string | number
  contact_name: string | null
  contact_email: string
  payment_reference: string | null
}

function clean(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

function formatTzs(value: string | number): string {
  return `TZS ${Number(value).toLocaleString('en-US')}`
}

async function getPayment(id: string): Promise<PaymentEmailRow> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('invitation_orders')
    .select('id, ref, user_id, status, amount_total, contact_name, contact_email, payment_reference')
    .eq('id', id)
    .eq('provider', 'mpesa_lipa_namba')
    .single<PaymentEmailRow>()
  if (error) throw new Error(error.message)
  return data
}

async function createCustomerNotification(args: {
  userId: string | null
  type: 'payment_confirmed' | 'system'
  title: string
  body: string
}) {
  if (!args.userId) return
  try {
    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('notifications').insert({
      user_id: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      href: '/my/dashboard/orders',
    })
    if (error) console.error('[invitation-payments] notification insert failed', error)
  } catch (error) {
    console.error('[invitation-payments] notification insert threw', error)
  }
}

async function emailCustomer(args: {
  payment: PaymentEmailRow
  kind: 'approved' | 'rejected'
  note: string
}) {
  if (!isEmailConfigured()) return
  const approved = args.kind === 'approved'
  const subject = approved
    ? `Payment approved - ${args.payment.ref}`
    : `Payment update - ${args.payment.ref}`
  const html = renderEmail({
    preheader: approved
      ? `Your invitation payment ${args.payment.ref} has been approved.`
      : `We need help reconciling invitation payment ${args.payment.ref}.`,
    eyebrow: 'Invitation Payment',
    heading: approved ? 'Your payment is approved' : 'Payment needs review',
    referenceCode: args.payment.ref,
    sections: [
      {
        kind: 'paragraph',
        text: approved
          ? 'Finance has confirmed your Lipa Namba payment. Your invitation order is now confirmed and moving into design.'
          : 'Finance could not approve the payment details submitted for this invitation order. Please reply with the correct payment SMS/reference or contact OpusFesta support.',
      },
      {
        kind: 'detailRows',
        label: 'Invoice',
        rows: [
          { label: 'Order', value: args.payment.ref },
          { label: 'Amount', value: formatTzs(args.payment.amount_total) },
          ...(args.payment.payment_reference
            ? [{ label: 'Reference', value: args.payment.payment_reference }]
            : []),
        ],
      },
      ...(args.note
        ? [{ kind: 'notesCard' as const, label: 'Finance note', body: args.note }]
        : []),
    ],
  })
  await sendEmail({
    to: args.payment.contact_email,
    subject,
    html,
    text: plaintextLines([
      subject,
      `Order: ${args.payment.ref}`,
      `Amount: ${formatTzs(args.payment.amount_total)}`,
      args.payment.payment_reference ? `Reference: ${args.payment.payment_reference}` : null,
      args.note ? `Finance note: ${args.note}` : null,
    ]),
  })
}

export async function approveInvitationPayment(formData: FormData): Promise<void> {
  await requirePermission('finance.write')

  const id = clean(formData.get('id'))
  const note = clean(formData.get('note'))
  if (!id) throw new Error('Missing payment id.')

  const payment = await getPayment(id)
  if (payment.status === 'paid') {
    revalidatePath('/finance/payments')
    return
  }
  if (payment.status !== 'processing' && payment.status !== 'pending') {
    throw new Error(`Cannot approve a payment with status "${payment.status}".`)
  }

  const reviewedBy = (await getCallerEmail()) ?? 'admin'
  const now = new Date().toISOString()
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('invitation_orders')
    .update({
      status: 'paid',
      paid_at: now,
      reviewed_at: now,
      reviewed_by: reviewedBy,
      review_note: note || null,
    })
    .eq('id', id)
    .eq('provider', 'mpesa_lipa_namba')
  if (error) throw new Error(error.message)

  await Promise.all([
    emailCustomer({ payment, kind: 'approved', note }).catch((error) => {
      console.error('[invitation-payments] approval email failed', error)
    }),
    createCustomerNotification({
      userId: payment.user_id,
      type: 'payment_confirmed',
      title: 'Invitation payment approved',
      body: `${formatTzs(payment.amount_total)} confirmed${payment.payment_reference ? ` · ref ${payment.payment_reference}` : ''}`,
    }),
  ])
  revalidatePath('/finance/payments')
}

export async function rejectInvitationPayment(formData: FormData): Promise<void> {
  await requirePermission('finance.write')

  const id = clean(formData.get('id'))
  const note = clean(formData.get('note'))
  if (!id) throw new Error('Missing payment id.')
  if (!note) throw new Error('Add a short note before rejecting.')

  const payment = await getPayment(id)
  if (payment.status === 'paid') throw new Error('Paid payments cannot be rejected.')
  if (payment.status === 'failed') {
    revalidatePath('/finance/payments')
    return
  }

  const reviewedBy = (await getCallerEmail()) ?? 'admin'
  const now = new Date().toISOString()
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('invitation_orders')
    .update({
      status: 'failed',
      reviewed_at: now,
      reviewed_by: reviewedBy,
      review_note: note,
    })
    .eq('id', id)
    .eq('provider', 'mpesa_lipa_namba')
  if (error) throw new Error(error.message)

  await Promise.all([
    emailCustomer({ payment, kind: 'rejected', note }).catch((error) => {
      console.error('[invitation-payments] rejection email failed', error)
    }),
    createCustomerNotification({
      userId: payment.user_id,
      type: 'system',
      title: 'Invitation payment needs attention',
      body: note,
    }),
  ])
  revalidatePath('/finance/payments')
}
