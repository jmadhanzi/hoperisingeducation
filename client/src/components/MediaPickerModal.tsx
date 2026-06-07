/**
 * MediaPickerModal — reusable image picker backed by the Media Library.
 *
 * Usage:
 *   <MediaPickerModal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onSelect={(url, alt) => doSomething(url, alt)}
 *   />
 *
 * The modal shows all uploaded images from the media library.
 * Admins can also upload a new file directly from this modal.
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  X, Search, Upload, Image as ImageIcon, Check, Loader2, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the selected image URL and optional alt text */
  onSelect: (url: string, alt: string) => void;
  /** Optional title override */
  title?: string;
}

interface MediaFile {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  altText: string | null;
  size: number;
  createdAt: Date;
}

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title = "Pick from Media Library",
}: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.media.list.useQuery(
    { limit: 200 },
    { enabled: open }
  );

  // Client-side filter: images only, and optional search
  const allFiles: MediaFile[] = ((data?.files ?? []) as MediaFile[]).filter(
    (f) => f.mimeType.startsWith("image/")
  );

  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: (file) => {
      toast.success("Image uploaded");
      utils.media.list.invalidate();
      setSelected(file as unknown as MediaFile);
    },
    onError: () => toast.error("Upload failed"),
  });

  const files: MediaFile[] = search
    ? allFiles.filter(
        (f) =>
          f.filename.toLowerCase().includes(search.toLowerCase()) ||
          (f.altText ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : allFiles;

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const file = fileList[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are supported here");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10 MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        uploadMutation.mutate({
          filename: file.name,
          mimeType: file.type,
          base64,
          folder: "blog",
        });
      };
      reader.readAsDataURL(file);
    },
    [uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInsert = () => {
    if (!selected) return;
    onSelect(selected.url, selected.altText ?? selected.filename);
    setSelected(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#EE701E]" />
            <h2 className="font-semibold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search images…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="gap-1.5 shrink-0"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload New
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Drop zone + grid */}
        <div
          className={`flex-1 overflow-y-auto p-4 transition-colors ${isDragging ? "bg-[#EE701E]/5 ring-2 ring-inset ring-[#EE701E]" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-[#EE701E]" />
            </div>
          )}

          {!isLoading && files.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                {search ? "No images match your search." : "No images in the library yet."}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Drag an image here or click "Upload New" to add one.
              </p>
            </div>
          )}

          {!isLoading && files.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {files.map((file) => {
                const isSelected = selected?.id === file.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelected(isSelected ? null : file)}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EE701E] ${
                      isSelected
                        ? "border-[#EE701E] ring-2 ring-[#EE701E]/30"
                        : "border-transparent hover:border-[#EE701E]/40"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.altText ?? file.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 bg-black/40 flex items-end p-1.5 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <span className="text-white text-[10px] leading-tight line-clamp-2 font-medium">
                        {file.altText ?? file.filename}
                      </span>
                    </div>
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#EE701E] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[#EE701E]/90 text-white rounded-2xl px-6 py-4 text-sm font-semibold shadow-xl">
                Drop to upload
              </div>
            </div>
          )}
        </div>

        {/* Selected preview + footer */}
        <div className="border-t border-border px-5 py-4 flex items-center gap-4">
          {selected ? (
            <>
              <img
                src={selected.url}
                alt={selected.altText ?? selected.filename}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selected.filename}</p>
                <p className="text-xs text-muted-foreground truncate">{selected.url}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">Selected</Badge>
            </>
          ) : (
            <p className="text-sm text-muted-foreground flex-1">
              Click an image to select it, or drag a new one to upload.
            </p>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInsert}
              disabled={!selected}
              className="bg-[#EE701E] hover:bg-[#d4611a] text-white gap-1.5"
            >
              <Check className="w-4 h-4" />
              Insert Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
