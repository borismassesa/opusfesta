'use client'

import { motion } from 'motion/react'
import { CheckCircleIcon, CircleIcon, ClipboardCheckIcon, ListTodoIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const ChecklistCard = ({ className }: { className?: string }) => {
    return (
        <Card className={`relative flex flex-col gap-0 border-border/70 bg-background/65 pt-0 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)] overflow-hidden ${className || ''}`}>
            {/* Dynamic Background Glow */}
            <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className='absolute -bottom-32 -left-32 size-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none'
            />
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className='absolute top-1/2 -right-16 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none'
            />

            <div className='z-10 flex flex-col gap-6 p-6'>
                {/* Header Ribbon containing Milestone progress */}
                <MotionPreset fade slide={{ direction: 'down', offset: 20 }} className='flex w-full flex-col gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='size-8 rounded-md'>
                                <AvatarFallback className='bg-emerald-500/10 text-emerald-500 shrink-0 rounded-md'>
                                    <ClipboardCheckIcon className='size-4' />
                                </AvatarFallback>
                            </Avatar>
                            <span className='font-semibold text-sm'>Milestone 2</span>
                        </div>
                        <span className='text-xs font-semibold text-emerald-500'>60% Complete</span>
                    </div>

                    <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-border/50'>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                            className='absolute inset-y-0 left-0 bg-emerald-500'
                        />
                    </div>
                </MotionPreset>

                {/* Tasks List */}
                <div className='grid gap-3'>
                    {/* Task 1 - Done */}
                    <MotionPreset
                        fade
                        slide={{ direction: 'right', offset: 20 }}
                        delay={0.3}
                        className='group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md'
                    >
                        <div className='flex items-center gap-3 opacity-60'>
                            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500'>
                                <CheckCircleIcon className='size-4' />
                            </div>
                            <span className='text-sm font-medium line-through'>Secure wedding planner</span>
                        </div>
                    </MotionPreset>

                    {/* Task 2 - Active */}
                    <MotionPreset
                        fade
                        slide={{ direction: 'right', offset: 20 }}
                        delay={0.4}
                        className='group flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 backdrop-blur-sm shadow-sm transition-all hover:bg-primary/10'
                    >
                        <div className='flex items-center gap-3'>
                            <div className='relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20'>
                                <span className='absolute inline-flex h-full w-full animate-ping rounded-lg bg-primary opacity-20' />
                                <CircleIcon className='relative size-4 text-primary' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm font-medium'>Tour top 3 venues</span>
                                <span className='text-xs text-primary font-medium'>Next priority</span>
                            </div>
                        </div>
                    </MotionPreset>

                    {/* Task 3 - Upcoming */}
                    <MotionPreset
                        fade
                        slide={{ direction: 'right', offset: 20 }}
                        delay={0.5}
                        className='group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md'
                    >
                        <div className='flex items-center gap-3 opacity-50'>
                            <div className='flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                                <CircleIcon className='size-4' />
                            </div>
                            <span className='text-sm font-medium'>Draft guest list</span>
                        </div>
                    </MotionPreset>
                </div>
            </div>

            <CardContent className='relative z-10 mt-auto flex flex-col gap-3 pb-6 pt-2 px-6 border-t border-border/40 bg-card/30'>
                <MotionPreset
                    component='h3'
                    fade
                    slide={{ direction: 'down', offset: 20 }}
                    delay={0.7}
                    className='text-2xl font-semibold flex items-center gap-2'
                >
                    <ListTodoIcon className='size-5 text-emerald-500' />
                    Checklist
                </MotionPreset>
                <MotionPreset
                    component='p'
                    fade
                    slide={{ direction: 'down', offset: 20 }}
                    delay={0.8}
                    className='text-muted-foreground text-base'
                >
                    Ready. Clear next actions, always.
                </MotionPreset>
            </CardContent>
        </Card>
    )
}

export default ChecklistCard
