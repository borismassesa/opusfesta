"use client";

import { UserIcon } from "lucide-react";
import { motion } from "motion/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import Funnel from "@/assets/svg/funnel";
import Logo from "@/assets/svg/logo";

const avatars = [
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png",
    alt: "User 1",
    fallback: "U1",
    delay: 0,
    startX: -60,
    startY: -10,
    badge: "New couple",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png",
    alt: "User 2",
    fallback: "U2",
    delay: 0.9,
    startX: 60,
    startY: 0,
    badge: "New vendor",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
    alt: "User 3",
    fallback: "U3",
    delay: 1.8,
    startX: -80,
    startY: 15,
    badge: "New couple",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png",
    alt: "User 4",
    fallback: "U4",
    delay: 2.7,
    startX: 80,
    startY: 10,
    badge: "New vendor",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
    alt: "User 5",
    fallback: "U5",
    delay: 3.6,
    startX: 0,
    startY: 20,
    badge: "New couple",
  },
];

const UserAnalytics = () => {
  return (
    <div className="relative flex min-h-97 flex-1 items-end overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-primary/15 absolute left-1/2 top-2 h-32 w-52 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-muted/70 absolute left-6 top-16 h-24 w-36 rounded-full blur-3xl" />
        <div className="bg-muted/60 absolute right-4 top-8 h-28 w-40 rounded-full blur-3xl" />
      </div>
      <Funnel className="absolute top-0 left-1/2 z-0 -translate-x-1/2" />
      <Logo className="absolute top-50 left-1/2 z-10 size-16 -translate-x-1/2" />

      {avatars.map((avatar, index) => (
        <motion.div
          key={index}
          className="absolute left-1/2"
          style={{ top: 0 }}
          initial={{ y: avatar.startY, x: avatar.startX, opacity: 0, scale: 0.8 }}
          animate={{
            y: [avatar.startY, 240],
            x: [avatar.startX, -20],
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1, 0.6],
          }}
          transition={{
            duration: 4.5,
            delay: avatar.delay,
            repeat: Infinity,
            repeatDelay: 0,
            ease: "easeInOut",
          }}
        >
          <Avatar className="size-10">
            <AvatarImage src={avatar.src} alt={avatar.alt} />
            <AvatarFallback>{avatar.fallback}</AvatarFallback>
          </Avatar>
        </motion.div>
      ))}

      {avatars.map((avatar, index) => (
        <motion.div
          key={`badge-${index}`}
          className="absolute left-1/2"
          style={{ top: 0 }}
          initial={{ y: 240, x: -20, opacity: 0, scale: 0.6 }}
          animate={{
            y: [245, 360],
            x: [-45, avatar.startX - 25],
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1, 1, 0.8],
          }}
          transition={{
            duration: 4.5,
            delay: avatar.delay + 2.25,
            repeat: Infinity,
            repeatDelay: 0,
            ease: "easeInOut",
          }}
        >
          <Badge
            variant="outline"
            className="bg-background gap-1.5 rounded-md border-0 px-2.5 py-1.25 text-sm font-normal whitespace-nowrap shadow-md"
          >
            <span className="bg-primary/10 grid size-5 place-content-center rounded-sm">
              <UserIcon className="size-4" />
            </span>
            {avatar.badge}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
};

export default UserAnalytics;
