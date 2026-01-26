"use client";

import { useState } from "react";
import { ArrowUpDown, Edit, Trash2, Eye, MoreHorizontal, Users, Archive, ArchiveRestore, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  salary_range: string | null;
  is_active: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  application_count?: number;
}

interface JobPostingTableProps {
  jobs: JobPosting[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onReuse?: (id: string) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function JobPostingTable({
  jobs,
  selectedIds,
  onSelect,
  onSelectAll,
  onDelete,
  onEdit,
  onPreview,
  onArchive,
  onUnarchive,
  onReuse,
  sortBy,
  sortDirection,
  onSort,
}: JobPostingTableProps) {
  const allSelected = jobs.length > 0 && jobs.every((job) => selectedIds.has(job.id));
  const someSelected = jobs.some((job) => selectedIds.has(job.id));

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    if (!onSort) {
      return <TableHead className={className}>{children}</TableHead>;
    }

    const isSorted = sortBy === field;
    return (
      <TableHead className={className}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 -ml-3 hover:bg-transparent"
          onClick={() => onSort(field)}
        >
          {children}
          <ArrowUpDown
            className={cn(
              "ml-2 h-4 w-4",
              isSorted && "text-primary",
              isSorted && sortDirection === "desc" && "rotate-180"
            )}
          />
        </Button>
      </TableHead>
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white dark:bg-card w-full">
      {/* Mobile: Scrollable container with proper padding */}
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table className="min-w-[800px] sm:min-w-0">
            <TableHeader>
              <TableRow className="border-b border-border dark:border-border">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <SortableHeader field="title">Title</SortableHeader>
                <SortableHeader field="department" className="hidden sm:table-cell">
                  Department
                </SortableHeader>
                <SortableHeader field="location" className="hidden md:table-cell">
                  Location
                </SortableHeader>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden xl:table-cell">Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Applications</TableHead>
                <SortableHeader field="created_at" className="hidden md:table-cell">
                  Created
                </SortableHeader>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No job postings found
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className={cn(
                      "border-b border-border dark:border-border",
                      "bg-white dark:bg-card",
                      "hover:bg-muted/50 dark:hover:bg-muted/50",
                      selectedIds.has(job.id) && "bg-muted/50 dark:bg-muted/50",
                      (!job.is_active || job.is_archived) && "opacity-60"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(job.id)}
                        onCheckedChange={(checked) => onSelect(job.id, checked === true)}
                        aria-label={`Select ${job.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground dark:text-foreground min-w-[200px] sm:min-w-0">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground dark:text-foreground break-words">{job.title}</span>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-muted-foreground sm:hidden">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          {job.salary_range && (
                            <>
                              <span>•</span>
                              <span>{job.salary_range}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-foreground dark:text-foreground whitespace-nowrap">{job.department}</TableCell>
                    <TableCell className="hidden md:table-cell text-foreground dark:text-foreground whitespace-nowrap">{job.location}</TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      <span className="text-sm text-foreground dark:text-foreground">
                        {job.employment_type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground dark:text-muted-foreground whitespace-nowrap">
                      {job.salary_range || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {job.is_archived ? (
                        <Badge className="bg-orange-500 text-white border-0 font-medium dark:bg-orange-600 dark:text-white text-xs">
                          Archived
                        </Badge>
                      ) : job.is_active ? (
                        <Badge className="bg-green-500 text-white border-0 font-medium dark:bg-green-600 dark:text-white text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white border-0 font-medium dark:bg-red-600 dark:text-white text-xs">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      <Link
                        href={`/careers/applications?jobPostingId=${job.id}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{job.application_count || 0}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground dark:text-muted-foreground whitespace-nowrap">
                      {new Date(job.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          type="button"
                          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 dark:hover:bg-muted/50"
                          onClick={() => onDelete(job.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 dark:hover:bg-muted/50"
                          onClick={() => onPreview(job.id)}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 dark:hover:bg-muted/50"
                              aria-label="More options"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-popover dark:border-border">
                            {onReuse && job.is_archived && (
                              <DropdownMenuItem onClick={() => onReuse(job.id)} className="dark:hover:bg-accent dark:text-foreground">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reuse
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEdit(job.id)} className="dark:hover:bg-accent dark:text-foreground">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {onArchive && onUnarchive && (
                              <>
                                {job.is_archived ? (
                                  <DropdownMenuItem onClick={() => onUnarchive(job.id)} className="dark:hover:bg-accent dark:text-foreground">
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Unarchive
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => onArchive(job.id)} className="dark:hover:bg-accent dark:text-foreground">
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
