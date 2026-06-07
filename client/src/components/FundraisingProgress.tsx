/**
 * FundraisingProgress — Live fundraising progress bar component.
 *
 * Polls the server every 30 seconds via tRPC so the totals update
 * automatically after each successful Stripe payment without a page reload.
 */
import { useEffect, useRef, useState } from "react";
import { Users, Calendar, TrendingUp, Heart, Star, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ── Milestone thresholds (percentage) ─────────────────────────────────────
const MILESTONES = [
  { pct: 25, label: "25%", icon: Star },
  { pct: 50, label: "Halfway!", icon: Heart },
  { pct: 75, label: "75%", icon: TrendingUp },
  { pct: 100, label: "Goal Reached!", icon: Award },
];

function formatUSD(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${dollars.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ── Animated counter hook ──────────────────────────────────────────────────
function useAnimatedCount(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const raf = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(raf);
      else prev.current = target;
    };
    requestAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function FundraisingProgress() {
  const { data, isLoading, error } = trpc.donations.fundraisingStats.useQuery(undefined, {
    // Poll every 30 seconds so the bar updates after a successful payment
    refetchInterval: 30_000,
    // Also refetch when the window regains focus (donor returns after Stripe checkout)
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });

  const animatedRaised = useAnimatedCount(data?.raisedCents ?? 0);
  const animatedPct = useAnimatedCount(data?.percentComplete ?? 0);

  // ── Skeleton while loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 card-shadow animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-3" />
        <div className="h-6 bg-gray-200 rounded-full w-full mb-4" />
        <div className="flex gap-6">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    );
  }

  // ── Graceful error fallback ────────────────────────────────────────────
  if (error || !data) return null;

  const {
    campaignTitle,
    campaignDescription,
    goalCents,
    donorCount,
    percentComplete,
    daysLeft,
  } = data;

  // Determine which milestones have been reached
  const reachedMilestones = MILESTONES.filter((m) => percentComplete >= m.pct);
  const nextMilestone = MILESTONES.find((m) => percentComplete < m.pct);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 card-shadow border border-[#EE701E]/20 overflow-hidden relative">
      {/* Subtle background accent */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#EE701E]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-[#EE701E] fill-[#EE701E]" aria-hidden="true" />
            <span
              className="text-xs font-semibold tracking-widest text-[#EE701E] uppercase"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Live Campaign
            </span>
          </div>
          <h3
            className="text-xl font-extrabold text-[#0D215C]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {campaignTitle}
          </h3>
          {campaignDescription && (
            <p
              className="text-[#584237] text-sm mt-1 leading-relaxed"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              {campaignDescription}
            </p>
          )}
        </div>
        {/* Percentage badge */}
        <div className="flex-shrink-0 ml-4 text-right" aria-live="polite" aria-atomic="true">
          <span
            className="text-3xl font-extrabold text-[#EE701E]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {animatedPct}%
          </span>
          <p
            className="text-xs text-[#584237]"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            funded
          </p>
        </div>
      </div>

      {/* Amount row */}
      <div className="flex items-baseline gap-2 mt-4 mb-3">
        <span
          className="text-2xl font-extrabold text-[#0D215C]"
          style={{ fontFamily: "Manrope, sans-serif" }}
          aria-label={`${formatUSD(animatedRaised)} raised`}
        >
          {formatUSD(animatedRaised)}
        </span>
        <span
          className="text-[#584237] text-sm"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          raised of{" "}
          <span className="font-semibold text-[#0D215C]">{formatUSD(goalCents)}</span> goal
        </span>
      </div>

      {/* Progress bar track */}
      <div
        className="relative h-4 bg-[#F0F1F2] rounded-full overflow-hidden mb-1"
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Fundraising progress: ${percentComplete}% of goal reached`}
      >
        {/* Animated fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedPct}%`,
            background: "linear-gradient(90deg, #EE701E 0%, #f59340 100%)",
          }}
        />
        {/* Milestone tick marks */}
        {MILESTONES.slice(0, -1).map((m) => (
          <div
            key={m.pct}
            className="absolute top-0 bottom-0 w-0.5 bg-white/60"
            style={{ left: `${m.pct}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between text-xs text-[#584237] mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
        <span>$0</span>
        <span>{formatUSD(goalCents / 4)}</span>
        <span>{formatUSD(goalCents / 2)}</span>
        <span>{formatUSD((goalCents * 3) / 4)}</span>
        <span>{formatUSD(goalCents)}</span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 pt-3 border-t border-[#E7E8E9]">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#EE701E]" aria-hidden="true" />
          <span
            className="text-sm font-semibold text-[#0D215C]"
            style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {donorCount.toLocaleString()} donor{donorCount !== 1 ? "s" : ""}
          </span>
        </div>
        {daysLeft !== null && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#EE701E]" aria-hidden="true" />
            <span
              className="text-sm font-semibold text-[#0D215C]"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              {daysLeft > 0 ? `${daysLeft} days left` : "Campaign ended"}
            </span>
          </div>
        )}
        {nextMilestone && (
          <div className="flex items-center gap-1.5 ml-auto">
            <TrendingUp className="w-4 h-4 text-[#4BAF4F]" aria-hidden="true" />
            <span
              className="text-sm text-[#584237]"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              Next milestone:{" "}
              <span className="font-semibold text-[#4BAF4F]">{nextMilestone.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* Milestone badges (shown when reached) */}
      {reachedMilestones.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {reachedMilestones.map(({ pct, label, icon: Icon }) => (
            <span
              key={pct}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EE701E]/10 text-[#EE701E] border border-[#EE701E]/30"
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <Icon className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4BAF4F] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4BAF4F]" />
        </span>
        <span
          className="text-xs text-[#584237]"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          Updates automatically · refreshes every 30 seconds
        </span>
      </div>
    </div>
  );
}
