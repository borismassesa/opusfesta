import WorkforceHeading from '../_components/PageHeading'
import { getEmployees, getTaskAssignments } from '../_lib/queries'
import { getCallerScope } from '../_lib/task-scope'
import { DEPARTMENTS, type Department } from '../_lib/types'
import TasksClient from './TasksClient'
import { createAssignment, deleteAssignment, setAssignmentActive } from './actions'

export const dynamic = 'force-dynamic'

// Admin task-assignment surface. The (admin)/workforce layout gates this
// on workforce.read, so viewers/managers can reach it. Whether the assign
// form shows — and how wide the target options are — depends on the
// caller's scope (full vs. own-department manager). The server actions
// re-check scope, so this is presentation only.

const TZ = 'Africa/Dar_es_Salaam'

function todayInTz(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export default async function TasksPage() {
  const scope = await getCallerScope()
  const restrictedDepartment: Department | null =
    scope && !scope.canAssignAll ? scope.department : null

  const [assignments, allEmployees] = await Promise.all([
    getTaskAssignments({ department: restrictedDepartment }),
    getEmployees(),
  ])

  const employeeOptions = allEmployees
    .filter((e) => (restrictedDepartment ? e.department === restrictedDepartment : true))
    .map((e) => ({ id: e.id, name: e.name, department: e.department }))

  const departmentOptions: Department[] = scope?.canAssignAll
    ? DEPARTMENTS
    : restrictedDepartment
      ? [restrictedDepartment]
      : []

  const subtitle = scope
    ? scope.canAssignAll
      ? 'Assign one-off or recurring tasks to anyone or any department.'
      : `Assign tasks within ${restrictedDepartment}.`
    : 'You have view-only access to task assignments.'

  return (
    <div className="pb-12">
      <WorkforceHeading title="Tasks" subtitle={subtitle} />
      <div className="pt-6">
        <TasksClient
          assignments={assignments}
          employees={employeeOptions}
          departments={departmentOptions}
          canAssign={Boolean(scope)}
          today={todayInTz()}
          actions={{ create: createAssignment, setActive: setAssignmentActive, remove: deleteAssignment }}
        />
      </div>
    </div>
  )
}
