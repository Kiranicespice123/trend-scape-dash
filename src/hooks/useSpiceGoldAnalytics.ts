import { useQuery } from "@tanstack/react-query";

type TimePeriod = "daily" | "weekly" | "monthly" | "overall";

interface RangeData {
  reward_from_range: string;
  reward_to_range: string;
  total_users: number;
}

interface WeeklyRangeData {
  reward_from_range: string;
  reward_to_range: string;
  total_users: number;
}

interface WeeklyDateData {
  date: string;
  unique_users?: number;
  ranges: WeeklyRangeData[];
}

interface NewApiResponse {
  code: number;
  data: {
    daily: WeeklyDateData[];
    aggregated: {
      unique_users: number;
      totalSg: number;
      averageSg: number;
      ranges: RangeData[];
    };
  };
  message: string;
}

interface MonthlyResponse {
  code: number;
  data: RangeData[];
  message: string;
}

interface WeeklyResponse {
  code: number;
  data: WeeklyDateData[];
  message: string;
}

interface StandardResponse {
  code: number;
  data: {
    total_users: number;
    ranges: RangeData[];
  };
  message: string;
}

interface TopEarner {
  rank: number;
  linkedId: number;
  totalRewardPoints: number;
  developerId: string;
  firstName?: string;
  lastName?: string;
}

// Normalized response type
export interface NormalizedSpiceGoldData {
  code: number;
  data: {
    total_users: number;
    ranges: RangeData[];
    weeklyBreakdown?: WeeklyDateData[]; // For weekly view, include daily breakdown
    unique_users?: number; // From aggregated data
    totalSg?: number; // From aggregated data
    averageSg?: number; // From aggregated data
  };
  message: string;
}

