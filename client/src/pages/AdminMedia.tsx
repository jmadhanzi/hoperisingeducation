/**
 * AdminMedia — Media Library management page
 * Features: drag-drop upload, grid/list view, folder filter, copy URL, alt text edit, delete
 * Access: admin only
 */
import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, Trash2, Copy, Edit3, Check, X, Image, Video,
  FolderOpen, Grid3X3, List, ArrowLeft, Plus, Search,
  FileText, Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLoginUrl } from "@/const";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MediaFile {
  id: number;
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  altText: string | null;
  folder: string;
  uploadedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const FOLDERS = ["general", "hero", "programs", "team", "events", "blog", "gallery"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isVideo(mimeType: string) {
  return mimeType.startsWith("video/");
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

// ── Upload modal ──────────────────────────────────────────────────────────────
function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, "pending" | "done" | "error">>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.media.upload.useMutation();

  const addFiles = (newFiles: File[]) => {
    const allowed = newFiles.filter((f) => {
      if (f.size > 50 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 50 MB limit`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...allowed]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleUploadAll = async () => {
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      setProgress((p) => ({ ...p, [file.name]: "pending" }));
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip data URI prefix
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await uploadMutation.mutateAsync({
          filename: file.name,
          mimeType: file.type,
          base64,
          folder,
        });
        setProgress((p) => ({ ...p, [file.name]: "done" }));
      } catch {
        setProgress((p) => ({ ...p, [file.name]: "error" }));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    toast.success("Upload complete");
    onUploaded();
    setFiles([]);
    setProgress({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#EE701E]" /> Upload Media
          </DialogTitle>
        </DialogHeader>

        {/* Folder selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Folder</label>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? "border-[#EE701E] bg-orange-50" : "border-border hover:border-[#EE701E]/50"
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Images & videos up to 50 MB each</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {files.map((f) => (
              <div key={f.name} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 min-w-0">
                  {isVideo(f.type) ? (
                    <Film className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <Image className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  <span className="truncate">{f.name}</span>
                  <span className="text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {progress[f.name] === "done" && <Check className="w-4 h-4 text-green-500" />}
                  {progress[f.name] === "error" && <X className="w-4 h-4 text-red-500" />}
                  {!progress[f.name] && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((x) => x.name !== f.name)); }}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button
            onClick={handleUploadAll}
            disabled={!files.length || uploading}
            className="bg-[#EE701E] hover:bg-[#d4611a] text-white"
          >
            {uploading ? "Uploading…" : `Upload ${files.length} file${files.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Alt text edit modal ───────────────────────────────────────────────────────
function AltTextModal({
  file,
  onClose,
  onSaved,
}: {
  file: MediaFile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [altText, setAltText] = useState(file.altText ?? "");
  const [folder, setFolder] = useState(file.folder);
  const updateMutation = trpc.media.updateAlt.useMutation();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: file.id, altText, folder });
      toast.success("Saved");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Media Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isImage(file.mimeType) && (
            <img src={file.url} alt={file.altText ?? ""} className="w-full h-40 object-cover rounded-lg" />
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium">Alt Text / Caption</label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for accessibility…"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Folder</label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FOLDERS.map((f) => (
                  <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-[#EE701E] hover:bg-[#d4611a] text-white">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminMedia() {
  const { user, loading } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editFile, setEditFile] = useState<MediaFile | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [folderFilter, setFolderFilter] = useState("all");
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.media.list.useQuery(
    { folder: folderFilter === "all" ? undefined : folderFilter, limit: 200 },
    { enabled: user?.role === "admin" }
  );

  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      utils.media.list.invalidate();
      toast.success("File deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

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

  const files: MediaFile[] = (data?.files ?? []) as MediaFile[];
  const total = data?.total ?? 0;

  const filtered = files.filter((f) =>
    !search || f.filename.toLowerCase().includes(search.toLowerCase()) || (f.altText ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

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
              <FolderOpen className="w-5 h-5 text-[#EE701E]" />
              <span className="font-semibold">Media Library</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/content" className="text-sm text-white/70 hover:text-white transition-colors">
              Site Content
            </Link>
            <Button
              onClick={() => setUploadOpen(true)}
              size="sm"
              className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5"
            >
              <Plus className="w-4 h-4" /> Upload
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or caption…"
              className="pl-9"
            />
          </div>
          <Select value={folderFilter} onValueChange={setFolderFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {FOLDERS.map((f) => (
                <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-[#EE701E] text-white" : "hover:bg-muted"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-[#EE701E] text-white" : "hover:bg-muted"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <span>{total} file{total !== 1 ? "s" : ""} total</span>
          {search && <span>· {filtered.length} matching</span>}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#EE701E] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {search ? "No files match your search" : "No media files yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search ? "Try a different search term." : "Upload photos and videos to get started."}
            </p>
            {!search && (
              <Button onClick={() => setUploadOpen(true)} className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5">
                <Upload className="w-4 h-4" /> Upload Your First File
              </Button>
            )}
          </div>
        )}

        {/* Grid view */}
        {!isLoading && filtered.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((file) => (
              <div
                key={file.id}
                className="group relative bg-muted rounded-xl overflow-hidden border border-border hover:border-[#EE701E]/50 transition-all"
              >
                {/* Preview */}
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {isImage(file.mimeType) ? (
                    <img
                      src={file.url}
                      alt={file.altText ?? file.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isVideo(file.mimeType) ? (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Film className="w-8 h-8" />
                      <span className="text-xs">Video</span>
                    </div>
                  ) : (
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(file.url)}
                    title="Copy URL"
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditFile(file)}
                    title="Edit details"
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(file.id)}
                    title="Delete"
                    className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* File info */}
                <div className="p-2">
                  <p className="text-xs font-medium truncate text-foreground">{file.filename}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">{file.folder}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {!isLoading && filtered.length > 0 && viewMode === "list" && (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Preview</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Filename</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Size</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Folder</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Caption</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {isImage(file.mimeType) ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : isVideo(file.mimeType) ? (
                          <Film className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px]">
                      <span className="truncate block">{file.filename}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <span className="text-xs">{file.mimeType}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant="secondary">{file.folder}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px]">
                      <span className="truncate block text-xs">{file.altText ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyUrl(file.url)}
                          title="Copy URL"
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditFile(file)}
                          title="Edit"
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(file.id)}
                          title="Delete"
                          className="p-1.5 hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => { utils.media.list.invalidate(); }}
      />

      {/* Alt text edit modal */}
      {editFile && (
        <AltTextModal
          file={editFile}
          onClose={() => setEditFile(null)}
          onSaved={() => utils.media.list.invalidate()}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete File?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the file from the media library. Any pages using this URL will show a broken image.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
