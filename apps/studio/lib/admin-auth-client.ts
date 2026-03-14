import type { StudioRole } from './studio-types';

const ROLE_HIERARCHY: StudioRole[] = ['studio_viewer', 'studio_editor', 'studio_admin'];

export function hasMinimumRole(userRole: StudioRole, minimumRole: StudioRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minimumRole);
}
