export function Swatch({
  color,
  name,
  hex,
  note,
  size = 'md',
}: {
  color: string
  name: string
  hex?: string
  note?: string
  size?: 'sm' | 'md'
}) {
  const h = size === 'sm' ? 'h-16' : 'h-32'
  return (
    <div>
      <div
        className={`${h} rounded-2xl`}
        style={{ background: color, border: '1px solid rgba(0,0,0,0.06)' }}
      />
      <p className="mt-3 font-bold text-sm">{name}</p>
      {hex && <p className="mono text-xs text-gray-500">{hex}</p>}
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  )
}
