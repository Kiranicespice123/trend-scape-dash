import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Calendar as CalendarIcon2 } from "lucide-react";

type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

const Analytics = () => {
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(),
    to: new Date(),
  });

  const {
    data: analyticsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnalytics(timePeriod, dateRange);

  if (isError) {
    toast({
      title: "Error loading analytics",
      description:
        error instanceof Error
          ? error.message
          : "Failed to load analytics data",
      variant: "destructive",
    });
  }

  // Data for three pie charts
  const totalUsersData =
    analyticsData?.map((item) => ({
      name: item.page,
      value: item.totalUsers,
    })) || [];

  const oldVsNewData = [
    {
      name: "Old Users",
      value: analyticsData?.reduce((sum, item) => sum + item.old, 0) || 0,
    },
    {
      name: "New Users",
      value: analyticsData?.reduce((sum, item) => sum + item.new, 0) || 0,
    },
  ];

  const pageDistributionData =
    analyticsData?.map((item) => ({
      name: item.page,
      old: item.old,
      new: item.new,
    })) || [];

  const COLORS = ["hsl(262 83% 58%)", "hsl(220 70% 55%)", "hsl(280 85% 60%)"];
  const USER_COLORS = ["hsl(199 89% 48%)", "hsl(142 71% 45%)"];

  const chartConfig = {
    credential: { label: "Credential", color: COLORS[0] },
    referral_list: { label: "Referral List", color: COLORS[1] },
    chakra_list: { label: "Chakra List", color: COLORS[2] },
    old: { label: "Old Users", color: USER_COLORS[0] },
    new: { label: "New Users", color: USER_COLORS[1] },
  };

  return (
    <div className="min-h-screen p-2 md:p-4 animate-fade-in">
      <div className="mx-auto max-w-full space-y-3">
        {/* Modern Header with Stats */}
        <div className="glass-card rounded-2xl p-3 md:p-4 animate-slide-up">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Traffic and Acquisition
              </h1>
            </div>
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="h-8 px-3 hover:bg-primary/10 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">
                Total Users
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {analyticsData?.reduce(
                  (sum, item) => sum + item.totalUsers,
                  0
                ) || 0}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">New</div>
              <div className="text-2xl md:text-3xl font-bold text-success">
                {analyticsData?.reduce((sum, item) => sum + item.new, 0) || 0}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-info/10 to-info/5 border border-info/20 hover:scale-105 transition-transform duration-300">
              <div className="text-xs text-muted-foreground mb-1">
                Returning
              </div>
              <div className="text-2xl md:text-3xl font-bold text-info">
                {analyticsData?.reduce((sum, item) => sum + item.old, 0) || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="glass-card rounded-xl p-2 flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {(["daily", "weekly", "monthly", "yearly"] as TimePeriod[]).map(
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
                  {period.charAt(0).toUpperCase()}
                </Button>
              )
            )}
          </div>
          {/* Only show date pickers for daily/yearly, not weekly/monthly */}
          {timePeriod !== "weekly" && timePeriod !== "monthly" && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              <div className="flex gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1 hover:bg-primary/10 rounded-lg"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {dateRange.from ? format(dateRange.from, "MM/dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-50 glass-card"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) =>
                        setDateRange({ ...dateRange, from: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 gap-1 hover:bg-primary/10 rounded-lg"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {dateRange.to ? format(dateRange.to, "MM/dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-50 glass-card"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>

        {/* Modern Charts & Data */}
        {isLoading ? (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading analytics...
              </p>
            </div>
          </div>
        ) : !analyticsData || analyticsData.length === 0 ? (
          <div className="glass-card rounded-2xl p-8">
            <p className="text-center text-muted-foreground">
              No data available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Modern Chart Card */}
            <div className="glass-card rounded-2xl p-4 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <h3 className="text-sm font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                User Distribution
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <ChartContainer
                  config={chartConfig}
                  className="h-[200px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={oldVsNewData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={60}
                        dataKey="value"
                      >
                        {oldVsNewData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={USER_COLORS[index % USER_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Page Breakdown */}
                <div className="space-y-2">
                  {pageDistributionData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium capitalize">
                          {item.name.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {item.old + item.new}
                        </span>
                      </div>
                      <div className="flex gap-0.5 h-4 rounded overflow-hidden">
                        <div
                          className="flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                          style={{
                            width: `${
                              (item.new / (item.old + item.new)) * 100
                            }%`,
                            backgroundColor: USER_COLORS[1],
                          }}
                        >
                          {item.new > 10 && item.new}
                        </div>
                        <div
                          className="flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                          style={{
                            width: `${
                              (item.old / (item.old + item.new)) * 100
                            }%`,
                            backgroundColor: USER_COLORS[0],
                          }}
                        >
                          {item.old > 10 && item.old}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modern Data Table */}
            <div className="glass-card rounded-2xl p-4 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500">
              <h3 className="text-sm font-semibold mb-3 bg-gradient-to-r from-secondary to-info bg-clip-text text-transparent">
                Detailed Analytics
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !analyticsData || analyticsData.length === 0 ? (
                <p className="text-center text-muted-foreground text-xs py-4">
                  No data
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 font-medium">
                          Page
                        </th>
                        <th className="text-right py-2 px-2 font-medium">
                          Total
                        </th>
                        <th className="text-right py-2 px-2 font-medium">
                          New
                        </th>
                        <th className="text-right py-2 px-2 font-medium">
                          Return
                        </th>
                        <th className="text-right py-2 px-2 font-medium">
                          % New
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-border/50 hover:bg-primary/5 transition-colors duration-200"
                        >
                          <td className="py-2 px-2 capitalize font-medium">
                            {item.page.replace(/_/g, " ")}
                          </td>
                          <td className="py-2 px-2 text-right font-bold text-primary">
                            {item.totalUsers}
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-success">
                            {item.new}
                          </td>
                          <td className="py-2 px-2 text-right font-semibold text-info">
                            {item.old}
                          </td>
                          <td className="py-2 px-2 text-right font-medium">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                              {((item.new / item.totalUsers) * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-primary/30 font-bold bg-gradient-to-r from-primary/5 to-accent/5">
                        <td className="py-2 px-2">Total</td>
                        <td className="py-2 px-2 text-right text-primary">
                          {analyticsData.reduce(
                            (sum, item) => sum + item.totalUsers,
                            0
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-success">
                          {analyticsData.reduce(
                            (sum, item) => sum + item.new,
                            0
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-info">
                          {analyticsData.reduce(
                            (sum, item) => sum + item.old,
                            0
                          )}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs">
                            {(
                              (analyticsData.reduce(
                                (sum, item) => sum + item.new,
                                0
                              ) /
                                analyticsData.reduce(
                                  (sum, item) => sum + item.totalUsers,
                                  0
                                )) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* NEW: Time Series Trend Section - Only for Weekly/Monthly */}
        {!isLoading && analyticsData && analyticsData.length > 0 && (timePeriod === "weekly" || timePeriod === "monthly") && (
          <div className="glass-card rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {timePeriod === "monthly" ? "Monthly Progress" : "Weekly Progress"}
              </h3>
            </div>

            {/* Circular Progress Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">{(() => {
              // Group data by date to get unique dates
              const dateGroups = new Map<string, typeof analyticsData>();
              analyticsData.forEach(item => {
                if (item.date) {
                  if (!dateGroups.has(item.date)) {
                    dateGroups.set(item.date, []);
                  }
                  dateGroups.get(item.date)?.push(item);
                }
              });

              const dates = Array.from(dateGroups.keys()).sort();
              const maxUsers = Math.max(...analyticsData.map(d => d.totalUsers));

              return (
                <>
                  {["credential", "referral_list", "chakra_list"].map((pageName, pageIdx) => {
                    const pageData = dates.map(date => {
                      const items = dateGroups.get(date) || [];
                      const pageItem = items.find(item => item.page === pageName);
                      return {
                        date,
                        totalUsers: pageItem?.totalUsers || 0,
                        new: pageItem?.new || 0,
                        old: pageItem?.old || 0
                      };
                    });

                    return (
                      <div key={pageName} className="glass-card rounded-xl p-4 border border-primary/10">
                        <div className="text-xs font-semibold mb-4 capitalize text-center" style={{ color: COLORS[pageIdx] }}>
                          {pageName.replace(/_/g, " ")}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {pageData.map((dayData, idx) => {
                            const progress = maxUsers > 0 ? (dayData.totalUsers / maxUsers) * 100 : 0;
                            const dayLabel = timePeriod === "weekly" 
                              ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx] || dayData.date.slice(-2)
                              : dayData.date.slice(-2);
                            
                            return (
                              <div key={idx} className="flex flex-col items-center gap-1">
                                <div 
                                  className="relative w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{
                                    background: `conic-gradient(hsl(25 95% 53%) ${progress}%, hsl(var(--border)) ${progress}%)`,
                                    padding: '2px'
                                  }}
                                >
                                  <div className="w-full h-full rounded-full glass-card flex items-center justify-center">
                                    <span className="text-[10px] font-bold" style={{ color: COLORS[pageIdx] }}>
                                      {dayData.totalUsers > 999 ? `${(dayData.totalUsers / 1000).toFixed(1)}k` : dayData.totalUsers}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-muted-foreground font-medium">{dayLabel}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-[10px]">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: USER_COLORS[1] }} />
                            <span className="text-muted-foreground">New: {pageData.reduce((sum, d) => sum + d.new, 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: USER_COLORS[0] }} />
                            <span className="text-muted-foreground">Return: {pageData.reduce((sum, d) => sum + d.old, 0)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
            </div>

            {/* Trend Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Credential Trend */}
              <div className="glass-card rounded-xl p-3 border border-primary/20">
                <div className="text-xs font-semibold text-primary mb-2">Credential Page</div>
                <ChartContainer config={chartConfig} className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.filter(item => item.page === "credential")}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => timePeriod === "monthly" ? value.slice(5) : value.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={30} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="totalUsers" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="new" stroke={USER_COLORS[1]} strokeWidth={1.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="old" stroke={USER_COLORS[0]} strokeWidth={1.5} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Referral List Trend */}
              <div className="glass-card rounded-xl p-3 border border-secondary/20">
                <div className="text-xs font-semibold text-secondary mb-2">Referral List Page</div>
                <ChartContainer config={chartConfig} className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.filter(item => item.page === "referral_list")}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => timePeriod === "monthly" ? value.slice(5) : value.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={30} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="totalUsers" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="new" stroke={USER_COLORS[1]} strokeWidth={1.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="old" stroke={USER_COLORS[0]} strokeWidth={1.5} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Chakra List Trend */}
              <div className="glass-card rounded-xl p-3 border border-accent/20">
                <div className="text-xs font-semibold text-accent mb-2">Chakra List Page</div>
                <ChartContainer config={chartConfig} className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.filter(item => item.page === "chakra_list")}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => timePeriod === "monthly" ? value.slice(5) : value.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={30} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="totalUsers" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="new" stroke={USER_COLORS[1]} strokeWidth={1.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="old" stroke={USER_COLORS[0]} strokeWidth={1.5} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Combined Comparison Bar Chart */}
            <div className="glass-card rounded-xl p-4 border border-primary/10">
              <div className="text-xs font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Page Comparison - {timePeriod === "monthly" ? "Monthly" : "Daily"} Breakdown
              </div>
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => timePeriod === "monthly" ? value.slice(5) : value.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="totalUsers" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new" fill={USER_COLORS[1]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="old" fill={USER_COLORS[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Detailed Timeline Table */}
            <div className="mt-4 overflow-x-auto">
              <div className="text-xs font-semibold mb-2 text-muted-foreground">Detailed Timeline</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium">{timePeriod === "monthly" ? "Month" : "Date"}</th>
                    <th className="text-left py-2 px-2 font-medium">Page</th>
                    <th className="text-right py-2 px-2 font-medium">Total</th>
                    <th className="text-right py-2 px-2 font-medium">New</th>
                    <th className="text-right py-2 px-2 font-medium">Return</th>
                    <th className="text-right py-2 px-2 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-primary/5 transition-colors duration-200"
                    >
                      <td className="py-2 px-2 font-medium text-muted-foreground">
                        {item.date ? (timePeriod === "monthly" ? item.date : format(new Date(item.date), "MMM dd")) : "-"}
                      </td>
                      <td className="py-2 px-2 capitalize">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium",
                          item.page === "credential" && "bg-primary/10 text-primary",
                          item.page === "referral_list" && "bg-secondary/10 text-secondary",
                          item.page === "chakra_list" && "bg-accent/10 text-accent"
                        )}>
                          {item.page.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-primary">{item.totalUsers}</td>
                      <td className="py-2 px-2 text-right font-semibold text-success">{item.new}</td>
                      <td className="py-2 px-2 text-right font-semibold text-info">{item.old}</td>
                      <td className="py-2 px-2 text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium",
                          item.new > item.old ? "bg-success/10 text-success" : "bg-info/10 text-info"
                        )}>
                          {item.new > item.old ? "↑" : "↓"} {((item.new / item.totalUsers) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
