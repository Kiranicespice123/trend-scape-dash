import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

interface AnalyticsData {
  page: string;
  totalUsers: number;
  old: number;
  new: number;
}

interface AnalyticsResponse {
  code: number;
  data: AnalyticsData[];
  message: string;
}

const RANGE_MAP: Record<TimePeriod, string> = {
  daily: "D",
  weekly: "W",
  monthly: "M",
  yearly: "Y",
};

export const useAnalytics = (
  timePeriod: TimePeriod,
  dateRange: { from?: Date; to?: Date }
) => {
  return useQuery<AnalyticsData[]>({
    queryKey: ["analytics", timePeriod, dateRange],
    queryFn: async () => {
      const rangeParam = RANGE_MAP[timePeriod];
      const url = new URL("https://gamestaging.icespice.com/store_store/test_vs_result");
      
      url.searchParams.append("range", rangeParam);
      
      if (dateRange.from) {
        url.searchParams.append("from", format(dateRange.from, "yyyy-MM-dd"));
      }
      
      if (dateRange.to) {
        url.searchParams.append("to", format(dateRange.to, "yyyy-MM-dd"));
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result: AnalyticsResponse = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || "Failed to fetch analytics data");
      }

      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
