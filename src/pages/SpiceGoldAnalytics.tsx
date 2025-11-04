import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useSpiceGoldAnalytics, useTopEarners } from "@/hooks/useSpiceGoldAnalytics";
import { Loader2, TrendingUp, Users, Award, Coins } from "lucide-react";

type TimePeriod = "daily" | "weekly" | "monthly" | "overall";

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b'
];

const SpiceGoldAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("overall");
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useSpiceGoldAnalytics(timePeriod);
  const { data: topEarnersData, isLoading: isLoadingEarners } = useTopEarners();

  const isLoading = isLoadingAnalytics || isLoadingEarners;

  // Transform data for charts
  const chartData = analyticsData?.data?.ranges?.map((item, index) => {
    const fromRange = parseInt(item.reward_from_range);
    const toRange = item.reward_to_range ? parseInt(item.reward_to_range) : null;
    
    let rangeName = "";
    if (toRange) {
      rangeName = `${fromRange}-${toRange}`;
    } else {
      rangeName = `${fromRange}+`;
    }

    const percentage = ((item.total_users / (analyticsData?.data?.total_users || 1)) * 100).toFixed(1);

    return {
      name: rangeName,
      users: item.total_users,
      percentage: parseFloat(percentage),
      color: COLORS[index % COLORS.length],
    };
  }) || [];

  const topEarners = topEarnersData?.data?.slice(0, 5) || [];
  const totalUsers = analyticsData?.data?.total_users || 0;

  // Calculate total SpiceGold earned (estimated from ranges)
  const estimatedTotalSG = chartData.reduce((total, item) => {
    const rangeMatch = item.name.match(/(\d+)-(\d+)|(\d+)\+/);
    if (rangeMatch) {
      const from = parseInt(rangeMatch[1] || rangeMatch[3]);
      const to = rangeMatch[2] ? parseInt(rangeMatch[2]) : from + 5000;
      const midpoint = (from + to) / 2;
      return total + (midpoint * item.users);
    }
    return total;
  }, 0);

  const topEarnersTotal = topEarners.reduce((sum, earner) => sum + (earner.totalRewardPoints || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">SpiceGold Analytics</h1>
          <p className="text-sm text-muted-foreground">User earnings & distribution</p>
        </div>
        
        <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Day</TabsTrigger>
            <TabsTrigger value="weekly">Week</TabsTrigger>
            <TabsTrigger value="monthly">Month</TabsTrigger>
            <TabsTrigger value="overall">Overall</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Compact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <div className="text-xl font-bold mt-1">{totalUsers.toLocaleString()}</div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Total SG (Est.)</div>
              </div>
              <div className="text-xl font-bold mt-1">{Math.round(estimatedTotalSG).toLocaleString()}</div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Top 5 Total</div>
              </div>
              <div className="text-xl font-bold mt-1">{topEarnersTotal.toLocaleString()}</div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Avg per User</div>
              </div>
              <div className="text-xl font-bold mt-1">
                {totalUsers > 0 ? Math.round(estimatedTotalSG / totalUsers).toLocaleString() : 0}
              </div>
            </Card>
          </div>

          {/* Combined Chart & Top Earners */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Main Distribution Chart */}
            {chartData.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SG Distribution by Range</CardTitle>
                  <CardDescription className="text-xs">User count and percentage per earning range</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        label={{ value: 'SG Range', position: 'insideBottom', offset: -50, fontSize: 12 }}
                      />
                      <YAxis className="text-xs" label={{ value: 'Users', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card p-2 rounded-lg border shadow-lg">
                                <p className="font-semibold text-sm">{payload[0].payload.name} SG</p>
                                <p className="text-primary font-bold">{payload[0].value?.toLocaleString()} users</p>
                                <p className="text-xs text-muted-foreground">{payload[0].payload.percentage}% of total</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Compact Top Earners */}
            {topEarners.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Top 5 Players
                  </CardTitle>
                  <CardDescription className="text-xs">Highest SG earners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topEarners.map((earner, index) => (
                      <div
                        key={earner.linkedId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-950' :
                            index === 1 ? 'bg-gray-400 text-gray-950' :
                            index === 2 ? 'bg-amber-600 text-amber-950' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{earner.firstName} {earner.lastName}</p>
                            <p className="text-xs text-muted-foreground">ID: {earner.linkedId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {(earner.totalRewardPoints ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Compact Range Details Table */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Range Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{item.name} SG</p>
                        <p className="text-xs text-muted-foreground">
                          {item.users.toLocaleString()} ({item.percentage}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default SpiceGoldAnalytics;
