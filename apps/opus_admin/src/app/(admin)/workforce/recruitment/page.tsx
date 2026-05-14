import WorkforceHeading from '../_components/PageHeading'
import RecruitmentClient from './RecruitmentClient'
import { getJobsWithCandidates } from '../_lib/queries'

export const dynamic = 'force-dynamic'

export default async function RecruitmentPage() {
  const jobs = await getJobsWithCandidates()
  const open = jobs.filter((j) => j.status === 'Open').length
  const candidates = jobs.reduce((sum, j) => sum + j.candidates.length, 0)
  return (
    <>
      <WorkforceHeading
        title="Recruitment"
        subtitle={`${open} open role${open === 1 ? '' : 's'} · ${candidates} active candidates in pipeline`}
      />
      <RecruitmentClient jobs={jobs} />
    </>
  )
}
