"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface FilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface DataTableFiltersProps {
  filters: DataTableFilter[];
  className?: string;
}

export function DataTableFilters({
  filters,
  className,
}: DataTableFiltersProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold mb-4">Filter</h3>
      <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              {filter.label}
            </Label>
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Select ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
