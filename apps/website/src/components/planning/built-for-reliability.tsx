'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldCheckIcon, HistoryIcon, LockIcon, CheckIcon, CircleDotIcon, ArrowLeftIcon } from 'lucide-react'

const reliabilityFeatures = [
    {
        id: 'autosave',
        title: 'Auto-save',
        description: 'Every change is saved continuously in the background. No manual saves, no lost progress.',
        icon: ShieldCheckIcon,
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500/10',
        borderClass: 'border-emerald-500/20',
        glowClass: 'from-emerald-500/15 to-emerald-500/0',
        accentHex: 'rgb(16 185 129)', // emerald-500
        visual: 'save'
    },
    {
        id: 'history',
        title: 'Version History',
        description: 'Track every decision update over time. Review changes, compare versions, and roll back if needed.',
        icon: HistoryIcon,
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-500/10',
        borderClass: 'border-blue-500/20',
        glowClass: 'from-blue-500/15 to-blue-500/0',
        accentHex: 'rgb(59 130 246)', // blue-500
        visual: 'timeline'
    },
    {
        id: 'privacy',
        title: 'Privacy Controls',
        description: 'Role-based access ensures each collaborator sees only what they need. Your data stays secure.',
        icon: LockIcon,
        colorClass: 'text-violet-500',
        bgClass: 'bg-violet-500/10',
        borderClass: 'border-violet-500/20',
        glowClass: 'from-violet-500/15 to-violet-500/0',
        accentHex: 'rgb(139 92 246)', // violet-500
        visual: 'shield'
    }
]

const allSaveEntries = [
    { label: 'Budget updated', time: 'Just now' },
    { label: 'Guest list synced', time: '1s ago' },
    { label: 'Vendor reply saved', time: '3s ago' },
    { label: 'Timeline adjusted', time: 'Just now' },
    { label: 'Seating chart saved', time: '1s ago' },
    { label: 'Menu selection locked', time: '2s ago' },
]

const historyEntries = [
    { label: 'Venue changed to Garden Hall', version: 'v12', active: true },
    { label: 'Budget cap raised to TSh 18M', version: 'v11', active: false },
    { label: 'Added photographer shortlist', version: 'v10', active: false },
    { label: 'Guest count updated to 150', version: 'v9', active: false },
]

const accessRoles = [
    { label: 'Couple', access: 'Full access', level: 'full' as const, scope: 100 },
    { label: 'Planner', access: 'Edit access', level: 'edit' as const, scope: 70 },
    { label: 'Family', access: 'View only', level: 'view' as const, scope: 35 },
]

