import {
  BsQuestionCircle, BsFileText, BsFolder2Open, BsStar,
  BsPeople, BsWrench, BsHouseDoor, BsImage, BsGear,
  BsFileEarmark,
} from 'react-icons/bs';
import type { ComponentType } from 'react';

// Map of react-icons names (as strings in ContentType config) to components.
// Keep this list in sync with any icons referenced from lib/cms/types/*.ts.
const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  BsQuestionCircle,
  BsFileText,
  BsFolder2Open,
  BsStar,
  BsPeople,
  BsWrench,
  BsHouseDoor,
  BsImage,
  BsGear,
};

export function resolveIcon(name: string | undefined): ComponentType<{ className?: string }> {
  if (!name) return BsFileEarmark;
  return ICON_MAP[name] ?? BsFileEarmark;
}
