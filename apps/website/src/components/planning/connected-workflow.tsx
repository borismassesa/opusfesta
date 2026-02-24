'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CalendarIcon, StoreIcon, CalculatorIcon, LinkIcon, RefreshCcwIcon } from 'lucide-react'

const syncItems = [
    {
        id: 'calendar',
        title: 'Calendar Sync',
        description: 'Deadlines and reminders stay aligned.',
        icon: CalendarIcon,
        color: 'from-blue-500/20 to-blue-500/0',
        strokeClass: 'text-blue-500',
        bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
        id: 'vendors',
        title: 'Vendor Updates',
        description: 'Replies and contract changes reflect instantly.',
        icon: StoreIcon,
        color: 'from-purple-500/20 to-purple-500/0',
        strokeClass: 'text-purple-500',
        bgClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
        id: 'budget',
        title: 'Budget Sync',
        description: 'Quotes and payments update totals automatically.',
        icon: CalculatorIcon,
        color: 'from-emerald-500/20 to-emerald-500/0',
        strokeClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
]

export default function ConnectedWorkflow() {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px] items-center relative">
            {/* Background ambient glow based on hovered item */}
            <AnimatePresence mode="wait">
                {hoveredItem && (
                    <motion.div
                        key={hoveredItem}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute inset-[-100px] rounded-[100%] bg-linear-to-br ${syncItems.find(i => i.id === hoveredItem)?.color} pointer-events-none blur-3xl`}
                    />
                )}
            </AnimatePresence>

            {/* Left: Text & Selectors */}
            <div className="relative z-10 space-y-8">
                <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">Connected Workflow</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">Your planning data stays in sync.</h2>
                    <p className="mt-4 text-muted-foreground">Every choice you make cascades automatically through your timeline, team notifications, and budget balances.</p>
                </div>

                <div className="space-y-4">
                    {syncItems.map((item) => {
                        const isHovered = hoveredItem === item.id
                        const Icon = item.icon

                        return (
                            <div
                                key={item.id}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={`relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${isHovered
                                    ? 'border-primary/50 bg-background shadow-lg scale-[1.02]'
                                    : 'border-border/50 bg-card hover:border-border/80 hover:bg-muted/30'
                                    }`}
                            >
                                <div className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${isHovered ? item.bgClass : 'bg-muted border-border text-muted-foreground'
                                    }`}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold transition-colors ${isHovered ? 'text-foreground' : 'text-foreground/80'}`}>
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right: Dynamic Visualization Hub */}
            <div className="relative aspect-square w-full max-w-md mx-auto z-10 hidden lg:flex items-center justify-center overflow-visible">
                {/* Fixed coordinate system container so SVG pixels map 1:1 to CSS position pixels */}
                <div className="relative flex size-[400px] shrink-0 items-center justify-center">

                    {/* SVG Connections overlay matching the 400x400 space */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none -z-10" viewBox="0 0 400 400" aria-hidden="true">
                        {syncItems.map((item, index) => {
                            const angle = (index * 120 - 90) * (Math.PI / 180)

                            // True mathematical bounding radii (Center node is 96px, Orbit nodes are 56px)
                            const innerRadius = 60
                            const outerRadius = 96
                            const centerX = 200
                            const centerY = 200

                            const lineX1 = centerX + innerRadius * Math.cos(angle)
                            const lineY1 = centerY + innerRadius * Math.sin(angle)
                            const lineX2 = centerX + outerRadius * Math.cos(angle)
                            const lineY2 = centerY + outerRadius * Math.sin(angle)

                            const isHovered = hoveredItem === item.id

                            return (
                                <g key={`orb-${item.id}`}>
                                    {/* Base faint line */}
                                    <line
                                        x1={lineX1}
                                        y1={lineY1}
                                        x2={lineX2}
                                        y2={lineY2}
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className="text-border/40"
                                        strokeDasharray="4 4"
                                    />

                                    {/* Animated Active Line */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.line
                                                x1={lineX2}
                                                y1={lineY2}
                                                x2={lineX1}
                                                y2={lineY1}
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                className={item.strokeClass}
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                exit={{ pathLength: 0, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Data packet animation */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.circle
                                                r="4"
                                                fill="currentColor"
                                                className={item.strokeClass}
                                                initial={{ cx: lineX2, cy: lineY2, opacity: 0 }}
                                                animate={{
                                                    cx: [lineX2, lineX1],
                                                    cy: [lineY2, lineY1],
                                                    opacity: [0, 1, 0]
                                                }}
                                                exit={{ opacity: 0 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "easeIn"
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </g>
                            )
                        })}
                    </svg>

                    {/* Center Hub */}
                    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative flex size-24 items-center justify-center rounded-full border border-border/50 bg-card shadow-2xl">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="absolute -inset-px rounded-full border border-dashed border-primary/30"
                            />
                            <RefreshCcwIcon className="size-8 text-primary" />
                        </div>
                    </div>

                    {/* Node Icons */}
                    {syncItems.map((item, index) => {
                        const angle = (index * 120 - 90) * (Math.PI / 180)
                        const radius = 130

                        // Exact coordinate matching with the 400x400 SVG
                        const nodeX = 200 + radius * Math.cos(angle)
                        const nodeY = 200 + radius * Math.sin(angle)

                        const isHovered = hoveredItem === item.id
                        const isActiveOrIdle = hoveredItem === null || isHovered
                        const Icon = item.icon

                        return (
                            <motion.div
                                key={`node-${item.id}`}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                                style={{
                                    left: nodeX,
                                    top: nodeY
                                }}
                                animate={{
                                    scale: isHovered ? 1.2 : isActiveOrIdle ? 1 : 0.9,
                                    opacity: isActiveOrIdle ? 1 : 0.4
                                }}
                                transition={{ type: 'spring', bounce: 0.4 }}
                            >
                                <div className={`flex size-14 items-center justify-center rounded-full border shadow-lg transition-colors duration-300 ${isHovered ? item.bgClass : 'border-border bg-card text-muted-foreground'}`}>
                                    <Icon className="size-6" />
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