export const useSpiceGoldAnalytics = (timePeriod: TimePeriod) => {
  return useQuery<NormalizedSpiceGoldData>({
    queryKey: ["spicegold-analytics", timePeriod],
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    queryFn: async () => {
      let url: string;

      switch (timePeriod) {
        case "daily":
          url =
            "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_daily?range=D";
          break;
        case "weekly":
          url =
            "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_daily?range=W";
          break;
        case "monthly":
          url =
            "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_daily?range=M";
          break;
        case "overall":
          url =
            "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_till_date";
          break;
        default:
          url =
            "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_till_date";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch SpiceGold analytics data");
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || "Failed to fetch data");
      }

      // Check if this is the new API response structure (with daily and aggregated)
      if (
        result.data &&
        typeof result.data === "object" &&
        "daily" in result.data &&
        "aggregated" in result.data
      ) {
        const newApiData = result as NewApiResponse;

        // Use aggregated data for ranges and stats
        return {
          code: newApiData.code,
          data: {
            total_users: newApiData.data.aggregated.unique_users,
            ranges: newApiData.data.aggregated.ranges,
            weeklyBreakdown: newApiData.data.daily, // Include daily breakdown
            unique_users: newApiData.data.aggregated.unique_users,
            totalSg: newApiData.data.aggregated.totalSg,
            averageSg: newApiData.data.aggregated.averageSg,
          },
          message: newApiData.message,
        };
      }

      // Normalize different response structures (old API format)
      if (timePeriod === "monthly") {
        // Monthly response: data is array of dates, each with ranges (same structure as weekly)
        const monthlyData = result as WeeklyResponse;

        // Check if data exists and is an array
        if (!monthlyData.data || !Array.isArray(monthlyData.data)) {
          throw new Error("Invalid monthly data format");
        }

        // Aggregate ranges across all dates using reward_from_range and reward_to_range
        const rangeMap = new Map<string, number>();

        monthlyData.data.forEach((dateData) => {
          if (dateData.ranges && Array.isArray(dateData.ranges)) {
            dateData.ranges.forEach((range) => {
              // Create a unique key from from_range and to_range
              // Use a special separator to avoid conflicts with range values
              const rangeKey = `${range.reward_from_range}__${
                range.reward_to_range || ""
              }`;
              const currentTotal = rangeMap.get(rangeKey) || 0;
              rangeMap.set(rangeKey, currentTotal + range.total_users);
            });
          }
        });

        // Convert to RangeData format
        const aggregatedRanges: RangeData[] = Array.from(
          rangeMap.entries()
        ).map(([rangeKey, totalUsers]) => {
          // Parse the key back to from and to
          const [from, to] = rangeKey.split("__");
          return {
            reward_from_range: from || "",
            reward_to_range: to || "",
            total_users: totalUsers,
          };
        });

        // Sort ranges by from_range
        aggregatedRanges.sort((a, b) => {
          const aFrom = parseInt(a.reward_from_range) || 0;
          const bFrom = parseInt(b.reward_from_range) || 0;
          return aFrom - bFrom;
        });

        const totalUsers = aggregatedRanges.reduce(
          (sum, range) => sum + range.total_users,
          0
        );

        return {
          code: monthlyData.code,
          data: {
            total_users: totalUsers,
            ranges: aggregatedRanges,
            weeklyBreakdown: monthlyData.data, // Include daily breakdown for monthly view
          },
          message: monthlyData.message,
        };
      } else if (timePeriod === "weekly") {
        // Weekly response: data is array of dates, each with ranges
        const weeklyData = result as WeeklyResponse;

        // Aggregate ranges across all dates using reward_from_range and reward_to_range
        const rangeMap = new Map<string, number>();

        // Check if data exists and is an array
        if (!weeklyData.data || !Array.isArray(weeklyData.data)) {
          throw new Error("Invalid weekly data format");
        }

        weeklyData.data.forEach((dateData) => {
          if (dateData.ranges && Array.isArray(dateData.ranges)) {
            dateData.ranges.forEach((range) => {
              // Create a unique key from from_range and to_range
              // Use a special separator to avoid conflicts with range values
              const rangeKey = `${range.reward_from_range}__${
                range.reward_to_range || ""
              }`;
              const currentTotal = rangeMap.get(rangeKey) || 0;
              rangeMap.set(rangeKey, currentTotal + range.total_users);
            });
          }
        });

        // Convert to RangeData format
        const aggregatedRanges: RangeData[] = Array.from(
          rangeMap.entries()
        ).map(([rangeKey, totalUsers]) => {
          // Parse the key back to from and to
          const [from, to] = rangeKey.split("__");
          return {
            reward_from_range: from || "",
            reward_to_range: to || "",
            total_users: totalUsers,
          };
        });

        // Sort ranges by from_range
        aggregatedRanges.sort((a, b) => {
          const aFrom = parseInt(a.reward_from_range) || 0;
          const bFrom = parseInt(b.reward_from_range) || 0;
          return aFrom - bFrom;
        });

        const totalUsers = aggregatedRanges.reduce(
          (sum, range) => sum + range.total_users,
          0
        );

        return {
          code: weeklyData.code,
          data: {
            total_users: totalUsers,
            ranges: aggregatedRanges,
            weeklyBreakdown: weeklyData.data, // Include daily breakdown for weekly view
          },
          message: weeklyData.message,
        };
      } else if (timePeriod === "daily") {
        // Daily response: data is array of dates, each with ranges (same structure as weekly/monthly)
        const dailyData = result as WeeklyResponse;

        // Check if data exists and is an array
        if (!dailyData.data || !Array.isArray(dailyData.data)) {
          throw new Error("Invalid daily data format");
        }

        // For daily, there should be only one date entry, but we'll handle it the same way
        // Aggregate ranges across all dates (usually just one date for daily)
        const rangeMap = new Map<string, number>();

        dailyData.data.forEach((dateData) => {
          if (dateData.ranges && Array.isArray(dateData.ranges)) {
            dateData.ranges.forEach((range) => {
              const rangeKey = `${range.reward_from_range}__${
                range.reward_to_range || ""
              }`;
              const currentTotal = rangeMap.get(rangeKey) || 0;
              rangeMap.set(rangeKey, currentTotal + range.total_users);
            });
          }
        });

        // Convert to RangeData format
        const aggregatedRanges: RangeData[] = Array.from(
          rangeMap.entries()
        ).map(([rangeKey, totalUsers]) => {
          const [from, to] = rangeKey.split("__");
          return {
            reward_from_range: from || "",
            reward_to_range: to || "",
            total_users: totalUsers,
          };
        });

        // Sort ranges by from_range
        aggregatedRanges.sort((a, b) => {
          const aFrom = parseInt(a.reward_from_range) || 0;
          const bFrom = parseInt(b.reward_from_range) || 0;
          return aFrom - bFrom;
        });

        const totalUsers = aggregatedRanges.reduce(
          (sum, range) => sum + range.total_users,
          0
        );

        return {
          code: dailyData.code,
          data: {
            total_users: totalUsers,
            ranges: aggregatedRanges,
            weeklyBreakdown: dailyData.data, // Include daily breakdown for daily view
          },
          message: dailyData.message,
        };
      } else {
        // Standard response format (overall)
        return result as StandardResponse;
      }
    },
  });
};

export const useTopEarners = () => {
  return useQuery<{ code: number; data: TopEarner[]; message: string }>({
    queryKey: ["top-earners"],
    queryFn: async () => {
      const response = await fetch(
        "https://gamestaging.icespice.com/store_store/top_reward_points_earners"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch top earners");
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || "Failed to fetch top earners");
      }

      return result;
    },
    refetchInterval: 30000,
  });
};
