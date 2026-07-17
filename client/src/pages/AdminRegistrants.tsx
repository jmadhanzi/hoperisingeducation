import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Download, Search, X } from "lucide-react";

export default function AdminRegistrants() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const filter = {
    search: search || undefined,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading, refetch } = trpc.registrants.list.useQuery(filter, {
    enabled: !loading && user?.role === "admin",
  });

  const exportQuery = trpc.registrants.exportCsv.useQuery(
    {
      search: search || undefined,
      dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      dateTo: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : undefined,
    },
    { enabled: false }
  );

  if (loading) return null;
  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  async function handleExport() {
    try {
      const result = await exportQuery.refetch();
      if (!result.data) return;
      const { csv, count } = result.data;
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrants-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${count} registrant${count !== 1 ? "s" : ""}`);
    } catch (e: any) {
      toast.error(e.message ?? "Export failed");
    }
  }

  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }

  const rows = data?.registrants ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-[#F4631E]" />
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D215C]" style={{ fontFamily: "Manrope, sans-serif" }}>
                Registrants
              </h1>
              <p className="text-sm text-[#584237]">People who submitted the Get Involved form</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")} className="text-[#0D215C]">
              ← Back to Admin
            </Button>
            <Button
              onClick={handleExport}
              disabled={exportQuery.isFetching}
              className="bg-[#0D215C] hover:bg-[#0a1a4a] text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              {exportQuery.isFetching ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reg-search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-search"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Name or email…"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reg-from">From Date</Label>
                <Input
                  id="reg-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                />
              </div>
              <div>
                <Label htmlFor="reg-to">To Date</Label>
                <Input
                  id="reg-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                />
              </div>
            </div>
            {(search || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2 text-gray-500">
                <X className="w-3.5 h-3.5 mr-1" /> Clear filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">
            {isLoading ? "Loading…" : `${total} registrant${total !== 1 ? "s" : ""} found`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Prev
              </Button>
              <span className="text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next →
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No registrants found</p>
            <p className="text-sm mt-1">
              {search || dateFrom || dateTo
                ? "Try adjusting your filters."
                : "Registrations will appear here when people submit the Get Involved form."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0D215C] text-white">
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Interest</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Message</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-t border-gray-100 hover:bg-orange-50/30 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[#0D215C]">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <a href={`mailto:${r.email}`} className="hover:text-[#F4631E] hover:underline">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell capitalize">{r.interest ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell max-w-xs">
                      <span className="line-clamp-2">{r.message ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
