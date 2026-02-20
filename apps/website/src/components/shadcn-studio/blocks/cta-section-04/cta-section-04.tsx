import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { MotionPreset } from "@/components/ui/motion-preset";

const CTASection = () => {
  return (
    <section className="bg-muted py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="relative rounded-3xl border-none bg-black py-16 shadow-none">
          <CardContent className="flex items-center gap-16 px-6 sm:max-lg:flex-col md:px-12">
            <MotionPreset
              className="relative w-full max-sm:hidden"
              fade
              motionProps={{
                animate: {
                  y: [0, -10, 0],
                  opacity: 1,
                },
                transition: {
                  y: {
                    duration: 1.7,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5,
                  },
                },
              }}
            >
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/cta/image-7.png"
                alt="Dashboard Analytics"
                className="max-lg:mx-auto max-lg:max-h-80 lg:absolute lg:-translate-y-1/2 lg:scale-105 dark:hidden"
              />
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/cta/image-7-dark.png"
                alt="Dashboard Analytics"
                className="hidden max-lg:mx-auto max-lg:max-h-80 lg:absolute lg:-translate-y-1/2 lg:scale-105 dark:inline-block"
              />
            </MotionPreset>
            <div className="space-y-4 xl:justify-self-end">
              <MotionPreset
                component="h2"
                className="text-2xl font-semibold text-white md:text-3xl lg:text-4xl"
                fade
                blur
                slide={{ direction: "up", offset: 50 }}
                transition={{ duration: 0.5 }}
              >
                Grow your business with couples ready to book.
              </MotionPreset>

              <MotionPreset
                component="p"
                className="text-xl text-white"
                fade
                blur
                slide={{ direction: "up", offset: 50 }}
                delay={0.3}
                transition={{ duration: 0.5 }}
              >
                Join the curated marketplace trusted by modern couples across East Africa. Highlight your portfolio and
                respond to qualified leads.
              </MotionPreset>

              <MotionPreset
                fade
                blur
                slide={{ direction: "up", offset: 50 }}
                delay={0.6}
                transition={{ duration: 0.5 }}
              >
                <Button asChild size="lg" variant="secondary" className="rounded-lg text-base has-[>svg]:px-6">
                  <a href="/signup" className="inline-flex items-center gap-2">
                    Apply to join
                    <ArrowRightIcon className="size-5" />
                  </a>
                </Button>
              </MotionPreset>

              <MotionPreset
                component="p"
                className="text-sm text-white/70"
                fade
                blur
                slide={{ direction: "up", offset: 50 }}
                delay={0.75}
                transition={{ duration: 0.5 }}
              >
                Approval in 48 hours for qualified teams.
              </MotionPreset>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;
