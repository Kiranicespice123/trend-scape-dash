import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTopEarners } from "@/hooks/useSpiceGoldAnalytics";
import {
  Loader2,
  Trophy,
  Award,
  TrendingUp,
  Users,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type BharatPassFilter = "all" | "withBharatPass" | "withoutBharatPass";

const TopPlayers = () => {
  const { toast } = useToast();
  const [bharatPassFilter, setBharatPassFilter] =
    useState<BharatPassFilter>("all");
  const { data: topEarnersData, isLoading, isError } = useTopEarners();

  // Get top 100 earners
  const allTopEarners = React.useMemo(() => {
    return topEarnersData?.data?.slice(0, 100) || [];
  }, [topEarnersData?.data]);

  // Filter earners based on Bharat Pass filter
  const topEarners = React.useMemo(() => {
    if (bharatPassFilter === "all") {
      return allTopEarners;
    } else if (bharatPassFilter === "withBharatPass") {
      return allTopEarners.filter((earner) => earner.hasBharatPass === "Y");
    } else {
      return allTopEarners.filter((earner) => earner.hasBharatPass !== "Y");
    }
  }, [allTopEarners, bharatPassFilter]);

  // Calculate analytics
  const analytics = React.useMemo(() => {
    if (topEarners.length === 0) return null;

    const totalSG = topEarners.reduce(
      (sum, earner) => sum + earner.totalRewardPoints,
      0
    );
    const averageSG = totalSG / topEarners.length;
    const maxSG = Math.max(...topEarners.map((e) => e.totalRewardPoints));
    const minSG = Math.min(...topEarners.map((e) => e.totalRewardPoints));

    // Distribution by ranges
    const ranges = [
      { label: "0-1000", min: 0, max: 1000 },
      { label: "1001-5000", min: 1001, max: 5000 },
      { label: "5001-10000", min: 5001, max: 10000 },
      { label: "10001-25000", min: 10001, max: 25000 },
      { label: "25001-50000", min: 25001, max: 50000 },
      { label: "50001+", min: 50001, max: Infinity },
    ];

    const distribution = ranges.map((range) => ({
      ...range,
      count: topEarners.filter(
        (e) =>
          e.totalRewardPoints >= range.min && e.totalRewardPoints <= range.max
      ).length,
    }));

    // Top 10 for detailed view
    const top10 = topEarners.slice(0, 10);

    // Chart data for top 20
    const chartData = topEarners.slice(0, 20).map((earner) => ({
      rank: earner.rank,
      name: earner.firstName
        ? `${earner.firstName} ${earner.lastName || ""}`.trim()
        : `User ${earner.linkedId}`,
      sg: earner.totalRewardPoints,
      linkedId: earner.linkedId,
    }));

    return {
      totalSG,
      averageSG,
      maxSG,
      minSG,
      distribution,
      top10,
      chartData,
    };
  }, [topEarners]);

  const handleDownloadCSV = () => {
    if (!topEarners.length) return;

    const headers = [
      "Rank",
      "Linked ID",
      "Developer ID",
      "First Name",
      "Last Name",
      "Bharat Pass",
      "Total Event Count",
      "Total Reward Points (SG)",
      "Mobile",
    ];
    const rows = topEarners.map((earner) => [
      earner.rank,
      earner.linkedId,
      earner.developerId,
      earner.firstName || "",
      earner.lastName || "",
      earner.hasBharatPass || "",
      earner.totalEventCount || "",
      earner.totalRewardPoints,
      earner.mobile || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "top_100_players.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download Started",
        description: "Top 100 players CSV is being downloaded.",
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading top players...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load top players data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 md:p-4 animate-fade-in">
      <div className="mx-auto max-w-full space-y-3">
        {/* Header */}
        <div className="glass-card rounded-2xl p-3 md:p-4 animate-slide-up">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Top Players Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Top 100 SpiceGold earners and detailed analytics
              </p>
            </div>
            <Button onClick={handleDownloadCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:scale-105 transition-transform duration-300">
                <div className="text-xs text-muted-foreground mb-1">
                  Total Players
                </div>
                <div className="text-2xl md:text-3xl font-bold text-blue-500">
                  {topEarners.length}
                </div>
              </div>
              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:scale-105 transition-transform duration-300">
                <div className="text-xs text-muted-foreground mb-1">
                  Total SG Earned
                </div>
                <div className="text-2xl md:text-3xl font-bold text-green-500">
                  {Math.round(analytics.totalSG).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:scale-105 transition-transform duration-300">
                <div className="text-xs text-muted-foreground mb-1">
                  Average SG
                </div>
                <div className="text-2xl md:text-3xl font-bold text-purple-500">
                  {analytics.averageSG.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:scale-105 transition-transform duration-300">
                <div className="text-xs text-muted-foreground mb-1">
                  Highest SG
                </div>
                <div className="text-2xl md:text-3xl font-bold text-orange-500">
                  {analytics.maxSG.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Top 20 Bar Chart */}
            <div className="glass-card rounded-2xl p-4 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <h3 className="text-sm font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Top 20 Players - SG Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="rank"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    label={{
                      value: "Rank",
                      position: "insideBottom",
                      offset: -5,
                      style: { fontSize: "10px" },
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    tickFormatter={(value) => value.toLocaleString()}
                    label={{
                      value: "SG Points",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: "10px" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString()} SG`,
                      "Total Points",
                    ]}
                    labelFormatter={(label) => `Rank: ${label}`}
                  />
                  <Bar
                    dataKey="sg"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Chart */}
            <div className="glass-card rounded-2xl p-4 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500">
              <h3 className="text-sm font-semibold mb-3 bg-gradient-to-r from-secondary to-info bg-clip-text text-transparent">
                SG Range Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    label={{
                      value: "Number of Players",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: "10px" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} players`, "Count"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Players Table */}
        <div className="glass-card rounded-2xl p-4 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Top 100 Players Leaderboard
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {bharatPassFilter === "all"
                  ? "Complete list of top SpiceGold earners"
                  : bharatPassFilter === "withBharatPass"
                  ? `Players with Bharat Pass (${topEarners.length})`
                  : `Players without Bharat Pass (${topEarners.length})`}
              </p>
            </div>
            {/* Filter Buttons */}
            <div className="flex gap-1">
              <Button
                variant={bharatPassFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setBharatPassFilter("all")}
                className="h-7 text-xs px-3"
              >
                All Players
              </Button>
              <Button
                variant={
                  bharatPassFilter === "withBharatPass" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setBharatPassFilter("withBharatPass")}
                className="h-7 text-xs px-3"
              >
                With Bharat Pass
              </Button>
              <Button
                variant={
                  bharatPassFilter === "withoutBharatPass"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setBharatPassFilter("withoutBharatPass")}
                className="h-7 text-xs px-3"
              >
                Without Bharat Pass
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium sticky left-0 bg-card z-10">
                    Rank
                  </th>
                  <th className="text-left py-2 px-3 font-medium">Linked ID</th>
                  <th className="text-left py-2 px-3 font-medium">
                    Developer ID
                  </th>
                  <th className="text-left py-2 px-3 font-medium">Name</th>
                  <th className="text-center py-2 px-3 font-medium">
                    Bharat Pass
                  </th>
                  <th className="text-left py-2 px-3 font-medium">Mobile</th>
                  <th className="text-right py-2 px-3 font-medium">
                    Total Events
                  </th>
                  <th className="text-right py-2 px-3 font-medium">Total SG</th>
                </tr>
              </thead>
              <tbody>
                {topEarners.map((earner) => (
                  <tr
                    key={earner.rank}
                    className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-2 px-3 sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2">
                        {earner.rank <= 3 && (
                          <Trophy
                            className={`h-4 w-4 ${
                              earner.rank === 1
                                ? "text-yellow-500"
                                : earner.rank === 2
                                ? "text-gray-400"
                                : "text-orange-600"
                            }`}
                          />
                        )}
                        <span className="font-medium">{earner.rank}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">{earner.linkedId}</td>
                    <td className="py-2 px-3 font-mono text-[10px]">
                      {earner.developerId}
                    </td>
                    <td className="py-2 px-3">
                      {earner.firstName
                        ? `${earner.firstName} ${earner.lastName || ""}`.trim()
                        : `User ${earner.linkedId}`}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {earner.hasBharatPass === "Y" ? (
                        <img
                          src="https://appcdn.goqii.com/storeimg/54957_1762418839.png"
                          alt="Bharat Pass"
                          className="h-5 w-5 mx-auto object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-left">
                      {earner.mobile || "-"}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {earner.totalEventCount?.toLocaleString() || "-"}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {earner.totalRewardPoints.toLocaleString()} SG
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPlayers;
