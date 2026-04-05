import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, ChevronRight, X, User, Briefcase, Heart,
  CreditCard, FileText, Edit2, Check, Phone, Mail, MapPin,
  Building2, Hash, Plus, RefreshCw, Trash2, FolderOpen, AlertCircle,
  GraduationCap, ClipboardList, Star, UserCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/utils";

async function apiFetchJson(url: string, opts: RequestInit = {}) {
  const r = await apiFetch(url, opts);
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error ?? "Request failed"); }
  return r.json();
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-violet-100 text-violet-700",
  admin:       "bg-purple-100 text-purple-700",
  manager:     "bg-blue-100 text-blue-700",
  employee:    "bg-slate-100 text-slate-700",
};

function Avatar({ name, photo, size = 40 }: { name: string; photo?: string | null; size?: number }) {
  if (photo) return <img src={photo} alt={name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-sm"
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

type Tab = "personal" | "employment" | "financial" | "emergency" | "beneficiaries" | "experience" | "education" | "references" | "notes" | "documents";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "personal",      label: "Personal",      icon: User },
  { id: "employment",    label: "Employment",    icon: Briefcase },
  { id: "financial",     label: "Financial",     icon: CreditCard },
  { id: "emergency",     label: "Next of Kin",   icon: Heart },
  { id: "beneficiaries", label: "Beneficiaries", icon: Star },
  { id: "experience",    label: "Experience",    icon: ClipboardList },
  { id: "education",     label: "Education",     icon: GraduationCap },
  { id: "references",    label: "References",    icon: UserCheck },
  { id: "documents",     label: "Documents",     icon: FolderOpen },
  { id: "notes",         label: "Notes",         icon: FileText },
];

