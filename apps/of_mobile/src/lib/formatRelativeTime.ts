/**
 * Formats a timestamp as a short relative label ("5m ago", "3h ago",
 * "Yesterday", "2d ago") for messages/conversation lists, falling back to a
 * "Mon D" date once it's a week old. `now` is injectable for deterministic tests.
 */
export function formatRelativeTime(dateStr: string, now: number = Date.now()): string {
  if (!dateStr) return '';
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
