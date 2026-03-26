'use client'

import { useEffect, useState } from 'react'

import Autoplay from 'embla-carousel-autoplay'

import { ArrowRightIcon } from 'lucide-react'

import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { MatterButton } from '@/components/ui/matter-button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { TextShimmer } from '@/components/ui/text-shimmer'

import { cn } from '@/lib/utils'

type AboutUsData = {
  group: string
  items: {
    title: string
    description: string
  }[]
}[]

const AboutUs = ({ aboutUsData }: { aboutUsData: AboutUsData }) => {
  const [leftApi, setLeftApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!leftApi) {
      return
    }

    leftApi.on('select', () => {
      const selectedIndex = leftApi.selectedScrollSnap()

      setCurrent(selectedIndex)
    })
  }, [leftApi])

  const flatItems = aboutUsData.flatMap(group => group.items.map(item => ({ ...item, group: group.group })))
  const doubledFlatItems = [...flatItems, ...flatItems]

  const uniqueGroups = aboutUsData.map(g => g.group).filter((v, i, a) => a.indexOf(v) === i)

  const normalizedIdx = current % flatItems.length

  const activeGroup = flatItems[normalizedIdx]?.group || uniqueGroups[0]

  return (
    <section
      id='about-us'
      className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:max-h-175 lg:gap-24 lg:px-8 lg:max-xl:grid-cols-3 xl:grid-cols-2'
    >
      {/* Left: Headings */}
      <div className='lg:max-xl:col-span-2'>
        <div className='relative'>
          <MotionPreset
            fade
            blur
            slide={{ direction: 'down', offset: 50 }}
            transition={{ duration: 0.7 }}
            className='pt-8 max-lg:mb-6 sm:pt-16 lg:pt-24'
          >
            <TextShimmer className='text-sm font-medium uppercase' duration={1.75}>
              ABOUT US
            </TextShimmer>
          </MotionPreset>

          <div className='relative'>
            <div className='flex flex-col justify-center overflow-hidden lg:h-121'>
              <MotionPreset
                fade
                blur
                slide={{ direction: 'down', offset: 50 }}
                transition={{ duration: 0.7 }}
                delay={0.3}
                className='relative flex items-center justify-center gap-8 lg:justify-start'
              >
                <div className='flex flex-col transition-transform duration-500 will-change-transform max-lg:w-fit max-lg:justify-center'>
                  {(() => {
                    const activeIdx = uniqueGroups.indexOf(activeGroup)
                    const total = uniqueGroups.length

                    const indices = [(activeIdx - 1 + total) % total, activeIdx, (activeIdx + 1) % total]

                    return indices.map(idx => {
                      const group = uniqueGroups[idx]
                      const isActive = idx === activeIdx

                      return (
                        <div
                          key={group}
                          className={cn(
                            'flex h-9 items-center text-3xl transition-all duration-300 max-lg:max-w-140 sm:h-18 sm:text-6xl',
                            isActive ? 'text-primary font-medium' : 'text-muted-foreground/80'
                          )}
                        >
                          <div>
                            <span
                              className={cn({
                                'mr-2 opacity-100': isActive,
                                'mr-2.75 opacity-0 sm:mr-3.5': !isActive
                              })}
                            >
                              We are
                            </span>
                            <span>{group}</span>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </MotionPreset>
            </div>

            <MotionPreset
              fade
              blur
              slide={{ direction: 'down', offset: 50 }}
              transition={{ duration: 0.7 }}
              delay={0.4}
              className='absolute top-1/2 right-0 mt-1 translate-x-full -translate-y-1/2 max-lg:hidden'
            >
              <MatterButton size='icon-lg' aria-label='Arrow Icon'>
                <ArrowRightIcon />
              </MatterButton>
            </MotionPreset>
          </div>
        </div>
      </div>

      {/* Right: Items */}
      <div className='relative overflow-hidden'>
        <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.5}>
          <Carousel
            className='relative w-full max-lg:order-2 lg:col-span-3'
            setApi={setLeftApi}
            plugins={[Autoplay({ delay: 1900, stopOnInteraction: false })]}
            orientation='vertical'
            opts={{ loop: true, align: 'center' }}
          >
            <div className='from-background pointer-events-none absolute inset-x-0 top-0 z-1 h-33 w-full bg-linear-to-b via-75% to-transparent lg:h-85' />
            <div className='from-background pointer-events-none absolute inset-x-0 bottom-0 z-1 h-33 w-full bg-linear-to-t via-75% to-transparent lg:h-85' />
            <CarouselContent className='m-0! h-90 w-full max-lg:items-center lg:h-184'>
              {doubledFlatItems.map((item, idx) => (
                <CarouselItem
                  key={`${item.group}-${item.title}-${idx}`}
                  className={cn(
                    'flex basis-1/5 cursor-pointer flex-col p-0! opacity-70 max-lg:items-center lg:basis-1/10',
                    {
                      'opacity-100': current === idx
                    }
                  )}
                >
                  <div className='flex items-center gap-5 border-b px-4 py-5 transition-colors max-lg:w-65 max-lg:justify-center lg:max-xl:w-120'>
                    <span className='w-full max-w-47.5 text-2xl max-lg:text-center'>{item.title}</span>
                    <span className='text-muted-foreground text-nowrap max-xl:hidden'>{item.description}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </MotionPreset>
      </div>
    </section>
  )
}

export default AboutUs