const DOC_TYPES: { value: string; label: string; color: string }[] = [
  { value: "contract",         label: "Employment Contract", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "guarantor",        label: "Guarantor Form",      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { value: "id_copy",          label: "ID / Passport Copy",  color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { value: "offer_letter",     label: "Offer Letter",        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "reference_letter", label: "Reference Letter",    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  { value: "certificate",      label: "Certificate / Qualification", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "nda",              label: "NDA",                 color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { value: "policy",           label: "Policy Acknowledgement", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { value: "medical",          label: "Medical Record",      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { value: "other",            label: "Other",               color: "bg-muted text-muted-foreground" },
];

function docTypeInfo(type: string) {
  return DOC_TYPES.find(d => d.value === type) ?? DOC_TYPES[DOC_TYPES.length - 1];
}

function Field({ label, value, editing, type = "text", placeholder, onChange }: {
  label: string; value?: string | number | null; editing: boolean;
  type?: string; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
      {editing ? (
        <input
          type={type}
          value={value ?? ""}
          placeholder={placeholder ?? label}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <p className={`text-sm py-1.5 ${value != null && value !== "" ? "text-foreground" : "text-muted-foreground/60 italic"}`}>
          {value != null && value !== "" ? String(value) : "Not set"}
        </p>
      )}
    </div>
  );
}

function SelectField({ label, value, editing, options, onChange }: {
  label: string; value?: string | null; editing: boolean;
  options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
      {editing ? (
        <select
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">— Select —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <p className={`text-sm py-1.5 ${value ? "text-foreground" : "text-muted-foreground/60 italic"}`}>
          {options.find(o => o.value === value)?.label ?? value ?? "Not set"}
        </p>
      )}
    </div>
  );
}

function TextareaField({ label, value, editing, placeholder, onChange }: {
  label: string; value?: string | null; editing: boolean; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
      {editing ? (
        <textarea
          value={value ?? ""}
          placeholder={placeholder ?? label}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      ) : (
        <p className={`text-sm py-1.5 whitespace-pre-wrap ${value ? "text-foreground" : "text-muted-foreground/60 italic"}`}>
          {value || "Not set"}
        </p>
      )}
    </div>
  );
}

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "single_parent", label: "Single Parent" },
  { value: "married", label: "Married" },
  { value: "separated", label: "Separated" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

// ── Tabular Section Components ─────────────────────────────────────────────────

function BeneficiariesTab({ staffId, canEdit }: { staffId: number; canEdit: boolean }) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", address: "", phoneNumber: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<any>({});

  const { data: rows = [], refetch } = useQuery<any[]>({
    queryKey: ["staff-beneficiaries", staffId],
    queryFn: () => apiFetchJson(`/api/users/${staffId}/beneficiaries`),
  });

  const add = async () => {
    if (!draft.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    try {
      await apiFetchJson(`/api/users/${staffId}/beneficiaries`, {
        method: "POST", body: JSON.stringify({ ...draft, orderIndex: rows.length }),
      });
      setDraft({ name: "", address: "", phoneNumber: "" }); setAdding(false); refetch();
      toast({ title: "Beneficiary added" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const save = async (id: number) => {
    try {
      await apiFetchJson(`/api/users/${staffId}/beneficiaries/${id}`, {
        method: "PUT", body: JSON.stringify(editDraft),
      });
      setEditId(null); refetch(); toast({ title: "Updated" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this beneficiary?")) return;
    try {
      await apiFetchJson(`/api/users/${staffId}/beneficiaries/${id}`, { method: "DELETE" });
      refetch(); toast({ title: "Removed" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Star className="w-3.5 h-3.5" /> Beneficiaries
        </h3>
        {canEdit && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-primary">New Beneficiary</p>
          <Field label="Name *" value={draft.name} editing placeholder="Full name" onChange={v => setDraft(p => ({ ...p, name: v }))} />
          <Field label="Address" value={draft.address} editing onChange={v => setDraft(p => ({ ...p, address: v }))} />
          <Field label="Phone Number" value={draft.phoneNumber} editing type="tel" onChange={v => setDraft(p => ({ ...p, phoneNumber: v }))} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setDraft({ name: "", address: "", phoneNumber: "" }); }}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
            <button onClick={add}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {(rows as any[]).length === 0 && !adding ? (
        <div className="text-center py-10 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No beneficiaries recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(rows as any[]).map((row: any) => (
            <div key={row.id} className="border border-border rounded-xl p-4">
              {editId === row.id ? (
                <div className="space-y-3">
                  <Field label="Name *" value={editDraft.name} editing onChange={v => setEditDraft((p: any) => ({ ...p, name: v }))} />
                  <Field label="Address" value={editDraft.address} editing onChange={v => setEditDraft((p: any) => ({ ...p, address: v }))} />
                  <Field label="Phone Number" value={editDraft.phoneNumber} editing type="tel" onChange={v => setEditDraft((p: any) => ({ ...p, phoneNumber: v }))} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
                    <button onClick={() => save(row.id)} className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{row.name}</p>
                    {row.address && <p className="text-xs text-muted-foreground mt-0.5">{row.address}</p>}
                    {row.phoneNumber && <p className="text-xs text-muted-foreground">{row.phoneNumber}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditId(row.id); setEditDraft({ name: row.name, address: row.address ?? "", phoneNumber: row.phoneNumber ?? "" }); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkExperienceTab({ staffId, canEdit }: { staffId: number; canEdit: boolean }) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const emptyRow = { companyName: "", companyAddress: "", positionHeld: "", fromDate: "", toDate: "", reasonForLeaving: "" };
  const [draft, setDraft] = useState({ ...emptyRow });
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<any>({});

  const { data: rows = [], refetch } = useQuery<any[]>({
    queryKey: ["staff-experience", staffId],
    queryFn: () => apiFetchJson(`/api/users/${staffId}/work-experience`),
  });

  const add = async () => {
    if (!draft.companyName.trim()) { toast({ title: "Company name is required", variant: "destructive" }); return; }
    try {
      await apiFetchJson(`/api/users/${staffId}/work-experience`, {
        method: "POST", body: JSON.stringify({ ...draft, orderIndex: rows.length }),
      });
      setDraft({ ...emptyRow }); setAdding(false); refetch();
      toast({ title: "Experience entry added" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const save = async (id: number) => {
    try {
      await apiFetchJson(`/api/users/${staffId}/work-experience/${id}`, {
        method: "PUT", body: JSON.stringify(editDraft),
      });
      setEditId(null); refetch(); toast({ title: "Updated" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this entry?")) return;
    try {
      await apiFetchJson(`/api/users/${staffId}/work-experience/${id}`, { method: "DELETE" });
      refetch(); toast({ title: "Removed" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const ExperienceForm = ({ data, onChange }: { data: any; onChange: (f: string, v: string) => void }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <Field label="Company Name *" value={data.companyName} editing placeholder="e.g. Acme Ltd" onChange={v => onChange("companyName", v)} />
        <Field label="Company Address" value={data.companyAddress} editing onChange={v => onChange("companyAddress", v)} />
        <Field label="Position Held" value={data.positionHeld} editing onChange={v => onChange("positionHeld", v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" value={data.fromDate} editing placeholder="e.g. Jan 2020" onChange={v => onChange("fromDate", v)} />
        <Field label="To" value={data.toDate} editing placeholder="e.g. Dec 2022" onChange={v => onChange("toDate", v)} />
      </div>
      <Field label="Reason for Leaving" value={data.reasonForLeaving} editing onChange={v => onChange("reasonForLeaving", v)} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5" /> Work Experience (Start with recent employer)
        </h3>
        {canEdit && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-primary">New Entry</p>
          <ExperienceForm data={draft} onChange={(f, v) => setDraft(p => ({ ...p, [f]: v }))} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setDraft({ ...emptyRow }); }}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
            <button onClick={add}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {(rows as any[]).length === 0 && !adding ? (
        <div className="text-center py-10 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No work experience recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(rows as any[]).map((row: any, idx: number) => (
            <div key={row.id} className="border border-border rounded-xl p-4">
              {editId === row.id ? (
                <div className="space-y-3">
                  <ExperienceForm data={editDraft} onChange={(f, v) => setEditDraft((p: any) => ({ ...p, [f]: v }))} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
                    <button onClick={() => save(row.id)} className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center shrink-0">{idx + 1}</span>
                      <p className="font-semibold text-sm">{row.companyName}</p>
                    </div>
                    {row.positionHeld && <p className="text-xs text-primary font-medium mt-1 ml-7">{row.positionHeld}</p>}
                    {row.companyAddress && <p className="text-xs text-muted-foreground mt-0.5 ml-7">{row.companyAddress}</p>}
                    {(row.fromDate || row.toDate) && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-7">{row.fromDate} — {row.toDate || "Present"}</p>
                    )}
                    {row.reasonForLeaving && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-7">Left: {row.reasonForLeaving}</p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditId(row.id); setEditDraft({ companyName: row.companyName, companyAddress: row.companyAddress ?? "", positionHeld: row.positionHeld ?? "", fromDate: row.fromDate ?? "", toDate: row.toDate ?? "", reasonForLeaving: row.reasonForLeaving ?? "" }); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EducationTab({ staffId, canEdit }: { staffId: number; canEdit: boolean }) {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const emptyRow = { schoolAttended: "", certificateObtained: "", fromDate: "", toDate: "" };
  const [draft, setDraft] = useState({ ...emptyRow });
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<any>({});

  const { data: rows = [], refetch } = useQuery<any[]>({
    queryKey: ["staff-education", staffId],
    queryFn: () => apiFetchJson(`/api/users/${staffId}/education`),
  });

  const add = async () => {
    if (!draft.schoolAttended.trim()) { toast({ title: "School name is required", variant: "destructive" }); return; }
    try {
      await apiFetchJson(`/api/users/${staffId}/education`, {
        method: "POST", body: JSON.stringify({ ...draft, orderIndex: rows.length }),
      });
      setDraft({ ...emptyRow }); setAdding(false); refetch();
      toast({ title: "Education entry added" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const save = async (id: number) => {
    try {
      await apiFetchJson(`/api/users/${staffId}/education/${id}`, {
        method: "PUT", body: JSON.stringify(editDraft),
      });
      setEditId(null); refetch(); toast({ title: "Updated" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this entry?")) return;
    try {
      await apiFetchJson(`/api/users/${staffId}/education/${id}`, { method: "DELETE" });
      refetch(); toast({ title: "Removed" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const EduForm = ({ data, onChange }: { data: any; onChange: (f: string, v: string) => void }) => (
    <div className="space-y-3">
      <Field label="School / Institution *" value={data.schoolAttended} editing onChange={v => onChange("schoolAttended", v)} />
      <Field label="Certificate / Qualification Obtained" value={data.certificateObtained} editing onChange={v => onChange("certificateObtained", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="From" value={data.fromDate} editing placeholder="e.g. 2015" onChange={v => onChange("fromDate", v)} />
        <Field label="To" value={data.toDate} editing placeholder="e.g. 2019" onChange={v => onChange("toDate", v)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5" /> Educational Qualification
        </h3>
        {canEdit && !adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {adding && (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-primary">New Entry</p>
          <EduForm data={draft} onChange={(f, v) => setDraft(p => ({ ...p, [f]: v }))} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setDraft({ ...emptyRow }); }}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
            <button onClick={add}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {(rows as any[]).length === 0 && !adding ? (
        <div className="text-center py-10 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No education records</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(rows as any[]).map((row: any, idx: number) => (
            <div key={row.id} className="border border-border rounded-xl p-4">
              {editId === row.id ? (
                <div className="space-y-3">
                  <EduForm data={editDraft} onChange={(f, v) => setEditDraft((p: any) => ({ ...p, [f]: v }))} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
                    <button onClick={() => save(row.id)} className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center shrink-0">{idx + 1}</span>
                      <p className="font-semibold text-sm">{row.schoolAttended}</p>
                    </div>
                    {row.certificateObtained && <p className="text-xs text-primary font-medium mt-1 ml-7">{row.certificateObtained}</p>}
                    {(row.fromDate || row.toDate) && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-7">{row.fromDate} — {row.toDate}</p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditId(row.id); setEditDraft({ schoolAttended: row.schoolAttended, certificateObtained: row.certificateObtained ?? "", fromDate: row.fromDate ?? "", toDate: row.toDate ?? "" }); }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(row.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_REF = { name: "", address: "", occupation: "", age: "", telephone: "", email: "" };

function ReferencesTab({ staffId, canEdit }: { staffId: number; canEdit: boolean }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any[]>([{ ...EMPTY_REF }, { ...EMPTY_REF }]);

  const { data: rows = [], refetch } = useQuery<any[]>({
    queryKey: ["staff-references", staffId],
    queryFn: () => apiFetchJson(`/api/users/${staffId}/references`),
  });

  const startEdit = () => {
    const d = [0, 1].map(i => {
      const r = (rows as any[])[i];
      return r ? { name: r.name ?? "", address: r.address ?? "", occupation: r.occupation ?? "", age: r.age ?? "", telephone: r.telephone ?? "", email: r.email ?? "" } : { ...EMPTY_REF };
    });
    setDraft(d);
    setEditing(true);
  };

  const save = async () => {
    try {
      await apiFetchJson(`/api/users/${staffId}/references`, {
        method: "PUT", body: JSON.stringify(draft),
      });
      refetch(); setEditing(false);
      toast({ title: "References saved" });
    } catch (e: any) { toast({ title: e.message, variant: "destructive" }); }
  };

  const setRef = (i: number, field: string, val: string) =>
    setDraft(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5" /> References
        </h3>
        {canEdit && !editing && (
          <button onClick={startEdit}
            className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
        {canEdit && editing && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[0, 1].map(i => {
          const r = editing ? draft[i] : (rows as any[])[i];
          return (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reference {i + 1}</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={r?.name} editing={editing} onChange={v => setRef(i, "name", v)} />
                <Field label="Occupation" value={r?.occupation} editing={editing} onChange={v => setRef(i, "occupation", v)} />
              </div>
              <Field label="Address" value={r?.address} editing={editing} onChange={v => setRef(i, "address", v)} />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Age" value={r?.age} editing={editing} onChange={v => setRef(i, "age", v)} />
                <Field label="Tel" value={r?.telephone} editing={editing} type="tel" onChange={v => setRef(i, "telephone", v)} />
                <Field label="Email" value={r?.email} editing={editing} type="email" onChange={v => setRef(i, "email", v)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Staff Detail Panel ─────────────────────────────────────────────────────────
function StaffPanel({ staffId, canEdit, onClose, onUpdated }: {
  staffId: number; canEdit: boolean; onClose: () => void; onUpdated: (u: any) => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("personal");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any>({});

  const { data: staff, isLoading, refetch } = useQuery({
    queryKey: ["staff-detail", staffId],
    queryFn: () => apiFetchJson(`/api/users/${staffId}`),
  });

  const save = useMutation({
    mutationFn: (patch: any) => apiFetchJson(`/api/users/${staffId}/hr-profile`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
    onSuccess: (updated) => {
      onUpdated(updated);
      refetch();
      setEditing(false);
      toast({ title: "Profile updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Documents
  const [addingDoc, setAddingDoc] = useState(false);
  const [docDraft, setDocDraft] = useState({ name: "", documentType: "contract", receivedDate: "", notes: "" });

  const { data: documents = [], refetch: refetchDocs } = useQuery<any[]>({
    queryKey: ["staff-docs", staffId],
    queryFn: () => apiFetchJson(`/api/users/${staffId}/documents`),
    enabled: tab === "documents",
  });

  const addDoc = useMutation({
    mutationFn: (body: any) => apiFetchJson(`/api/users/${staffId}/documents`, {
      method: "POST", body: JSON.stringify(body),
    }),
    onSuccess: () => {
      refetchDocs();
      setAddingDoc(false);
      setDocDraft({ name: "", documentType: "contract", receivedDate: "", notes: "" });
      toast({ title: "Document added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteDoc = useMutation({
    mutationFn: (docId: number) => apiFetchJson(`/api/users/${staffId}/documents/${docId}`, { method: "DELETE" }),
    onSuccess: () => { refetchDocs(); toast({ title: "Document removed" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const startEdit = () => {
    if (!staff) return;
    setDraft({
      // Name
      surname: staff.surname ?? "",
      firstName: staff.firstName ?? "",
      middleName: staff.middleName ?? "",
      // Personal
      dateOfBirth: staff.dateOfBirth ?? "",
      gender: staff.gender ?? "",
      maritalStatus: staff.maritalStatus ?? "",
      maidenName: staff.maidenName ?? "",
      religion: staff.religion ?? "",
      stateOfOrigin: staff.stateOfOrigin ?? "",
      nationality: staff.nationality ?? "",
      nationalId: staff.nationalId ?? "",
      hobbies: staff.hobbies ?? "",
      // Addresses
      permanentAddress: staff.permanentAddress ?? "",
      temporaryAddress: staff.temporaryAddress ?? "",
      address: staff.address ?? "",
      city: staff.city ?? "",
      stateProvince: staff.stateProvince ?? "",
      country: staff.country ?? "",
      postalCode: staff.postalCode ?? "",
      // Spouse & family
      spouseName: staff.spouseName ?? "",
      spouseOccupation: staff.spouseOccupation ?? "",
      numberOfChildren: staff.numberOfChildren ?? "",
      // Employment
      startDate: staff.startDate ?? "",
      // Next of kin
      emergencyContactName: staff.emergencyContactName ?? "",
      emergencyContactPhone: staff.emergencyContactPhone ?? "",
      emergencyContactRelation: staff.emergencyContactRelation ?? "",
      emergencyContactAddress: staff.emergencyContactAddress ?? "",
      // Financial
      bankName: staff.bankName ?? "",
      bankBranch: staff.bankBranch ?? "",
      bankAccountNumber: staff.bankAccountNumber ?? "",
      bankAccountName: staff.bankAccountName ?? "",
      taxId: staff.taxId ?? "",
      pensionId: staff.pensionId ?? "",
      pfaName: staff.pfaName ?? "",
      rsaPin: staff.rsaPin ?? "",
      hmo: staff.hmo ?? "",
      notes: staff.notes ?? "",
    });
    setEditing(true);
  };

  const cancelEdit = () => { setDraft({}); setEditing(false); };
  const set = (field: string) => (v: string) => setDraft((p: any) => ({ ...p, [field]: v }));
  const d = editing ? draft : (staff ?? {});

  // Tabs that use their own CRUD sub-components (no global edit)
  const isSubTab = ["beneficiaries", "experience", "education", "references", "documents"].includes(tab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm">
      <div className="bg-background h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {staff && <Avatar name={staff.name} photo={staff.profilePhoto} size={52} />}
              <div>
                <h2 className="text-xl font-bold">{staff?.name ?? "—"}</h2>
                <p className="text-sm text-muted-foreground">{staff?.jobTitle ?? staff?.role ?? "—"}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {staff?.role && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[staff.role] ?? "bg-muted text-muted-foreground"}`}>
                      {staff.role.replace("_", " ")}
                    </span>
                  )}
                  {staff?.department && (
                    <span className="text-xs text-muted-foreground">{staff.department}</span>
                  )}
                  {staff?.staffId && (
                    <span className="text-xs font-mono text-muted-foreground">#{staff.staffId}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            {staff?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{staff.email}</span>}
            {staff?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{staff.phone}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto shrink-0">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (editing && !isSubTab) { /* keep editing */ } }}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors
                  ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading…</div>
          ) : (
            <>
              {/* Edit / Save controls — only for tabs that use global editing */}
              {canEdit && !isSubTab && (
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs text-muted-foreground">
                    {editing ? "Editing — make changes and save" : "Click Edit to update this section"}
                  </p>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <button onClick={cancelEdit}
                          className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => save.mutate(draft)} disabled={save.isPending}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {save.isPending ? "Saving…" : "Save Changes"}
                        </button>
                      </>
                    ) : (
                      <button onClick={startEdit}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Personal Tab ─────────────────────────────────────── */}
              {tab === "personal" && (
                <div className="space-y-5">
                  {/* Name breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Surname" value={d.surname} editing={editing} onChange={set("surname")} />
                      <Field label="First Name" value={d.firstName} editing={editing} onChange={set("firstName")} />
                      <Field label="Middle Name" value={d.middleName} editing={editing} onChange={set("middleName")} />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Identity</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Date of Birth" value={d.dateOfBirth} editing={editing} type="date" onChange={set("dateOfBirth")} />
                      <SelectField label="Sex" value={d.gender} editing={editing}
                        options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
                        onChange={set("gender")} />
                      <SelectField label="Marital Status" value={d.maritalStatus} editing={editing}
                        options={MARITAL_STATUS_OPTIONS} onChange={set("maritalStatus")} />
                      <Field label="Maiden Name (if married)" value={d.maidenName} editing={editing} onChange={set("maidenName")} />
                      <Field label="Religion" value={d.religion} editing={editing} onChange={set("religion")} />
                      <Field label="State of Origin" value={d.stateOfOrigin} editing={editing} onChange={set("stateOfOrigin")} />
                      <Field label="Nationality" value={d.nationality} editing={editing} onChange={set("nationality")} />
                      <Field label="National ID / Passport" value={d.nationalId} editing={editing} placeholder="e.g. A1234567" onChange={set("nationalId")} />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Addresses
                    </h4>
                    <div className="space-y-3">
                      <TextareaField label="Permanent Home Address" value={d.permanentAddress} editing={editing} onChange={set("permanentAddress")} />
                      <TextareaField label="Temporary Home Address" value={d.temporaryAddress} editing={editing} onChange={set("temporaryAddress")} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="City" value={d.city} editing={editing} onChange={set("city")} />
                        <Field label="State / Province" value={d.stateProvince} editing={editing} onChange={set("stateProvince")} />
                        <Field label="Country" value={d.country} editing={editing} onChange={set("country")} />
                        <Field label="Postal Code" value={d.postalCode} editing={editing} onChange={set("postalCode")} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Family</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Spouse Name" value={d.spouseName} editing={editing} onChange={set("spouseName")} />
                      <Field label="Spouse Occupation" value={d.spouseOccupation} editing={editing} onChange={set("spouseOccupation")} />
                      <Field label="Number of Children" value={d.numberOfChildren} editing={editing} type="number" onChange={set("numberOfChildren")} />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <Field label="Hobbies" value={d.hobbies} editing={editing} placeholder="e.g. Reading, Football, Cooking" onChange={set("hobbies")} />
                  </div>
                </div>
              )}

              {/* ── Employment Tab ────────────────────────────────────── */}
              {tab === "employment" && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Employment Details
                  </h3>
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Department</p>
                        <p className="font-medium">{staff?.department ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Job Title</p>
                        <p className="font-medium">{staff?.jobTitle ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Staff ID</p>
                        <p className="font-mono text-xs font-medium">{staff?.staffId ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Role / Access</p>
                        <p className="font-medium capitalize">{staff?.role?.replace("_", " ") ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Member Since</p>
                        <p className="font-medium">
                          {staff?.createdAt ? new Date(staff.createdAt).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" }) : "—"}
                        </p>
                      </div>
                      {staff?.site && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Site</p>
                          <p className="font-medium">{staff.site.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Field label="Start Date" value={d.startDate} editing={editing} type="date" onChange={set("startDate")} />
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    To update name, email, department, job title or access level — use the User Management page.
                  </p>
                </div>
              )}

              {/* ── Financial Tab ─────────────────────────────────────── */}
              {tab === "financial" && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Banking & Tax Information
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        🔒 Financial data is sensitive. Only HR admins and the employee themselves can view and update this section.
                      </p>
                    </div>
                    <div className="border border-border rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Bank Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Bank Name" value={d.bankName} editing={editing} placeholder="e.g. GT Bank" onChange={set("bankName")} />
                        <Field label="Branch" value={d.bankBranch} editing={editing} placeholder="e.g. Victoria Island" onChange={set("bankBranch")} />
                        <Field label="Account Name" value={d.bankAccountName} editing={editing} placeholder="Account holder name" onChange={set("bankAccountName")} />
                        <Field label="Account Number" value={d.bankAccountNumber} editing={editing} placeholder="e.g. 0123456789" onChange={set("bankAccountNumber")} />
                      </div>
                    </div>
                    <div className="border border-border rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5"><Hash className="w-4 h-4" /> Tax & Pension</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Tax ID (T.I.N)" value={d.taxId} editing={editing} placeholder="Tax identification number" onChange={set("taxId")} />
                        <Field label="Pension ID" value={d.pensionId} editing={editing} placeholder="Pension scheme ID" onChange={set("pensionId")} />
                        <Field label="PFA Name" value={d.pfaName} editing={editing} placeholder="Pension Fund Administrator" onChange={set("pfaName")} />
                        <Field label="RSA PIN" value={d.rsaPin} editing={editing} placeholder="Retirement Savings Account PIN" onChange={set("rsaPin")} />
                      </div>
                      <Field label="HMO (Health Insurance)" value={d.hmo} editing={editing} placeholder="e.g. AXA / Hygeia plan name or ID" onChange={set("hmo")} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Next of Kin Tab ───────────────────────────────────── */}
              {tab === "emergency" && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5" /> Next of Kin
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Name of Next of Kin" value={d.emergencyContactName} editing={editing} placeholder="Full name" onChange={set("emergencyContactName")} />
                    <TextareaField label="Address of Next of Kin" value={d.emergencyContactAddress} editing={editing} onChange={set("emergencyContactAddress")} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Mobile" value={d.emergencyContactPhone} editing={editing} type="tel" placeholder="+234 800 000 0000" onChange={set("emergencyContactPhone")} />
                      <Field label="Relationship" value={d.emergencyContactRelation} editing={editing} placeholder="e.g. Spouse, Parent, Sibling" onChange={set("emergencyContactRelation")} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Beneficiaries Tab ─────────────────────────────────── */}
              {tab === "beneficiaries" && <BeneficiariesTab staffId={staffId} canEdit={canEdit} />}

              {/* ── Work Experience Tab ───────────────────────────────── */}
              {tab === "experience" && <WorkExperienceTab staffId={staffId} canEdit={canEdit} />}

              {/* ── Education Tab ─────────────────────────────────────── */}
              {tab === "education" && <EducationTab staffId={staffId} canEdit={canEdit} />}

              {/* ── References Tab ────────────────────────────────────── */}
              {tab === "references" && <ReferencesTab staffId={staffId} canEdit={canEdit} />}

              {/* ── Documents Tab ─────────────────────────────────────── */}
              {tab === "documents" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5" /> Received Documents
                    </h3>
                    {canEdit && !addingDoc && (
                      <button onClick={() => setAddingDoc(true)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Document
                      </button>
                    )}
                  </div>

                  {addingDoc && (
                    <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-primary">New Document Record</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Document Name *</label>
                          <input
                            value={docDraft.name}
                            onChange={e => setDocDraft(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. John's Guarantor Form"
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Document Type</label>
                            <select
                              value={docDraft.documentType}
                              onChange={e => setDocDraft(p => ({ ...p, documentType: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20">
                              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Date Received</label>
                            <input
                              type="date"
                              value={docDraft.receivedDate}
                              onChange={e => setDocDraft(p => ({ ...p, receivedDate: e.target.value }))}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Notes</label>
                          <textarea
                            value={docDraft.notes}
                            onChange={e => setDocDraft(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Any notes about this document…"
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setAddingDoc(false); setDocDraft({ name: "", documentType: "contract", receivedDate: "", notes: "" }); }}
                            className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => addDoc.mutate(docDraft)}
                            disabled={!docDraft.name.trim() || addDoc.isPending}
                            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {addDoc.isPending ? "Saving…" : "Save Document"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {(documents as any[]).length === 0 && !addingDoc ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No documents recorded yet</p>
                      <p className="text-xs mt-1">Add guarantor forms, contracts, ID copies and more</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(documents as any[]).map((doc: any) => {
                        const info = docTypeInfo(doc.documentType);
                        return (
                          <div key={doc.id} className="border border-border rounded-xl p-3.5 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {doc.receivedDate && <span>Received: {new Date(doc.receivedDate).toLocaleDateString()}</span>}
                                {doc.uploadedByName && <span>Added by {doc.uploadedByName}</span>}
                              </div>
                              {doc.notes && <p className="text-xs text-muted-foreground mt-1 italic">{doc.notes}</p>}
                            </div>
                            {canEdit && (
                              <button onClick={() => deleteDoc.mutate(doc.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground shrink-0 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Notes Tab ─────────────────────────────────────────── */}
              {tab === "notes" && (
                <div className="space-y-5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Internal Notes
                  </h3>
                  <TextareaField label="Notes" value={d.notes} editing={editing}
                    placeholder="Add any internal notes about this employee…" onChange={set("notes")} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Staff List Page ────────────────────────────────────────────────────────────
export default function StaffPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: staffList = [], isLoading } = useQuery<any[]>({
    queryKey: ["staff-list"],
    queryFn: () => apiFetchJson("/api/users"),
  });

  const canEdit = user?.role === "admin" || user?.role === "super_admin" || user?.role === "manager";

  const filtered = useMemo(() => {
    if (!search.trim()) return staffList as any[];
    const q = search.toLowerCase();
    return (staffList as any[]).filter((s: any) =>
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q) ||
      s.jobTitle?.toLowerCase().includes(q) ||
      s.staffId?.toLowerCase().includes(q)
    );
  }, [staffList, search]);

  const handleUpdated = useCallback((updated: any) => {
    queryClient.setQueryData(["staff-list"], (old: any[] | undefined) =>
      old ? old.map(s => s.id === updated.id ? updated : s) : old
    );
  }, [queryClient]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Staff Profiles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage employee records</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, department, job title or staff ID…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading staff…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>{search ? "No staff match your search" : "No staff members found"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s: any) => (
            <button key={s.id} onClick={() => setSelectedId(s.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-background hover:bg-muted/30 hover:border-primary/30 transition-all text-left">
              <Avatar name={s.name} photo={s.profilePhoto} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${ROLE_COLORS[s.role] ?? "bg-muted text-muted-foreground"}`}>
                    {s.role.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  {s.jobTitle && <span>{s.jobTitle}</span>}
                  {s.department && <span className="text-muted-foreground/60">·</span>}
                  {s.department && <span>{s.department}</span>}
                  {s.email && <span className="text-muted-foreground/60">·</span>}
                  {s.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selectedId !== null && (
        <StaffPanel
          staffId={selectedId}
          canEdit={canEdit}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
