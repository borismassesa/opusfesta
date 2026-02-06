import { MotionPreset } from "@/components/ui/motion-preset";

import UserAnalytics from "@/components/shadcn-studio/blocks/bento-grid-19/user-analytics";
import ProductMetrics from "@/components/shadcn-studio/blocks/bento-grid-19/product-metrics";
import PerformanceCard from "@/components/shadcn-studio/blocks/chart-performance";
import EnterpriseCollaboration from "@/components/shadcn-studio/blocks/bento-grid-19/enterprise-collaboration";
import StayInformed from "@/components/shadcn-studio/blocks/bento-grid-19/stay-informed";
import TurnViewersToOrders from "@/components/shadcn-studio/blocks/bento-grid-19/turn-viewers-to-orders";
import ProductManagement from "@/components/shadcn-studio/blocks/bento-grid-19/product-management";

const BentoGrid = () => {
  return (
    <section className="bg-muted py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end border-b border-border/40 pb-10 mb-10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6">
              <span className="w-12 h-px bg-accent"></span>
              <span className="font-mono text-accent text-xs tracking-widest uppercase">
                Marketplace overview
              </span>
              <span className="md:hidden w-12 h-px bg-accent"></span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary leading-[1.1]">
              One view of every event, <br />
              <span className="font-serif italic font-normal text-secondary">for couples and vendors.</span>
            </h2>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <p className="text-secondary text-base md:text-lg max-w-md text-center md:text-right leading-relaxed font-light">
              Track inquiries, bookings, and timelines in a shared workspace so everyone stays aligned from first
              message to final payment.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-12">
        <div className="grid grid-rows-2 gap-6">
          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            transition={{ duration: 0.5 }}
            className="bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] flex flex-col gap-6 overflow-hidden rounded-2xl pb-6"
          >
            <UserAnalytics />
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-semibold">Couples & vendors joining</h3>
              <p className="text-muted-foreground text-sm">
                See who is joining the marketplace and engaging with listings, proposals, and chats.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            delay={0.15}
            transition={{ duration: 0.5 }}
            className="bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] flex flex-col gap-6 overflow-hidden rounded-2xl pb-6"
          >
            <TurnViewersToOrders />
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-semibold">From interest to bookings</h3>
              <p className="text-muted-foreground text-sm">
                Convert inquiries into confirmed bookings with fast replies and clear next steps.
              </p>
            </div>
          </MotionPreset>
        </div>

        <div className="grid content-start gap-4">
          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            delay={0.3}
            transition={{ duration: 0.5 }}
            className="h-88"
          >
            <PerformanceCard className="h-full w-full overflow-hidden rounded-2xl border-0 bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)]" />
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            delay={0.45}
            transition={{ duration: 0.5 }}
            className="bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] flex flex-col overflow-hidden rounded-2xl pb-6"
          >
            <EnterpriseCollaboration />
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-semibold">Vendor collaboration</h3>
              <p className="text-muted-foreground text-sm">
                Keep venues, vendors, and couples aligned with shared updates and approvals.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            delay={0.6}
            transition={{ duration: 0.5 }}
            className="bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] flex flex-col gap-6 overflow-hidden rounded-2xl pb-6"
          >
            <StayInformed />
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-semibold">Live updates</h3>
              <p className="text-muted-foreground text-sm">
                Instant alerts for new inquiries, approvals, payments, and schedule changes.
              </p>
            </div>
          </MotionPreset>
        </div>

        <div className="grid gap-6 max-md:grid-rows-2 md:max-lg:col-span-2 md:max-lg:grid-cols-2 lg:grid-rows-2">
          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            delay={0.75}
            transition={{ duration: 0.5 }}
            className="bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] flex flex-col gap-6 overflow-hidden rounded-2xl pb-6"
          >
            <ProductManagement />
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-semibold">Workspace for every event</h3>
              <p className="text-muted-foreground text-sm">
                Manage proposals, guest details, and timelines in one hub for couples and vendors.
              </p>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            blur
            slide={{ direction: "down", offset: 75 }}
            delay={0.9}
            transition={{ duration: 0.5 }}
            className="bg-card ring-1 ring-border/10 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] flex flex-col gap-6 overflow-hidden rounded-2xl pb-6"
          >
            <ProductMetrics />
            <div className="space-y-2 px-6">
              <h3 className="text-2xl font-semibold">Marketplace momentum</h3>
              <p className="text-muted-foreground text-sm">
                Track views, saves, and inquiries across venues and vendor listings at a glance.
              </p>
            </div>
          </MotionPreset>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
