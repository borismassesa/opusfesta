'use client'

import { useEffect, useState } from 'react'

import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import { NumberTicker } from '@/components/ui/number-ticker'

import RegularUpdatesRippleBg from '@/components/shadcn-studio/blocks/bento-grid-13/regular-updates-ripple-bg'

import Link from 'next/link'
import { SendIcon, CheckCheckIcon, MailOpenIcon, TrendingUpIcon, TrendingDownIcon, ArrowRightIcon } from 'lucide-react'

export type NotificationCard = {
  id: string
  productName: string
  productImage: string
  productAlt: string
  percentageChange: number
  stats: {
    invited: number
    confirmed: number
    pending: number
  }
}

const notificationsList: NotificationCard[] = [
  {
    id: '1',
    productName: 'WhatsApp',
    productImage: '/assets/images/churchcouples.jpg',
    productAlt: 'WhatsApp invite',
    percentageChange: 6.2,
    stats: { invited: 240, confirmed: 232, pending: 198 }
  },
  {
    id: '2',
    productName: 'SMS',
    productImage: '/assets/images/coupleswithpiano.jpg',
    productAlt: 'SMS invite',
    percentageChange: -2.5,
    stats: { invited: 210, confirmed: 201, pending: 154 }
  },
  {
    id: '3',
    productName: 'Email',
    productImage: '/assets/images/authentic_couple.jpg',
    productAlt: 'Email invite',
    percentageChange: 10,
    stats: { invited: 80, confirmed: 76, pending: 52 }
  }
]

const RegularUpdatesCard = () => {
  const [notifications, setNotifications] = useState<NotificationCard[]>(notificationsList)
  const [activeIndex, setActiveIndex] = useState<NotificationCard>(notificationsList[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prevCards => {
        const newArray = [...prevCards]

        setActiveIndex(newArray[newArray.length - 1])
        newArray.unshift(newArray.pop()!)

        return newArray
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className='h-full gap-12 shadow-none ring-0'>
      <MotionPreset
        fade
        slide={{ direction: 'down', offset: 35 }}
        delay={0.15}
        transition={{ duration: 0.5 }}
        className='relative flex h-full justify-center'
      >
        <div className='absolute inset-x-3.5 flex min-h-29 justify-center gap-4'>
          <div className='bg-card flex w-27 flex-col items-start gap-2.5 rounded-xl border p-3 shadow-lg'>
            <div className='grid size-9.5 place-content-center rounded-full border'>
              <SendIcon className='size-5' />
            </div>
            <div className='space-y-1'>
              <h5 className='font-medium'>
                <NumberTicker value={activeIndex.stats.invited} />
              </h5>
              <p className='text-muted-foreground text-xs'>Sent</p>
            </div>
          </div>
          <div className='bg-card flex w-27 flex-col items-start gap-2.5 rounded-xl border p-3 shadow-lg'>
            <div className='grid size-9.5 place-content-center rounded-full border'>
              <CheckCheckIcon className='size-5' />
            </div>
            <div className='space-y-1'>
              <h5 className='font-medium'>
                <NumberTicker value={activeIndex.stats.confirmed} />
              </h5>
              <p className='text-muted-foreground text-xs'>Delivered</p>
            </div>
          </div>
          <div className='bg-card flex w-27 flex-col items-start gap-2.5 rounded-xl border p-3 shadow-lg'>
            <div className='grid size-9.5 place-content-center rounded-full border'>
              <MailOpenIcon className='size-5' />
            </div>
            <div className='space-y-1'>
              <h5 className='font-medium'>
                <NumberTicker value={activeIndex.stats.pending} />
              </h5>
              <p className='text-muted-foreground text-xs'>Opened</p>
            </div>
          </div>
        </div>
        <RegularUpdatesRippleBg className='text-border pointer-events-none size-118 select-none' />
        <img
          src='/assets/logo/opusfesta-logo-mark.png'
          alt='OpusFesta'
          className='absolute top-1/2 size-30 -translate-y-1/2 object-contain'
        />

        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className='bg-card absolute bottom-0 left-1/2 flex h-20 w-72 -translate-x-1/2 items-center justify-between rounded-xl border p-4 shadow-xl md:w-75 xl:w-72'
            style={{
              transformOrigin: 'bottom center'
            }}
            animate={{
              bottom: (index - 2) * -8,
              scale: 1 - index * 0.1,
              opacity: 1 - index * 0.25,
              zIndex: notifications.length - index
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut'
            }}
          >
            <div className='flex flex-col gap-1'>
              <h5 className='text-xl font-semibold'>{notification.productName}</h5>
              <Badge className='bg-[#9FE870] text-[#1A1A1A] border-transparent font-semibold focus-visible:outline-none'>
                {notification.percentageChange > 0 ? (
                  <TrendingUpIcon />
                ) : (
                  <TrendingDownIcon />
                )}
                {notification.percentageChange}%
              </Badge>
            </div>

            <img
              src={notification.productImage}
              alt={notification.productAlt}
              className='size-13 rounded-lg object-cover'
            />
          </motion.div>
        ))}
      </MotionPreset>

      <CardContent className='flex flex-col gap-4'>
        <MotionPreset
          component='h5'
          fade
          slide={{ direction: 'down', offset: 35 }}
          delay={0.3}
          transition={{ duration: 0.5 }}
          className='text-2xl font-semibold'
        >
          Send invites
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 35 }}
          delay={0.45}
          transition={{ duration: 0.5 }}
          className='text-muted-foreground text-lg'
        >
          Send beautiful invites by WhatsApp, SMS or email and watch them deliver and get opened, live.
        </MotionPreset>
        <Link
          href='/my/dashboard/invitations'
          className='group mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#b97fd0] transition-colors hover:text-[#9a5fb5]'
        >
          Send invites
          <ArrowRightIcon className='size-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </CardContent>
    </Card>
  )
}

export default RegularUpdatesCard
