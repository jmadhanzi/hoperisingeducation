/**
 * AdminCampaigns — manage multiple simultaneous fundraising campaigns.
 * Features: create, edit, delete, toggle active/featured, quick-update raised amount.
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Star,
  DollarSign,
  Target,
  Calendar,
  ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CampaignFormData {
  title: string;
  excerpt: string;
  description: string;
  coverImageUrl: string;
  goalCents: number;
  raisedCents: number;
  currency: string;
  donateUrl: string;
  deadline: string; // ISO date string or ""
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

const EMPTY_FORM: CampaignFormData = {
  title: "",
  excerpt: "",
  description: "",
  coverImageUrl: "",
  goalCents: 0,
  raisedCents: 0,
  currency: "USD",
  donateUrl: "",
  deadline: "",
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function centsToDisplay(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

function progressPct(raised: number, goal: number) {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminCampaigns() {
  const utils = trpc.useUtils();

  const { data: campaigns = [], isLoading } = trpc.campaigns.listAll.useQuery();

  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created");
      utils.campaigns.listAll.invalidate();
      utils.campaigns.listActive.invalidate();
      utils.campaigns.getFeatured.invalidate();
      setFormOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success("Campaign updated");
      utils.campaigns.listAll.invalidate();
      utils.campaigns.listActive.invalidate();
      utils.campaigns.getFeatured.invalidate();
      setFormOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.campaigns.delete.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted");
      utils.campaigns.listAll.invalidate();
      utils.campaigns.listActive.invalidate();
      utils.campaigns.getFeatured.invalidate();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActiveMutation = trpc.campaigns.toggleActive.useMutation({
    onSuccess: () => {
      utils.campaigns.listAll.invalidate();
      utils.campaigns.listActive.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleFeaturedMutation = trpc.campaigns.toggleFeatured.useMutation({
    onSuccess: () => {
      utils.campaigns.listAll.invalidate();
      utils.campaigns.getFeatured.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRaisedMutation = trpc.campaigns.updateRaised.useMutation({
    onSuccess: () => {
      toast.success("Raised amount updated");
      utils.campaigns.listAll.invalidate();
      utils.campaigns.listActive.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Local state ──────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CampaignFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [raisedEditId, setRaisedEditId] = useState<number | null>(null);
  const [raisedInput, setRaisedInput] = useState("");

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(c: (typeof campaigns)[0]) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      excerpt: c.excerpt ?? "",
      description: c.description ?? "",
      coverImageUrl: c.coverImageUrl ?? "",
      goalCents: c.goalCents,
      raisedCents: c.raisedCents,
      currency: c.currency,
      donateUrl: c.donateUrl ?? "",
      deadline: c.deadline ? new Date(c.deadline).toISOString().split("T")[0] : "",
      isActive: c.isActive,
      isFeatured: c.isFeatured,
      sortOrder: c.sortOrder,
    });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title: form.title,
      excerpt: form.excerpt || undefined,
      description: form.description || undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      goalCents: form.goalCents,
      raisedCents: form.raisedCents,
      currency: form.currency,
      donateUrl: form.donateUrl || undefined,
      deadline: form.deadline ? new Date(form.deadline) : null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: form.sortOrder,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleRaisedSave(id: number) {
    const cents = Math.round(parseFloat(raisedInput) * 100);
    if (isNaN(cents) || cents < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    updateRaisedMutation.mutate({ id, raisedCents: cents });
    setRaisedEditId(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Campaigns
              </h1>
              <p className="text-xs text-gray-500">Manage your fundraising campaigns</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-[#EE701E] hover:bg-[#d4611a] text-white">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Create your first fundraising campaign to get started.</p>
            <Button onClick={openCreate} className="gap-2 bg-[#EE701E] hover:bg-[#d4611a] text-white">
              <Plus className="w-4 h-4" />
              Create First Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => {
              const pct = progressPct(c.raisedCents, c.goalCents);
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
                    c.isActive ? "border-gray-200" : "border-gray-200 opacity-60"
                  }`}
                >
                  {/* Cover image */}
                  {c.coverImageUrl ? (
                    <img
                      src={c.coverImageUrl}
                      alt={c.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-[#0D215C] to-[#1a3a8f] flex items-center justify-center">
                      <Target className="w-10 h-10 text-white/30" />
                    </div>
                  )}

                  <div className="p-4">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={c.isActive ? "default" : "secondary"} className="text-xs">
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {c.isFeatured && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      {c.title}
                    </h3>
                    {c.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{c.excerpt}</p>
                    )}

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="font-semibold text-[#EE701E]">{centsToDisplay(c.raisedCents, c.currency)} raised</span>
                        <span>of {centsToDisplay(c.goalCents, c.currency)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#EE701E] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-400 mt-0.5">{pct}%</div>
                    </div>

                    {/* Quick raised edit */}
                    {raisedEditId === c.id ? (
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount raised ($)"
                          value={raisedInput}
                          onChange={(e) => setRaisedInput(e.target.value)}
                          className="h-8 text-xs"
                          autoFocus
                        />
                        <Button size="sm" className="h-8 text-xs bg-[#EE701E] hover:bg-[#d4611a] text-white px-3" onClick={() => handleRaisedSave(c.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs px-2" onClick={() => setRaisedEditId(null)}>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-xs mb-3 gap-1.5"
                        onClick={() => {
                          setRaisedEditId(c.id);
                          setRaisedInput((c.raisedCents / 100).toFixed(2));
                        }}
                      >
                        <DollarSign className="w-3 h-3" />
                        Update Raised Amount
                      </Button>
                    )}

                    {/* Deadline */}
                    {c.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {new Date(c.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {/* Donate URL */}
                    {c.donateUrl && (
                      <a
                        href={c.donateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Donate URL
                      </a>
                    )}

                    {/* Toggles */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.isActive}
                          onCheckedChange={(v) => toggleActiveMutation.mutate({ id: c.id, isActive: v })}
                          id={`active-${c.id}`}
                        />
                        <Label htmlFor={`active-${c.id}`} className="text-xs cursor-pointer">Active</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.isFeatured}
                          onCheckedChange={(v) => toggleFeaturedMutation.mutate({ id: c.id, isFeatured: v })}
                          id={`featured-${c.id}`}
                        />
                        <Label htmlFor={`featured-${c.id}`} className="text-xs cursor-pointer">Featured</Label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs gap-1"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-3"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              {editingId !== null ? "Edit Campaign" : "New Campaign"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Campaign Title *</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. School Fees for 100 Children"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Short Description (shown on card)</Label>
              <Input
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="One sentence summary of the campaign"
                maxLength={500}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detailed description of what the funds will be used for..."
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                type="url"
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                placeholder="https://... or /manus-storage/..."
              />
              {form.coverImageUrl && (
                <img src={form.coverImageUrl} alt="Preview" className="h-24 w-full object-cover rounded-md mt-1" />
              )}
            </div>

            {/* Goal / Raised / Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal">Goal Amount ($)</Label>
                <Input
                  id="goal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(form.goalCents / 100).toFixed(2)}
                  onChange={(e) => setForm((f) => ({ ...f, goalCents: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                  placeholder="10000.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="raised">Raised So Far ($)</Label>
                <Input
                  id="raised"
                  type="number"
                  min="0"
                  step="0.01"
                  value={(form.raisedCents / 100).toFixed(2)}
                  onChange={(e) => setForm((f) => ({ ...f, raisedCents: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase().slice(0, 3) }))}
                  placeholder="USD"
                  maxLength={3}
                />
              </div>
            </div>

            {/* Donate URL */}
            <div className="space-y-1.5">
              <Label htmlFor="donateUrl">Donation URL (Raisely, PayPal, etc.)</Label>
              <Input
                id="donateUrl"
                type="url"
                value={form.donateUrl}
                onChange={(e) => setForm((f) => ({ ...f, donateUrl: e.target.value }))}
                placeholder="https://donate.raisely.com/your-campaign"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Campaign Deadline (optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Display Order (lower = shown first)</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value || "0") }))}
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-8 pt-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (visible on public site)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="isFeatured"
                  checked={form.isFeatured}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured on Home page
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#EE701E] hover:bg-[#d4611a] text-white"
              >
                {editingId !== null ? "Save Changes" : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the campaign and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
