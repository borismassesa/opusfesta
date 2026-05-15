import WorkforceHeading from '../_components/PageHeading'
import RecruitmentClient from './RecruitmentClient'
import { getJobsWithCandidates } from '../_lib/queries'

export const dynamic = 'force-dynamic'

export default async function RecruitmentPage() {
  const jobs = await getJobsWithCandidates()
  return (
    <>
      <WorkforceHeading title="Recruitment" />
      <RecruitmentClient jobs={jobs} />
    </>
  )
}
