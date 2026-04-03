import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SiWhatsapp, SiFacebook, SiInstagram } from "react-icons/si";
import { CheckCircle2, Bot, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ApiAgent { id: number; name: string; email: string; role: string; isActive: boolean; }

export default function Settings() {
  const { toast } = useToast();
  const { agent: currentAgent, logout } = useAuth();
  const qc = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("agent");

  const { data: agents = [], isLoading } = useQuery<ApiAgent[]>({
    queryKey: ["agents"],
    queryFn: () => apiGet("/agents"),
  });

  const addAgentMutation = useMutation({
    mutationFn: (data: object) => apiPost("/agents", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      setIsAddOpen(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("agent");
      toast({ title: "Agent added", description: "New agent has been created." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; role?: string; isActive?: boolean }) =>
      apiPut(`/agents/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your configuration has been updated successfully." });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your team, channels, and AI configuration.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Connected Channels</CardTitle>
            <CardDescription>Manage the platforms CommsCRM is listening to.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <SiWhatsapp className="h-5 w-5 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-semibold">WhatsApp Business</h4>
                  <p className="text-sm text-muted-foreground">+1 (555) 019-2834</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Connected
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
                  <SiFacebook className="h-5 w-5 text-[#1877F2]" />
                </div>
                <div>
                  <h4 className="font-semibold">Facebook Messenger</h4>
                  <p className="text-sm text-muted-foreground">@HiraOfficial</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Connected
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-muted/20 opacity-70">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <SiInstagram className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Instagram Direct</h4>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Connect Account</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> AI & Automation
            </CardTitle>
            <CardDescription>Configure how the AI bot handles incoming messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">First-line Deflection Bot</Label>
                <p className="text-sm text-muted-foreground">Automatically attempt to resolve queries before routing to human agents.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Bot Personality Tone</Label>
              <Select defaultValue="professional">
                <SelectTrigger className="w-[300px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Direct</SelectItem>
                  <SelectItem value="friendly">Friendly & Casual</SelectItem>
                  <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Auto-escalation Threshold</Label>
              <div className="text-sm text-muted-foreground mb-2">Escalate to human if sentiment score drops below:</div>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="100" defaultValue="40" className="w-[300px] accent-primary" />
                <span className="font-medium text-sm">40%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-6 py-4">
            <Button onClick={handleSave} data-testid="button-save-ai-settings">Save Automation Settings</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Add agents and manage their roles.</CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-agent">Add Agent</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Agent</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Sarah Mitchell" /></div>
                  <div className="space-y-2"><Label>Email Address</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="sarah@hiracrm.com" /></div>
                  <div className="space-y-2"><Label>Initial Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" /></div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button disabled={!newName || !newEmail || !newPassword || addAgentMutation.isPending} onClick={() => addAgentMutation.mutate({ name: newName, email: newEmail, password: newPassword, role: newRole })}>
                    {addAgentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Agent"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border" data-testid={`agent-row-${agent.id}`}>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name} {agent.id === currentAgent?.id && <span className="text-xs text-muted-foreground">(you)</span>}</div>
                        <div className="text-sm text-muted-foreground">{agent.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select defaultValue={agent.role} onValueChange={(val) => updateAgentMutation.mutate({ id: agent.id, role: val })}>
                        <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={agent.id === currentAgent?.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout} data-testid="button-logout">Sign out</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
