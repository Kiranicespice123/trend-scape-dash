import { useQuery } from "@tanstack/react-query";

type TimePeriod = "daily" | "weekly" | "monthly" | "overall";

interface RangeData {
  reward_from_range: string;
  reward_to_range: string;
  total_users: number;
}

interface TopEarner {
  user_id: string;
  username?: string;
  total_points: number;
  rank: number;
}

interface SpiceGoldResponse {
  code: number;
  data: {
    total_users: number;
    ranges: RangeData[];
  };
  message: string;
}

export const useSpiceGoldAnalytics = (timePeriod: TimePeriod) => {
  return useQuery<SpiceGoldResponse>({
    queryKey: ["spicegold-analytics", timePeriod],
    queryFn: async () => {
      let url: string;

      switch (timePeriod) {
        case "daily":
          url = "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_daily?range=D";
          break;
        case "weekly":
          url = "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_daily?range=W";
          break;
        case "monthly":
          url = "https://gamestaging.icespice.com/store_store/reward_points_range_analytics?range=M";
          break;
        case "overall":
          url = "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_till_date";
          break;
        default:
          url = "https://gamestaging.icespice.com/store_store/reward_points_range_analytics_till_date";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch SpiceGold analytics data");
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || "Failed to fetch data");
      }

      return result;
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
