"use client";

import { Component, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { Download, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { isConvexConfigured } from "@/lib/convex-config";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const STATUSES = ["new", "pitched", "replied", "won", "lost"] as const;
type LeadStatus = (typeof STATUSES)[number];

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: Doc<"savedLeads">[]) {
  const header = ["Name", "Category", "City", "Phone", "WhatsApp", "Email", "Website", "Rating", "Reviews", "Tier", "Status", "Audit date", "Gaps", "Biggest gap", "Notes"];
  const lines = rows.map((r) =>
    [
      r.name, r.category, r.city, r.phone ?? "", r.whatsapp ?? "", r.email ?? "", r.website ?? "",
      r.rating ?? "", r.reviewsCount ?? "", r.tier, r.status,
      new Date(r.auditDate).toISOString().slice(0, 10), r.gaps.join("; "), r.biggestGap, r.notes,
    ].map(csvEscape).join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "saved-leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

class LoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed">
            Saved leads could not be loaded. If you have just merged this feature, the usual causes are: the
            Convex functions have not been deployed yet (run <span className="font-mono text-foreground">npx convex deploy</span> once
            from the app folder), or the Clerk JWT template named <span className="font-mono text-foreground">convex</span> does
            not exist yet in the Clerk dashboard.
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

export function SavedLeads() {
  return (
    <div className="w-full pb-32">
      <header className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05]">Saved leads</h1>
        <p className="text-muted-foreground mt-4 text-base max-w-2xl leading-relaxed">
          Every business you audited and chose to keep, with the audit snapshot from the day you saved it.
          Track where each pitch stands.
        </p>
      </header>
      {!isConvexConfigured() ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed space-y-2">
            <p className="text-foreground font-medium">Saved leads are not switched on yet.</p>
            <p>
              The database is Convex. To finish the setup: add NEXT_PUBLIC_CONVEX_URL to Vercel (the URL of your
              production deployment, from the Convex dashboard), create the JWT template named convex in the Clerk
              dashboard, and run npx convex deploy once from the app folder. Then reload this page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <LoadBoundary>
          <SavedLeadsInner />
        </LoadBoundary>
      )}
    </div>
  );
}

function SavedLeadsInner() {
  const leads = useQuery(api.savedLeads.listMine);
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads?.length ?? 0 };
    for (const s of STATUSES) c[s] = (leads ?? []).filter((l) => l.status === s).length;
    return c;
  }, [leads]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (leads ?? []).filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (q && !`${l.name} ${l.category} ${l.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [leads, statusFilter, search]);

  if (leads === undefined) {
    return <p className="text-sm text-muted-foreground">Loading saved leads...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>
          All · {counts.all}
        </Button>
        {STATUSES.map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize">
            {s} · {counts[s]}
          </Button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, niche, city" className="h-9 pl-8 w-56" />
        </div>
        <Button size="sm" variant="outline" onClick={() => downloadCsv(visible)} disabled={visible.length === 0}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {leads.length === 0
              ? "Nothing saved yet. Run an audit in the pipeline and use Save lead on the businesses worth pitching."
              : "No saved leads match this filter."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((lead) => (
            <SavedLeadCard key={lead._id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedLeadCard({ lead }: { lead: Doc<"savedLeads"> }) {
  const setStatus = useMutation(api.savedLeads.setStatus);
  const remove = useMutation(api.savedLeads.remove);

  async function onRemove() {
    try {
      await remove({ id: lead._id });
      toast.success(`${lead.name} removed from saved leads`);
    } catch {
      toast.error("Could not remove this lead.");
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base font-medium leading-snug">{lead.name}</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {lead.category} · {lead.city}
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={onRemove} aria-label={`Remove ${lead.name}`} className="h-7 w-7 shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-[color:var(--chart-4)] text-[color:var(--chart-4)]" strokeWidth={1.5} />
            <span className="font-mono tabular-nums">{lead.rating?.toFixed(1) ?? "—"}</span>
            <span>({lead.reviewsCount ?? 0})</span>
          </span>
          <Badge variant="secondary" className="text-[10px] font-normal h-5">{lead.tier}</Badge>
          <span className="text-[11px]">
            Audited {new Date(lead.auditDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {lead.gaps.slice(0, 3).map((g) => (
            <Badge key={g} variant="outline" className="text-[10px] font-normal text-[color:var(--destructive)] border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/5">
              {g}
            </Badge>
          ))}
          {lead.gaps.length > 3 && (
            <Badge variant="outline" className="text-[10px] font-normal">+{lead.gaps.length - 3} more</Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground italic leading-relaxed">{lead.biggestGap}</p>

        <div className="flex items-center gap-2 pt-1 border-t border-border/60">
          <label htmlFor={`status-${lead._id}`} className="text-[11px] text-muted-foreground">Status</label>
          <select
            id={`status-${lead._id}`}
            value={lead.status}
            onChange={(e) => setStatus({ id: lead._id, status: e.target.value as LeadStatus })}
            className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <NotesEditor lead={lead} />
      </CardContent>
    </Card>
  );
}

function NotesEditor({ lead }: { lead: Doc<"savedLeads"> }) {
  const setNotes = useMutation(api.savedLeads.setNotes);
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? lead.notes;
  const dirty = draft !== null && draft !== lead.notes;

  async function onSaveNote() {
    if (!dirty) return;
    try {
      await setNotes({ id: lead._id, notes: value });
      setDraft(null);
      toast.success("Note saved");
    } catch {
      toast.error("Could not save the note.");
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Notes: who you spoke to, what they said, next step..."
        className="text-xs min-h-[64px]"
        aria-label={`Notes for ${lead.name}`}
      />
      {dirty && (
        <Button size="sm" variant="outline" onClick={onSaveNote} className="w-full">Save note</Button>
      )}
    </div>
  );
}
