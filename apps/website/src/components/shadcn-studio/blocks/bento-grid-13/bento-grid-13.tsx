import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  GraduationCapIcon,
  PaintbrushIcon,
  PlusIcon,
  ThumbsUpIcon,
  UserIcon,
  UsersRoundIcon,
  ZapIcon
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Magnetic } from '@/components/ui/magnet-effect'

import { cn } from '@/lib/utils'

import StatCard from '@/components/shadcn-studio/blocks/bento-grid-13/stat-card'
import GoalAndTargetCard from '@/components/shadcn-studio/blocks/bento-grid-13/goal-and-target-card'
import SalesGrowthCard from '@/components/shadcn-studio/blocks/bento-grid-13/sales-growth-card'
import TargetVisibilityRippleBg from '@/components/shadcn-studio/blocks/bento-grid-13/target-visibility-ripple-bg'
import RegularUpdatesCard from '@/components/shadcn-studio/blocks/bento-grid-13/regular-updates-card'

const visitorData = [
  {
    product: 'Desktop',
    percentage: 25,
    amount: 23.8,
    trend: 'up',
    heightClass: 'h-[25%]',
    color: 'bg-primary'
  },
  {
    product: 'Tablet',
    percentage: 55,
    amount: 13.604,
    trend: 'down',
    heightClass: 'h-[55%]',
    color: 'bg-secondary'
  },
  {
    product: 'Mobile',
    percentage: 20,
    amount: 47.146,
    trend: 'up',
    heightClass: 'h-[20%]',
    color: 'bg-primary/60'
  }
]

const panelClass =
  'rounded-3xl border border-border/70 bg-background/65 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)]'
const surfaceClass =
  'rounded-2xl border border-border/70 bg-card shadow-[0_16px_34px_-26px_rgba(15,23,42,0.42)]'

