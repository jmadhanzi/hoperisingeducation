/**
 * Public Campaigns page — displays all active fundraising campaigns.
 * Each card shows: cover image, title, excerpt, progress bar, raised/goal,
 * deadline countdown, and a Donate button linking to the campaign's donate URL.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Target, Calendar, Heart, ExternalLink, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── Helpers ───────────────────────────────────────────────────────────────────

function centsToDisplay(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function progressPct(raised: number, goal: number) {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

function daysLeft(deadline: Date | null | string | undefined): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = trpc.campaigns.listActive.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="relative py-24 md:py-32 bg-[#0D215C] text-white overflow-hidden"
        aria-label="Campaigns hero"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#EE701E] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <Badge className="bg-[#EE701E]/20 text-[#EE701E] border-[#EE701E]/30 mb-4 text-sm px-4 py-1">
            Active Fundraising Campaigns
          </Badge>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Every Dollar Changes a Life
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Choose a campaign below and make a direct impact for children in Zimbabwe. 
            All funds go directly to the program — 100% transparent.
          </p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16 bg-gray-50" aria-label="Campaigns list">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2 bg-gray-200 rounded-full" />
                    <div className="h-10 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No active campaigns right now</h3>
              <p className="text-gray-500 mb-6">Check back soon — new campaigns are added regularly.</p>
              <Button
                asChild
                className="bg-[#EE701E] hover:bg-[#d4611a] text-white"
              >
                <a href="/donate">Make a General Donation</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((c) => {
                const pct = progressPct(c.raisedCents, c.goalCents);
                const days = daysLeft(c.deadline);
                return (
                  <article
                    key={c.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group border border-gray-100"
                  >
                    {/* Cover image */}
                    <div className="relative overflow-hidden h-48 shrink-0">
                      {c.coverImageUrl ? (
                        <img
                          src={c.coverImageUrl}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0D215C] to-[#1a3a8f] flex items-center justify-center">
                          <Heart className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      {/* Deadline badge */}
                      {days !== null && (
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={`text-xs font-semibold ${
                              days === 0
                                ? "bg-red-600 text-white"
                                : days <= 7
                                ? "bg-orange-500 text-white"
                                : "bg-white/90 text-gray-800"
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {days === 0 ? "Ended" : `${days}d left`}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      {/* Title */}
                      <h2
                        className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2"
                        style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                      >
                        {c.title}
                      </h2>

                      {/* Excerpt */}
                      {c.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                          {c.excerpt}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-lg font-bold text-[#EE701E]">
                            {centsToDisplay(c.raisedCents, c.currency)}
                          </span>
                          <span className="text-sm text-gray-500">
                            of {centsToDisplay(c.goalCents, c.currency)} goal
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#EE701E] to-[#f59340] rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">{pct}% funded</span>
                          {c.deadline && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(c.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-auto">
                        {c.donateUrl ? (
                          <a
                            href={c.donateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full bg-[#EE701E] hover:bg-[#d4611a] text-white gap-2 font-semibold">
                              <Heart className="w-4 h-4" />
                              Donate Now
                            </Button>
                          </a>
                        ) : (
                          <a href="/donate" className="flex-1">
                            <Button className="w-full bg-[#EE701E] hover:bg-[#d4611a] text-white gap-2 font-semibold">
                              <Heart className="w-4 h-4" />
                              Donate Now
                            </Button>
                          </a>
                        )}
                        {c.description && (
                          <Button
                            variant="outline"
                            className="px-4 border-gray-200 text-gray-600 hover:text-gray-900"
                            onClick={() => setSelectedId(c.id)}
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* General Donate CTA */}
      <section className="py-16 bg-[#0D215C] text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            Not sure which campaign to support?
          </h2>
          <p className="text-white/75 mb-8 text-lg">
            Make a general donation and we will direct your gift to where it is needed most.
          </p>
          <a href="/donate">
            <Button className="bg-[#EE701E] hover:bg-[#d4611a] text-white text-base px-8 py-3 h-auto font-semibold">
              Make a General Donation
            </Button>
          </a>
        </div>
      </section>

      <Footer />

      {/* Campaign Detail Modal */}
      <Dialog open={selectedId !== null} onOpenChange={(o) => !o && setSelectedId(null)}>
        {selected && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                {selected.title}
              </DialogTitle>
            </DialogHeader>

            {selected.coverImageUrl && (
              <img
                src={selected.coverImageUrl}
                alt={selected.title}
                className="w-full h-56 object-cover rounded-lg"
              />
            )}

            {/* Progress */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-2xl font-bold text-[#EE701E]">
                  {centsToDisplay(selected.raisedCents, selected.currency)}
                </span>
                <span className="text-gray-500">
                  of {centsToDisplay(selected.goalCents, selected.currency)} goal
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EE701E] to-[#f59340] rounded-full"
                  style={{ width: `${progressPct(selected.raisedCents, selected.goalCents)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-sm text-gray-500">
                <span>{progressPct(selected.raisedCents, selected.goalCents)}% funded</span>
                {selected.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(selected.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {selected.description && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.description}
              </div>
            )}

            {/* Donate button */}
            <div className="pt-2">
              {selected.donateUrl ? (
                <a href={selected.donateUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-[#EE701E] hover:bg-[#d4611a] text-white gap-2 h-12 text-base font-semibold">
                    <ExternalLink className="w-4 h-4" />
                    Donate to This Campaign
                  </Button>
                </a>
              ) : (
                <a href="/donate">
                  <Button className="w-full bg-[#EE701E] hover:bg-[#d4611a] text-white gap-2 h-12 text-base font-semibold">
                    <Heart className="w-4 h-4" />
                    Donate Now
                  </Button>
                </a>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