function SaveVisual() {
    const [cycle, setCycle] = useState(0)

    useEffect(() => {
        const id = setInterval(() => setCycle(c => c + 1), 3000)
        return () => clearInterval(id)
    }, [])

    const startIdx = (cycle * 3) % allSaveEntries.length
    const visibleEntries = Array.from({ length: 3 }, (_, i) =>
        allSaveEntries[(startIdx + i) % allSaveEntries.length]
    )

    return (
        <div className="flex flex-col gap-2.5">
            {/* Live status bar */}
            <div className="flex items-center gap-2 mb-1">
                <motion.div
                    className="size-2 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Saving active</span>
                <div className="ml-auto flex gap-0.5">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="h-2.5 w-1 rounded-full bg-emerald-500/40"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {visibleEntries.map((entry, i) => (
                    <motion.div
                        key={`${entry.label}-${cycle}-${i}`}
                        layout
                        initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                        transition={{ duration: 0.35, delay: i * 0.08 }}
                        className="flex items-center gap-2.5 rounded-lg bg-emerald-500/[0.04] px-2.5 py-1.5"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15 + i * 0.08, type: 'spring', bounce: 0.5 }}
                            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15"
                        >
                            <CheckIcon className="size-3 text-emerald-500" />
                        </motion.div>
                        <span className="text-xs text-foreground/80">{entry.label}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{entry.time}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

function TimelineVisual() {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

    return (
        <div className="relative flex flex-col gap-0">
            {historyEntries.slice(0, 3).map((entry, i) => {
                const isActive = entry.active
                const isHovered = hoveredIdx === i

                return (
                    <motion.div
                        key={entry.label}
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className={`group/entry relative flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-200 cursor-default ${isHovered ? 'bg-blue-500/[0.06]' : ''}`}
                    >
                        {/* Timeline connector */}
                        <div className="relative flex flex-col items-center self-stretch">
                            <motion.div
                                className={`size-3 shrink-0 rounded-full border-2 z-10 transition-colors duration-200 ${isActive ? 'border-blue-500 bg-blue-500' : isHovered ? 'border-blue-400 bg-blue-400/30' : 'border-border bg-card'}`}
                                animate={isActive ? { boxShadow: ['0 0 0 0px rgba(59,130,246,0.3)', '0 0 0 6px rgba(59,130,246,0)', '0 0 0 0px rgba(59,130,246,0.3)'] } : {}}
                                transition={isActive ? { duration: 2.5, repeat: Infinity } : {}}
                            />
                            {i < 2 && (
                                <div className="w-px flex-1 bg-border/60 mt-0.5" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <span className={`text-xs leading-tight block truncate ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {entry.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <AnimatePresence>
                                {isHovered && !isActive && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8, x: 4 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: 4 }}
                                        className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium text-blue-500"
                                    >
                                        <ArrowLeftIcon className="size-2.5" />
                                        Revert
                                    </motion.button>
                                )}
                            </AnimatePresence>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono transition-colors ${isActive ? 'bg-blue-500/10 text-blue-500' : 'text-muted-foreground/60'}`}>
                                {entry.version}
                            </span>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

function ShieldVisual() {
    return (
        <div className="flex flex-col gap-3">
            {accessRoles.map((role, i) => (
                <motion.div
                    key={role.label}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                    className="flex flex-col gap-1.5"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CircleDotIcon className={`size-3 ${
                                role.level === 'full' ? 'text-violet-500' : role.level === 'edit' ? 'text-blue-500' : 'text-muted-foreground'
                            }`} />
                            <span className="text-xs text-foreground/80 font-medium">{role.label}</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            role.level === 'full'
                                ? 'bg-violet-500/10 text-violet-500'
                                : role.level === 'edit'
                                    ? 'bg-blue-500/10 text-blue-500'
                                    : 'bg-muted text-muted-foreground'
                        }`}>
                            {role.access}
                        </span>
                    </div>
                    <div className="relative h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                        <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full ${
                                role.level === 'full' ? 'bg-violet-500' : role.level === 'edit' ? 'bg-blue-500' : 'bg-muted-foreground/40'
                            }`}
                            initial={{ width: '0%' }}
                            whileInView={{ width: `${role.scope}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.15, duration: 0.7, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

const visuals: Record<string, () => React.JSX.Element> = {
    save: SaveVisual,
    timeline: TimelineVisual,
    shield: ShieldVisual
}

export default function BuiltForReliability() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {reliabilityFeatures.map((feature, featureIdx) => {
                const Icon = feature.icon
                const Visual = visuals[feature.visual]

                return (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: featureIdx * 0.12 }}
                        className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_56px_-34px_rgba(15,23,42,0.4)]"
                    >
                        {/* Ambient glow — corner accent */}
                        <div
                            className="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                            style={{ backgroundColor: feature.accentHex }}
                        />
                        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.glowClass} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                        {/* Visual area */}
                        <div className={`relative border-b ${feature.borderClass} px-5 pt-5 pb-4`}>
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    className={`flex size-9 items-center justify-center rounded-lg border ${feature.bgClass} ${feature.borderClass} ${feature.colorClass}`}
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                >
                                    <Icon className="size-4" />
                                </motion.div>
                                <motion.div
                                    className={`h-px flex-1 bg-gradient-to-r ${feature.glowClass}`}
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + featureIdx * 0.12, duration: 0.6 }}
                                    style={{ transformOrigin: 'left' }}
                                />
                            </div>
                            <Visual />
                        </div>

                        {/* Text area */}
                        <div className="relative p-5 pt-4">
                            <h3 className="text-base font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
