import { BadgeCheckIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Marquee } from "@/components/ui/marquee";

import Logo from "@/assets/svg/logo";
import CardBannerEdge from "@/assets/svg/card-banner-edge";

const TurnViewersToOrders = () => {
  return (
    <div className="relative min-h-97 flex-1">
      <Marquee vertical reverse duration={20} className="absolute top-0 left-1/2 h-1/2 w-full max-w-60 -translate-x-1/2">
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" alt="John Doe" />
            <AvatarFallback className="rounded-lg text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Couple browsing</span>
            <span className="text-muted-foreground text-sm">12 Nov &lsquo;26</span>
          </div>
        </div>
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png" alt="Fanny Hansen" />
            <AvatarFallback className="rounded-lg text-xs">FH</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Inquiry sent</span>
            <span className="text-muted-foreground text-sm">28 Oct &lsquo;26</span>
          </div>
        </div>
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png" alt="Todd Payne" />
            <AvatarFallback className="rounded-lg text-xs">TP</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Vendor shortlisted</span>
            <span className="text-muted-foreground text-sm">19 Nov &lsquo;26</span>
          </div>
        </div>
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png" alt="Cecilia Manning" />
            <AvatarFallback className="rounded-lg text-xs">CM</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Quote requested</span>
            <span className="text-muted-foreground text-sm">3 Dec &lsquo;26</span>
          </div>
        </div>
      </Marquee>
      <Marquee
        vertical
        reverse
        duration={20}
        className="absolute bottom-0 left-1/2 h-1/2 w-full max-w-60 -translate-x-1/2"
      >
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarFallback className="rounded-lg bg-green-600/10 text-xs dark:bg-green-400/10">
              <BadgeCheckIcon className="size-4 text-green-600 dark:text-green-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Booking confirmed</span>
            <span className="text-muted-foreground text-sm">TZS 1.4M</span>
          </div>
        </div>
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarFallback className="rounded-lg bg-green-600/10 text-xs dark:bg-green-400/10">
              <BadgeCheckIcon className="size-4 text-green-600 dark:text-green-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Deposit received</span>
            <span className="text-muted-foreground text-sm">TZS 620k</span>
          </div>
        </div>
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarFallback className="rounded-lg bg-green-600/10 text-xs dark:bg-green-400/10">
              <BadgeCheckIcon className="size-4 text-green-600 dark:text-green-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Vendor booked</span>
            <span className="text-muted-foreground text-sm">TZS 2.1M</span>
          </div>
        </div>
        <div className="bg-card/95 flex items-start gap-3 rounded-md px-4 py-1.5 shadow-sm">
          <Avatar className="size-7 rounded-lg">
            <AvatarFallback className="rounded-lg bg-green-600/10 text-xs dark:bg-green-400/10">
              <BadgeCheckIcon className="size-4 text-green-600 dark:text-green-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">Final payment</span>
            <span className="text-muted-foreground text-sm">TZS 3.2M</span>
          </div>
        </div>
      </Marquee>
      <div className="from-foreground/[0.07] absolute inset-x-0 bottom-1/2 h-15 w-full -translate-y-10.5 bg-gradient-to-t to-transparent to-60% backdrop-blur-[1.5px]" />
      <div className="from-foreground/[0.07] absolute inset-x-0 top-1/2 h-15 w-full translate-y-10.5 bg-gradient-to-b to-transparent to-60% backdrop-blur-[1.5px]" />
      <CardBannerEdge className="absolute top-1/2 left-0 -translate-y-1/2" />
      <CardBannerEdge className="absolute top-1/2 right-0 -translate-y-1/2 rotate-y-180" />
      <div className="bg-card absolute inset-x-0 top-1/2 flex h-21.5 w-full -translate-y-1/2 items-center justify-center">
        <div className="text-card-foreground flex items-center gap-3.5">
          <Logo className="size-11.5" />
          <span className="text-2xl font-semibold">OpusFesta</span>
        </div>
      </div>
      <div className="from-card pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b to-transparent" />
      <div className="from-card pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent" />
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent" />
      <div className="from-card pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent" />
    </div>
  );
};

export default TurnViewersToOrders;
