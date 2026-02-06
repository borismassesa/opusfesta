"use client";

import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, ChartColumnBigIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, XAxis } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
const avatars = [
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
    fallback: "AY",
    name: "Amina Yusuf",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
    fallback: "DK",
    name: "Daniel Kato",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
    fallback: "GM",
    name: "Grace Mtei",
  },
  {
    src: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
    fallback: "LN",
    name: "Luca N.",
  },
];

const physicalProductsChartData = [
  { month: "Jan", sales: 280 },
  { month: "Feb", sales: 400 },
  { month: "Mar", sales: 280 },
  { month: "Apr", sales: 590 },
  { month: "May", sales: 360 },
  { month: "Jun", sales: 460 },
  { month: "Jul", sales: 400 },
];

const physicalProductsChartConfig = {
  sales: {
    label: "Bookings",
  },
} satisfies ChartConfig;

const dailySalesChartData = [
  { day: "Monday", sales: 120 },
  { day: "Tuesday", sales: 240 },
  { day: "Wednesday", sales: 190 },
  { day: "Thursday", sales: 270 },
  { day: "Friday", sales: 210 },
  { day: "Saturday", sales: 320 },
  { day: "Sunday", sales: 270 },
];

const dailySalesChartConfig = {
  sales: {
    label: "Bookings",
  },
} satisfies ChartConfig;

const PerformanceCard = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <ChartColumnBigIcon className="size-6" />
          <span className="text-lg font-semibold">Bookings performance</span>
        </div>
      </CardHeader>
      <Tabs defaultValue="new-couples" className="flex flex-1 min-h-0 flex-col gap-4">
        <TabsList className="bg-background w-full rounded-none border-b p-0">
          <TabsTrigger
            value="new-couples"
            className="bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent focus-visible:z-1 data-[state=active]:shadow-none"
          >
            New Couples
          </TabsTrigger>
          <TabsTrigger
            value="vendor-leads"
            className="bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent focus-visible:z-1 data-[state=active]:shadow-none"
          >
            Vendor Leads
          </TabsTrigger>
          <TabsTrigger
            value="weekly-bookings"
            className="bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent focus-visible:z-1 data-[state=active]:shadow-none"
          >
            Weekly Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="new-couples"
          className="flex min-h-0 flex-1 flex-col justify-between gap-4 overflow-y-auto px-6 pb-6"
        >
          <div className="bg-muted/40 flex items-center justify-between rounded-xl px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">New couples this week</span>
              <span className="text-xl font-semibold">148</span>
            </div>
            <Badge className="bg-primary/10 [a&]:hover:bg-primary/5 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 text-primary border-none px-3 py-1 focus-visible:outline-none">
              +12%
            </Badge>
          </div>

          <div className="bg-muted/40 flex flex-col gap-4 rounded-xl px-5 py-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Confirmed bookings</span>
                <span className="text-xl font-semibold">TZS 78.2M</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-6.5">
                  <AvatarFallback className="bg-primary/10 text-primary shrink-0">
                    <ArrowUpIcon className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xl font-semibold">14.8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <div className="flex -space-x-2">
                  {avatars.map((avatar, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Avatar className="ring-background ring-2 transition-all duration-300 ease-in-out hover:z-1 hover:-translate-y-1 hover:shadow-md">
                          <AvatarImage src={avatar.src} alt={avatar.name} />
                          <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{avatar.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
              <Button className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 h-7 rounded-full px-2 py-1 text-xs">
                View vendors
                <ArrowRightIcon />
              </Button>
            </div>
          </div>

          <p className="text-center">
            <span className="font-medium">Increase 24%</span>{" "}
            <span className="text-muted-foreground text-sm">More follow-ups to convert pending inquiries.</span>
          </p>
        </TabsContent>

        <TabsContent
          value="vendor-leads"
          className="flex min-h-0 flex-1 flex-col justify-between gap-4 overflow-y-auto px-6 pb-6"
        >
          <div className="bg-muted/40 flex items-center justify-between rounded-xl px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Venue inquiries</span>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary/10 text-primary shrink-0">
                    <ArrowUpIcon className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-lg font-medium">1,589</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Vendor replies</span>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary/10 text-primary shrink-0">
                    <ArrowDownIcon className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-lg font-medium">1,365</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 space-y-5 rounded-xl py-4 shadow-sm">
            <div className="flex items-center justify-between px-6">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Deposits received</span>
                <span className="text-xl font-semibold">TZS 32.4M</span>
              </div>
              <Badge className="bg-primary/10 [a&]:hover:bg-primary/5 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 text-primary rounded-sm border-none focus-visible:outline-none">
                <ArrowUpIcon className="size-4" />
                5.6%
              </Badge>
            </div>

            <ChartContainer config={physicalProductsChartConfig} className="h-30 w-full">
              <AreaChart
                data={physicalProductsChartData}
                margin={{
                  left: 20,
                  right: 20,
                }}
                className="stroke-3"
              >
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="90%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Area dataKey="sales" type="natural" fill="url(#fillSales)" stroke="var(--chart-2)" stackId="a" />
              </AreaChart>
            </ChartContainer>
          </div>

          <p className="text-center">
            <span className="font-medium">18%</span>{" "}
            <span className="text-muted-foreground text-sm">to reach this month's booking target</span>
          </p>
        </TabsContent>

        <TabsContent
          value="weekly-bookings"
          className="flex min-h-0 flex-1 flex-col justify-between gap-4 overflow-y-auto px-6 pb-6"
        >
          <div className="bg-muted/40 space-y-5 rounded-xl py-4 shadow-sm">
            <div className="flex items-center justify-between px-6">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Average booking value</span>
                <span className="text-xl font-semibold">TZS 8.2M</span>
              </div>
              <Badge className="bg-primary/10 [a&]:hover:bg-primary/5 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 text-primary rounded-sm border-none focus-visible:outline-none">
                <ArrowDownIcon className="size-4" />
                3.4%
              </Badge>
            </div>

            <ChartContainer config={dailySalesChartConfig} className="h-32.5 w-full px-1.5">
              <BarChart
                accessibilityLayer
                data={dailySalesChartData}
                barSize={12}
                margin={{
                  left: 0,
                  right: 0,
                }}
              >
                <Bar
                  dataKey="sales"
                  fill="var(--chart-1)"
                  background={{ fill: "color-mix(in oklab, var(--primary) 10%, transparent)", radius: 12 }}
                  radius={12}
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              </BarChart>
            </ChartContainer>
          </div>

          <p className="text-center">
            <span className="font-medium">12%</span>{" "}
            <span className="text-muted-foreground text-sm">to hit the weekly booking target</span>
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PerformanceCard;
