import { ArrowRightIcon } from 'lucide-react'

import QuestionMark from '@/assets/svg/question-mark'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { MotionPreset } from '@/components/ui/motion-preset'

type FAQItem = {
  question: string
  answer: string
  linkText: string
}

type FAQComponentProps = {
  faqItems: FAQItem[]
}

const FAQ = ({ faqItems }: FAQComponentProps) => {
  const carouselArrowClass =
    'static size-11 translate-y-0 rounded-2xl border border-border/70 bg-background/80 text-foreground shadow-[0_16px_30px_-20px_rgba(15,23,42,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0'

  return (
    <section className='relative overflow-hidden border-b border-border/60 py-8 sm:py-16 lg:py-20'>
      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <MotionPreset
          fade
          motionProps={{
            animate: {
              y: [0, -16, 0],
              opacity: 1
            },
            transition: {
              y: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1
              },
              opacity: {
                duration: 0.5,
                delay: 1
              }
            }
          }}
          className='text-primary absolute left-0 rotate-15 opacity-70'
        >
          <QuestionMark className='h-27' />
        </MotionPreset>

        <MotionPreset
          fade
          motionProps={{
            animate: {
              y: [0, -20, 0],
              opacity: 1
            },
            transition: {
              y: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1
              },
              opacity: {
                duration: 0.5,
                delay: 1
              }
            }
          }}
          className='text-primary absolute right-5 -rotate-40'
        >
          <QuestionMark />
        </MotionPreset>

        <MotionPreset
          fade
          motionProps={{
            animate: {
              y: [0, -12, 0],
              opacity: 1
            },
            transition: {
              y: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1.3
              },
              opacity: {
                duration: 0.5,
                delay: 1.3
              }
            }
          }}
          className='text-primary absolute bottom-0 left-[20%] -rotate-30 opacity-70'
        >
          <QuestionMark className='h-25' />
        </MotionPreset>

        <MotionPreset
          fade
          motionProps={{
            animate: {
              y: [0, -12, 0],
              opacity: 1
            },
            transition: {
              y: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1.3
              },
              opacity: {
                duration: 0.5,
                delay: 1.3
              }
            }
          }}
          className='text-primary absolute right-[16%] -bottom-8 hidden opacity-35 lg:block'
        >
          <QuestionMark className='h-25' />
        </MotionPreset>

        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <MotionPreset
            component='h2'
            className='text-2xl font-semibold md:text-3xl lg:text-4xl'
            fade
            slide={{ direction: 'up', offset: 50 }}
            transition={{ duration: 0.7 }}
          >
            <span className='relative z-10'>
              Before You Ask,
              <span className='bg-primary absolute bottom-1 left-0 -z-10 h-px w-full'></span>
            </span>
            <span> Check Here</span>
          </MotionPreset>
          <MotionPreset
            component='p'
            className='text-muted-foreground text-xl'
            fade
            slide={{ direction: 'up', offset: 50 }}
            delay={0.3}
            transition={{ duration: 0.7 }}
          >
            Leverage artificial intelligence algorithms to provide users with valuable insights
          </MotionPreset>
        </div>

        <MotionPreset fade slide={{ direction: 'up', offset: 50 }} delay={0.6} transition={{ duration: 0.7 }}>
          <Carousel
            opts={{
              align: 'start',
              slidesToScroll: 1,
              loop: true
            }}
          >
            <div className='flex items-center gap-6'>
              <CarouselPrevious variant='outline' className={carouselArrowClass} />
              <CarouselContent>
                {faqItems.map((item, index) => (
                  <CarouselItem key={index} className='pl-6 md:basis-1/2 lg:basis-1/3'>
                    <Card className='group h-full rounded-2xl border border-border/70 bg-card/90 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.45)] transition-all duration-250 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-[0_22px_46px_-34px_rgba(15,23,42,0.5)]'>
                      <CardContent className='flex h-full flex-col gap-4 p-6 text-left sm:p-7'>
                        <div className='space-y-3'>
                          <h3 className='text-xl font-semibold leading-tight'>{item.question}</h3>
                          <p className='text-muted-foreground text-sm leading-relaxed sm:text-base'>{item.answer}</p>
                        </div>

                        <Button
                          variant='link'
                          className='text-primary mt-auto w-fit !px-0 !no-underline'
                          asChild
                        >
                          <a href='#'>
                            {item.linkText}
                            <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext variant='outline' className={carouselArrowClass} />
            </div>
          </Carousel>
        </MotionPreset>

        <MotionPreset
          className='mt-12 text-center sm:mt-16'
          fade
          slide={{ direction: 'up', offset: 50 }}
          delay={1.2}
          transition={{ duration: 0.7 }}
        >
          <Button size='lg'>Read All Articles</Button>
        </MotionPreset>
      </div>
    </section>
  )
}

export default FAQ
