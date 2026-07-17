import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Video, Upload, Pencil, Trash2, X, Check, Eye, EyeOff, GripVertical } from "lucide-react";

const MAX_MB = 200;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_EXTS = ".mp4,.webm,.mov";

type VideoItem = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  size: number;
  createdAt: Date;
};

export default function AdminVideos() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: "", description: "", thumbnailUrl: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", thumbnailUrl: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: videos = [], isLoading } = trpc.videos.listAll.useQuery();

  const uploadMutation = trpc.videos.upload.useMutation({
    onSuccess: () => {
      utils.videos.listAll.invalidate();
      utils.videos.listPublished.invalidate();
      setUploadFile(null);
      setUploadForm({ title: "", description: "", thumbnailUrl: "" });
      setUploadProgress(null);
      toast.success("Video uploaded successfully");
    },
    onError: (e) => {
      setUploadProgress(null);
      toast.error(e.message);
    },
  });

  const updateMutation = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.videos.listAll.invalidate();
      setEditingId(null);
      toast.success("Video updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.videos.togglePublish.useMutation({
    onSuccess: (res) => {
      utils.videos.listAll.invalidate();
      utils.videos.listPublished.invalidate();
      toast.success(res.isPublished ? "Video published" : "Video unpublished");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.videos.delete.useMutation({
    onSuccess: () => {
      utils.videos.listAll.invalidate();
      utils.videos.listPublished.invalidate();
      toast.success("Video deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const reorderMutation = trpc.videos.reorder.useMutation({
    onError: (e) => toast.error(e.message),
  });

  if (loading) return null;
  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please upload MP4, WebM, or MOV.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_MB} MB.`;
    }
    return null;
  }

  function handleFileSelect(file: File) {
    const err = validateFile(file);
    if (err) { toast.error(err); return; }
    setUploadFile(file);
    if (!uploadForm.title) {
      setUploadForm((f) => ({ ...f, title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }));
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [uploadForm.title]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return;
    if (!uploadForm.title.trim()) { toast.error("Title is required"); return; }

    // Simulate progress while encoding
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setUploadProgress(10 + Math.round((ev.loaded / ev.total) * 60));
      }
    };
    reader.onload = () => {
      setUploadProgress(75);
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        fileBase64: base64,
        filename: uploadFile.name,
        mimeType: uploadFile.type,
        size: uploadFile.size,
        thumbnailUrl: uploadForm.thumbnailUrl || undefined,
      });
      setUploadProgress(90);
    };
    reader.readAsDataURL(uploadFile);
  }

  function moveVideo(index: number, direction: -1 | 1) {
    const sorted = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;
    const items = sorted.map((v, i) => ({ id: v.id, sortOrder: i }));
    // Swap
    const tmp = items[index].sortOrder;
    items[index].sortOrder = items[newIndex].sortOrder;
    items[newIndex].sortOrder = tmp;
    reorderMutation.mutate({ items });
    utils.videos.listAll.setData(undefined, (old) =>
      old
        ? old.map((v) => {
            const found = items.find((i) => i.id === v.id);
            return found ? { ...v, sortOrder: found.sortOrder } : v;
          })
        : old
    );
  }

  const sortedVideos = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Video className="w-7 h-7 text-[#F4631E]" />
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Marketing Videos
              </h1>
              <p className="text-sm text-[#584237]">Upload and manage videos shown on the public site</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin")} className="text-[#0D215C]">
            ← Back to Admin
          </Button>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border-[#F4631E]/30 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-[#0D215C] mb-4">Upload New Video</h2>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
                dragging ? "border-[#F4631E] bg-orange-50" : "border-gray-300 hover:border-[#F4631E] hover:bg-orange-50/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              {uploadFile ? (
                <div>
                  <p className="font-semibold text-[#0D215C]">{uploadFile.name}</p>
                  <p className="text-sm text-gray-500">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-600">Drag & drop a video here, or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">MP4, WebM, MOV · Max {MAX_MB} MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTS}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
            </div>

            {uploadProgress !== null && (
              <div className="mb-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress < 90 ? "Reading file…" : "Uploading to storage…"}
                </p>
              </div>
            )}

            {uploadFile && (
              <form onSubmit={handleUpload} className="space-y-3">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Hope Rising in Zimbabwe 2025"
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description shown below the video"
                    rows={2}
                    maxLength={1000}
                  />
                </div>
                <div>
                  <Label>Poster / Thumbnail URL (optional)</Label>
                  <Input
                    value={uploadForm.thumbnailUrl}
                    onChange={(e) => setUploadForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="https://... or /manus-storage/..."
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={uploadMutation.isPending || uploadProgress !== null}
                    className="bg-[#F4631E] hover:bg-[#d9541a] text-white"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadMutation.isPending ? "Uploading…" : "Upload Video"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setUploadFile(null); setUploadProgress(null); setUploadForm({ title: "", description: "", thumbnailUrl: "" }); }}
                  >
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Video List */}
        <h2 className="text-lg font-bold text-[#0D215C] mb-3">All Videos ({videos.length})</h2>
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : sortedVideos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No videos yet</p>
            <p className="text-sm mt-1">Upload your first video above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedVideos.map((video, index) => (
              <Card key={video.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {editingId === video.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateMutation.mutate({ id: video.id, ...editForm });
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Thumbnail URL</Label>
                        <Input
                          value={editForm.thumbnailUrl}
                          onChange={(e) => setEditForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={updateMutation.isPending} size="sm" className="bg-[#F4631E] hover:bg-[#d9541a] text-white">
                          <Check className="w-3.5 h-3.5 mr-1" /> Save
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                          <X className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start gap-4">
                      {/* Reorder handles */}
                      <div className="flex flex-col gap-1 pt-1 shrink-0">
                        <button
                          onClick={() => moveVideo(index, -1)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-[#F4631E] disabled:opacity-20"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <GripVertical className="w-4 h-4 text-gray-300 mx-auto" />
                        <button
                          onClick={() => moveVideo(index, 1)}
                          disabled={index === sortedVideos.length - 1}
                          className="text-gray-400 hover:text-[#F4631E] disabled:opacity-20"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              video.isPublished ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {video.isPublished ? "Published" : "Draft"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {(video.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        <h3 className="font-semibold text-[#0D215C] truncate">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-gray-500 truncate">{video.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={video.isPublished}
                            onCheckedChange={() => toggleMutation.mutate({ id: video.id })}
                            disabled={toggleMutation.isPending}
                          />
                          {video.isPublished ? (
                            <Eye className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(video.id);
                            setEditForm({
                              title: video.title,
                              description: video.description ?? "",
                              thumbnailUrl: video.thumbnailUrl ?? "",
                            });
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Delete "${video.title}"?`)) deleteMutation.mutate({ id: video.id });
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
