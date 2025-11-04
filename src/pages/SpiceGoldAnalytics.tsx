import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSpiceGoldAnalytics, useTopEarners } from "@/hooks/useSpiceGoldAnalytics";
import { Loader2, TrendingUp, Users, Award, Coins } from "lucide-react";

type TimePeriod = "daily" | "weekly" | "monthly" | "overall";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const SpiceGoldAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useSpiceGoldAnalytics(timePeriod);
  const { data: topEarnersData, isLoading: isLoadingEarners } = useTopEarners();

  const isLoading = isLoadingAnalytics || isLoadingEarners;

  // Prepare data for charts
  const dailyEarningsData = analyticsData?.data?.daily_ranges?.map((item) => ({
    name: item.range,
    users: item.count,
    description: item.description,
  })) || [];

  const overallBalanceData = analyticsData?.data?.overall_ranges?.map((item) => ({
    name: item.range,
    users: item.count,
    description: item.description,
  })) || [];

  const topEarners = topEarnersData?.data?.slice(0, 10) || [];

  const stats = analyticsData?.data?.stats;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">SpiceGold Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track user earnings, balances, and top performers
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
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users with Balance</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.total_users_with_balance ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users holding valid SG balance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average SG per User</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.average_points_per_user ?? 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average earning health across player base
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Highest Balance</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats.highest_balance ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Top performing player SG balance
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Earnings Chart */}
            {dailyEarningsData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Today's SG (Daily Earnings)
                  </CardTitle>
                  <CardDescription>
                    Distribution of users by daily SG earning ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyEarningsData}>
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
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card p-3 rounded-lg border shadow-lg">
                                <p className="font-semibold">{payload[0].payload.name}</p>
                                <p className="text-sm text-muted-foreground">{payload[0].payload.description}</p>
                                <p className="text-primary font-bold mt-1">{payload[0].value} users</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Overall Balance Chart */}
            {overallBalanceData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overall SG (Cumulative Balance)
                  </CardTitle>
                  <CardDescription>
                    Distribution of users by total SG balance ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overallBalanceData}>
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
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card p-3 rounded-lg border shadow-lg">
                                <p className="font-semibold">{payload[0].payload.name}</p>
                                <p className="text-sm text-muted-foreground">{payload[0].payload.description}</p>
                                <p className="text-primary font-bold mt-1">{payload[0].value} users</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Pie Chart for Daily Earnings */}
            {dailyEarningsData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Earnings Distribution</CardTitle>
                  <CardDescription>Percentage breakdown of earning ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dailyEarningsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {dailyEarningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Earners List */}
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
                        key={earner.user_id}
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
                            <p className="font-medium">{earner.username || earner.user_id}</p>
                            <p className="text-xs text-muted-foreground">User ID: {earner.user_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {(earner.total_points ?? 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">SG Points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpiceGoldAnalytics;
