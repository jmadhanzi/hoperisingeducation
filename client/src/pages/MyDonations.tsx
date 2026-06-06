/**
 * MyDonations — protected route (/my-donations)
 * Accessible only to authenticated users.
 * Shows: summary stats, sortable donation history table, empty state.
 */
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Heart,
  DollarSign,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Repeat,
  Zap,
  MessageSquare,
  Calendar,
  TrendingUp,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUSD(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
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
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ── Summary Cards ─────────────────────────────────────────────────────────────

type DonationRow = {
  id: number;
  amountCents: number;
  currency: string;
  donorName: string | null;
  donorEmail: string | null;
  message: string | null;
  isRecurring: boolean;
  status: string;
  stripeSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function SummaryCards({ donations }: { donations: DonationRow[] }) {
  const completed = donations.filter((d) => d.status === "completed");
  const totalCents = completed.reduce((sum, d) => sum + d.amountCents, 0);
  const monthlyCount = completed.filter((d) => d.isRecurring).length;
  const oneTimeCount = completed.filter((d) => !d.isRecurring).length;

  const cards = [
    {
      icon: <DollarSign className="w-5 h-5 text-[#EE701E]" />,
      bg: "bg-[#EE701E]/10",
      label: "Total Donated",
      value: formatUSD(totalCents),
      sub: `${completed.length} completed gift${completed.length !== 1 ? "s" : ""}`,
    },
    {
      icon: <Repeat className="w-5 h-5 text-[#0D215C]" />,
      bg: "bg-[#0D215C]/10",
      label: "Monthly Gifts",
      value: String(monthlyCount),
      sub: monthlyCount === 1 ? "recurring donation" : "recurring donations",
    },
    {
      icon: <Zap className="w-5 h-5 text-[#4BAF4F]" />,
      bg: "bg-[#4BAF4F]/10",
      label: "One-Time Gifts",
      value: String(oneTimeCount),
      sub: oneTimeCount === 1 ? "single donation" : "single donations",
    },
    {
      icon: <Calendar className="w-5 h-5 text-[#EE701E]" />,
      bg: "bg-[#EE701E]/10",
      label: "First Donation",
      value:
        completed.length > 0
          ? formatDate(completed[completed.length - 1].createdAt)
          : "—",
      sub: "date of first gift",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-2xl p-5 border border-[#E7E8E9] card-shadow"
        >
          <div
            className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}
          >
            {c.icon}
          </div>
          <p
            className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {c.label}
          </p>
          <p
            className="text-2xl font-extrabold text-[#0D215C]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {c.value}
          </p>
          <p
            className="text-xs text-[#584237] mt-0.5"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {c.sub}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Donations Table ───────────────────────────────────────────────────────────

function DonationsTable({ donations }: { donations: DonationRow[] }) {
  const [sortField, setSortField] = useState<"createdAt" | "amountCents">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleSort = (field: "createdAt" | "amountCents") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = donations
    .filter((d) => statusFilter === "all" || d.status === statusFilter)
    .sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortField === "amountCents") return (a.amountCents - b.amountCents) * mult;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * mult;
    });

  const SortIcon = ({ field }: { field: "createdAt" | "amountCents" }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
      )
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-30" />
    );

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E8E9] py-16 text-center">
        <Heart className="w-10 h-10 text-[#E7E8E9] mx-auto mb-3" />
        <p
          className="text-[#584237] text-sm"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          No donations match this filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E8E9] overflow-hidden">
      {/* Table toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E8E9]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#EE701E]/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#EE701E]" />
          </div>
          <h3
            className="font-extrabold text-[#0D215C]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Donation History
          </h3>
          <span className="text-xs bg-[#F8F9FA] text-[#584237] px-2 py-0.5 rounded-full font-semibold">
            {filtered.length} of {donations.length}
          </span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E7E8E9]">
              <th
                className="text-left px-6 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider cursor-pointer hover:text-[#EE701E] transition-colors"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                onClick={() => toggleSort("createdAt")}
              >
                Date <SortIcon field="createdAt" />
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider cursor-pointer hover:text-[#EE701E] transition-colors"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                onClick={() => toggleSort("amountCents")}
              >
                Amount <SortIcon field="amountCents" />
              </th>
              <th
                className="text-center px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Frequency
              </th>
              <th
                className="text-center px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Status
              </th>
              <th
                className="text-center px-4 py-3 text-xs font-semibold text-[#584237] uppercase tracking-wider"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <>
                <tr
                  key={d.id}
                  className={`border-b border-[#E7E8E9] transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-[#F8F9FA]/50"
                  } hover:bg-[#EE701E]/5`}
                >
                  {/* Date */}
                  <td className="px-6 py-4">
                    <span
                      className="font-medium text-[#0D215C]"
                      style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      {formatDate(d.createdAt)}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4 text-right">
                    <span
                      className="font-extrabold text-[#0D215C]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {formatUSD(d.amountCents)}
                    </span>
                  </td>

                  {/* Frequency */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        d.isRecurring
                          ? "bg-[#0D215C]/10 text-[#0D215C]"
                          : "bg-[#4BAF4F]/10 text-[#4BAF4F]"
                      }`}
                    >
                      {d.isRecurring ? (
                        <Repeat className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" />
                      )}
                      {d.isRecurring ? "Monthly" : "One-Time"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <StatusBadge status={d.status} />
                  </td>

                  {/* Expand toggle */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === d.id ? null : d.id)
                      }
                      className="text-[#584237] hover:text-[#EE701E] transition-colors p-1 rounded-md hover:bg-[#EE701E]/10"
                      aria-label="Toggle details"
                    >
                      {expandedId === d.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expandedId === d.id && (
                  <tr key={`${d.id}-detail`} className="bg-[#EE701E]/5 border-b border-[#E7E8E9]">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p
                            className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1"
                            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                          >
                            Date &amp; Time
                          </p>
                          <p
                            className="text-[#0D215C] font-medium"
                            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                          >
                            {formatDateTime(d.createdAt)}
                          </p>
                        </div>
                        {d.stripeSessionId && (
                          <div>
                            <p
                              className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1"
                              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                            >
                              Reference
                            </p>
                            <p
                              className="text-[#0D215C] font-mono text-xs break-all"
                            >
                              {d.stripeSessionId}
                            </p>
                          </div>
                        )}
                        {d.message && (
                          <div className="sm:col-span-2">
                            <p
                              className="text-xs font-semibold text-[#584237] uppercase tracking-wider mb-1 flex items-center gap-1"
                              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                            >
                              <MessageSquare className="w-3 h-3" /> Your Message
                            </p>
                            <p
                              className="text-[#584237] italic leading-relaxed"
                              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                            >
                              "{d.message}"
                            </p>
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
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyDonations() {
  // Redirect to login if not authenticated
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });

  const { data: donations, isLoading, error, refetch, isFetching } =
    trpc.donations.myDonations.useQuery(undefined, {
      enabled: !!user,
    });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (authLoading || (isLoading && !donations)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 text-[#EE701E] animate-spin mx-auto mb-4" />
            <p
              className="text-[#584237]"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Loading your donation history…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="pt-28 pb-20 container mx-auto text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2
            className="text-xl font-bold text-[#0D215C] mb-2"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Could not load donations
          </h2>
          <p
            className="text-[#584237] mb-6"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const rows = donations ?? [];

  // ── Empty state ────────────────────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="pt-28 pb-20">
          <div className="container mx-auto max-w-2xl text-center">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[#584237] hover:text-[#EE701E] transition-colors mb-8"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <div className="bg-white rounded-3xl p-12 border border-[#E7E8E9] card-shadow">
              <div className="w-20 h-20 bg-[#EE701E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-[#EE701E]" />
              </div>
              <h1
                className="text-2xl font-extrabold text-[#0D215C] mb-3"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                No donations yet
              </h1>
              <p
                className="text-[#584237] leading-relaxed mb-8"
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                You haven't made any donations yet. Every contribution — large or small — directly funds a child's education in Zimbabwe.
              </p>
              <Link href="/donate" className="btn-primary inline-flex items-center gap-2">
                <Heart className="w-4 h-4 fill-white" /> Make Your First Donation
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="container mx-auto max-w-5xl">
          {/* Page header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[#584237] hover:text-[#EE701E] transition-colors mb-4"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p
                  className="section-label mb-1"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Your Account
                </p>
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-[#0D215C]"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  My Donations
                </h1>
                <p
                  className="text-[#584237] mt-2"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Hello, <span className="font-semibold text-[#0D215C]">{user?.name ?? "Friend"}</span>. Thank you for your generosity.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#584237] border border-[#E7E8E9] px-4 py-2 rounded-xl hover:border-[#EE701E] hover:text-[#EE701E] transition-colors disabled:opacity-60"
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <Link href="/donate" className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white" /> Donate Again
                </Link>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <SummaryCards donations={rows} />

          {/* Donations table */}
          <DonationsTable donations={rows} />

          {/* Footer note */}
          <p
            className="text-center text-xs text-[#584237]/60 mt-6"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Showing your most recent 50 donations. For receipts or questions, contact us at{" "}
            <a
              href="mailto:info@hoperisingeducation.org"
              className="text-[#EE701E] hover:underline"
            >
              info@hoperisingeducation.org
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
