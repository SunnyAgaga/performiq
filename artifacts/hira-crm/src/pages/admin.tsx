import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users, UserPlus, ShieldCheck, Headphones, Search,
  Loader2, MoreHorizontal, Pencil, PowerOff, Power,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

interface ApiAgent {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent" | "supervisor";
  isActive: boolean;
  activeConversations: number;
  resolvedToday: number;
  rating: number;
  createdAt: string;
}

const ROLE_META: Record<string, { label: string; badge: string }> = {
  admin:      { label: "Admin",      badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  supervisor: { label: "Supervisor", badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  agent:      { label: "Agent",      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
};

function RolePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-red-500" />
            <div>
              <span className="font-medium">Admin</span>
              <span className="text-muted-foreground text-xs ml-2">Full access, user management</span>
            </div>
          </div>
        </SelectItem>
        <SelectItem value="supervisor">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            <div>
              <span className="font-medium">Supervisor</span>
              <span className="text-muted-foreground text-xs ml-2">Manage agents, view all queues</span>
            </div>
          </div>
        </SelectItem>
        <SelectItem value="agent">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-blue-500" />
            <div>
              <span className="font-medium">Agent</span>
              <span className="text-muted-foreground text-xs ml-2">Handle conversations</span>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function Admin() {
  const { agent: me } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("agent");

  const [editTarget, setEditTarget] = useState<ApiAgent | null>(null);
  const [editRole, setEditRole] = useState("");

  if (me?.role !== "admin") return <Redirect to="/" />;

  const { data: agents = [], isLoading } = useQuery<ApiAgent[]>({
    queryKey: ["agents"],
    queryFn: () => apiGet("/agents"),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => apiPost("/agents", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      setIsCreateOpen(false);
      setCreateName(""); setCreateEmail(""); setCreatePassword(""); setCreateRole("agent");
      toast({ title: "User created", description: "The new account is ready." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message || "Could not create user.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; role?: string; isActive?: boolean }) =>
      apiPut(`/agents/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      setEditTarget(null);
      toast({
        title: vars.isActive !== undefined
          ? (vars.isActive ? "User activated" : "User deactivated")
          : "Role updated",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update user.", variant: "destructive" });
    },
  });

  const filtered = useMemo(() => agents.filter((a) => {
    const q = search.toLowerCase();
    return (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      && (roleFilter === "all" || a.role === roleFilter);
  }), [agents, search, roleFilter]);

  const counts = useMemo(() => ({
    total: agents.length,
    active: agents.filter((a) => a.isActive).length,
    admin: agents.filter((a) => a.role === "admin").length,
    supervisor: agents.filter((a) => a.role === "supervisor").length,
    agent: agents.filter((a) => a.role === "agent").length,
  }), [agents]);

  return (
    <div className="p-8 h-full flex flex-col gap-6">

      {/* Header + Add User */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage agents, supervisors, and admins.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-user">
              <UserPlus className="h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a team member and assign their role.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="cn">Full Name</Label>
                <Input id="cn" placeholder="e.g. Sarah Mitchell" value={createName}
                  onChange={(e) => setCreateName(e.target.value)} data-testid="input-create-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ce">Email Address</Label>
                <Input id="ce" type="email" placeholder="sarah@hiracrm.com" value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)} data-testid="input-create-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp">Initial Password</Label>
                <Input id="cp" type="password" placeholder="Minimum 8 characters" value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)} data-testid="input-create-password" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <RolePicker value={createRole} onChange={setCreateRole} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                disabled={!createName || !createEmail || !createPassword || createMutation.isPending}
                onClick={() => createMutation.mutate({ name: createName, email: createEmail, password: createPassword, role: createRole })}
                data-testid="button-submit-create-user"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 shrink-0">
        {[
          { label: "Total Users",  value: counts.total,      sub: `${counts.active} active`,  color: "bg-primary/10 text-primary",                      Icon: Users },
          { label: "Admins",       value: counts.admin,      sub: "Full access",               color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",        Icon: ShieldCheck },
          { label: "Supervisors",  value: counts.supervisor, sub: "Team leads",                color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400", Icon: ShieldCheck },
          { label: "Agents",       value: counts.agent,      sub: "Front-line support",        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",    Icon: Headphones },
        ].map(({ label, value, sub, color, Icon }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold">{isLoading ? "—" : value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3 shrink-0 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email…" className="pl-9 bg-background"
              value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-users" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-role-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Active</TableHead>
                <TableHead className="text-right">Resolved Today</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell></TableRow>
              ) : filtered.map((agent) => {
                const role = ROLE_META[agent.role] ?? ROLE_META.agent;
                const isSelf = agent.id === me?.id;
                return (
                  <TableRow key={agent.id} data-testid={`user-row-${agent.id}`}
                    className={!agent.isActive ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${agent.email}`} />
                          <AvatarFallback className="text-xs font-semibold">{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {agent.name}
                            {isSelf && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">you</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{agent.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${role.badge} border-none`}>{role.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={agent.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-none"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-none"}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{agent.activeConversations}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{agent.resolvedToday}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{agent.rating.toFixed(1)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {agent.createdAt ? formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true }) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isSelf}
                            data-testid={`user-actions-${agent.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="gap-2 cursor-pointer"
                            onClick={() => { setEditTarget(agent); setEditRole(agent.role); }}>
                            <Pencil className="h-4 w-4" /> Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={`gap-2 cursor-pointer ${agent.isActive
                              ? "text-destructive focus:text-destructive"
                              : "text-green-600 focus:text-green-600"}`}
                            onClick={() => updateMutation.mutate({ id: agent.id, isActive: !agent.isActive })}
                            disabled={updateMutation.isPending}>
                            {agent.isActive
                              ? <><PowerOff className="h-4 w-4" /> Deactivate</>
                              : <><Power className="h-4 w-4" /> Activate</>}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  No users found
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Change the role assigned to {editTarget?.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${editTarget?.email}`} />
                <AvatarFallback className="text-xs">{editTarget?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{editTarget?.name}</p>
                <p className="text-xs text-muted-foreground">{editTarget?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Role</Label>
              <RolePicker value={editRole} onChange={setEditRole} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button
              disabled={!editRole || editRole === editTarget?.role || updateMutation.isPending}
              onClick={() => editTarget && updateMutation.mutate({ id: editTarget.id, role: editRole })}
              data-testid="button-save-role">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
