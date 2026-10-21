"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex-config";
import { placeKeyOf, tierOf } from "@/lib/saved-leads";
import type { AuditResult, Lead } from "@/lib/types";
import { Button } from "./ui/button";

/**
 * Save an audited lead (with its audit snapshot) to Convex.
 * Renders nothing until Convex is configured, so the audit phase is
 * unchanged for anyone who has not set it up yet.
 */
export function SaveLeadButton({ lead, audit, compact = false }: { lead: Lead; audit: AuditResult; compact?: boolean }) {
  if (!isConvexConfigured()) return null;
  return <SaveLeadButtonInner lead={lead} audit={audit} compact={compact} />;
}

function SaveLeadButtonInner({ lead, audit, compact }: { lead: Lead; audit: AuditResult; compact: boolean }) {
  const saved = useQuery(api.savedLeads.listMine);
  const save = useMutation(api.savedLeads.save);
  const [saving, setSaving] = useState(false);
  const placeKey = placeKeyOf(lead);
  const alreadySaved = (saved ?? []).some((s) => s.placeKey === placeKey);

  async function onSave() {
    setSaving(true);
    try {
      await save({
        placeKey,
        placeId: lead.placeId,
        name: lead.name,
        category: lead.category,
        address: lead.address,
        city: lead.city,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        website: lead.website,
        rating: lead.rating,
        reviewsCount: lead.reviewsCount,
        photosCount: lead.photosCount,
        tier: tierOf(lead, audit),
        auditDate: Date.now(),
        gaps: audit.gaps,
        strengths: audit.strengths ?? [],
        biggestGap: audit.biggestGap,
        hasWebsite: audit.hasWebsite,
        siteKind: audit.siteKind,
      });
      toast.success(alreadySaved ? "Saved lead updated with the latest audit" : "Lead saved. Find it under Saved leads.");
    } catch {
      toast.error("Could not save this lead. Check the Convex setup and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button size="sm" variant={alreadySaved ? "secondary" : "outline"} onClick={onSave} disabled={saving} className={compact ? "" : "w-full"}>
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : alreadySaved ? (
        <BookmarkCheck className="h-3.5 w-3.5 mr-1.5" />
      ) : (
        <Bookmark className="h-3.5 w-3.5 mr-1.5" />
      )}
      {compact ? (alreadySaved ? "Saved" : "Save") : alreadySaved ? "Saved · update audit" : "Save lead"}
    </Button>
  );
}
