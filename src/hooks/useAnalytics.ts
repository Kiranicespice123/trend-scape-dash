import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

type TimePeriod = "daily" | "weekly" | "monthly";

interface AnalyticsData {
  page: string;
  totalUsers: number;
  old: number;
  new: number;
  firstTime: number; // Added based on new API response
  date?: string; // Added for monthly/weekly data
}

interface NestedAnalyticsData {
  date: string;
  pages: Array<{
    page: string;
    totalUsers: number;
    old: number;
    new: number;
    firstTime: number; // Added based on new API response
  }>;
}

interface AnalyticsResponse {
  code: number;
  data: AnalyticsData[] | NestedAnalyticsData[];
  message: string;
}

const RANGE_MAP: Record<TimePeriod, string> = {
  daily: "D",
  weekly: "W",
  monthly: "M",
};

export const useAnalytics = (
  timePeriod: TimePeriod,
  dateRange: { from?: Date; to?: Date }
) => {
  return useQuery<AnalyticsData[]>({
    queryKey: ["analytics", timePeriod, dateRange],
    queryFn: async () => {
      // If date range is provided, always send from and to (no range parameter)
      let url: URL;
      if (dateRange?.from && dateRange?.to) {
        url = new URL(
          "https://gamestaging.icespice.com/store_store/test_vs_result_daily"
        );
        url.searchParams.append("from", format(dateRange.from, "yyyy-MM-dd"));
        url.searchParams.append("to", format(dateRange.to, "yyyy-MM-dd"));
      } else {
        // If no date range, use the time period range parameter
        const rangeParam = RANGE_MAP[timePeriod];
        // All periods use test_vs_result_daily endpoint
        url = new URL(
          "https://gamestaging.icespice.com/store_store/test_vs_result_daily"
        );
        url.searchParams.append("range", rangeParam);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result: AnalyticsResponse = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || "Failed to fetch analytics data");
      }

      // Check if data is nested (monthly/weekly format)
      if (result.data.length > 0 && "pages" in result.data[0]) {
        // Flatten nested structure: combine date with each page's data
        const flattenedData: AnalyticsData[] = [];
        (result.data as NestedAnalyticsData[]).forEach((dateEntry) => {
          dateEntry.pages.forEach((page) => {
            flattenedData.push({
              ...page,
              date: dateEntry.date,
            });
          });
        });
        return flattenedData;
      }

      return result.data as AnalyticsData[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
