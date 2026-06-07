/**
 * AdminContent — Site Content Editor
 * Allows admins to edit all public-facing text blocks grouped by section.
 * Changes are saved via tRPC siteContent.upsertMany and appear live on the site.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Save, ArrowLeft, RefreshCw, ChevronDown, ChevronRight,
  FileText, Eye, FolderOpen, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ContentRow {
  id: number;
  key: string;
  label: string;
  type: "text" | "textarea" | "html";
  value: string;
  section: string;
  updatedAt: Date;
}

// ── Section accordion ─────────────────────────────────────────────────────────
function SectionBlock({
  section,
  rows,
  values,
  onChange,
  dirty,
}: {
  section: string;
  rows: ContentRow[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  dirty: Set<string>;
}) {
  const [open, setOpen] = useState(true);

  const sectionDirty = rows.some((r) => dirty.has(r.key));

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-semibold text-foreground">{section}</span>
          <Badge variant="secondary" className="text-xs">{rows.length} field{rows.length !== 1 ? "s" : ""}</Badge>
        </div>
        {sectionDirty && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Unsaved changes</Badge>
        )}
      </button>

      {/* Fields */}
      {open && (
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.key} className="px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <label className="text-sm font-medium text-foreground">{row.label}</label>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">{row.key}</span>
                </div>
                {dirty.has(row.key) && (
                  <span className="text-xs text-amber-600 font-medium">Modified</span>
                )}
              </div>

              {row.type === "text" && (
                <Input
                  value={values[row.key] ?? row.value}
                  onChange={(e) => onChange(row.key, e.target.value)}
                  className={dirty.has(row.key) ? "border-amber-400 focus-visible:ring-amber-400" : ""}
                />
              )}

              {row.type === "textarea" && (
                <Textarea
                  value={values[row.key] ?? row.value}
                  onChange={(e) => onChange(row.key, e.target.value)}
                  rows={3}
                  className={dirty.has(row.key) ? "border-amber-400 focus-visible:ring-amber-400" : ""}
                />
              )}

              {row.type === "html" && (
                <Textarea
                  value={values[row.key] ?? row.value}
                  onChange={(e) => onChange(row.key, e.target.value)}
                  rows={6}
                  className={`font-mono text-xs ${dirty.has(row.key) ? "border-amber-400 focus-visible:ring-amber-400" : ""}`}
                  placeholder="HTML content…"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminContent() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: rows = [], isLoading, refetch } = trpc.siteContent.getAllFull.useQuery(
    undefined,
    { enabled: !loading && user?.role === "admin" }
  );

  const seedMutation = trpc.siteContent.seed.useMutation({
    onSuccess: (result) => {
      toast.success(`Seeded ${result.inserted} default content rows`);
      refetch();
    },
    onError: () => toast.error("Failed to seed content"),
  });

  const saveMutation = trpc.siteContent.upsertMany.useMutation({
    onSuccess: (result) => {
      toast.success(`Saved ${result.count} field${result.count !== 1 ? "s" : ""}`);
      setDirty(new Set());
      utils.siteContent.getAll.invalidate();
      refetch();
    },
    onError: () => toast.error("Failed to save changes"),
  });

  // Local edit state
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  // Initialise local values once rows are loaded
  useEffect(() => {
    if (rows.length > 0) {
      const initial: Record<string, string> = {};
      for (const row of rows) {
        initial[row.key] = row.value;
      }
      setValues(initial);
      setDirty(new Set());
    }
  }, [rows]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => new Set(prev).add(key));
  };

  const handleSave = () => {
    const changed = Array.from(dirty).map((key) => ({ key, value: values[key] ?? "" }));
    if (!changed.length) {
      toast.info("No changes to save");
      return;
    }
    saveMutation.mutate(changed);
  };

  const handleSeedAndLoad = async () => {
    await seedMutation.mutateAsync();
  };

  // Auth guard
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#EE701E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Admin access required.</p>
          <Link href="/" className="text-[#EE701E] hover:underline mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  // Group rows by section
  const sections: Record<string, ContentRow[]> = {};
  for (const row of rows as ContentRow[]) {
    if (!sections[row.section]) sections[row.section] = [];
    sections[row.section].push(row);
  }
  const sectionNames = Object.keys(sections).sort();

  const dirtyCount = dirty.size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#0D215C] text-white sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Admin
            </Link>
            <span className="text-white/30">/</span>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#EE701E]" />
              <span className="font-semibold">Site Content Editor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/media" className="text-sm text-white/70 hover:text-white transition-colors">
              Media Library
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" /> Preview Site
            </a>
            {dirtyCount > 0 && (
              <Badge className="bg-amber-400 text-amber-900 border-amber-400">
                {dirtyCount} unsaved
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || dirtyCount === 0}
              size="sm"
              className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 max-w-4xl">
        {/* Not loaded yet */}
        {rows.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No content rows found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Click below to load the default content definitions for all editable sections.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleSeedAndLoad}
                disabled={seedMutation.isPending}
                className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5"
              >
                {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Load Default Content
              </Button>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#EE701E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content sections */}
        {rows.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Site Content Editor</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Edit any text on the website. Changes go live immediately after saving.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || dirtyCount === 0}
                  size="sm"
                  className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save {dirtyCount > 0 ? `(${dirtyCount})` : ""}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {sectionNames.map((section) => (
                <SectionBlock
                  key={section}
                  section={section}
                  rows={sections[section]}
                  values={values}
                  onChange={handleChange}
                  dirty={dirty}
                />
              ))}
            </div>

            {/* Bottom save bar */}
            {dirtyCount > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-[#0D215C] text-white rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4">
                  <span className="text-sm">{dirtyCount} unsaved change{dirtyCount !== 1 ? "s" : ""}</span>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    size="sm"
                    className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5"
                  >
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Now
                  </Button>
                  <button
                    onClick={() => {
                      // Reset to server values
                      const reset: Record<string, string> = {};
                      for (const row of rows as ContentRow[]) {
                        reset[row.key] = row.value;
                      }
                      setValues(reset);
                      setDirty(new Set());
                    }}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
