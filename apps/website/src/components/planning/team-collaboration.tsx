'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
    UsersIcon,
    HandshakeIcon,
    MessagesSquareIcon,
    FileTextIcon,
    CreditCardIcon,
    MusicIcon,
    ShoppingBagIcon,
    CameraIcon,
    MailIcon,
    UtensilsIcon,
    MapPinIcon
} from 'lucide-react'

type Role = 'couple' | 'planner' | 'family'

const roles = [
    {
        id: 'couple' as Role,
        label: 'Couple',
        icon: UsersIcon,
        description: 'Shared priorities and approvals.'
    },
    {
        id: 'planner' as Role,
        label: 'Planner',
        icon: HandshakeIcon,
        description: 'Milestones and vendor coordination.'
    },
    {
        id: 'family' as Role,
        label: 'Family',
        icon: MessagesSquareIcon,
        description: 'Selective updates on critical tasks.'
    }
]

// Determine which nodes each role can "see"
const visibilityMap: Record<Role, string[]> = {
    couple: ['budget', 'venues', 'catering', 'photography', 'music', 'registry', 'invitations', 'attire'],
    planner: ['budget', 'venues', 'catering', 'photography', 'music'], // Locked out of registry/attire inherently
    family: ['venues', 'registry', 'invitations'] // Only sees public facing stuff
}

// We position 8 nodes carefully around a perfect circle mathematically.
// Center is (50, 50). Radius is roughly 38%.
const nodes = [
    { id: 'budget', label: 'Budget & Contracts', icon: CreditCardIcon, x: 23, y: 23 }, // Top-Left
    { id: 'attire', label: 'Attire fittings', icon: FileTextIcon, x: 50, y: 12 },      // Top-Center
    { id: 'venues', label: 'Venues', icon: MapPinIcon, x: 77, y: 23 },                // Top-Right
    { id: 'catering', label: 'Catering menu', icon: UtensilsIcon, x: 88, y: 50 },         // Right-Center
    { id: 'photography', label: 'Photography', icon: CameraIcon, x: 77, y: 77 },       // Bottom-Right
    { id: 'music', label: 'Entertainment', icon: MusicIcon, x: 50, y: 88 },       // Bottom-Center
    { id: 'registry', label: 'Registry gifts', icon: ShoppingBagIcon, x: 23, y: 77 },    // Bottom-Left
    { id: 'invitations', label: 'Guest RSVPs', icon: MailIcon, x: 12, y: 50 },          // Left-Center
]

export default function TeamCollaboration() {
    const [activeRole, setActiveRole] = useState<Role>('couple')
    const [isMounted, setIsMounted] = useState(false)

    // Avoid hydration mismatch with AnimatePresence
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
            {/* Left: Role Selectors */}
            <div className="space-y-3">
                {roles.map((role) => {
                    const isActive = role.id === activeRole
                    const Icon = role.icon

                    return (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id)}
                            className={`group relative w-full rounded-2xl border p-4 text-left transition-all duration-300 ${isActive
                                ? 'border-primary/50 bg-card shadow-[0_8px_30px_-12px_rgba(var(--primary),0.3)]'
                                : 'border-border/50 bg-card/30 hover:border-border hover:bg-card/60'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-role-bg"
                                    className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/10 to-transparent"
                                    initial={false}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className="relative flex items-center gap-4">
                                <div className={`flex size-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                                    }`}>
                                    <Icon className="size-5" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {role.label}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                        {role.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Right: Interactive Node Map */}
            <div className="relative aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-4xl border border-border/70 bg-card shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">
                {/* Ambient background glow that shifts based on role */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`bg-${activeRole}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.7 }}
                        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] ${activeRole === 'couple' ? 'from-primary/10 via-background to-background'
                            : activeRole === 'planner' ? 'from-blue-500/10 via-background to-background'
                                : 'from-purple-500/10 via-background to-background'
                            }`}
                    />
                </AnimatePresence>

                {/* Center Hub */}
                <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                        key={`hub-${activeRole}`}
                        initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                        className="flex size-16 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                    >
                        {activeRole === 'couple' && <UsersIcon className="size-7" />}
                        {activeRole === 'planner' && <HandshakeIcon className="size-7" />}
                        {activeRole === 'family' && <MessagesSquareIcon className="size-7" />}
                    </motion.div>
                </div>

                {/* Nodes and connecting lines */}
                <div className="absolute inset-4 pointer-events-none">
                    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                        <AnimatePresence>
                            {nodes.map((node) => {
                                const isVisible = visibilityMap[activeRole].includes(node.id)
                                if (!isVisible) return null

                                return (
                                    <g key={`group-${activeRole}-${node.id}`}>
                                        <motion.line
                                            x1="50%"
                                            y1="50%"
                                            x2={`${node.x}%`}
                                            y2={`${node.y}%`}
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="text-primary/70"
                                            strokeDasharray="4 8"
                                            initial={{ opacity: 0, strokeDashoffset: 24 }}
                                            animate={{
                                                opacity: 1,
                                                strokeDashoffset: 0
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                opacity: { duration: 0.8 },
                                                strokeDashoffset: { repeat: Infinity, ease: "linear", duration: 3.5 } // Much slower
                                            }}
                                        />
                                    </g>
                                )
                            })}
                        </AnimatePresence>
                    </svg>

                    {nodes.map((node) => {
                        const isVisible = visibilityMap[activeRole].includes(node.id)
                        const Icon = node.icon

                        return (
                            <div
                                key={`wrapper-${node.id}`}
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                <motion.div
                                    className="relative flex flex-col items-center justify-center"
                                    initial={false}
                                    animate={{
                                        scale: isVisible ? 1 : 0.75,
                                        opacity: isVisible ? 1 : 0.15,
                                        filter: isVisible ? 'blur(0px)' : 'blur(2px)',
                                        y: isVisible ? 0 : 4
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        type: 'spring',
                                        bounce: 0.4,
                                        delay: isVisible ? 0.2 : 0
                                    }}
                                >
                                    <div className={`relative z-10 flex size-10 items-center justify-center rounded-full border transition-all duration-500 ${isVisible ? 'border-primary/40 bg-background text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]' : 'border-border/50 bg-muted/40 text-muted-foreground'
                                        }`}>
                                        <Icon className="size-4" />
                                    </div>
                                    <div className="absolute top-10 mt-2 w-max text-center">
                                        <span className={`block text-[10px] font-medium tracking-tight transition-colors duration-500 lg:text-xs leading-tight ${isVisible ? 'text-foreground drop-shadow-sm' : 'text-muted-foreground/60'
                                            }`}>
                                            {node.label}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