const BentoGrid = () => {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8 xl:grid-cols-3'>
        <div className='flex flex-col gap-6'>
          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} transition={{ duration: 0.5 }}>
            <Card className={`${panelClass} gap-24 pt-5 pb-4`}>
              <div className='flex flex-col items-stretch gap-8 px-4.5'>
                <MotionPreset
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={0.15}
                  transition={{ duration: 0.5 }}
                  className='w-full'
                >
                  <StatCard
                    avatarIcon={<UsersRoundIcon className='size-4' />}
                    title='Total visitors'
                    statNumber='23.02K'
                    percentage={-6}
                    className='w-full p-5'
                  />
                </MotionPreset>

                <MotionPreset
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={0.3}
                  transition={{ duration: 0.5 }}
                  className={`relative flex w-full px-4 py-6 ${surfaceClass}`}
                >
                  {visitorData.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex grow flex-col gap-2.5 border-dashed px-3 py-2',
                        index < visitorData.length - 1 && 'border-r'
                      )}
                    >
                      <span className='text-muted-foreground text-sm'>{item.product}</span>

                      <div className='text-2xl font-medium'>{item.percentage}%</div>
                      <div className='flex min-h-25 flex-1 items-end'>
                        <div className={cn('bg-primary grow rounded-xl', item.heightClass, item.color)}></div>
                      </div>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-muted-foreground text-sm'>{item.amount}</span>
                        {item.trend === 'up' ? (
                          <ArrowUpRightIcon className='size-4' />
                        ) : (
                          <ArrowDownLeftIcon className='size-4' />
                        )}
                      </div>
                    </div>
                  ))}
                </MotionPreset>
              </div>

              <CardContent className='relative z-20 flex flex-col gap-4 pt-3'>
                <div className='flex justify-center'>
                  <Magnetic range={130} strength={0.25} className='w-full max-w-[22rem]'>
                    <MotionPreset
                      fade
                      zoom
                      delay={0.75}
                      transition={{ duration: 0.5 }}
                      className={`flex items-center gap-2 p-4 ${surfaceClass}`}
                    >
                      <Avatar className='size-9.5 rounded-full shadow-md'>
                        <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                          <ThumbsUpIcon className='size-4.5' />
                        </AvatarFallback>
                      </Avatar>
                      <p className='text-muted-foreground text-xs'>
                        User are improved by <span className='text-card-foreground'>32%</span> than last month and
                        product reached to 2,432 new users
                      </p>
                    </MotionPreset>
                  </Magnetic>
                </div>
                <MotionPreset
                  component='h5'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={0.45}
                  transition={{ duration: 0.5 }}
                  className='text-2xl font-semibold'
                >
                  Product reach
                </MotionPreset>
                <MotionPreset
                  component='p'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={0.6}
                  transition={{ duration: 0.5 }}
                  className='text-muted-foreground text-lg'
                >
                  See how many people discover and engage with your product visitors, views and conversion signals at a
                  glance.
                </MotionPreset>
              </CardContent>
            </Card>
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 35 }}
            delay={0.9}
            transition={{ duration: 0.5 }}
          >
            <Card className={`${panelClass} gap-0 pt-0`}>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 35 }}
                delay={1.05}
                transition={{ duration: 0.5 }}
                className='relative flex min-h-[230px] items-center justify-center sm:min-h-[240px]'
              >
                <TargetVisibilityRippleBg className='text-border pointer-events-none size-40 select-none sm:size-44' />

                <div className='absolute top-1/2 -translate-y-1/2'>
                  <Avatar className='size-16 rounded-full border shadow-lg'>
                    <AvatarFallback className='bg-background text-primary shrink-0 rounded-sm'>
                      <UserIcon className='size-8 stroke-1' />
                    </AvatarFallback>
                  </Avatar>
                  <Badge className='absolute top-0 right-0 size-5 rounded-full px-1'>
                    <PlusIcon className='size-2.5' />
                  </Badge>
                </div>

                <MotionPreset
                  fade
                  className='absolute top-6 left-12 -rotate-5'
                  motionProps={{
                    animate: {
                      y: [0, -10, 0],
                      opacity: 1
                    },
                    transition: {
                      y: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut'
                      },
                      opacity: {
                        duration: 0.5,
                        delay: 1.2
                      }
                    }
                  }}
                >
                  <Badge className='bg-card text-foreground border-border/70 gap-2.5 px-3 py-1.5 transition-shadow duration-200 hover:shadow-sm'>
                    <ZapIcon className='size-3.5' />
                    Athlete
                  </Badge>
                </MotionPreset>

                <MotionPreset
                  fade
                  className='absolute bottom-8 left-8 rotate-5'
                  motionProps={{
                    animate: {
                      y: [0, -9, 0],
                      opacity: 1
                    },
                    transition: {
                      y: {
                        duration: 1.9,
                        repeat: Infinity,
                        ease: 'easeOut'
                      },
                      opacity: {
                        duration: 0.5,
                        delay: 1.35
                      }
                    }
                  }}
                >
                  <Badge className='bg-card text-foreground border-border/70 gap-2.5 px-3 py-1.5 transition-shadow duration-200 hover:shadow-sm'>
                    <PaintbrushIcon className='size-3.5' />
                    Artists
                  </Badge>
                </MotionPreset>

                <MotionPreset
                  fade
                  className='absolute top-6 right-4 -rotate-10'
                  motionProps={{
                    animate: {
                      y: [0, -10, 0],
                      opacity: 1
                    },
                    transition: {
                      y: {
                        duration: 2.1,
                        repeat: Infinity,
                        ease: 'easeOut'
                      },
                      opacity: {
                        duration: 0.5,
                        delay: 1.5
                      }
                    }
                  }}
                >
                  <Badge className='bg-card text-foreground border-border/70 gap-2.5 px-3 py-1.5 transition-shadow duration-200 hover:shadow-sm'>
                    <BriefcaseBusinessIcon className='size-3.5' />
                    Professionals
                  </Badge>
                </MotionPreset>

                <MotionPreset
                  fade
                  className='absolute right-10 bottom-8 rotate-10'
                  motionProps={{
                    animate: {
                      y: [0, -8, 0],
                      opacity: 1
                    },
                    transition: {
                      y: {
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeOut'
                      },
                      opacity: {
                        duration: 0.5,
                        delay: 1.65
                      }
                    }
                  }}
                >
                  <Badge className='bg-card text-foreground border-border/70 gap-2.5 px-3 py-1.5 transition-shadow duration-200 hover:shadow-sm'>
                    <GraduationCapIcon className='size-3.5' />
                    Student
                  </Badge>
                </MotionPreset>
              </MotionPreset>

              <CardContent className='flex flex-col gap-3 pb-5'>
                <MotionPreset
                  component='h5'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={1.8}
                  inView={false}
                  transition={{ duration: 0.5 }}
                  className='text-2xl font-semibold'
                >
                  Targeted Visibility
                </MotionPreset>

                <MotionPreset
                  component='p'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={1.95}
                  inView={false}
                  transition={{ duration: 0.5 }}
                  className='text-muted-foreground text-base'
                >
                  Show your product only to selected customers, segments or regions tiers for precise marketing.
                </MotionPreset>
              </CardContent>
            </Card>
          </MotionPreset>
        </div>

        <div className='flex h-full flex-col gap-6'>
          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} transition={{ duration: 0.5 }}>
            <GoalAndTargetCard />
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 35 }}
            delay={0.6}
            transition={{ duration: 0.5 }}
            className='grow'
          >
            <SalesGrowthCard />
          </MotionPreset>
        </div>

        <div className='flex flex-col gap-6 md:max-xl:col-span-2'>
          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} transition={{ duration: 0.5 }}>
            <RegularUpdatesCard />
          </MotionPreset>

          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} delay={0.6} transition={{ duration: 0.5 }}>
            <Card className={`${panelClass}`}>
              <MotionPreset
                fade
                slide={{ direction: 'down', offset: 35 }}
                delay={0.75}
                transition={{ duration: 0.5 }}
                className='flex flex-col gap-1 pt-3'
              >
                <Marquee pauseOnHover reverse duration={30} gap={0.5} className='px-2 pt-2 pb-1.5'>
                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png'
                        alt='Riley Smith'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>RS</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>09:15</span>
                      <span className='text-sm'>Riley Smith</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>$2,000</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png'
                        alt='Taylor Morgan'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>TM</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>11:45</span>
                      <span className='text-sm'>Taylor Morgan</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>$2,200</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png'
                        alt='Alex Thomas'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>AT</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>14:45</span>
                      <span className='text-sm'>Alex Thomas</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>$1,500</span>
                  </div>
                </Marquee>

                <Marquee pauseOnHover duration={30} gap={0.5} className='px-2 pt-2 pb-1.5'>
                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png'
                        alt='Jamie Parker'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>JP</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>19:15</span>
                      <span className='text-sm'>Jamie Parker</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>$800</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png'
                        alt='Casey Reynolds'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>CR</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>18:30</span>
                      <span className='text-sm'>Casey Reynolds</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>$750</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-11.png'
                        alt='Jordan Lee'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>JP</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>09:15</span>
                      <span className='text-sm'>Jordan Lee</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>$3,250</span>
                  </div>
                </Marquee>
              </MotionPreset>

              <CardContent className='flex flex-col gap-4 pt-4'>
                <MotionPreset
                  component='h5'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={0.9}
                  inView={false}
                  transition={{ duration: 0.5 }}
                  className='text-2xl font-semibold'
                >
                  Customer Payments
                </MotionPreset>

                <MotionPreset
                  component='p'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={1.05}
                  inView={false}
                  transition={{ duration: 0.5 }}
                  className='text-muted-foreground text-lg'
                >
                  Track who paid, how much, and the payment status — one clear ledger for sales, refunds and
                  reconciliations.
                </MotionPreset>
              </CardContent>
            </Card>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
