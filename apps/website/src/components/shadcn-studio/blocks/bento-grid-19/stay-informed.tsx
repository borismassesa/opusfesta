"use client";

import { useEffect, useState } from "react";

import { BadgeCheckIcon, ShoppingCartIcon, TriangleAlertIcon } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

import { cn } from "@/lib/utils";

const data = [
  {
    title: "New inquiry received",
    time: "10:00 AM",
    icon: ShoppingCartIcon,
  },
  {
    title: "Deposit confirmed",
    time: "09:13 PM",
    icon: BadgeCheckIcon,
  },
  {
    title: "Couple requested a tour",
    time: "12:24 AM",
    icon: ShoppingCartIcon,
  },
  {
    title: "Proposal approved",
    time: "09:30 PM",
    icon: BadgeCheckIcon,
  },
  {
    title: "Schedule update",
    time: "04:12 PM",
    icon: TriangleAlertIcon,
  },
  {
    title: "Payment received",
    time: "03:45 PM",
    icon: BadgeCheckIcon,
  },
];

const StayInformed = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-52 flex-1">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          slidesToScroll: 1,
        }}
        plugins={[Autoplay({ delay: 2500, stopOnInteraction: false })]}
        orientation="vertical"
        className="relative"
      >
        <CarouselContent className="-mt-1 max-h-52 items-center">
          {data.map((item, index) => (
            <CarouselItem
              key={index}
              className={cn("z-1 w-full max-w-60 cursor-grab pt-1 select-none active:cursor-grabbing", {
                "z-10": index === current,
              })}
            >
              <div
                className={cn(
                  "bg-background/90 flex scale-100 items-center gap-3 rounded-md px-4 py-2 shadow-sm transition-transform duration-500",
                  {
                    "origin-center scale-115 shadow-lg": index === current,
                  }
                )}
              >
                <Avatar className="size-9 rounded-sm">
                  <AvatarFallback className="bg-primary/10 rounded-sm">
                    <item.icon className="text-primary size-6 stroke-1" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-sm font-light">{item.time}</span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="from-card pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b to-transparent" />
        <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent" />
      </Carousel>
    </div>
  );
};

export default StayInformed;
