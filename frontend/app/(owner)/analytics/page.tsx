"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const COLORS = ["#5F7A52", "#8B3A56", "#D99A32"];

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [raw, setRaw] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    document.title = "Analytics & Reports | GenReviewAI";
    const restaurantId = localStorage.getItem("gr_restaurant_id");
    if (!restaurantId) {
      setError("No restaurant is linked to this account yet.");
      setLoading(false);
      setInsightsLoading(false);
      return;
    }
    Promise.allSettled([
      api.getDashboard(restaurantId),
      api.getAnalytics(restaurantId),
    ])
      .then(([d, a]) => {
        if (d.status === "fulfilled") setDashboard(d.value as DashboardResponse);
        if (a.status === "fulfilled") setRaw(a.value);
        if (d.status === "rejected") setError((d.reason as ApiError).message);
      })
      .finally(() => setLoading(false));

    api.getAiInsights(restaurantId)
      .then((res) => {
        if (res && res.insights) {
          setInsights(res.insights);
        }
      })
      .catch((err) => {
        console.error("Failed to load AI insights:", err);
      })
      .finally(() => setInsightsLoading(false));
  }, []);

  const pieData = dashboard
    ? [
        { name: "Positive", value: dashboard.metrics.positive_reviews },
        { name: "Negative", value: dashboard.metrics.negative_reviews },
        { name: "Neutral", value: dashboard.metrics.neutral_reviews },
      ].filter((d) => d.value > 0)
    : [];

  const ratingDistribution = raw?.rating_distribution || {};
  const totalFromDist = Object.values(ratingDistribution).reduce((a: any, b: any) => a + b, 0) as number || 1;
  const starRatings = ["5", "4", "3", "2", "1"];

  const sentimentPct = raw?.sentiment_percentage || { positive: 0, negative: 0, neutral: 0 };
  const totalReviews = dashboard?.metrics.total_reviews || raw?.total_reviews || 0;
  const averageRating = dashboard?.metrics.average_rating || 0;
  const privateCount = dashboard?.recent_reviews?.filter((review) => review.is_private).length || 0;
  const trendData = raw?.review_trend || [];
  const maxTrend = Math.max(...trendData.map((item: any) => item.reviews || 0), 1);
  const sentiments = [
    { name: "Positive", color: "#5F7A52", value: sentimentPct.positive },
    { name: "Neutral", color: "#D99A32", value: sentimentPct.neutral },
    { name: "Negative", color: "#8B3A56", value: sentimentPct.negative },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Sentiment breakdown"
        title="Analytics"
        description="Track ratings, private feedback, customer sentiment, and simple next actions for each restaurant."
      />

      <div className="px-8 py-8">
        {loading && (
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            Crunching numbers…
          </p>
        )}

        {error && !loading && (
          <div className="border border-plum/30 bg-plum/5 px-5 py-4 text-sm text-plum-dark">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 border border-line bg-paper p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Restaurant view
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Switch between outlets once multi-restaurant backend is approved.
                </p>
              </div>
              <select className="border border-line bg-paper-dim px-3.5 py-2.5 text-sm text-ink outline-none focus:border-paprika">
                <option>{localStorage.getItem("gr_restaurant_name") || "Current restaurant"}</option>
                <option>Downtown branch</option>
                <option>Airport branch</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Total reviews", value: totalReviews },
                { label: "Average rating", value: averageRating.toFixed(1) },
                { label: "Positive share", value: `${sentimentPct.positive.toFixed(0)}%` },
                { label: "Private cases", value: privateCount },
              ].map((item) => (
                <div key={item.label} className="border border-line bg-paper p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    {item.label}
                  </p>
                  <p className="mt-2 font-mono text-3xl text-ink">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
            {/* Sentiment split card */}
            <div className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Sentiment split
              </p>
              {pieData.length === 0 ? (
                <p className="mt-10 text-sm text-ink-faint">
                  Not enough reviews yet to chart a split.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {pieData.map((item, index) => {
                    const pct = totalReviews ? Math.round((item.value / totalReviews) * 100) : 0;
                    return (
                      <div key={item.name} className="border border-line bg-paper-dim p-4">
                        <div className="h-28 w-full bg-paper">
                          <div className="flex h-full items-end px-5 pb-4">
                            <div
                              className="w-full transition-all"
                              style={{
                                height: `${Math.max(pct, 8)}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                        <p className="mt-3 font-medium text-ink">{item.name}</p>
                        <p className="mt-1 font-mono text-2xl text-ink">{item.value}</p>
                        <p className="text-sm text-ink-soft">{pct}% of total</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ratings distribution card */}
            <div className="border border-line bg-paper p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                Rating Breakdown
              </p>
              <div className="mt-6 space-y-4">
                {starRatings.map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const pct = Math.round((count / totalFromDist) * 100);
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-8 font-mono text-ink-soft text-right">{star} ★</span>
                      <div className="h-2 flex-1 bg-paper-dim border border-line rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 font-mono text-ink text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint mt-8">
                Sentiment Percentages
              </p>
              <div className="mt-4 space-y-3">
                {sentiments.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-ink-soft font-medium">{s.name}</span>
                    <div className="h-2 flex-1 bg-paper-dim border border-line rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${s.value}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="w-12 font-mono text-ink text-right">{s.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Volume Trend card */}
            {trendData.length > 0 && (
              <div className="border border-line bg-paper p-6 col-span-1 lg:col-span-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Review Volume Trend
                </p>
                <div className="mt-6 flex h-64 items-end gap-4 border-b border-line px-4 pb-4">
                  {trendData.map((item: any) => (
                    <div key={item.date} className="flex h-full flex-1 flex-col justify-end">
                      <p className="mb-2 text-center font-mono text-xs text-ink">{item.reviews}</p>
                      <div
                        className="w-full bg-paprika"
                        style={{ height: `${Math.max((item.reviews / maxTrend) * 100, 8)}%` }}
                      />
                      <p className="mt-2 text-center font-mono text-[10px] text-ink-faint">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights Hub */}
            <div className="border border-line bg-paper p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  AI Insights Hub
                </p>
                <span className="rounded-full border border-paprika/40 bg-paprika/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-paprika">
                  Powered by Gemini
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                Real-time actionable recommendations based on your actual customer reviews and feedback.
              </p>

              {insightsLoading ? (
                <div className="mt-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded border border-line bg-paper-dim" />
                  ))}
                </div>
              ) : insights.length === 0 ? (
                <p className="mt-6 text-sm text-ink-faint">
                  No insights available yet. Gemini needs review data to generate recommendations.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {insights.map((insight: any, idx: number) => {
                    const priority = (insight.priority || "medium").toLowerCase();
                    const priorityConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
                      high: { label: "High Priority", bg: "bg-plum/10 border-plum/30", text: "text-plum-dark", dot: "bg-plum" },
                      medium: { label: "Medium", bg: "bg-amber/10 border-amber/30", text: "text-amber-dark", dot: "bg-amber" },
                      low: { label: "Low", bg: "bg-sage/10 border-sage/30", text: "text-sage-dark", dot: "bg-sage" },
                    };
                    const pc = priorityConfig[priority] || priorityConfig.medium;
                    return (
                      <div key={idx} className="border border-line bg-paper-dim p-4 flex flex-col gap-2 transition-all hover:border-paprika/30 hover:shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${pc.dot}`} />
                          <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${pc.bg} ${pc.text}`}>
                            {pc.label}
                          </span>
                        </div>
                        <p className="font-semibold text-ink text-sm leading-snug">{insight.title}</p>
                        <p className="text-xs text-ink-soft leading-relaxed">{insight.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
