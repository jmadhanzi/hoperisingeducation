import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Film,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const contentTemplates = [
  {
    page: "home",
    contentKey: "hero-eyebrow",
    label: "Home hero eyebrow",
    fallback: "Hope Rising Education",
  },
  {
    page: "home",
    contentKey: "hero-title",
    label: "Home hero title",
    fallback: "Every child deserves a chance to rise.",
  },
  {
    page: "home",
    contentKey: "hero-body",
    label: "Home hero introduction",
    fallback: "Hope Rising Education works alongside children, families, and schools to remove barriers to learning.",
  },
  {
    page: "home",
    contentKey: "impact-title",
    label: "Home impact heading",
    fallback: "A community-powered future",
  },
  {
    page: "about",
    contentKey: "intro",
    label: "About page introduction",
    fallback: "Hope Rising Education partners with communities to help learners thrive.",
  },
  {
    page: "programs",
    contentKey: "hero-prefix",
    label: "Programs page heading prefix",
    fallback: "Our",
  },
  {
    page: "programs",
    contentKey: "hero-highlight",
    label: "Programs page highlighted heading",
    fallback: "Programs",
  },
  {
    page: "programs",
    contentKey: "hero-intro",
    label: "Programs page introduction",
    fallback: "Holistic, evidence-based programs that address every barrier between a child and quality education.",
  },
  {
    page: "programs",
    contentKey: "program-my-best-me-description",
    label: "My Best Me description",
    fallback: "The My Best Me curriculum is Hope Rising Education's flagship program — a multimedia-rich, age-appropriate learning experience designed to cultivate hope, resilience, and emotional intelligence in children.",
  },
  {
    page: "programs",
    contentKey: "program-school-support-description",
    label: "School Fees & Supplies description",
    fallback: "Financial barriers are the primary reason children drop out of school in Zimbabwe. We cover school fees, uniforms, textbooks, stationery, and other essential supplies so no child is left behind.",
  },
  {
    page: "programs",
    contentKey: "program-tutoring-description",
    label: "Tutoring & Mentorship description",
    fallback: "One-on-one and small-group tutoring sessions help children who are falling behind catch up with their peers. Dedicated mentors provide consistent guidance and encouragement throughout the school year.",
  },
  {
    page: "programs",
    contentKey: "program-nutrition-description",
    label: "Nutrition & Meals description",
    fallback: "Hunger is a significant barrier to learning. We provide warm, nutritious meals daily to children in our programs, ensuring they have the energy and focus needed to engage fully in their education.",
  },
  {
    page: "programs",
    contentKey: "program-psychosocial-description",
    label: "Psycho-Social Support description",
    fallback: "Many children in our communities have experienced trauma, loss, or significant stress. Our trained counselors and safe spaces provide the emotional support children need to heal and thrive.",
  },
  {
    page: "programs",
    contentKey: "program-safe-spaces-description",
    label: "Safe Learning Environments description",
    fallback: "We build and maintain safe, welcoming classrooms and learning spaces equipped with the tools children need to thrive. A safe environment is the foundation of effective learning.",
  },
  {
    page: "programs",
    contentKey: "partnerships-title",
    label: "Community partnerships heading",
    fallback: "Community Partnerships",
  },
  {
    page: "programs",
    contentKey: "partnerships-body",
    label: "Community partnerships description",
    fallback: "Our programs succeed because we work hand-in-hand with local schools, community leaders, families, and government agencies. Sustainable change requires deep community ownership.",
  },
  {
    page: "programs",
    contentKey: "cta-title",
    label: "Programs call-to-action heading",
    fallback: "Help Fund Our Programs",
  },
  {
    page: "programs",
    contentKey: "cta-body",
    label: "Programs call-to-action description",
    fallback: "Your donation directly supports these life-changing programs for vulnerable children.",
  },
];

type ContentTemplate = (typeof contentTemplates)[number];

type ContentRecord = {
  page: string;
  contentKey: string;
  label: string;
  value: string;
  isPublished: boolean;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("The selected file could not be read."));
        return;
      }
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

