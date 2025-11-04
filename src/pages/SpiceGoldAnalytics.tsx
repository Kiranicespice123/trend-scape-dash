import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
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
  const chartData = analyticsData?.data?.ranges?.map((item) => {
    const fromRange = parseInt(item.reward_from_range);
    const toRange = item.reward_to_range ? parseInt(item.reward_to_range) : null;
    
    let rangeName = "";
    if (toRange) {
      rangeName = `${fromRange.toLocaleString()}-${toRange.toLocaleString()} SG`;
    } else {
      rangeName = `${fromRange.toLocaleString()}+ SG`;
    }

    return {
      name: rangeName,
      users: item.total_users,
      fromRange,
      toRange,
      percentage: ((item.total_users / (analyticsData?.data?.total_users || 1)) * 100).toFixed(1),
    };
  }) || [];

  const topEarners = topEarnersData?.data?.slice(0, 10) || [];
  const totalUsers = analyticsData?.data?.total_users || 0;

  // Calculate total SpiceGold earned (estimated from ranges)
  const estimatedTotalSG = chartData.reduce((total, item) => {
    // Use midpoint of range as estimate
    const midpoint = item.toRange 
      ? (item.fromRange + item.toRange) / 2 
      : item.fromRange + 5000; // For open-ended range, add buffer
    return total + (midpoint * item.users);
  }, 0);

  // Calculate total from top 10 earners
  const topEarnersTotal = topEarners.reduce((sum, earner) => sum + (earner.totalRewardPoints || 0), 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">SpiceGold Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track user earnings distribution and top performers
          </p>
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
          {/* Stats Cards Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Total Users with SpiceGold</CardTitle>
                  <CardDescription className="mt-1">
                    Users who have earned SG points
                  </CardDescription>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{totalUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Total SpiceGold Earned (Est.)</CardTitle>
                  <CardDescription className="mt-1">
                    Estimated total across all users
                  </CardDescription>
                </div>
                <Coins className="h-8 w-8 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
                  {Math.round(estimatedTotalSG).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">SG Points</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Top 10 Earners Total</CardTitle>
                  <CardDescription className="mt-1">
                    Combined SG of top performers
                  </CardDescription>
                </div>
                <Award className="h-8 w-8 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold" style={{ color: 'hsl(var(--chart-3))' }}>
                  {topEarnersTotal.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">SG Points</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bar Chart - User Distribution by Range */}
            {chartData.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    SpiceGold Distribution by Range
                  </CardTitle>
                  <CardDescription>
                    Number of users in each earning range
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card p-4 rounded-lg border shadow-lg">
                                <p className="font-semibold text-lg">{payload[0].payload.name}</p>
                                <p className="text-primary font-bold text-2xl mt-2">
                                  {payload[0].value?.toLocaleString()} users
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {payload[0].payload.percentage}% of total users
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="users" 
                        fill="hsl(var(--primary))" 
                        radius={[8, 8, 0, 0]}
                        name="Number of Users"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Area Chart - Cumulative Distribution */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Earnings Trend Visualization
                  </CardTitle>
                  <CardDescription>
                    User count across earning ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        name="Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Pie Chart - Distribution Percentage */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Percentage Distribution</CardTitle>
                  <CardDescription>User percentage in each range</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card p-3 rounded-lg border shadow-lg">
                                <p className="font-semibold">{payload[0].payload.name}</p>
                                <p className="text-primary font-bold mt-1">
                                  {payload[0].value?.toLocaleString()} users
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {payload[0].payload.percentage}% of total
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Table */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>Complete user distribution across all ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Range: {item.fromRange.toLocaleString()} - {item.toRange ? item.toRange.toLocaleString() : '∞'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {item.users.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.percentage}% of users
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Earners Section */}
          {topEarners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  High-Value Players (Top 10)
                </CardTitle>
                <CardDescription>
                  Top performers ranked by total SG accumulated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topEarners.map((earner, index) => (
                    <div
                      key={earner.linkedId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-500 text-yellow-950' :
                          index === 1 ? 'bg-gray-400 text-gray-950' :
                          index === 2 ? 'bg-amber-600 text-amber-950' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {earner.firstName} {earner.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">ID: {earner.linkedId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {(earner.totalRewardPoints ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">SG Points</p>
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
