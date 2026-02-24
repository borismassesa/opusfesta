'use client'

import { motion } from 'motion/react'
import { InboxIcon, ListTodoIcon, RefreshCwIcon, ScaleIcon, LayoutGridIcon, NavigationIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const METRICS = [
    { id: 'alerts', label: 'Milestone alerts', value: 3, icon: InboxIcon, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'decisions', label: 'Open decisions', value: 8, icon: ScaleIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'priorities', label: 'Daily priorities', value: 5, icon: ListTodoIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' }
]

export const DashboardCard = ({ className }: { className?: string }) => {
    return (
        <Card className={`relative flex flex-col gap-0 border-border/70 bg-background/65 pt-0 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)] overflow-hidden ${className || ''}`}>
            {/* Dynamic Background Glow */}
            <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className='absolute -top-32 -left-32 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none'
            />
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className='absolute top-1/2 -right-16 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none'
            />

            <div className='z-10 flex flex-col gap-6 p-6'>
                {/* Header Ribbon */}
                <MotionPreset fade slide={{ direction: 'down', offset: 20 }} className='flex w-full items-center justify-between rounded-xl border border-border/50 bg-card p-3 shadow-sm'>
                    <div className='flex items-center gap-3'>
                        <Avatar className='size-8 rounded-md'>
                            <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-md'>
                                <LayoutGridIcon className='size-4' />
                            </AvatarFallback>
                        </Avatar>
                        <span className='font-semibold text-sm'>Dashboard</span>
                    </div>
                    <Button variant='outline' size='sm' className='h-7 text-xs'>
                        Details
                    </Button>
                </MotionPreset>

                {/* Live Metrics Grid */}
                <div className='grid gap-3'>
                    {METRICS.map((metric, idx) => (
                        <MotionPreset
                            key={metric.id}
                            fade
                            slide={{ direction: 'right', offset: 20 }}
                            delay={0.2 + idx * 0.1}
                            className='group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md'
                        >
                            <div className='flex items-center gap-3'>
                                <div className={`flex size-10 items-center justify-center rounded-lg ${metric.bg} ${metric.color}`}>
                                    <metric.icon className='size-5' />
                                </div>
                                <span className='font-medium text-sm'>{metric.label}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                                    className='flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'
                                >
                                    {metric.value}
                                </motion.span>
                            </div>
                        </MotionPreset>
                    ))}
                </div>

                {/* Sync Status Badge */}
                <MotionPreset fade slide={{ direction: 'up', offset: 20 }} delay={0.6} className='flex justify-center pt-2'>
                    <div className='inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 shadow-sm backdrop-blur-md'>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                            <RefreshCwIcon className='size-3.5 text-primary' />
                        </motion.div>
                        <span className='text-xs font-medium text-muted-foreground'>Milestones synced live</span>
                        <div className='relative ml-2 flex size-2 items-center justify-center'>
                            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75' />
                            <span className='relative inline-flex size-1.5 rounded-full bg-emerald-500' />
                        </div>
                    </div>
                </MotionPreset>
            </div>

            <CardContent className='relative z-10 mt-auto flex flex-col gap-3 pb-6 pt-2 px-6 border-t border-border/40 bg-card/30'>
                <MotionPreset
                    component='h3'
                    fade
                    slide={{ direction: 'down', offset: 20 }}
                    delay={0.7}
                    className='text-2xl font-semibold flex items-center gap-2'
                >
                    <NavigationIcon className='size-5 text-amber-400' />
                    Your live command center.
                </MotionPreset>
                <MotionPreset
                    component='p'
                    fade
                    slide={{ direction: 'down', offset: 20 }}
                    delay={0.8}
                    className='text-muted-foreground text-base'
                >
                    Ready with milestone alerts, open decisions, and daily priorities.
                </MotionPreset>
            </CardContent>
        </Card>
    )
}

export default DashboardCard
