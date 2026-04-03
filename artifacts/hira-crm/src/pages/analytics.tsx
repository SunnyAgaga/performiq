import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface AnalyticsData {
  volumeByChannel: Array<{ channel: string; count: number }>;
  agentPerformance: Array<{ id: number; name: string; avatar: string | null; resolvedToday: number; rating: number; activeConversations: number }>;
  dailyVolume: Array<{ date: string; open: number; resolved: number }>;
  summary: { avgResponseTime: number; csatScore: number; totalResolved: number };
}

const performanceData = [
  { time: '08:00', volume: 120, avgResponse: 140 },
  { time: '10:00', volume: 280, avgResponse: 180 },
  { time: '12:00', volume: 450, avgResponse: 240 },
  { time: '14:00', volume: 380, avgResponse: 190 },
  { time: '16:00', volume: 510, avgResponse: 280 },
  { time: '18:00', volume: 320, avgResponse: 150 },
  { time: '20:00', volume: 190, avgResponse: 110 },
];

export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: () => apiGet("/analytics"),
    staleTime: 60000,
  });

  const agentsSorted = [...(data?.agentPerformance ?? [])].sort((a, b) => b.resolvedToday - a.resolvedToday);
  const maxResolved = agentsSorted[0]?.resolvedToday ?? 1;

  const resolutionData = (data?.dailyVolume ?? []).map((d) => ({
    name: d.date,
    resolved: d.resolved,
    escalated: Math.round(d.open * 0.06),
  }));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your team's performance metrics.</p>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Volume vs Response Time</CardTitle>
            <CardDescription>Correlation between ticket volume and speed</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="volume" name="Tickets" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgResponse" name="Response (s)" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Resolution Breakdown</CardTitle>
            <CardDescription>Resolved vs Escalated tickets this week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionData.length ? resolutionData : [{ name: 'No data', resolved: 0, escalated: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Legend />
                <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="escalated" name="Escalated" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Agent Leaderboard</CardTitle>
            <CardDescription>Top performers based on resolution count and CSAT</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-6">
                {agentsSorted.map((agent, i) => (
                  <div key={agent.id} className="flex items-center" data-testid={`agent-leaderboard-${agent.id}`}>
                    <div className="w-8 text-center font-bold text-muted-foreground mr-2">#{i + 1}</div>
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{agent.name}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{agent.resolvedToday} resolved</span>
                          <span className="text-sm font-medium text-amber-500 flex items-center">★ {agent.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <Progress value={maxResolved > 0 ? (agent.resolvedToday / maxResolved) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                ))}
                {agentsSorted.length === 0 && <p className="text-center text-muted-foreground py-4">No agent data available</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>AI Deflection</CardTitle>
            <CardDescription>Tickets handled fully by bot</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-muted fill-none" strokeWidth="16" />
                <circle cx="96" cy="96" r="88" className="stroke-primary fill-none transition-all duration-1000 ease-in-out" strokeWidth="16" strokeDasharray="552.9" strokeDashoffset="193.5" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">65%</span>
                <span className="text-sm text-muted-foreground mt-1">Deflection Rate</span>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Bot resolved <span className="font-medium text-foreground">842</span> out of <span className="font-medium text-foreground">1,295</span> total inquiries today without agent intervention.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
