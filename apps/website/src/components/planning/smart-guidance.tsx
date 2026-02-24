'use client'

import { motion } from 'motion/react'
import { SparklesIcon, AlertTriangleIcon, LandmarkIcon, ArrowRightIcon } from 'lucide-react'

const guidanceItems = [
    {
        id: 'next',
        title: 'What to do next',
        description: 'Priority-ranked actions for this week.',
        icon: SparklesIcon,
        colorClass: 'text-indigo-500',
        bgClass: 'bg-indigo-500/10',
        borderClass: 'border-indigo-500/20',
        delay: 0.1
    },
    {
        id: 'risk',
        title: 'What is at risk',
        description: 'Deadlines likely to slip without action.',
        icon: AlertTriangleIcon,
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-500/10',
        borderClass: 'border-amber-500/20',
        delay: 0.3
    },
    {
        id: 'rebalance',
        title: 'Where to rebalance',
        description: 'Budget categories needing adjustment.',
        icon: LandmarkIcon,
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500/10',
        borderClass: 'border-emerald-500/20',
        delay: 0.5
    }
]

export default function SmartGuidance() {
    return (
        <div className="grid gap-8 lg:grid-cols-[400px_1fr] xl:grid-cols-[500px_1fr] items-center relative">

            {/* Left: Animated Sticky Feed */}
            <div className="relative order-2 lg:order-1 h-[400px] w-full max-w-md mx-auto">
                <div className="absolute inset-0 flex flex-col justify-center gap-4">
                    {guidanceItems.map((item, index) => {
                        const Icon = item.icon

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20, y: 10 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: item.delay,
                                    type: "spring",
                                    bounce: 0.3
                                }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className={`group relative flex items-start gap-4 rounded-2xl border bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:bg-card hover:shadow-xl ${item.borderClass}`}
                            >
                                {/* Decorative gradient glow on hover */}
                                <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-r ${item.bgClass} to-transparent pointer-events-none`} />

                                <div className={`relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-110 ${item.bgClass} ${item.borderClass} ${item.colorClass}`}>
                                    <Icon className="size-5" />
                                </div>
                                <div className="relative flex-1">
                                    <h3 className="font-semibold text-foreground flex items-center justify-between">
                                        {item.title}
                                        <ArrowRightIcon className={`size-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${item.colorClass}`} />
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

            </div>

            {/* Right: Text */}
            <div className="relative z-10 space-y-8 order-1 lg:order-2 lg:pl-10">
                <div>
                    <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Smart Guidance</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">Recommendations that match your real plan.</h2>
                    <p className="mt-4 text-muted-foreground">Our intelligent engine analyzes your timeline, budget, and vendor responses to highlight exactly what needs your attention right now, preventing small slips from becoming major stress.</p>
                </div>
            </div>

        </div>
    )
}
