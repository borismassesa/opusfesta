import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { findCategory, INVITATION_CATEGORIES } from '@/data/invitations-categories'
import InvitationsCategoryClient from './InvitationsCategoryClient'

type Params = { category: string }

export function generateStaticParams() {
  return INVITATION_CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params
  const cat = findCategory(category)
  if (!cat) return { title: 'Category not found | OpusFesta' }
  return {
    title: `${cat.label} | OpusFesta Invitations`,
    description: `Browse ${cat.label.toLowerCase()} designs — bilingual digital invitations for Tanzanian weddings.`,
  }
}

export default async function InvitationsCategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const cat = findCategory(category)
  if (!cat) notFound()
  return <InvitationsCategoryClient category={cat} />
}