function ContentBlockEditor({ template, record }: { template: ContentTemplate; record?: ContentRecord }) {
  const utils = trpc.useUtils();
  const [value, setValue] = useState(record?.value ?? template.fallback);
  const [isPublished, setIsPublished] = useState(record?.isPublished ?? true);

  useEffect(() => {
    setValue(record?.value ?? template.fallback);
    setIsPublished(record?.isPublished ?? true);
  }, [record?.value, record?.isPublished, template.fallback]);

  const save = trpc.admin.saveSiteContent.useMutation({
    onSuccess: () => {
      toast.success(`${template.label} saved`);
      utils.admin.listSiteContent.invalidate();
      utils.content.pageContent.invalidate({ page: template.page });
    },
    onError: error => toast.error(error.message),
  });

  return (
    <div className="rounded-xl border border-[#E7E8E9] bg-[#FAFBFC] p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <label className="block text-sm font-bold text-[#0D215C]" htmlFor={`${template.page}-${template.contentKey}`}>
            {template.label}
          </label>
          <p className="mt-1 text-xs text-[#584237]/75">Plain text is rendered safely on the public site.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#584237]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={event => setIsPublished(event.target.checked)}
            className="h-4 w-4 rounded border-[#B9BDC2] text-[#EE701E] focus:ring-[#EE701E]"
          />
          Published
        </label>
      </div>
      <textarea
        id={`${template.page}-${template.contentKey}`}
        value={value}
        onChange={event => setValue(event.target.value)}
        rows={template.contentKey.includes("body") || template.contentKey === "intro" ? 4 : 2}
        maxLength={20_000}
        className="w-full rounded-lg border border-[#D9DEE3] bg-white px-3 py-2 text-sm text-[#263238] outline-none transition focus:border-[#EE701E] focus:ring-2 focus:ring-[#EE701E]/20"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={save.isPending || !value.trim()}
          onClick={() => save.mutate({
            page: template.page,
            contentKey: template.contentKey,
            label: template.label,
            value: value.trim(),
            isPublished,
          })}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0D215C] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#18377F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save copy
        </button>
      </div>
    </div>
  );
}

