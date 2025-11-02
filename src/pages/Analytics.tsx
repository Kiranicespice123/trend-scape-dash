import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(),
    to: new Date(),
  });

  // Mock data based on the provided JSON
  const analyticsData = [
    { page: "credential", totalUsers: 215, old: 59, new: 156 },
    { page: "referral_list", totalUsers: 23, old: 15, new: 8 },
    { page: "chakra_list", totalUsers: 155, old: 49, new: 106 },
  ];

  // Data for three pie charts
  const totalUsersData = analyticsData.map((item) => ({
    name: item.page,
    value: item.totalUsers,
  }));

  const oldVsNewData = [
    { name: "Old Users", value: analyticsData.reduce((sum, item) => sum + item.old, 0) },
    { name: "New Users", value: analyticsData.reduce((sum, item) => sum + item.new, 0) },
  ];

  const pageDistributionData = analyticsData.map((item) => ({
    name: item.page,
    old: item.old,
    new: item.new,
  }));

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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Journey page analytics overview</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Select time period and date range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Period Buttons */}
            <div className="flex flex-wrap gap-2">
              {(["daily", "weekly", "monthly", "yearly"] as TimePeriod[]).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? "default" : "outline"}
                  onClick={() => setTimePeriod(period)}
                  className="capitalize"
                >
                  {period}
                </Button>
              ))}
            </div>

            {/* Date Range Picker */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : <span>From date</span>}
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
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : <span>To date</span>}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {analyticsData.reduce((sum, item) => sum + item.totalUsers, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {analyticsData.reduce((sum, item) => sum + item.new, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Returning Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {analyticsData.reduce((sum, item) => sum + item.old, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Total Users by Page */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Page</CardTitle>
              <CardDescription>Total users per page</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={totalUsersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {totalUsersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Old vs New Users */}
          <Card>
            <CardHeader>
              <CardTitle>User Type Distribution</CardTitle>
              <CardDescription>Old vs new users</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={oldVsNewData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {oldVsNewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Page-wise Old vs New */}
          <Card>
            <CardHeader>
              <CardTitle>User Breakdown</CardTitle>
              <CardDescription>New vs returning by page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageDistributionData.map((item, index) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{item.name.replace("_", " ")}</span>
                      <span className="text-muted-foreground">{item.old + item.new} total</span>
                    </div>
                    <div className="flex gap-1 h-8 rounded-md overflow-hidden">
                      <div
                        className="flex items-center justify-center text-xs font-medium text-primary-foreground"
                        style={{
                          width: `${(item.new / (item.old + item.new)) * 100}%`,
                          backgroundColor: USER_COLORS[1],
                        }}
                      >
                        {item.new > 0 && `${item.new}`}
                      </div>
                      <div
                        className="flex items-center justify-center text-xs font-medium text-primary-foreground"
                        style={{
                          width: `${(item.old / (item.old + item.new)) * 100}%`,
                          backgroundColor: USER_COLORS[0],
                        }}
                      >
                        {item.old > 0 && `${item.old}`}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>New: {item.new}</span>
                      <span>Returning: {item.old}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>Page-wise breakdown of user analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Page</th>
                    <th className="text-right py-3 px-4 font-medium">Total Users</th>
                    <th className="text-right py-3 px-4 font-medium">New Users</th>
                    <th className="text-right py-3 px-4 font-medium">Returning Users</th>
                    <th className="text-right py-3 px-4 font-medium">% New</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map((item, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 px-4 capitalize">{item.page.replace("_", " ")}</td>
                      <td className="py-3 px-4 text-right font-medium">{item.totalUsers}</td>
                      <td className="py-3 px-4 text-right">{item.new}</td>
                      <td className="py-3 px-4 text-right">{item.old}</td>
                      <td className="py-3 px-4 text-right">
                        {((item.new / item.totalUsers) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
