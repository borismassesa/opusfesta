'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  TEMP_ADMIN_COOKIE,
  isTempAdminEnabled,
  isTempAdminPassword,
  tempAdminPassword,
} from '@/lib/temp-admin'

function safeLocalRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

// Validates the shared access code and, on success, sets the httpOnly
// `of_temp_admin` cookie that admin-auth.ts + proxy.ts recognise as `owner`.
export async function submitTempAccess(formData: FormData): Promise<void> {
  if (!isTempAdminEnabled()) redirect('/temp-access?error=disabled')

  const code = String(formData.get('code') ?? '')
  const next = safeLocalRedirect(
    typeof formData.get('redirect') === 'string'
      ? (formData.get('redirect') as string)
      : null,
  )

  if (!isTempAdminPassword(code)) redirect('/temp-access?error=1')

  const jar = await cookies()
  jar.set(TEMP_ADMIN_COOKIE, tempAdminPassword() as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  })

  redirect(next)
}

// Clears temp access (the "exit" link).
export async function exitTempAccess(): Promise<void> {
  const jar = await cookies()
  jar.delete(TEMP_ADMIN_COOKIE)
  redirect('/temp-access')
}