function ContentEditor() {
  const { data, isLoading } = trpc.admin.listSiteContent.useQuery();
  const contentByKey = useMemo(() => {
    const records = new Map<string, ContentRecord>();
    (data ?? []).forEach(record => records.set(`${record.page}:${record.contentKey}`, record));
    return records;
  }, [data]);

  return (
    <section className="rounded-2xl border border-[#E7E8E9] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-[#0D215C]/10 p-2.5 text-[#0D215C]"><FileText className="h-5 w-5" /></div>
        <div>
          <h2 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Website copy</h2>
          <p className="mt-1 text-sm text-[#584237]">Update priority public-page text without deploying code.</p>
        </div>
      </div>
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-[#F2F4F5]" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {contentTemplates.map(template => (
            <ContentBlockEditor
              key={`${template.page}-${template.contentKey}`}
              template={template}
              record={contentByKey.get(`${template.page}:${template.contentKey}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function VideoManager() {
  const utils = trpc.useUtils();
  const { data: videos, isLoading } = trpc.admin.listMarketingVideos.useQuery();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const upload = trpc.admin.uploadMarketingVideo.useMutation({
    onSuccess: result => {
      setVideoUrl(result.url);
      toast.success("Video uploaded to managed storage. Complete the details and publish it.");
    },
    onError: error => toast.error(error.message),
  });
  const save = trpc.admin.saveMarketingVideo.useMutation({
    onSuccess: () => {
      toast.success("Marketing video published");
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setThumbnailUrl("");
      setIsFeatured(true);
      setIsActive(true);
      utils.admin.listMarketingVideos.invalidate();
      utils.content.featuredVideo.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const remove = trpc.admin.deleteMarketingVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from the public library");
      utils.admin.listMarketingVideos.invalidate();
      utils.content.featuredVideo.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Choose an MP4, WebM, or MOV video.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Marketing videos must be 20 MB or smaller.");
      return;
    }
    try {
      const base64Data = await readFileAsBase64(file);
      upload.mutate({ fileName: file.name, contentType: file.type as "video/mp4" | "video/webm" | "video/quicktime", base64Data });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload preparation failed.");
    }
  };

  return (
    <section className="rounded-2xl border border-[#E7E8E9] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-[#EE701E]/10 p-2.5 text-[#EE701E]"><Film className="h-5 w-5" /></div>
        <div>
          <h2 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Marketing video</h2>
          <p className="mt-1 text-sm text-[#584237]">Upload a small video to managed storage or paste a secure hosted video URL.</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-[#E7E8E9] bg-[#FAFBFC] p-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-[#263238]">Video title</span>
          <input value={title} onChange={event => setTitle(event.target.value)} maxLength={255} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#EE701E] focus:ring-2 focus:ring-[#EE701E]/20" placeholder="Learners sharing their hopes for the future" />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-[#263238]">Description</span>
          <textarea value={description} onChange={event => setDescription(event.target.value)} maxLength={4_000} rows={3} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#EE701E] focus:ring-2 focus:ring-[#EE701E]/20" placeholder="A short, accessible description of this video." />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-[#263238]">Upload file</span>
          <span className="mt-1 flex flex-wrap items-center gap-3">
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#0D215C]/35 bg-white px-3 py-2 text-sm font-bold text-[#0D215C] hover:bg-[#0D215C]/5">
              {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {upload.isPending ? "Uploading…" : "Choose video"}
              <input type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" disabled={upload.isPending} onChange={onFileChange} />
            </span>
            <span className="text-xs text-[#584237]/75">MP4, WebM, or MOV; maximum 20 MB.</span>
          </span>
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-[#263238]">Video URL</span>
          <input value={videoUrl} onChange={event => setVideoUrl(event.target.value)} type="url" maxLength={1024} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#EE701E] focus:ring-2 focus:ring-[#EE701E]/20" placeholder="https://… or /manus-storage/…" />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-[#263238]">Optional thumbnail URL</span>
          <input value={thumbnailUrl} onChange={event => setThumbnailUrl(event.target.value)} type="url" maxLength={1024} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#EE701E] focus:ring-2 focus:ring-[#EE701E]/20" placeholder="https://…" />
        </label>
        <div className="flex flex-wrap gap-5 md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#584237]"><input checked={isFeatured} onChange={event => setIsFeatured(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-[#B9BDC2] text-[#EE701E] focus:ring-[#EE701E]" />Featured on Home</label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#584237]"><input checked={isActive} onChange={event => setIsActive(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-[#B9BDC2] text-[#EE701E] focus:ring-[#EE701E]" />Active</label>
        </div>
        <div className="flex justify-end md:col-span-2">
          <button type="button" disabled={save.isPending || !title.trim() || !videoUrl.trim()} onClick={() => save.mutate({ title: title.trim(), description: description.trim() || null, videoUrl: videoUrl.trim(), thumbnailUrl: thumbnailUrl.trim() || null, isFeatured, isActive })} className="inline-flex items-center gap-2 rounded-lg bg-[#EE701E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#D75E12] disabled:cursor-not-allowed disabled:opacity-50">
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish video
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? <div className="h-20 animate-pulse rounded-xl bg-[#F2F4F5]" /> : videos?.length ? videos.map(video => (
          <div key={video.id} className="flex flex-col gap-3 rounded-xl border border-[#E7E8E9] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><p className="font-bold text-[#0D215C]">{video.title}</p>{video.isFeatured ? <span className="rounded-full bg-[#EE701E]/10 px-2 py-0.5 text-xs font-bold text-[#D75E12]">Featured</span> : null}{video.isActive ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">Active</span> : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">Inactive</span>}</div>
              <p className="mt-1 truncate text-sm text-[#584237]">{video.videoUrl}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2"><a href={video.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm font-bold text-[#0D215C] hover:bg-[#0D215C]/5"><ExternalLink className="h-4 w-4" />Preview</a><button type="button" onClick={() => { if (window.confirm(`Remove “${video.title}” from the media library?`)) remove.mutate({ id: video.id }); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Remove</button></div>
          </div>
        )) : <p className="rounded-xl border border-dashed border-[#D9DEE3] p-4 text-sm text-[#584237]">No marketing video is published yet.</p>}
      </div>
    </section>
  );
}

function AnnouncementManager() {
  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.admin.listAnnouncements.useQuery();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [active, setActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const save = trpc.admin.saveAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Announcement published");
      setTitle(""); setBody(""); setCtaLabel(""); setCtaUrl(""); setActive(true); setStartsAt(""); setEndsAt("");
      utils.admin.listAnnouncements.invalidate();
      utils.content.activeAnnouncements.invalidate();
    },
    onError: error => toast.error(error.message),
  });
  const remove = trpc.admin.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Announcement removed");
      utils.admin.listAnnouncements.invalidate();
      utils.content.activeAnnouncements.invalidate();
    },
    onError: error => toast.error(error.message),
  });

  return (
    <section className="rounded-2xl border border-[#E7E8E9] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-[#4BAF4F]/10 p-2.5 text-[#398B3D]"><Megaphone className="h-5 w-5" /></div><div><h2 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Announcements</h2><p className="mt-1 text-sm text-[#584237]">Publish time-bounded public updates without redeploying the site.</p></div></div>
      <div className="grid gap-3 rounded-xl border border-[#E7E8E9] bg-[#FAFBFC] p-4 md:grid-cols-2">
        <label className="md:col-span-2"><span className="mb-1 block text-sm font-semibold text-[#263238]">Announcement title</span><input value={title} onChange={event => setTitle(event.target.value)} maxLength={255} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#4BAF4F] focus:ring-2 focus:ring-[#4BAF4F]/20" placeholder="School supply distribution this Saturday" /></label>
        <label className="md:col-span-2"><span className="mb-1 block text-sm font-semibold text-[#263238]">Message</span><textarea value={body} onChange={event => setBody(event.target.value)} maxLength={5_000} rows={3} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#4BAF4F] focus:ring-2 focus:ring-[#4BAF4F]/20" placeholder="Share the details that supporters need to know." /></label>
        <label><span className="mb-1 block text-sm font-semibold text-[#263238]">Optional button text</span><input value={ctaLabel} onChange={event => setCtaLabel(event.target.value)} maxLength={80} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#4BAF4F] focus:ring-2 focus:ring-[#4BAF4F]/20" placeholder="Learn more" /></label>
        <label><span className="mb-1 block text-sm font-semibold text-[#263238]">Optional button URL</span><input value={ctaUrl} onChange={event => setCtaUrl(event.target.value)} type="url" maxLength={1024} className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#4BAF4F] focus:ring-2 focus:ring-[#4BAF4F]/20" placeholder="https://…" /></label>
        <label><span className="mb-1 block text-sm font-semibold text-[#263238]">Start time (optional)</span><input value={startsAt} onChange={event => setStartsAt(event.target.value)} type="datetime-local" className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#4BAF4F] focus:ring-2 focus:ring-[#4BAF4F]/20" /></label>
        <label><span className="mb-1 block text-sm font-semibold text-[#263238]">End time (optional)</span><input value={endsAt} onChange={event => setEndsAt(event.target.value)} type="datetime-local" className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2 text-sm outline-none focus:border-[#4BAF4F] focus:ring-2 focus:ring-[#4BAF4F]/20" /></label>
        <div className="flex items-center"><label className="inline-flex items-center gap-2 text-sm font-semibold text-[#584237]"><input checked={active} onChange={event => setActive(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-[#B9BDC2] text-[#4BAF4F] focus:ring-[#4BAF4F]" />Publish now</label></div>
        <div className="flex justify-end"><button type="button" disabled={save.isPending || !title.trim() || !body.trim() || (!!ctaLabel.trim() !== !!ctaUrl.trim())} onClick={() => save.mutate({ title: title.trim(), body: body.trim(), ctaLabel: ctaLabel.trim() || null, ctaUrl: ctaUrl.trim() || null, isActive: active, startsAt: startsAt ? new Date(startsAt).toISOString() : null, endsAt: endsAt ? new Date(endsAt).toISOString() : null })} className="inline-flex items-center gap-2 rounded-lg bg-[#4BAF4F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#398B3D] disabled:cursor-not-allowed disabled:opacity-50">{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Publish update</button></div>
      </div>
      <div className="mt-5 space-y-3">
        {isLoading ? <div className="h-20 animate-pulse rounded-xl bg-[#F2F4F5]" /> : announcements?.length ? announcements.map(item => <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-[#E7E8E9] p-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-[#0D215C]">{item.title}</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.isActive ? "Active" : "Inactive"}</span></div><p className="mt-1 text-sm text-[#584237]">{item.body}</p><p className="mt-2 text-xs text-[#584237]/70">{formatDate(item.startsAt)} — {formatDate(item.endsAt)}</p></div><button type="button" onClick={() => { if (window.confirm(`Delete “${item.title}”?`)) remove.mutate({ id: item.id }); }} className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button></div>) : <p className="rounded-xl border border-dashed border-[#D9DEE3] p-4 text-sm text-[#584237]">No announcements have been published.</p>}
      </div>
    </section>
  );
}

function RegistrationManager() {
  const utils = trpc.useUtils();
  const [type, setType] = useState<"all" | "contact" | "volunteer">("all");
  const [status, setStatus] = useState<"all" | "new" | "in_progress" | "archived">("all");
  const [search, setSearch] = useState("");
  const filters = { type, status, search: search.trim() || undefined };
  const { data: rows, isLoading } = trpc.admin.listRegistrations.useQuery(filters);
  const exportCsv = trpc.admin.exportRegistrationsCsv.useQuery(filters, { enabled: false });
  const updateStatus = trpc.admin.updateRegistrationStatus.useMutation({
    onSuccess: () => { utils.admin.listRegistrations.invalidate(); utils.admin.exportRegistrationsCsv.invalidate(); },
    onError: error => toast.error(error.message),
  });

  const downloadCsv = async () => {
    const response = await exportCsv.refetch();
    if (!response.data) {
      toast.error("The CSV export could not be generated.");
      return;
    }
    const blob = new Blob([response.data.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = response.data.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`${response.data.count} registrant${response.data.count === 1 ? "" : "s"} exported`);
  };

  return (
    <section className="rounded-2xl border border-[#E7E8E9] bg-white p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><div className="rounded-xl bg-[#0D215C]/10 p-2.5 text-[#0D215C]"><UsersRound className="h-5 w-5" /></div><div><h2 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Registrant management</h2><p className="mt-1 text-sm text-[#584237]">Review protected contact and volunteer submissions, then export filtered data as CSV.</p></div></div><button type="button" onClick={downloadCsv} disabled={exportCsv.isFetching} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0D215C] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#18377F] disabled:opacity-50">{exportCsv.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download CSV</button></div>
      <div className="grid gap-3 rounded-xl border border-[#E7E8E9] bg-[#FAFBFC] p-4 md:grid-cols-3"><label><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#584237]">Type</span><select value={type} onChange={event => setType(event.target.value as typeof type)} className="w-full rounded-lg border border-[#D9DEE3] bg-white px-3 py-2 text-sm"><option value="all">All submissions</option><option value="contact">Contact</option><option value="volunteer">Volunteer</option></select></label><label><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#584237]">Status</span><select value={status} onChange={event => setStatus(event.target.value as typeof status)} className="w-full rounded-lg border border-[#D9DEE3] bg-white px-3 py-2 text-sm"><option value="all">All statuses</option><option value="new">New</option><option value="in_progress">In progress</option><option value="archived">Archived</option></select></label><label><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#584237]">Search</span><input value={search} onChange={event => setSearch(event.target.value)} maxLength={120} className="w-full rounded-lg border border-[#D9DEE3] bg-white px-3 py-2 text-sm" placeholder="Name, email, or interest" /></label></div>
      <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-[#E7E8E9] text-xs uppercase tracking-wide text-[#584237]"><tr><th className="px-3 py-3">Registrant</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Details</th><th className="px-3 py-3">Received</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={5} className="px-3 py-8 text-center text-[#584237]">Loading protected registrations…</td></tr> : rows?.length ? rows.map(row => <tr key={row.id} className="border-b border-[#F0F1F2] align-top"><td className="px-3 py-3"><p className="font-bold text-[#0D215C]">{row.name}</p><a href={`mailto:${row.email}`} className="text-xs text-[#0D215C] underline underline-offset-2">{row.email}</a>{row.phone ? <p className="mt-1 text-xs text-[#584237]">{row.phone}</p> : null}</td><td className="px-3 py-3 capitalize text-[#584237]">{row.type}</td><td className="max-w-xs px-3 py-3 text-[#584237]"><p>{row.subject || row.interest || "General enquiry"}</p>{row.message ? <p className="mt-1 line-clamp-2 text-xs text-[#584237]/75">{row.message}</p> : null}</td><td className="whitespace-nowrap px-3 py-3 text-[#584237]">{formatDate(row.createdAt)}</td><td className="px-3 py-3"><select value={row.status} onChange={event => updateStatus.mutate({ id: row.id, status: event.target.value as "new" | "in_progress" | "archived" })} disabled={updateStatus.isPending} aria-label={`Update status for ${row.name}`} className="rounded-lg border border-[#D9DEE3] bg-white px-2 py-1.5 text-xs font-semibold text-[#263238]"><option value="new">New</option><option value="in_progress">In progress</option><option value="archived">Archived</option></select></td></tr>) : <tr><td colSpan={5} className="px-3 py-8 text-center text-[#584237]">No registrations match the selected filters.</td></tr>}</tbody></table></div>
    </section>
  );
}

function RaiselyConfiguration() {
  const utils = trpc.useUtils();
  const { data } = trpc.admin.getDonationConfiguration.useQuery();
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(data?.raiselyDonationUrl ?? ""); }, [data?.raiselyDonationUrl]);
  const save = trpc.admin.saveDonationConfiguration.useMutation({
    onSuccess: () => { toast.success("Donation destination saved"); utils.admin.getDonationConfiguration.invalidate(); utils.content.donationDestination.invalidate(); },
    onError: error => toast.error(error.message),
  });

  return (
    <section className="rounded-2xl border border-[#E7E8E9] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-[#EE701E]/10 p-2.5 text-[#EE701E]"><Settings className="h-5 w-5" /></div><div><h2 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>Raisely donation destination</h2><p className="mt-1 text-sm text-[#584237]">Set the secure Raisely campaign or hosted donation URL. The Hope Rising site never receives payment card details.</p></div></div>
      <div className="flex flex-col gap-3 sm:flex-row"><label className="min-w-0 flex-1"><span className="sr-only">Raisely campaign URL</span><input value={url} onChange={event => setUrl(event.target.value)} type="url" maxLength={1024} placeholder="https://…raisely.com/…" className="w-full rounded-lg border border-[#D9DEE3] px-3 py-2.5 text-sm outline-none focus:border-[#EE701E] focus:ring-2 focus:ring-[#EE701E]/20" /></label><button type="button" disabled={save.isPending || (!!url.trim() && !/^https:\/\//i.test(url.trim()))} onClick={() => save.mutate({ raiselyDonationUrl: url.trim() || null })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EE701E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#D75E12] disabled:cursor-not-allowed disabled:opacity-50">{save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save donation link</button></div>
      <p className="mt-3 text-xs leading-5 text-[#584237]/75">Leave this field empty to show the public “campaign coming soon” state until Raisely is configured.</p>
    </section>
  );
}

/** Protected dashboard extension. It is rendered only after the parent route's
 * user guard; all mutations are independently protected by server middleware. */
export function ContentManagement() {
  return (
    <div className="space-y-6">
      <ContentEditor />
      <VideoManager />
      <AnnouncementManager />
      <RegistrationManager />
      <RaiselyConfiguration />
    </div>
  );
}
