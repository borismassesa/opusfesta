"use client";

import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FiltersPanelProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  departments: string[];
  locations: string[];
  onClearFilters: () => void;
  hideStatusFilter?: boolean;
}

export function FiltersPanel({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  locationFilter,
  onLocationChange,
  statusFilter,
  onStatusChange,
  departments,
  locations,
  onClearFilters,
  hideStatusFilter = false,
}: FiltersPanelProps) {
  const hasActiveFilters =
    searchQuery ||
    departmentFilter !== "all" ||
    locationFilter !== "all" ||
    (!hideStatusFilter && statusFilter !== "all");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Filter</h3>
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">
            Select Department
          </label>
          <Select value={departmentFilter} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">
            Select Location
          </label>
          <Select value={locationFilter} onValueChange={onLocationChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hideStatusFilter && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">
              Select Status
            </label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground">
            Search
          </label>
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {departmentFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Department: {departmentFilter}
              <button
                onClick={() => onDepartmentChange("all")}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {locationFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Location: {locationFilter}
              <button
                onClick={() => onLocationChange("all")}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {!hideStatusFilter && statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
              <button
                onClick={() => onStatusChange("all")}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
