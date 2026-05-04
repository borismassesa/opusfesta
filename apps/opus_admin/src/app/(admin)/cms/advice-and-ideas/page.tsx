import { redirect } from 'next/navigation'
import { getAdminAccessRole } from '@/lib/admin-auth'

export default async function AdviceIdeasCmsRoot() {
  const role = await getAdminAccessRole()
  redirect(
    role === 'author'
      ? '/operations/articles'
      : '/cms/advice-and-ideas/hero'
  )
}
