import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChannelIcon, getChannelColor, getStatusColor } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MoreVertical, Send, CheckCircle, Paperclip, Smile, UserPlus, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiGet, apiPost, apiPut } from "@/lib/api";

interface ApiAgent { id: number; name: string; avatar: string | null; email: string; role: string; }
interface ApiCustomer { id: number; name: string; phone: string | null; channel: string; }
interface ApiConversation {
  id: number;
  channel: "whatsapp" | "facebook" | "instagram";
  status: "open" | "pending" | "resolved" | "closed";
  unreadCount: number;
  lastMessageAt: string | null;
  customer: ApiCustomer;
  assignedAgent: ApiAgent | null;
}
interface ApiMessage { id: number; sender: "customer" | "agent" | "bot"; content: string; isRead: boolean; createdAt: string; }
interface ConversationListResponse { total: number; conversations: ApiConversation[]; }

export default function Inbox() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const convParams = new URLSearchParams();
  if (filter !== "all") convParams.set("status", filter);
  if (searchQuery) convParams.set("search", searchQuery);
  convParams.set("limit", "50");

  const { data: convData, isLoading: convLoading } = useQuery<ConversationListResponse>({
    queryKey: ["conversations", filter, searchQuery],
    queryFn: () => apiGet(`/conversations?${convParams.toString()}`),
    refetchInterval: 15000,
  });

  const conversations = convData?.conversations ?? [];

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ApiMessage[]>({
    queryKey: ["messages", selectedId],
    queryFn: () => apiGet(`/conversations/${selectedId}/messages`),
    enabled: !!selectedId,
    refetchInterval: 10000,
  });

  const { data: agentsList = [] } = useQuery<ApiAgent[]>({
    queryKey: ["agents"],
    queryFn: () => apiGet("/agents"),
  });

  useEffect(() => {
    if (conversations.length > 0 && !selectedId) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: ({ content }: { content: string }) =>
      apiPost(`/conversations/${selectedId}/messages`, { content, sender: "agent" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const updateConvMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; status?: string; assignedAgentId?: number | null }) =>
      apiPut(`/conversations/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleSend = () => {
    if (!replyText.trim() || !selectedId) return;
    sendMessageMutation.mutate({ content: replyText });
    setReplyText("");
  };

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Left Panel: Conversation List */}
      <div className="w-[380px] border-r flex flex-col bg-card shrink-0">
        <div className="p-4 border-b flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Inbox</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9 bg-muted/50 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-inbox"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[110px] bg-muted/50 border-none" data-testid="select-filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y">
            {convLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {conversations.map((conv) => {
              const Icon = getChannelIcon(conv.channel);
              const isSelected = conv.id === selectedId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                  data-testid={`conversation-item-${conv.id}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{conv.customer.name}</div>
                      <Icon className={`h-3 w-3 ${getChannelColor(conv.channel)}`} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "HH:mm") : ""}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-muted-foreground truncate pr-4 flex-1">
                      {conv.customer.phone ?? conv.channel}
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 shrink-0">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(conv.status)}`}>
                      {conv.status}
                    </Badge>
                    {conv.assignedAgent && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted/50 border-none">
                        {conv.assignedAgent.name.split(' ')[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {!convLoading && conversations.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">No conversations found.</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel: Chat Thread */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col bg-background">
          <div className="h-[72px] border-b flex items-center justify-between px-6 bg-card shrink-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border">
                <AvatarFallback>{selectedConv.customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {selectedConv.customer.name}
                  {React.createElement(getChannelIcon(selectedConv.channel), { className: `h-4 w-4 ${getChannelColor(selectedConv.channel)}` })}
                </div>
                <div className="text-sm text-muted-foreground">{selectedConv.customer.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={selectedConv.assignedAgent?.id.toString() ?? "unassigned"}
                onValueChange={(val) => updateConvMutation.mutate({ id: selectedConv.id, assignedAgentId: val === "unassigned" ? null : parseInt(val) })}
              >
                <SelectTrigger className="w-[160px] h-9" data-testid="select-assign-agent">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedConv.assignedAgent?.name ?? "Unassigned"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agentsList.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedConv.status}
                onValueChange={(val) => updateConvMutation.mutate({ id: selectedConv.id, status: val })}
              >
                <SelectTrigger className={`w-[130px] h-9 ${getStatusColor(selectedConv.status)} border-none`} data-testid="select-change-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-chat-options">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Block Contact</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete Conversation</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/20" ref={scrollRef}>
            {messagesLoading && (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.sender === 'agent';
              const isBot = msg.sender === 'bot';
              const showDateDivider = i === 0 ||
                new Date(messages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex justify-center my-6">
                      <div className="bg-muted/50 px-3 py-1 rounded-full text-xs text-muted-foreground font-medium">
                        {format(new Date(msg.createdAt), "MMMM d, yyyy")}
                      </div>
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : isBot
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100 rounded-tl-sm'
                          : 'bg-card border shadow-sm text-card-foreground rounded-tl-sm'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 px-1">
                      <span className="text-[11px] text-muted-foreground">{format(new Date(msg.createdAt), "HH:mm")}</span>
                      {isMe && <CheckCircle className="h-3 w-3 text-primary/60" />}
                      {isBot && <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Automated</span>}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {!messagesLoading && messages.length === 0 && (
              <div className="flex justify-center items-center py-12 text-muted-foreground text-sm">No messages yet</div>
            )}
          </div>

          <div className="p-4 bg-card border-t shrink-0">
            <div className="flex items-end gap-2 bg-muted/30 rounded-xl border p-2 focus-within:ring-1 focus-within:ring-ring transition-all">
              <div className="flex gap-1 pb-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Type a message... (Press Enter to send)"
                className="flex-1 bg-transparent border-none resize-none outline-none max-h-32 min-h-[40px] py-2 px-2 text-sm"
                rows={1}
                data-testid="textarea-reply"
              />
              <Button
                onClick={handleSend}
                disabled={!replyText.trim() || sendMessageMutation.isPending}
                className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90"
                data-testid="button-send-reply"
              >
                {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" />Send</>}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
