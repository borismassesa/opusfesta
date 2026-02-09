'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/lib/toast';
import {
  Users,
  UserPlus,
  Loader2,
  Trash2,
  Shield,
} from 'lucide-react';

type MemberRole = 'owner' | 'manager' | 'staff';
type MemberStatus = 'active' | 'invited' | 'disabled';

interface TeamMember {
  id: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
}

function roleVariant(role: MemberRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'owner':
      return 'default';
    case 'manager':
      return 'secondary';
    case 'staff':
      return 'outline';
    default:
      return 'outline';
  }
}

function statusVariant(status: MemberStatus): 'success' | 'warning' | 'secondary' {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
      return 'warning';
    case 'disabled':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

export default function TeamPage() {
  const queryClient = useQueryClient();
  const supabase = useClerkSupabaseClient();
  const {
    vendorId,
    vendorName,
    membershipRole,
    dbUserId,
    isAccessLoading,
  } = useVendorPortalAccess();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('staff');

  const isOwner = membershipRole === 'owner';

  // Fetch team members
  const {
    data: members = [],
    isLoading,
  } = useQuery<TeamMember[]>({
    queryKey: ['vendor-team', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const { data, error } = await supabase
        .from('vendor_memberships')
        .select('id, role, status, created_at, user:users(id, name, email, avatar)')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      if (!data) return [];

      return data.map((row: Record<string, unknown>) => {
        const rawUser = row.user;
        const user = rawUser && Array.isArray(rawUser) ? rawUser[0] : rawUser;
        return {
          id: row.id as string,
          role: row.role as MemberRole,
          status: row.status as MemberStatus,
          created_at: row.created_at as string,
          user: user as TeamMember['user'],
        };
      });
    },
    enabled: !!vendorId,
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId || !dbUserId) throw new Error('Missing vendor context');
      if (!inviteEmail.trim()) throw new Error('Email is required');

      // Look up user by email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail.toLowerCase().trim())
        .maybeSingle();

      if (!existingUser) {
        throw new Error('No user found with that email. They must sign up first.');
      }

      // Check if membership already exists
      const { data: existingMembership } = await supabase
        .from('vendor_memberships')
        .select('id')
        .eq('vendor_id', vendorId)
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMembership) {
        throw new Error('This user is already a team member.');
      }

      const { error } = await supabase
        .from('vendor_memberships')
        .insert({
          vendor_id: vendorId,
          user_id: existingUser.id,
          role: inviteRole,
          status: 'invited',
          invited_by: dbUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-team', vendorId] });
      toast.success('Team member invited successfully.');
      setInviteEmail('');
      setInviteRole('staff');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to invite team member');
    },
  });

  // Update role mutation
  const roleMutation = useMutation({
    mutationFn: async ({ membershipId, newRole }: { membershipId: string; newRole: MemberRole }) => {
      const { error } = await supabase
        .from('vendor_memberships')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', membershipId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-team', vendorId] });
      toast.success('Member role updated.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await supabase
        .from('vendor_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-team', vendorId] });
      toast.success('Team member removed.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove team member');
    },
  });

  if (isAccessLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:px-10 space-y-8">
        <div>
          <Skeleton className="h-8 w-52 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:px-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>Vendor profile not found. Complete onboarding first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:px-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Team Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage team members and roles for {vendorName || 'your business'}.
        </p>
      </div>

      {/* Invite Form (owners only) */}
      {isOwner && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>
                  Add a new member to your vendor team. They must have an existing account.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="team-member@example.com"
                />
              </div>
              <div className="w-full sm:w-40 space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => inviteMutation.mutate()}
                disabled={!inviteEmail.trim() || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </>
                )}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Note: Invite email notifications are not yet implemented. The member record will be created with &quot;invited&quot; status.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? 's' : ''} on this team.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No team members found.
            </p>
          ) : (
            <div className="space-y-1">
              {members.map((member, index) => {
                const isSelf = member.user?.id === dbUserId;
                const memberName = member.user?.name || member.user?.email || 'Unknown';
                const memberEmail = member.user?.email || '';
                const initials = getInitials(member.user?.name ?? null, member.user?.email ?? null);

                return (
                  <div key={member.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center gap-4 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={member.user?.avatar || undefined}
                          alt={memberName}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{memberName}</p>
                          {isSelf && (
                            <span className="text-xs text-muted-foreground">(you)</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{memberEmail}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={roleVariant(member.role)}>
                          {member.role === 'owner' && <Shield className="mr-1 h-3 w-3" />}
                          {member.role}
                        </Badge>
                        <Badge variant={statusVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </div>

                      <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(member.created_at)}
                      </span>

                      {/* Role change & remove - only for owners, can't modify self */}
                      {isOwner && !isSelf && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={member.role}
                            onValueChange={(newRole) =>
                              roleMutation.mutate({
                                membershipId: member.id,
                                newRole: newRole as MemberRole,
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeMutation.mutate(member.id)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
