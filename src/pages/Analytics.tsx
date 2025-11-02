import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";

type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

const Analytics = () => {
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(),
    to: new Date(),
  });

  const { data: analyticsData, isLoading, isError, error, refetch } = useAnalytics(timePeriod, dateRange);

  if (isError) {
    toast({
      title: "Error loading analytics",
      description: error instanceof Error ? error.message : "Failed to load analytics data",
      variant: "destructive",
    });
  }

  // Data for three pie charts
  const totalUsersData = analyticsData?.map((item) => ({
    name: item.page,
    value: item.totalUsers,
  })) || [];

  const oldVsNewData = [
    { name: "Old Users", value: analyticsData?.reduce((sum, item) => sum + item.old, 0) || 0 },
    { name: "New Users", value: analyticsData?.reduce((sum, item) => sum + item.new, 0) || 0 },
  ];

  const pageDistributionData = analyticsData?.map((item) => ({
    name: item.page,
    old: item.old,
    new: item.new,
  })) || [];

  const COLORS = ["hsl(222.2 47.4% 11.2%)", "hsl(210 40% 96.1%)", "hsl(217.2 32.6% 17.5%)"];
  const USER_COLORS = ["hsl(217.2 91.2% 59.8%)", "hsl(142.1 76.2% 36.3%)"];

  const chartConfig = {
    credential: { label: "Credential", color: COLORS[0] },
    referral_list: { label: "Referral List", color: COLORS[1] },
    chakra_list: { label: "Chakra List", color: COLORS[2] },
    old: { label: "Old Users", color: USER_COLORS[0] },
    new: { label: "New Users", color: USER_COLORS[1] },
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="mx-auto max-w-full space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-2 px-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground">Real-time • Auto-refresh 30s</p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="gap-1 h-8"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Compact Filters */}
        <Card className="border-none shadow-none bg-card/50">
          <CardContent className="p-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {(["daily", "weekly", "monthly", "yearly"] as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? "default" : "outline"}
                  onClick={() => setTimePeriod(period)}
                  className="capitalize h-7 text-xs px-3"
                  size="sm"
                >
                  {period.charAt(0).toUpperCase()}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {dateRange.from ? format(dateRange.from, "MM/dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {dateRange.to ? format(dateRange.to, "MM/dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
          </CardContent>
        </Card>

        {/* Compact Stats */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3">
                <div className="h-12 bg-muted animate-pulse rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-2 md:p-3">
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Total</div>
              <div className="text-lg md:text-2xl font-bold">
                {analyticsData?.reduce((sum, item) => sum + item.totalUsers, 0) || 0}
              </div>
            </Card>
            <Card className="p-2 md:p-3">
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">New</div>
              <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                {analyticsData?.reduce((sum, item) => sum + item.new, 0) || 0}
              </div>
            </Card>
            <Card className="p-2 md:p-3">
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Return</div>
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analyticsData?.reduce((sum, item) => sum + item.old, 0) || 0}
              </div>
            </Card>
          </div>
        )}

        {/* Compact Charts & Data Grid */}
        {isLoading ? (
          <Card className="p-4">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </Card>
        ) : !analyticsData || analyticsData.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-muted-foreground text-sm">No data available</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Combined Chart & Table */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Page Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Pie Chart */}
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={oldVsNewData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {oldVsNewData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  
                  {/* Page Breakdown */}
                  <div className="space-y-2">
                    {pageDistributionData.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-medium capitalize">{item.name.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground">{item.old + item.new}</span>
                        </div>
                        <div className="flex gap-0.5 h-4 rounded overflow-hidden">
                          <div
                            className="flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                            style={{
                              width: `${(item.new / (item.old + item.new)) * 100}%`,
                              backgroundColor: USER_COLORS[1],
                            }}
                          >
                            {item.new > 10 && item.new}
                          </div>
                          <div
                            className="flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                            style={{
                              width: `${(item.old / (item.old + item.new)) * 100}%`,
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
              </CardContent>
            </Card>
          </div>
        )}

            {/* Compact Data Table */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !analyticsData || analyticsData.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-4">No data</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 font-medium">Page</th>
                          <th className="text-right py-2 px-2 font-medium">Total</th>
                          <th className="text-right py-2 px-2 font-medium">New</th>
                          <th className="text-right py-2 px-2 font-medium">Return</th>
                          <th className="text-right py-2 px-2 font-medium">% New</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.map((item, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-2 px-2 capitalize font-medium">{item.page.replace(/_/g, " ")}</td>
                            <td className="py-2 px-2 text-right font-bold">{item.totalUsers}</td>
                            <td className="py-2 px-2 text-right text-green-600 dark:text-green-400">{item.new}</td>
                            <td className="py-2 px-2 text-right text-blue-600 dark:text-blue-400">{item.old}</td>
                            <td className="py-2 px-2 text-right font-medium">
                              {((item.new / item.totalUsers) * 100).toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-bold">
                          <td className="py-2 px-2">Total</td>
                          <td className="py-2 px-2 text-right">
                            {analyticsData.reduce((sum, item) => sum + item.totalUsers, 0)}
                          </td>
                          <td className="py-2 px-2 text-right text-green-600 dark:text-green-400">
                            {analyticsData.reduce((sum, item) => sum + item.new, 0)}
                          </td>
                          <td className="py-2 px-2 text-right text-blue-600 dark:text-blue-400">
                            {analyticsData.reduce((sum, item) => sum + item.old, 0)}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {((analyticsData.reduce((sum, item) => sum + item.new, 0) / 
                               analyticsData.reduce((sum, item) => sum + item.totalUsers, 0)) * 100).toFixed(0)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </div>
  );
};

export default Analytics;
