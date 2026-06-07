/**
 * AdminDashboard — protected route (/admin)
 * Accessible only to users with role === "admin".
 * Shows: stats cards, recent donors table, campaign goal editor.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DollarSign, Users, TrendingUp, Calendar, RefreshCw,
  Edit3, Save, X, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, Clock, XCircle, RotateCcw, Heart,
  ShieldCheck, ArrowLeft, BookOpen,
} from "lucide-react";
import { Link } from "wouter";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    completed: {
      label: "Completed",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      cls: "bg-green-100 text-green-700",
    },
    pending: {
      label: "Pending",
      icon: <Clock className="w-3.5 h-3.5" />,
      cls: "bg-yellow-100 text-yellow-700",
    },
    failed: {
      label: "Failed",
      icon: <XCircle className="w-3.5 h-3.5" />,
      cls: "bg-red-100 text-red-700",
    },
    refunded: {
      label: "Refunded",
      icon: <RotateCcw className="w-3.5 h-3.5" />,
      cls: "bg-gray-100 text-gray-600",
    },
  };
  const s = map[status] ?? { label: status, icon: null, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

// ── Campaign Goal Editor ──────────────────────────────────────────────────────

function CampaignEditor({ campaign }: {
  campaign: {
    id: number;
    title: string;
    description?: string | null;
    goalCents: number;
    deadline?: Date | string | null;
  } | null;
}) {
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(campaign?.title ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [goalDollars, setGoalDollars] = useState(
    campaign ? String(Math.round(campaign.goalCents / 100)) : "10000"
  );
  const [deadline, setDeadline] = useState(
    campaign?.deadline
      ? new Date(campaign.deadline).toISOString().slice(0, 10)
      : "2026-12-31"
  );

  const updateGoal = trpc.admin.updateCampaignGoal.useMutation({
    onSuccess: () => {
      toast.success("Campaign updated successfully!");
      utils.admin.campaignStats.invalidate();
      utils.donations.fundraisingStats.invalidate();
      setEditing(false);
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  const handleSave = () => {
    if (!campaign) return;
    const goalCents = Math.round(parseFloat(goalDollars) * 100);
    if (isNaN(goalCents) || goalCents < 100) {
      toast.error("Goal must be at least $1.00");
      return;
    }
    updateGoal.mutate({
      id: campaign.id,
      title: title.trim(),
      description: description.trim(),
      goalCents,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    });
  };

  const handleCancel = () => {
    setTitle(campaign?.title ?? "");
    setDescription(campaign?.description ?? "");
    setGoalDollars(campaign ? String(Math.round(campaign.goalCents / 100)) : "10000");
    setDeadline(
      campaign?.deadline
        ? new Date(campaign.deadline).toISOString().slice(0, 10)
        : "2026-12-31"
    );
    setEditing(false);
  };

  if (!campaign) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E7E8E9]">
        <p className="text-[#584237] text-sm">No active campaign found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E8E9] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E8E9]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#EE701E]/10 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#EE701E]" />
          </div>
          <h3 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
            Active Campaign
          </h3>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#EE701E] hover:text-[#d4601a] transition-colors"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={updateGoal.isPending}
              className="flex items-center gap-1.5 text-sm font-semibold bg-[#EE701E] text-white px-3 py-1.5 rounded-lg hover:bg-[#d4601a] transition-colors disabled:opacity-60"
            >
              {updateGoal.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#584237] px-3 py-1.5 rounded-lg border border-[#E7E8E9] hover:bg-[#F8F9FA] transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Campaign Title
          </label>
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#EE701E] bg-[#EE701E]/5 outline-none text-[#0D215C] font-semibold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            />
          ) : (
            <p className="text-[#0D215C] font-bold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
              {campaign.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Description
          </label>
          {editing ? (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[#EE701E] bg-[#EE701E]/5 outline-none text-[#584237] resize-none"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            />
          ) : (
            <p className="text-[#584237] text-sm leading-relaxed" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              {campaign.description || "—"}
            </p>
          )}
        </div>

        {/* Goal + Deadline side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Fundraising Goal
            </label>
            {editing ? (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#584237] font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={goalDollars}
                  onChange={e => setGoalDollars(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-[#EE701E] bg-[#EE701E]/5 outline-none text-[#0D215C] font-semibold"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                />
              </div>
            ) : (
              <p className="text-2xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                {formatUSD(campaign.goalCents)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1.5"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              Campaign Deadline
            </label>
            {editing ? (
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[#EE701E] bg-[#EE701E]/5 outline-none text-[#0D215C] font-semibold"
                style={{ fontFamily: "Manrope, sans-serif" }}
              />
            ) : (
              <p className="text-[#0D215C] font-semibold" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric"
                }) : "No deadline set"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Donors Table ──────────────────────────────────────────────────────────────

type DonorRow = {
  id: number;
  donorName: string | null;
  donorEmail: string | null;
  amountCents: number;
  currency: string;
  status: string;
  isRecurring: boolean;
  message: string | null;
  stripeSessionId: string | null;
  createdAt: Date;
};

function DonorsTable({ donors }: { donors: DonorRow[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sortField, setSortField] = useState<"createdAt" | "amountCents">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const toggleSort = (field: "createdAt" | "amountCents") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = donors
    .filter(d => statusFilter === "all" || d.status === statusFilter)
    .sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortField === "amountCents") return (a.amountCents - b.amountCents) * mult;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * mult;
    });

  const SortIcon = ({ field }: { field: "createdAt" | "amountCents" }) =>
    sortField === field
      ? (sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" /> : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />)
      : <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-30" />;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E8E9] overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E8E9]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0D215C]/10 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-[#0D215C]" />
          </div>
          <h3 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
            Recent Donors
          </h3>
          <span className="text-xs bg-[#F8F9FA] text-[#584237] px-2 py-0.5 rounded-full font-semibold">
            {filtered.length} of {donors.length}
          </span>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-[#E7E8E9] rounded-lg px-3 py-1.5 text-[#0D215C] font-semibold outline-none focus:border-[#EE701E] bg-white"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-10 h-10 text-[#E7E8E9] mx-auto mb-3" />
          <p className="text-[#584237] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            No donations found for this filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E7E8E9]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Donor
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider cursor-pointer hover:text-[#EE701E] transition-colors"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  onClick={() => toggleSort("amountCents")}
                >
                  Amount <SortIcon field="amountCents" />
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Type
                </th>
                <th
                  className="text-right px-6 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider cursor-pointer hover:text-[#EE701E] transition-colors"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                  onClick={() => toggleSort("createdAt")}
                >
                  Date <SortIcon field="createdAt" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((donor) => (
                <>
                  <tr
                    key={donor.id}
                    className="border-b border-[#E7E8E9] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === donor.id ? null : donor.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EE701E]/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#EE701E] font-bold text-xs">
                            {(donor.donorName ?? "A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                            {donor.donorName ?? "Anonymous"}
                          </p>
                          <p className="text-[#584237] text-xs" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                            {donor.donorEmail ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {formatUSD(donor.amountCents)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={donor.status} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        donor.isRecurring
                          ? "bg-[#EE701E]/10 text-[#EE701E]"
                          : "bg-[#0D215C]/10 text-[#0D215C]"
                      }`}>
                        {donor.isRecurring ? "Monthly" : "One-time"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-[#584237]"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                      {formatDate(donor.createdAt)}
                    </td>
                  </tr>
                  {expanded === donor.id && (
                    <tr key={`${donor.id}-expanded`} className="bg-[#F8F9FA]">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {donor.message && (
                            <div>
                              <p className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1">
                                Message
                              </p>
                              <p className="text-[#0D215C] italic">"{donor.message}"</p>
                            </div>
                          )}
                          {donor.stripeSessionId && (
                            <div>
                              <p className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1">
                                Stripe Session
                              </p>
                              <code className="text-xs text-[#584237] bg-white px-2 py-1 rounded border border-[#E7E8E9] break-all">
                                {donor.stripeSessionId}
                              </code>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Stats Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E7E8E9]">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-[#0D215C] mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
        {value}
      </p>
      <p className="text-sm font-semibold text-[#584237]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs text-[#584237]/70 mt-1" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } =
    trpc.admin.campaignStats.useQuery(undefined, {
      enabled: user?.role === "admin",
      refetchInterval: 60_000,
    });

  const { data: donors, isLoading: donorsLoading, refetch: refetchDonors } =
    trpc.admin.recentDonors.useQuery(undefined, {
      enabled: user?.role === "admin",
      refetchInterval: 60_000,
    });

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <RefreshCw className="w-8 h-8 text-[#EE701E] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="max-w-sm text-center p-8">
          <ShieldCheck className="w-14 h-14 text-[#EE701E] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Sign In Required
          </h2>
          <p className="text-[#584237] mb-6" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            You must be signed in as an administrator to access this page.
          </p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="max-w-sm text-center p-8">
          <AlertTriangle className="w-14 h-14 text-[#EE701E] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#0D215C] mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Access Denied
          </h2>
          <p className="text-[#584237] mb-6" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            This page is restricted to administrators only.
          </p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const isLoading = statsLoading || donorsLoading;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* ── Top bar ── */}
      <div className="bg-[#0D215C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to site
            </Link>
            <span className="text-white/30">|</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#EE701E]" />
              <span className="font-extrabold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
                Admin Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Blog
            </Link>
            <button
              onClick={() => { refetchStats(); refetchDonors(); }}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-[#EE701E] flex items-center justify-center text-xs font-bold">
                {user.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <span className="text-sm font-semibold" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                {user.name ?? "Admin"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Stats cards ── */}
        {statsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E7E8E9] animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
                <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Raised"
              value={formatUSD(stats.raisedCents)}
              sub={`${stats.percentComplete}% of ${formatUSD(stats.goalCents)} goal`}
              icon={DollarSign}
              color="#4BAF4F"
            />
            <StatCard
              label="Completed Donors"
              value={stats.donorCount.toLocaleString()}
              sub={`${stats.pendingCount} pending, ${stats.failedCount} failed`}
              icon={Users}
              color="#0D215C"
            />
            <StatCard
              label="Goal Progress"
              value={`${stats.percentComplete}%`}
              sub={`${formatUSD(stats.goalCents - stats.raisedCents)} remaining`}
              icon={TrendingUp}
              color="#EE701E"
            />
            <StatCard
              label="Days Remaining"
              value={stats.daysLeft !== null ? String(stats.daysLeft) : "—"}
              sub={stats.campaign?.deadline
                ? `Deadline: ${new Date(stats.campaign.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "No deadline set"}
              icon={Calendar}
              color="#EE701E"
            />
          </div>
        ) : null}

        {/* ── Progress bar ── */}
        {stats && (
          <div className="bg-white rounded-2xl border border-[#E7E8E9] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Campaign Progress
              </h3>
              <span className="text-sm font-semibold text-[#EE701E]">
                {formatUSD(stats.raisedCents)} raised of {formatUSD(stats.goalCents)}
              </span>
            </div>
            <div className="h-4 w-full bg-[#E7E8E9] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EE701E] to-[#f5a05a] rounded-full transition-all duration-1000"
                style={{ width: `${stats.percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#584237]"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              <span>$0</span>
              <span className="font-semibold text-[#EE701E]">{stats.percentComplete}% complete</span>
              <span>{formatUSD(stats.goalCents)}</span>
            </div>
          </div>
        )}

        {/* ── Two-column: Campaign editor + Donors table ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            {statsLoading ? (
              <div className="bg-white rounded-2xl border border-[#E7E8E9] p-6 animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-40" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-20 bg-gray-100 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-100 rounded" />
                  <div className="h-10 bg-gray-100 rounded" />
                </div>
              </div>
            ) : (
              <CampaignEditor campaign={stats?.campaign ?? null} />
            )}
          </div>

          <div className="xl:col-span-2">
            {donorsLoading ? (
              <div className="bg-white rounded-2xl border border-[#E7E8E9] p-6 animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-40" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded" />
                ))}
              </div>
            ) : (
              <DonorsTable donors={donors ?? []} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
