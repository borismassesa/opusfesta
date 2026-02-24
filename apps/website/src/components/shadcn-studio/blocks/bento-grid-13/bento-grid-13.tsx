import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Marquee } from '@/components/ui/marquee'
import { MotionPreset } from '@/components/ui/motion-preset'
import { cn } from '@/lib/utils'

import GoalAndTargetCard from '@/components/shadcn-studio/blocks/bento-grid-13/goal-and-target-card'
import SalesGrowthCard from '@/components/shadcn-studio/blocks/bento-grid-13/sales-growth-card'
import RegularUpdatesCard from '@/components/shadcn-studio/blocks/bento-grid-13/regular-updates-card'
import ChecklistCard from '@/components/shadcn-studio/blocks/bento-grid-13/checklist-card'
import DashboardCard from '@/components/shadcn-studio/blocks/bento-grid-13/dashboard-card'


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
            <DashboardCard className={panelClass} />
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 35 }}
            delay={0.9}
            transition={{ duration: 0.5 }}
          >
            <ChecklistCard className={panelClass} />
          </MotionPreset>
        </div>

        <div className='flex h-full flex-col gap-6'>
          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} transition={{ duration: 0.5 }}>
            <GoalAndTargetCard className={panelClass} />
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'down', offset: 35 }}
            delay={0.6}
            transition={{ duration: 0.5 }}
          >
            <SalesGrowthCard className={panelClass} />
          </MotionPreset>
        </div>

        <div className='flex flex-col gap-6 md:max-xl:col-span-2'>
          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} transition={{ duration: 0.5 }}>
            <RegularUpdatesCard className={panelClass} />
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
                        alt='Venue shortlisting'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>VS</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>Month 1</span>
                      <span className='text-sm'>Venue shortlisting</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>Ready</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png'
                        alt='Vendor selection'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>VS</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>Month 3</span>
                      <span className='text-sm'>Vendor selection</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>On track</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png'
                        alt='Catering tasting'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>CT</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>Month 4</span>
                      <span className='text-sm'>Catering tasting</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>Aligned</span>
                  </div>
                </Marquee>

                <Marquee pauseOnHover duration={30} gap={0.5} className='px-2 pt-2 pb-1.5'>
                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png'
                        alt='Dress fitting'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>DF</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>Month 6</span>
                      <span className='text-sm'>Dress fitting</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>Ready</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png'
                        alt='Send invitations'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>SI</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>Month 9</span>
                      <span className='text-sm'>Send invitations</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>On track</span>
                  </div>

                  <div className={`flex w-58 items-center gap-3 pt-2 pb-1.5 pr-3 pl-2 hover:shadow-md ${surfaceClass}`}>
                    <Avatar className='size-9.5 rounded-[12px]'>
                      <AvatarImage
                        src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-11.png'
                        alt='Seating chart'
                        className='rounded-[12px]'
                      />
                      <AvatarFallback className='text-xs'>SC</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-1 flex-col items-start gap-0.5'>
                      <span className='text-muted-foreground text-xs font-light'>Month 11</span>
                      <span className='text-sm'>Seating chart</span>
                    </div>
                    <span className='text-green-600 dark:text-green-400'>Aligned</span>
                  </div>
                </Marquee>
              </MotionPreset>

              <CardContent className='flex flex-col gap-4 pt-4'>
                <MotionPreset
                  component='h3'
                  fade
                  slide={{ direction: 'down', offset: 35 }}
                  delay={0.9}
                  inView={false}
                  transition={{ duration: 0.5 }}
                  className='text-2xl font-semibold'
                >
                  Planning Timeline
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
                  Ready. Keep every date realistic and aligned.
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
