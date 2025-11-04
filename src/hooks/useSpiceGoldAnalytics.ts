import { useQuery } from "@tanstack/react-query";

type TimePeriod = "daily" | "weekly" | "monthly" | "overall";

interface RangeData {
  reward_from_range: string;
  reward_to_range: string;
  total_users: number;
}

interface WeeklyRangeData {
  reward_range: string;
  total_users: number;
}

interface WeeklyDateData {
  date: string;
  ranges: WeeklyRangeData[];
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
  };
  message: string;
}

export const useSpiceGoldAnalytics = (timePeriod: TimePeriod) => {
  return useQuery<NormalizedSpiceGoldData>({
    queryKey: ["spicegold-analytics", timePeriod],
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
            "https://gamestaging.icespice.com/store_store/reward_points_range_analytics?range=M";
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

      // Normalize different response structures
      if (timePeriod === "monthly") {
        // Monthly response: data is array of RangeData directly
        const monthlyData = result as MonthlyResponse;
        const totalUsers = monthlyData.data.reduce(
          (sum, range) => sum + range.total_users,
          0
        );
        return {
          code: monthlyData.code,
          data: {
            total_users: totalUsers,
            ranges: monthlyData.data,
          },
          message: monthlyData.message,
        };
      } else if (timePeriod === "weekly") {
        // Weekly response: data is array of dates, each with ranges
        const weeklyData = result as WeeklyResponse;

        // Aggregate ranges across all dates
        const rangeMap = new Map<string, number>();

        weeklyData.data.forEach((dateData) => {
          dateData.ranges.forEach((range) => {
            // Parse reward_range like "0–100" or "1001+"
            const rangeKey = range.reward_range;
            const currentTotal = rangeMap.get(rangeKey) || 0;
            rangeMap.set(rangeKey, currentTotal + range.total_users);
          });
        });

        // Convert to RangeData format
        const aggregatedRanges: RangeData[] = Array.from(
          rangeMap.entries()
        ).map(([rewardRange, totalUsers]) => {
          // Parse "0–100", "0-100" or "1001+" format
          // Handle both en dash (–) and regular hyphen (-)
          if (rewardRange.includes("–") || rewardRange.includes("-")) {
            const separator = rewardRange.includes("–") ? "–" : "-";
            const [from, to] = rewardRange.split(separator);
            return {
              reward_from_range: from.trim(),
              reward_to_range: to.trim(),
              total_users: totalUsers,
            };
          } else if (rewardRange.endsWith("+")) {
            const from = rewardRange.replace("+", "").trim();
            return {
              reward_from_range: from,
              reward_to_range: "",
              total_users: totalUsers,
            };
          }
          // Fallback
          return {
            reward_from_range: rewardRange.trim(),
            reward_to_range: "",
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
          },
          message: weeklyData.message,
        };
      } else {
        // Standard response format (daily, overall)
        return result as StandardResponse;
      }
    },
    refetchInterval: 30000,
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
