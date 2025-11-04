import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  useSpiceGoldAnalytics,
  useTopEarners,
} from "@/hooks/useSpiceGoldAnalytics";
import {
  Loader2,
  TrendingUp,
  Users,
  Award,
  Coins,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TimePeriod = "daily" | "weekly" | "monthly" | "overall";

// Bracket-specific colors matching the framework recommendations
// Same colors used for all time periods (Day, Week, Month, Overall)
// Colors are determined by the range boundaries, not the time period
const getBracketColor = (
  from: number,
  to: number | null,
  period: TimePeriod
): string => {
  // Determine the maximum value for the range
  // For open-ended ranges like "1001+", use a large number
  const max = to || 100000;

  // Apply consistent colors based on the range boundaries
  // Same SG ranges always get the same colors regardless of time period
  if (max <= 50) return "#ef4444"; // 🟥 Dormant/New (0-50 SG)
  if (max <= 100) return "#c026d3"; // 🟪 Low Activity (51-100 SG)
  if (max <= 400) return "#2563eb"; // 🔵 Moderate Activity (101-400 SG)
  if (max <= 700) return "#facc15"; // 🟡 High Activity (401-700 SG)
  if (max <= 1000) return "#16a34a"; // 🟢 Top Daily Performer (701-1000 SG)
  if (max <= 4000) return "#0284c7"; // 🔷 Consistent User (1001-4000 SG)
  if (max <= 7000) return "#f97316"; // 🟠 Engaged User (4001-7000 SG)
  if (max <= 15000) return "#7e22ce"; // 🟣 High Retention User (7001-15000 SG)
  if (max <= 23000) return "#78350f"; // 🟤 Core Loyal User (15001-23000 SG)
  if (max <= 31000) return "#f59e0b"; // 🏅 Top Monthly Performer (23001-31000 SG)
  if (max <= 62000) return "#06b6d4"; // 💎 Elite / Long-Term Loyalist (31001-62000 SG)
  if (max <= 93000) return "#4f46e5"; // 👑 Legacy Tier (62001-93000 SG)

  // Default for any range above 93000
  return "#1e293b";
};

// Fallback colors for any unmapped ranges
const COLORS = [
  "hsl(25 95% 53%)", // Orange
  "hsl(220 70% 55%)", // Blue
  "hsl(280 85% 60%)", // Purple
  "hsl(199 89% 48%)", // Light blue
  "hsl(142 71% 45%)", // Green
  "hsl(262 83% 58%)", // Purple variant
];

// Bracket label mapping based on framework
const getBracketLabel = (
  from: number,
  to: number | null,
  period: TimePeriod
): { label: string; emoji: string; insight: string } => {
  const max = to || from + 10000;

  if (period === "daily") {
    if (max <= 50)
      return {
        label: "Dormant / New",
        emoji: "🟥",
        insight: "Barely engaged or newly joined users",
      };
    if (max <= 100)
      return {
        label: "Low Activity",
        emoji: "🟪",
        insight: "Lightly active; minimal gameplay",
      };
    if (max <= 400)
      return {
        label: "Moderate Activity",
        emoji: "🔵",
        insight: "Casual players with steady activity",
      };
    if (max <= 700)
      return {
        label: "High Activity",
        emoji: "🟡",
        insight: "Consistent users engaging daily",
      };
    if (max <= 1000)
      return {
        label: "Top Daily Performer",
        emoji: "🟢",
        insight: "Fully active users hitting daily cap",
      };
  }

  if (period === "weekly" || period === "monthly" || period === "overall") {
    if (max <= 50)
      return {
        label: "Dormant / New",
        emoji: "🟥",
        insight: "Barely engaged or newly joined users",
      };
    if (max <= 100)
      return {
        label: "Low Activity",
        emoji: "🟪",
        insight: "Lightly active users; small daily actions",
      };
    if (max <= 400)
      return {
        label: "Moderate Activity",
        emoji: "🔵",
        insight: "Casual players showing consistent participation",
      };
    if (max <= 700)
      return {
        label: "High Activity",
        emoji: "🟡",
        insight: "Active users engaging regularly",
      };
    if (max <= 1000)
      return {
        label: "Top Daily Performer",
        emoji: "🟢",
        insight: "Fully active users nearing daily cap",
      };
    if (max <= 4000)
      return {
        label: "Consistent User",
        emoji: "🔵",
        insight: "Users maintaining steady activity over multiple days",
      };
    if (max <= 7000)
      return {
        label: "Engaged User",
        emoji: "🟠",
        insight: "Regular, retained players engaging weekly",
      };
    if (max <= 15000)
      return {
        label: "High Retention User",
        emoji: "🟣",
        insight: "Strongly retained users with multi-week engagement",
      };
    if (max <= 23000)
      return {
        label: "Core Loyal User",
        emoji: "🟢",
        insight: "Power players; actively earning daily",
      };
    if (max <= 31000)
      return {
        label: "Top Monthly Performer",
        emoji: "🏅",
        insight: "Maxed-out or near-max monthly users",
      };
    if (max <= 62000)
      return {
        label: "Elite / Long-Term Loyalist",
        emoji: "💎",
        insight: "Users active across months; consistently re-engage",
      };
    if (max <= 93000)
      return {
        label: "Legacy Tier / Ultra Engaged",
        emoji: "👑",
        insight: "Top 1-2% of users - highest loyalty",
      };
  }

  return {
    label: "Elite Tier",
    emoji: "👑",
    insight: "Top performers with exceptional engagement",
  };
};

const SpiceGoldAnalytics = () => {
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("overall");
  const [showDetailedSummary, setShowDetailedSummary] = useState(false);
  const { data: analyticsData, isLoading: isLoadingAnalytics } =
    useSpiceGoldAnalytics(timePeriod);
  const { data: topEarnersData, isLoading: isLoadingEarners } = useTopEarners();

  const isLoading = isLoadingAnalytics || isLoadingEarners;

  // Transform data for charts with enhanced bracket labels
  const chartData =
    analyticsData?.data?.ranges
      ?.filter((item) => item && item.total_users > 0) // Filter out empty ranges
      .map((item, index) => {
        const fromRange = parseInt(item.reward_from_range) || 0;
        const toRange =
          item.reward_to_range && item.reward_to_range.trim()
            ? parseInt(item.reward_to_range)
            : null;

        let rangeName = "";
        if (toRange !== null && !isNaN(toRange)) {
          rangeName = `${fromRange}-${toRange}`;
        } else {
          rangeName = `${fromRange}+`;
        }

        const bracketInfo = getBracketLabel(fromRange, toRange, timePeriod);
        const percentage = (
          (item.total_users / (analyticsData?.data?.total_users || 1)) *
          100
        ).toFixed(1);

        return {
          name: rangeName,
          displayName: ` ${rangeName} SG`,
          bracketLabel: bracketInfo.label,
          bracketEmoji: `${bracketInfo.emoji} `,
          bracketInsight: bracketInfo.insight,
          users: item.total_users,
          percentage: parseFloat(percentage),
          color: getBracketColor(fromRange, toRange, timePeriod),
          fromRange,
          toRange,
        };
      }) || [];

  // Calculate specific bracket metrics
  const getBracketUsers = (from: number, to: number | null) => {
    const bracket = chartData.find((item) => {
      if (to === null) {
        return item.fromRange >= from && item.toRange === null;
      }
      return item.fromRange === from && item.toRange === to;
    });
    return bracket?.users || 0;
  };

  const topPerformers = getBracketUsers(
    701,
    timePeriod === "daily" ? 1000 : null
  );
  const highActivity = getBracketUsers(401, 700);
  const moderateActivity = getBracketUsers(101, 400);
  const lowActivity = getBracketUsers(51, 100);
  const dormant = getBracketUsers(0, 50);

  const topEarners = topEarnersData?.data?.slice(0, 10) || [];
  const totalUsers = analyticsData?.data?.total_users || 0;

  // Calculate total SpiceGold earned (estimated from ranges)
  const estimatedTotalSG = chartData.reduce((total, item) => {
    const rangeMatch = item.name.match(/(\d+)-(\d+)|(\d+)\+/);
    if (rangeMatch) {
      const from = parseInt(rangeMatch[1] || rangeMatch[3]);
      const to = rangeMatch[2] ? parseInt(rangeMatch[2]) : from + 5000;
      const midpoint = (from + to) / 2;
      return total + midpoint * item.users;
    }
    return total;
  }, 0);

  const topEarnersTotal = topEarners.reduce(
    (sum, earner) => sum + (earner.totalRewardPoints || 0),
    0
  );

  // Get date range info for display
  const getPeriodLabel = () => {
    switch (timePeriod) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "overall":
        return "Overall (Lifetime)";
      default:
        return "";
    }
  };

  // CSV Download handler
  const handleDownloadCsv = () => {
    if (!chartData || chartData.length === 0) {
      toast({
        title: "No data to download",
        description: "There is no analytics data available to download.",
        variant: "default",
      });
      return;
    }

    const headers = [
      "Range",
      "Bracket Label",
      "Users",
      "Percentage",
      "Insight",
    ];
    const csvContent =
      headers.join(",") +
      "\n" +
      chartData
        .map(
          (item) =>
            `"${item.name}","${item.displayName}","${
              item.users
            }","${item.percentage.toFixed(1)}%","${item.bracketInsight}"`
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `spicegold_analytics_${timePeriod}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Your SpiceGold analytics CSV is being downloaded.",
      });
    } else {
      toast({
        title: "Download Failed",
        description:
          "Your browser does not support downloading files directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-4 animate-fade-in">
      <div className="mx-auto max-w-full space-y-3">
        {/* Modern Header */}
        <div className="glass-card rounded-2xl p-3 md:p-4 animate-slide-up">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                IceSpice SG Earnings Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Framework-based user earnings & distribution analysis
              </p>
            </div>
          </div>

          {/* Modern Filters - Matching Analytics page style */}
          <div className="glass-card rounded-xl p-2 flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly", "overall"] as TimePeriod[]).map(
                (period) => (
                  <Button
                    key={period}
                    variant={timePeriod === period ? "default" : "ghost"}
                    onClick={() => setTimePeriod(period)}
                    className={cn(
                      "h-7 text-xs px-3 font-medium rounded-lg transition-all duration-300",
                      timePeriod === period
                        ? "gradient-primary text-white shadow-lg shadow-primary/30"
                        : "hover:bg-primary/10"
                    )}
                    size="sm"
                  >
                    {period === "daily"
                      ? "Day"
                      : period === "weekly"
                      ? "Week"
                      : period === "monthly"
                      ? "Month"
                      : "Overall"}
                  </Button>
                )
              )}
            </div>
            {/* Show period label */}
            {!isLoading && analyticsData && (
              <div className="ml-auto text-xs text-muted-foreground">
                {getPeriodLabel()} Analytics
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">
                Total Users
              </div>
              <div className="text-2xl md:text-3xl font-bold text-orange-500">
                {totalUsers.toLocaleString()}
              </div>
            </div>

            {/* <div className="text-center p-2 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">
                Total SG (Est.)
              </div>
              <div className="text-2xl md:text-3xl font-bold text-success">
                {Math.round(estimatedTotalSG).toLocaleString()}
              </div>
            </div> */}

            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-info/10 to-info/5 border border-info/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">
                Total SpiceGold Earned by Top 10 Users
              </div>
              <div className="text-2xl md:text-3xl font-bold text-info">
                {topEarnersTotal.toLocaleString()}
              </div>
            </div>

            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">
                Avg per User
              </div>
              <div className="text-2xl md:text-3xl font-bold text-purple-500">
                {totalUsers > 0
                  ? Math.round(estimatedTotalSG / totalUsers).toLocaleString()
                  : 0}
              </div>
            </div>
          </div>

          {/* Earning Bracket Metrics - Framework-based */}
          {/* {chartData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="text-[10px] text-muted-foreground mb-1">
                  🟢 Top Performers
                </div>
                <div className="text-lg font-bold text-green-500">
                  {topPerformers.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  {timePeriod === "daily" ? "701-1000 SG" : "701+ SG"}
                </div>
              </div>

              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                <div className="text-[10px] text-muted-foreground mb-1">
                  🟡 High Activity
                </div>
                <div className="text-lg font-bold text-yellow-500">
                  {highActivity.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  401-700 SG
                </div>
              </div>

              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="text-[10px] text-muted-foreground mb-1">
                  🔵 Moderate Activity
                </div>
                <div className="text-lg font-bold text-blue-500">
                  {moderateActivity.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  101-400 SG
                </div>
              </div>

              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="text-[10px] text-muted-foreground mb-1">
                  🟪 Low Activity
                </div>
                <div className="text-lg font-bold text-purple-500">
                  {lowActivity.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  51-100 SG
                </div>
              </div>

              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                <div className="text-[10px] text-muted-foreground mb-1">
                  🟥 Dormant / New
                </div>
                <div className="text-lg font-bold text-red-500">
                  {dormant.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  0-50 SG
                </div>
              </div>
            </div>
          )} */}
        </div>

        {isLoading ? (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading analytics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Compact Stats - Matching Analytics page style */}

            {/* Combined Chart & Top Earners */}
            <div className="grid gap-3 lg:grid-cols-3">
              {/* Main Distribution Chart - Enhanced Pie Chart */}
              {chartData.length > 0 && (
                <div className="glass-card rounded-2xl p-3 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    {" "}
                    <h3 className="text-sm font-semibold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      SG Distribution by Range
                    </h3>
                    {/* Action Buttons */}
                    {chartData.length > 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setShowDetailedSummary(!showDetailedSummary)
                          }
                          className="h-8 px-3 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300"
                        >
                          {showDetailedSummary ? "Hide" : "Show"} Detailed
                          Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCsv()}
                          className="h-8 px-3 text-xs rounded-lg border-secondary/30 text-secondary hover:bg-secondary/10 transition-all duration-300"
                        >
                          <Download className="h-3 w-3 mr-1" /> Download CSV
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    User distribution across SpiceGold earning ranges
                  </p>
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-3">
                    {/* Enhanced Pie Chart */}
                    <div className="w-full lg:w-2/3 relative">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart
                          margin={{ top: 10, right: 10, bottom: 80, left: 10 }}
                        >
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "13px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              zIndex: 1000,
                            }}
                            wrapperStyle={{
                              zIndex: 1000,
                            }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div
                                    className="bg-card p-3 rounded-lg border shadow-lg"
                                    style={{ zIndex: 1000 }}
                                  >
                                    <p className="font-bold text-base mb-1">
                                      {data.displayName || data.name}
                                    </p>
                                    {/* {data.bracketInsight && (
                                      <p className="text-[10px] text-muted-foreground mb-2 italic">
                                        {data.bracketInsight} here
                                      </p>
                                    )} */}
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full flex-shrink-0"
                                          style={{
                                            backgroundColor: data.color,
                                          }}
                                        />
                                        <p className="text-primary font-semibold text-sm">
                                          {data.users.toLocaleString()} users
                                        </p>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {data.percentage.toFixed(1)}% of total
                                        users
                                      </p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            label={false}
                            outerRadius={90}
                            innerRadius={50}
                            paddingAngle={2}
                            dataKey="users"
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="hsl(var(--card))"
                                strokeWidth={2}
                                style={{
                                  filter:
                                    "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                  transition: "all 0.3s ease",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  const target = e.target as SVGElement;
                                  if (target) {
                                    target.style.filter =
                                      "drop-shadow(0 4px 8px rgba(0,0,0,0.2)) brightness(1.1)";
                                    target.style.transform = "scale(1.05)";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  const target = e.target as SVGElement;
                                  if (target) {
                                    target.style.filter =
                                      "drop-shadow(0 2px 4px rgba(0,0,0,0.1))";
                                    target.style.transform = "scale(1)";
                                  }
                                }}
                              />
                            ))}
                          </Pie>

                          <Legend
                            verticalAlign="bottom"
                            height={80}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value, entry) => {
                              const data = chartData.find(
                                (d) => d.name === value
                              );
                              const percentage = data?.percentage || 0;
                              return (
                                <div className="inline-flex flex-col gap-0 max-w-[140px] items-start text-left">
                                  <span className="text-[10px] font-semibold truncate w-full block">
                                    {data?.displayName || value}
                                  </span>
                                  <span className="text-[8px] text-muted-foreground w-full block">
                                    {data?.users.toLocaleString()} ·{" "}
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            }}
                            wrapperStyle={{
                              fontSize: "10px",
                              paddingTop: "10px",
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center",
                              gap: "8px",
                              maxWidth: "100%",
                              overflow: "hidden",
                              alignItems: "flex-start",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Label for Donut Chart */}
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ paddingBottom: "165px" }}
                      >
                        <div className="text-center">
                          <p className="text-lg md:text-xl font-bold text-primary">
                            {totalUsers.toLocaleString()}
                          </p>
                          <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">
                            Total Users
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Statistics Panel */}
                    <div className="w-full lg:w-1/2">
                      <div className="p-4 rounded-lg bg-muted/50 border glass-card">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                          <Coins className="h-3 w-3 text-primary" />
                          Distribution Summary
                        </h4>
                        <div className="space-y-1.5 max-h-[385px] overflow-y-auto">
                          {chartData.map((item, index) => {
                            const widthPercentage =
                              (item.users / totalUsers) * 100;
                            return (
                              <div key={index} className="space-y-0.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <span className="font-medium">
                                        {item.displayName || item.name}
                                      </span>
                                      {/* {item.bracketInsight && (
                                        <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                                          {item.bracketInsight} here
                                        </p>
                                      )} */}
                                    </div>
                                  </div>
                                  <span className="text-muted-foreground flex-shrink-0 ml-2">
                                    {item.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${widthPercentage}%`,
                                      backgroundColor: item.color,
                                    }}
                                  />
                                </div>
                                <div className="text-[10px] text-muted-foreground pl-4">
                                  {item.users.toLocaleString()} users
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Top Earners */}
              {topEarners.length > 0 && (
                <div className="glass-card rounded-2xl p-3 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500">
                  <h3 className="text-sm font-semibold mb-1 bg-gradient-to-r from-secondary to-info bg-clip-text text-transparent flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Top 10 Players
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Highest SG earners
                  </p>
                  <div className="space-y-1 max-h-[477px] overflow-y-auto">
                    {topEarners.map((earner, index) => (
                      <div
                        key={earner.linkedId}
                        className="flex items-center justify-between p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                              index === 0
                                ? "bg-yellow-500 text-yellow-950"
                                : index === 1
                                ? "bg-gray-400 text-gray-950"
                                : index === 2
                                ? "bg-amber-600 text-amber-950"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {earner.firstName} {earner.lastName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              ID: {earner.linkedId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs font-bold text-primary">
                            {(earner.totalRewardPoints ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Daily/Weekly/Monthly Daily Breakdown - Single Consolidated View */}
              {(timePeriod === "daily" ||
                timePeriod === "weekly" ||
                timePeriod === "monthly") &&
                analyticsData?.data?.weeklyBreakdown && (
                  <div className="glass-card rounded-2xl p-4 hover:s  hadow-2xl hover:shadow-secondary/10 transition-all duration-500 lg:col-span-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold bg-gradient-to-r from-secondary to-info bg-clip-text text-transparent">
                          {timePeriod === "daily"
                            ? "Daily"
                            : timePeriod === "weekly"
                            ? "Weekly"
                            : "Monthly"}{" "}
                          Breakdown
                        </h3>
                        {analyticsData.data.weeklyBreakdown.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {analyticsData.data.weeklyBreakdown[0]?.date} -{" "}
                            {
                              analyticsData.data.weeklyBreakdown[
                                analyticsData.data.weeklyBreakdown.length - 1
                              ]?.date
                            }
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!analyticsData?.data?.weeklyBreakdown) return;

                          // Get all unique ranges
                          const allRanges =
                            analyticsData.data.weeklyBreakdown[0]?.ranges.filter(
                              (r) => {
                                return analyticsData.data.weeklyBreakdown.some(
                                  (day) =>
                                    day.ranges.find(
                                      (r2) =>
                                        r2.reward_from_range ===
                                          r.reward_from_range &&
                                        r2.reward_to_range === r.reward_to_range
                                    )?.total_users > 0
                                );
                              }
                            ) || [];

                          // Create CSV headers
                          const headers = [
                            "Date",
                            ...allRanges.map((r) => {
                              const fromRange =
                                parseInt(r.reward_from_range) || 0;
                              const toRange =
                                r.reward_to_range && r.reward_to_range.trim()
                                  ? parseInt(r.reward_to_range)
                                  : null;
                              return toRange
                                ? `${fromRange}-${toRange} SG`
                                : `${fromRange}+ SG`;
                            }),
                            "Total Users",
                          ];

                          // Create CSV rows
                          const rows = analyticsData.data.weeklyBreakdown.map(
                            (dateData) => {
                              const totalDayUsers = dateData.ranges.reduce(
                                (sum, r) => sum + r.total_users,
                                0
                              );
                              const row = [dateData.date];

                              allRanges.forEach((baseRange) => {
                                const matchingRange = dateData.ranges.find(
                                  (r) =>
                                    r.reward_from_range ===
                                      baseRange.reward_from_range &&
                                    r.reward_to_range ===
                                      baseRange.reward_to_range
                                );
                                row.push(
                                  (matchingRange?.total_users || 0).toString()
                                );
                              });

                              row.push(totalDayUsers.toString());
                              return row;
                            }
                          );

                          // Combine headers and rows
                          const csvContent = [
                            headers.join(","),
                            ...rows.map((row) => row.join(",")),
                          ].join("\n");

                          // Download CSV
                          const blob = new Blob([csvContent], {
                            type: "text/csv;charset=utf-8;",
                          });
                          const link = document.createElement("a");
                          if (link.download !== undefined) {
                            const url = URL.createObjectURL(blob);
                            link.setAttribute("href", url);
                            const startDate =
                              analyticsData.data.weeklyBreakdown[0]?.date ||
                              "weekly";
                            const endDate =
                              analyticsData.data.weeklyBreakdown[
                                analyticsData.data.weeklyBreakdown.length - 1
                              ]?.date || "";
                            link.setAttribute(
                              "download",
                              `${timePeriod}_breakdown_${startDate}_to_${endDate}.csv`
                            );
                            link.style.visibility = "hidden";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast({
                              title: "Download Started",
                              description: `${
                                timePeriod === "weekly" ? "Weekly" : "Monthly"
                              } breakdown CSV is being downloaded.`,
                            });
                          } else {
                            toast({
                              title: "Download Failed",
                              description:
                                "Your browser does not support downloading files directly.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="h-8 px-3 text-xs rounded-lg border-secondary/30 text-secondary hover:bg-secondary/10 transition-all duration-300"
                      >
                        <Download className="h-3 w-3 mr-1" /> Download CSV
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2 font-medium sticky left-0 bg-card z-10">
                              Date
                            </th>
                            {analyticsData.data.weeklyBreakdown[0]?.ranges
                              .filter((r) => {
                                // Show ranges that have users in at least one day
                                return analyticsData.data.weeklyBreakdown.some(
                                  (day) =>
                                    day.ranges.find(
                                      (r2) =>
                                        r2.reward_from_range ===
                                          r.reward_from_range &&
                                        r2.reward_to_range === r.reward_to_range
                                    )?.total_users > 0
                                );
                              })
                              .map((range, idx) => {
                                const fromRange =
                                  parseInt(range.reward_from_range) || 0;
                                const toRange =
                                  range.reward_to_range &&
                                  range.reward_to_range.trim()
                                    ? parseInt(range.reward_to_range)
                                    : null;
                                const rangeName = toRange
                                  ? `${fromRange}-${toRange}`
                                  : `${fromRange}+`;
                                const color = getBracketColor(
                                  fromRange,
                                  toRange,
                                  timePeriod
                                );
                                return (
                                  <th
                                    key={idx}
                                    className="text-center py-2 px-2 font-medium min-w-[80px]"
                                  >
                                    <div
                                      className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
                                      style={{ backgroundColor: color }}
                                    />
                                    <div className="text-[9px]">
                                      {rangeName} SG
                                    </div>
                                  </th>
                                );
                              })}
                            <th className="text-right py-2 px-2 font-medium">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.data.weeklyBreakdown.map(
                            (dateData, dateIndex) => {
                              const totalDayUsers = dateData.ranges.reduce(
                                (sum, r) => sum + r.total_users,
                                0
                              );
                              const allRanges =
                                analyticsData.data.weeklyBreakdown[0]?.ranges.filter(
                                  (r) => {
                                    return analyticsData.data.weeklyBreakdown.some(
                                      (day) =>
                                        day.ranges.find(
                                          (r2) =>
                                            r2.reward_from_range ===
                                              r.reward_from_range &&
                                            r2.reward_to_range ===
                                              r.reward_to_range
                                        )?.total_users > 0
                                    );
                                  }
                                ) || [];

                              return (
                                <tr
                                  key={dateIndex}
                                  className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                                >
                                  <td className="py-2 px-2 font-medium sticky left-0 bg-card z-10">
                                    {dateData.date}
                                  </td>
                                  {allRanges.map((baseRange, rangeIdx) => {
                                    const matchingRange = dateData.ranges.find(
                                      (r) =>
                                        r.reward_from_range ===
                                          baseRange.reward_from_range &&
                                        r.reward_to_range ===
                                          baseRange.reward_to_range
                                    );
                                    const users =
                                      matchingRange?.total_users || 0;
                                    const percentage =
                                      totalDayUsers > 0
                                        ? (
                                            (users / totalDayUsers) *
                                            100
                                          ).toFixed(1)
                                        : "0.0";
                                    const fromRange =
                                      parseInt(baseRange.reward_from_range) ||
                                      0;
                                    const toRange =
                                      baseRange.reward_to_range &&
                                      baseRange.reward_to_range.trim()
                                        ? parseInt(baseRange.reward_to_range)
                                        : null;
                                    const color = getBracketColor(
                                      fromRange,
                                      toRange,
                                      timePeriod
                                    );

                                    return (
                                      <td
                                        key={rangeIdx}
                                        className="text-center py-2 px-2"
                                      >
                                        {users > 0 ? (
                                          <div className="flex flex-col items-center gap-0.5">
                                            <div
                                              className="text-xs font-bold"
                                              style={{ color: color }}
                                            >
                                              {users.toLocaleString()}
                                            </div>
                                            <div className="text-[9px] text-muted-foreground">
                                              {percentage}%
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground/50">
                                            -
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="text-right py-2 px-2 font-bold text-primary">
                                    {totalDayUsers.toLocaleString()}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Detailed Summary Table */}
              {showDetailedSummary && chartData.length > 0 && (
                <div className="glass-card rounded-2xl p-4 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 lg:col-span-2">
                  <h3 className="text-sm font-semibold mb-3 bg-gradient-to-r from-secondary to-info bg-clip-text text-transparent">
                    Detailed Summary - {getPeriodLabel()}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium">
                            Range
                          </th>
                          <th className="text-left py-2 px-2 font-medium">
                            Bracket Label
                          </th>
                          <th className="text-right py-2 px-2 font-medium">
                            Users
                          </th>
                          <th className="text-right py-2 px-2 font-medium">
                            Percentage
                          </th>
                          {/* <th className="text-left py-2 px-2 font-medium">
                            Insight here
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-border/50 hover:bg-primary/5 transition-colors duration-200"
                          >
                            <td className="py-2 px-2 font-medium">
                              {item.name}
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span>{item.displayName}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-primary">
                              {item.users.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right font-semibold text-muted-foreground">
                              {item.percentage.toFixed(1)}%
                            </td>
                            {/* <td className="py-2 px-2 text-xs text-muted-foreground">
                              {item.bracketInsight} hjfh
                            </td> */}
                          </tr>
                        ))}
                        <tr className="border-t-2 border-primary/30 font-bold bg-gradient-to-r from-primary/5 to-accent/5">
                          <td className="py-2 px-2">Total</td>
                          <td className="py-2 px-2"></td>
                          <td className="py-2 px-2 text-right text-primary">
                            {totalUsers.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right">100%</td>
                          <td className="py-2 px-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpiceGoldAnalytics;
