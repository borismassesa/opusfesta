'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, Phone, CalendarDays, Users } from 'lucide-react';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import {
  getVendorLeads,
  updateLeadStatus,
  type InquiryStatus,
  type VendorLeadRecord,
} from '@/lib/supabase/business';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';

const STATUS_OPTIONS: InquiryStatus[] = ['pending', 'responded', 'accepted', 'declined', 'closed'];

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not specified';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusVariant(status: InquiryStatus): 'default' | 'warning' | 'success' | 'destructive' | 'secondary' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'responded':
      return 'secondary';
    case 'accepted':
      return 'success';
    case 'declined':
      return 'destructive';
    case 'closed':
      return 'default';
    default:
      return 'secondary';
  }
}

function statusLabel(status: InquiryStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

type LeadDraft = {
  status: InquiryStatus;
  response: string;
};

export default function LeadsPage() {
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const { vendorId, vendorName } = useVendorPortalAccess();
  const [draftByLead, setDraftByLead] = useState<Record<string, LeadDraft>>({});

  const {
    data: leads = [],
    isLoading,
  } = useQuery({
    queryKey: ['vendor-leads', vendorId],
    queryFn: () => getVendorLeads(vendorId!, supabase),
    enabled: !!vendorId,
  });

  useEffect(() => {
    if (!leads.length) {
      return;
    }

    setDraftByLead((prev) => {
      const next = { ...prev };
      for (const lead of leads) {
        if (!next[lead.id]) {
          next[lead.id] = {
            status: lead.status,
            response: lead.vendor_response || '',
          };
        }
      }
      return next;
    });
  }, [leads]);

  const saveMutation = useMutation({
    mutationFn: async ({ leadId, draft }: { leadId: string; draft: LeadDraft }) => {
      const success = await updateLeadStatus(leadId, draft.status, draft.response, supabase);
      if (!success) {
        throw new Error('Failed to save lead updates');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vendor-leads', vendorId] });
      toast.success('Lead updated successfully.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead');
    },
  });

  const stats = useMemo(() => {
    const totals: Record<InquiryStatus, number> = {
      pending: 0,
      responded: 0,
      accepted: 0,
      declined: 0,
      closed: 0,
    };

    for (const lead of leads) {
      totals[lead.status] += 1;
    }

    return {
      total: leads.length,
      ...totals,
    };
  }, [leads]);

  const updateDraft = (leadId: string, patch: Partial<LeadDraft>) => {
    setDraftByLead((prev) => ({
      ...prev,
      [leadId]: {
        status: prev[leadId]?.status ?? 'pending',
        response: prev[leadId]?.response ?? '',
        ...patch,
      },
    }));
  };

  const saveLead = (lead: VendorLeadRecord) => {
    const draft = draftByLead[lead.id] || {
      status: lead.status,
      response: lead.vendor_response || '',
    };

    saveMutation.mutate({ leadId: lead.id, draft });
  };

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>Vendor profile not found. Complete onboarding first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and respond to inquiries for {vendorName || 'your storefront'}.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Responded</CardDescription>
            <CardTitle className="text-2xl">{stats.responded}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-2xl">{stats.accepted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Declined</CardDescription>
            <CardTitle className="text-2xl">{stats.declined}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Closed</CardDescription>
            <CardTitle className="text-2xl">{stats.closed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No leads yet</CardTitle>
            <CardDescription>
              New client inquiries will appear here as soon as couples contact your vendor profile.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const draft = draftByLead[lead.id] || {
              status: lead.status,
              response: lead.vendor_response || '',
            };

            return (
              <Card key={lead.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle className="text-lg">{lead.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Received {formatDate(lead.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant={statusVariant(draft.status)}>{statusLabel(draft.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {lead.phone || 'No phone provided'}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {lead.event_type} · {formatDate(lead.event_date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {lead.guest_count ? `${lead.guest_count} guests` : 'Guest count not provided'}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-3 text-sm text-foreground">{lead.message}</div>

                  <div className="grid gap-3 md:grid-cols-[220px,1fr]">
                    <Select
                      value={draft.status}
                      onValueChange={(value) => updateDraft(lead.id, { status: value as InquiryStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Textarea
                      value={draft.response}
                      onChange={(event) => updateDraft(lead.id, { response: event.target.value })}
                      placeholder="Write a response note (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveLead(lead)}
                      disabled={saveMutation.isPending}
                      variant="secondary"
                    >
                      {saveMutation.isPending ? 'Saving...' : 'Save Lead Update'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
