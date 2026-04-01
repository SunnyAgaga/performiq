import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut, CalendarDays, Users, Timer, MapPin, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

async function apiFetch(url: string, opts: RequestInit = {}) {
  const r = await fetch(url, { ...opts, headers: { ...authHeader(), ...(opts.headers ?? {}) } });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error ?? "Request failed");
  }
  return r.json();
}

type LatLng = { lat: number; lng: number } | null;

function getLocation(): Promise<LatLng> {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}

function fmtTime(ts: string | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(mins: number | null | undefined) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function fmtCoords(lat?: string | null, lng?: string | null) {
  if (!lat || !lng) return null;
  const la = parseFloat(lat).toFixed(4);
  const lo = parseFloat(lng).toFixed(4);
  return `${la}, ${lo}`;
}

function mapsUrl(lat: string, lng: string) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function LocationCell({ inLat, inLng, outLat, outLng }: { inLat?: string | null; inLng?: string | null; outLat?: string | null; outLng?: string | null }) {
  const inCoords = fmtCoords(inLat, inLng);
  const outCoords = fmtCoords(outLat, outLng);
  if (!inCoords && !outCoords) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex flex-col gap-1 text-xs">
      {inCoords && (
        <a href={mapsUrl(inLat!, inLng!)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline">
          <MapPin className="w-3 h-3" /> In: {inCoords}
        </a>
      )}
      {outCoords && (
        <a href={mapsUrl(outLat!, outLng!)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline">
          <MapPin className="w-3 h-3" /> Out: {outCoords}
        </a>
      )}
    </div>
  );
}

function StatusBadge({ log }: { log: any }) {
  if (!log) return <Badge variant="outline">Not clocked in</Badge>;
  if (log.clockIn && !log.clockOut) return <Badge className="bg-green-500 text-white">Clocked In</Badge>;
  if (log.clockOut) return <Badge variant="secondary">Clocked Out</Badge>;
  return <Badge variant="outline">—</Badge>;
}

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isManager = user?.role === "manager" || user?.role === "admin" || user?.role === "super_admin";

  const [filterDate, setFilterDate] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [elapsed, setElapsed] = useState("");
  const [locStatus, setLocStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const locStatusRef = useRef(locStatus);
  locStatusRef.current = locStatus;

  const { data: today, isLoading: todayLoading } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: () => apiFetch("/api/attendance/today"),
    refetchInterval: 30000,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["attendance", filterDate, filterUserId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterDate) { params.set("startDate", filterDate); params.set("endDate", filterDate); }
      if (filterUserId) params.set("userId", filterUserId);
      return apiFetch(`/api/attendance?${params}`);
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => apiFetch("/api/users"),
    enabled: isManager,
  });

  const clockIn = useMutation({
    mutationFn: async () => {
      setLocStatus("requesting");
      const loc = await getLocation();
      setLocStatus(loc ? "granted" : "denied");
      return apiFetch("/api/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify(loc ? { lat: loc.lat, lng: loc.lng } : {}),
      });
    },
    onSuccess: (_, __, ___) => {
      qc.invalidateQueries({ queryKey: ["attendance-today"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
      const locMsg = locStatusRef.current === "granted" ? " Location recorded." : " Location unavailable — clocked in without coordinates.";
      toast({ title: "Clocked in", description: `Welcome! Recorded at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.${locMsg}` });
      setLocStatus("idle");
    },
    onError: (e: any) => { setLocStatus("idle"); toast({ title: "Error", description: e.message, variant: "destructive" }); },
  });

  const clockOut = useMutation({
    mutationFn: async () => {
      setLocStatus("requesting");
      const loc = await getLocation();
      setLocStatus(loc ? "granted" : "denied");
      return apiFetch("/api/attendance/clock-out", {
        method: "POST",
        body: JSON.stringify(loc ? { lat: loc.lat, lng: loc.lng } : {}),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-today"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
      const locMsg = locStatusRef.current === "granted" ? " Location recorded." : "";
      toast({ title: "Clocked out", description: `Have a great rest of your day!${locMsg}` });
      setLocStatus("idle");
    },
    onError: (e: any) => { setLocStatus("idle"); toast({ title: "Error", description: e.message, variant: "destructive" }); },
  });

  // Live elapsed timer
  useEffect(() => {
    if (!today?.clockIn || today?.clockOut) { setElapsed(""); return; }
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(today.clockIn).getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [today]);

  const isClockedIn = today?.clockIn && !today?.clockOut;
  const isBusy = clockIn.isPending || clockOut.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your daily clock-in and clock-out</p>
      </div>

      {/* Location permission notice */}
      {locStatus === "denied" && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Location permission was denied. Your clock event was recorded without coordinates. You can enable location access in your browser settings to capture it next time.</span>
        </div>
      )}

      {/* Clock In/Out Card */}
      <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4 shadow-sm">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${isClockedIn ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"}`}>
          <Clock className={`w-10 h-10 ${isClockedIn ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
        </div>
        {elapsed && (
          <div className="text-4xl font-mono font-bold tracking-widest text-green-600 dark:text-green-400">{elapsed}</div>
        )}
        <div className="text-center">
          <p className="text-lg font-semibold">
            {todayLoading ? "Loading…" : isClockedIn
              ? `Clocked in at ${fmtTime(today?.clockIn)}`
              : today?.clockOut ? `Done for today — clocked out at ${fmtTime(today?.clockOut)}`
              : "Not clocked in today"}
          </p>
          {today?.clockOut && (
            <p className="text-sm text-muted-foreground mt-1">Duration: {fmtDuration(today?.durationMinutes)}</p>
          )}
          {/* Show captured locations for today */}
          {(today?.clockInLat || today?.clockOutLat) && (
            <div className="mt-2 flex flex-col items-center gap-1 text-xs">
              {today.clockInLat && (
                <a href={mapsUrl(today.clockInLat, today.clockInLng)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline">
                  <MapPin className="w-3 h-3" /> In: {fmtCoords(today.clockInLat, today.clockInLng)}
                </a>
              )}
              {today.clockOutLat && (
                <a href={mapsUrl(today.clockOutLat, today.clockOutLng)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline">
                  <MapPin className="w-3 h-3" /> Out: {fmtCoords(today.clockOutLat, today.clockOutLng)}
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          {!today?.clockOut && (
            <Button
              size="lg"
              className={`gap-2 px-8 ${isClockedIn ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
              onClick={() => isClockedIn ? clockOut.mutate() : clockIn.mutate()}
              disabled={isBusy || todayLoading}
            >
              {isBusy && locStatus === "requesting"
                ? <><MapPin className="w-5 h-5 animate-pulse" /> Getting location…</>
                : isClockedIn
                ? <><LogOut className="w-5 h-5" /> Clock Out</>
                : <><LogIn className="w-5 h-5" /> Clock In</>}
            </Button>
          )}
          {!isBusy && !today?.clockOut && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location will be captured automatically
            </p>
          )}
          {today?.clockOut && (
            <p className="text-sm text-muted-foreground italic">Day complete — see you tomorrow!</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date" className="w-40 h-9 text-sm"
            value={filterDate} onChange={e => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <Button variant="ghost" size="sm" className="h-9 px-2 text-xs" onClick={() => setFilterDate("")}>Clear</Button>
          )}
        </div>
        {isManager && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Select value={filterUserId} onValueChange={setFilterUserId}>
              <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All employees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All employees</SelectItem>
                {(users as any[]).map((u: any) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name ?? u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                {isManager && <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>}
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Clock In</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Clock Out</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duration</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logsLoading ? (
                <tr><td colSpan={isManager ? 7 : 6} className="text-center py-10 text-muted-foreground">Loading…</td></tr>
              ) : (logs as any[]).length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="text-center py-10 text-muted-foreground">
                    <Timer className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No attendance records yet
                  </td>
                </tr>
              ) : (logs as any[]).map((log: any) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{fmtDate(log.date)}</td>
                  {isManager && <td className="px-4 py-3 text-muted-foreground">{log.user?.name ?? log.user?.email ?? "—"}</td>}
                  <td className="px-4 py-3">{fmtTime(log.clockIn)}</td>
                  <td className="px-4 py-3">{fmtTime(log.clockOut)}</td>
                  <td className="px-4 py-3">{fmtDuration(log.durationMinutes)}</td>
                  <td className="px-4 py-3">
                    <LocationCell inLat={log.clockInLat} inLng={log.clockInLng} outLat={log.clockOutLat} outLng={log.clockOutLng} />
                  </td>
                  <td className="px-4 py-3"><StatusBadge log={log} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
