"use client";

import { Label, Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

import { cn } from "@/lib/utils";

const growthChartData = [
  { month: "january", sales: 340, fill: "var(--color-january)" },
  { month: "february", sales: 200, fill: "var(--color-february)" },
  { month: "march", sales: 200, fill: "var(--color-march)" },
];

const growthChartConfig = {
  sales: {
    label: "Sales",
  },
  january: {
    label: "January",
    color: "var(--primary)",
  },
  february: {
    label: "February",
    color: "color-mix(in oklab, var(--primary) 60%, transparent)",
  },
  march: {
    label: "March",
    color: "color-mix(in oklab, var(--primary) 20%, transparent)",
  },
} satisfies ChartConfig;

const cardData = {
  title: "TZS 27.9M",
  description: "Bookings value",
  children: (
    <>
      <ChartContainer config={growthChartConfig} className="h-28 w-full">
        <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={growthChartData} dataKey="sales" nameKey="month" innerRadius={34} outerRadius={52} paddingAngle={3}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-medium">
                        TZS 23M
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </>
  ),
  changePercentage: "+12%",
};

const CheckOrdersStatus = ({ className }: { className?: string }) => {
  return (
    <div className="relative flex h-46 items-start justify-center overflow-hidden">
      <Card
        className={cn(
          "group max-w-65 justify-between gap-2 rounded-2xl border border-border/60 bg-background shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)]",
          className
        )}
      >
        <CardHeader className="gap-1 px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">{cardData.title}</CardTitle>
            <span className="text-sm">{cardData.changePercentage}</span>
          </div>
          <CardDescription className="text-muted-foreground text-base">{cardData.description}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 transition-transform duration-300 group-hover:-translate-y-2">
          {cardData.children}
        </CardContent>
      </Card>
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t to-transparent" />
    </div>
  );
};

export default CheckOrdersStatus;
