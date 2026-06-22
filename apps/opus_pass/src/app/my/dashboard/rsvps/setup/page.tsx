import { getEvents, getRsvpQuestions, getMyPublicInvite } from '@/lib/dashboard/queries'
import RsvpSetupWizard from './RsvpSetupWizard'

export const dynamic = 'force-dynamic'

export default async function RsvpSetupPage() {
  const [events, questions, publicInvite] = await Promise.all([
    getEvents(),
    getRsvpQuestions(),
    getMyPublicInvite(),
  ])
  return <RsvpSetupWizard events={events} questions={questions} publicInvite={publicInvite} />
}
