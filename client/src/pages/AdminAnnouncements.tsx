import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Megaphone, Plus, Pencil, Trash2, X, Check } from "lucide-react";

type AnnouncementForm = {
  title: string;
  body: string;
  publishAt: string;
  unpublishAt: string;
  isActive: boolean;
};

const EMPTY_FORM: AnnouncementForm = {
  title: "",
  body: "",
  publishAt: "",
  unpublishAt: "",
  isActive: true,
};

export default function AdminAnnouncements() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_FORM);

  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.announcements.listAll.useQuery();

  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      utils.announcements.listAll.invalidate();
      utils.announcements.listActive.invalidate();
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast.success("Announcement created");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => {
      utils.announcements.listAll.invalidate();
      utils.announcements.listActive.invalidate();
      setEditingId(null);
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast.success("Announcement updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      utils.announcements.listAll.invalidate();
      utils.announcements.listActive.invalidate();
      toast.success("Announcement deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return null;
  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item: (typeof items)[0]) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      publishAt: item.publishAt ? new Date(item.publishAt).toISOString().slice(0, 16) : "",
      unpublishAt: item.unpublishAt ? new Date(item.unpublishAt).toISOString().slice(0, 16) : "",
      isActive: item.isActive,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      body: form.body,
      publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : null,
      unpublishAt: form.unpublishAt ? new Date(form.unpublishAt).toISOString() : null,
      isActive: form.isActive,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function getStatus(item: (typeof items)[0]): { label: string; color: string } {
    if (!item.isActive) return { label: "Inactive", color: "bg-gray-200 text-gray-700" };
    const now = new Date();
    if (item.publishAt && new Date(item.publishAt) > now) return { label: "Scheduled", color: "bg-yellow-100 text-yellow-800" };
    if (item.unpublishAt && new Date(item.unpublishAt) < now) return { label: "Expired", color: "bg-red-100 text-red-700" };
    return { label: "Live", color: "bg-green-100 text-green-800" };
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-[#F4631E]" />
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Announcements
              </h1>
              <p className="text-sm text-[#584237]">Create and manage site-wide announcements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")} className="text-[#0D215C]">
              ← Back to Admin
            </Button>
            <Button onClick={openCreate} className="bg-[#F4631E] hover:bg-[#d9541a] text-white">
              <Plus className="w-4 h-4 mr-1" /> New Announcement
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 border-[#F4631E]/30 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#0D215C]">
                {editingId !== null ? "Edit Announcement" : "New Announcement"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ann-title">Title *</Label>
                  <Input
                    id="ann-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. School Fees Drive 2025 is now open!"
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label htmlFor="ann-body">
                    Body *{" "}
                    <span className="text-xs text-gray-500 font-normal">
                      (basic HTML allowed: &lt;b&gt;, &lt;a href="..."&gt;, &lt;br&gt;)
                    </span>
                  </Label>
                  <Textarea
                    id="ann-body"
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    placeholder="Announcement text. Use <b>bold</b>, <a href='...'>links</a>, <br> for line breaks."
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ann-publish">Publish At (optional)</Label>
                    <Input
                      id="ann-publish"
                      type="datetime-local"
                      value={form.publishAt}
                      onChange={(e) => setForm((f) => ({ ...f, publishAt: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to show immediately</p>
                  </div>
                  <div>
                    <Label htmlFor="ann-unpublish">Unpublish At (optional)</Label>
                    <Input
                      id="ann-unpublish"
                      type="datetime-local"
                      value={form.unpublishAt}
                      onChange={(e) => setForm((f) => ({ ...f, unpublishAt: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to show indefinitely</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="ann-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  />
                  <Label htmlFor="ann-active">Active (visible on site)</Label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isSaving} className="bg-[#F4631E] hover:bg-[#d9541a] text-white">
                    <Check className="w-4 h-4 mr-1" />
                    {isSaving ? "Saving…" : editingId !== null ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); }}
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No announcements yet</p>
            <p className="text-sm mt-1">Click "New Announcement" to create your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const status = getStatus(item);
              return (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#0D215C] truncate">{item.title}</h3>
                      <p
                        className="text-sm text-gray-600 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: item.body }}
                      />
                      {(item.publishAt || item.unpublishAt) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {item.publishAt && `Shows: ${new Date(item.publishAt).toLocaleString()}`}
                          {item.publishAt && item.unpublishAt && " · "}
                          {item.unpublishAt && `Hides: ${new Date(item.unpublishAt).toLocaleString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Delete this announcement?")) deleteMutation.mutate({ id: item.id });
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
