import { redirect } from 'next/navigation'
import WorkforceHeading from '../_components/PageHeading'
import { getReportTemplates } from '../_lib/queries'
import { hasPermission } from '@/lib/admin-auth'
import { DEPARTMENTS } from '../_lib/types'
import TemplatesClient from './TemplatesClient'
import { createTemplate, deleteTemplate, setTemplateActive, updateTemplate } from './actions'

export const dynamic = 'force-dynamic'

// Admin report-template builder. The (admin)/workforce layout gates on
// workforce.read; defining templates additionally needs workforce.write,
// so viewers see the list read-only and editors/admins get the builder.

export default async function ReportTemplatesPage() {
  const canEdit = await hasPermission('workforce.write')
  // Authoring report types is an admin/editor concern. Plain viewers who
  // somehow reach here without write get a read-only list.
  if (!canEdit && !(await hasPermission('workforce.read'))) redirect('/')

  const templates = await getReportTemplates()

  return (
    <div className="pb-12">
      <WorkforceHeading
        title="Report templates"
        subtitle="Define the report types employees can fill in."
      />
      <div className="pt-2">
        <TemplatesClient
          templates={templates}
          departments={DEPARTMENTS}
          canEdit={canEdit}
          actions={{
            create: createTemplate,
            update: updateTemplate,
            setActive: setTemplateActive,
            remove: deleteTemplate,
          }}
        />
      </div>
    </div>
  )
}
