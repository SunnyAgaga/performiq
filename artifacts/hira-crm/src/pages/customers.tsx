import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChannelIcon, getChannelColor } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, Mail, Phone, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link } from "wouter";
import { apiGet } from "@/lib/api";

interface ApiCustomer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  channel: "whatsapp" | "facebook" | "instagram";
  tags: string[];
  notes: string | null;
  totalConversations: number;
  lastSeen: string | null;
}
interface CustomersResponse { total: number; customers: ApiCustomer[]; }

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);

  const params = new URLSearchParams({ limit: "50" });
  if (searchQuery) params.set("search", searchQuery);

  const { data, isLoading } = useQuery<CustomersResponse>({
    queryKey: ["customers", searchQuery],
    queryFn: () => apiGet(`/customers?${params.toString()}`),
    staleTime: 10000,
  });

  const customers = data?.customers ?? [];

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="px-8 pt-6 pb-4 shrink-0 bg-background border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage your contacts and track growth across platforms.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-2">Add Customer</Button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 h-full flex flex-col gap-4">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between shrink-0 bg-muted/20">
              <div className="relative w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone..."
                  className="pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-customers"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{data?.total ?? 0} contacts</Badge>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : customers.map((customer) => {
                    const Icon = getChannelIcon(customer.channel);
                    return (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => setSelectedCustomer(customer)}
                        data-testid={`customer-row-${customer.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{customer.phone ?? "—"}</div>
                            <div className="text-muted-foreground text-xs">{customer.email ?? "—"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon className={`h-4 w-4 ${getChannelColor(customer.channel)}`} />
                            <span className="capitalize">{customer.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(customer.tags ?? []).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-muted">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{customer.totalConversations}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {customer.lastSeen ? formatDistanceToNow(new Date(customer.lastSeen), { addSuffix: true }) : "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && customers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No customers found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Customer Detail Sheet */}
      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedCustomer && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                  <AvatarFallback className="text-2xl">{selectedCustomer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
                    {(() => { const Icon = getChannelIcon(selectedCustomer.channel); return <Icon className={`h-4 w-4 ${getChannelColor(selectedCustomer.channel)}`} />; })()}
                    Preferred: <span className="capitalize text-foreground">{selectedCustomer.channel}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link href="/inbox">
                    <Button className="gap-2" data-testid="button-message-customer">
                      <MessageSquare className="h-4 w-4" /> Message
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2">Edit Profile</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Info</h3>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedCustomer.phone ?? "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedCustomer.email ?? "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedCustomer.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">{tag}</Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6 rounded-full text-xs">+ Add Tag</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Notes</h3>
                <div className="bg-muted/30 p-4 rounded-lg border text-sm">
                  {selectedCustomer.notes ? <p>{selectedCustomer.notes}</p> : <p className="text-muted-foreground italic">No notes added yet.</p>}
                  <Button variant="link" className="px-0 h-auto text-xs mt-2">Edit Notes</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Interaction Summary</h3>
                <div className="bg-muted/30 p-4 rounded-lg border text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total conversations</span>
                    <span className="font-medium">{selectedCustomer.totalConversations}</span>
                  </div>
                  {selectedCustomer.lastSeen && (
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground">Last seen</span>
                      <span className="font-medium">{formatDistanceToNow(new Date(selectedCustomer.lastSeen), { addSuffix: true })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
