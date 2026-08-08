import { api } from "./api";
import { ENDPOINTS } from "./endpoints";
import type { AuthUser } from "@/types";

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<{ users: any[]; auctions: any[] }, { search?: string } | void>({
      query: (params) => ({ url: ENDPOINTS.admin.users(params) }),
      providesTags: ["UserList"],
    }),
    getLiveAnalytics: build.query<
      {
        active: {
          id: string;
          title: string;
          lotNumber: string;
          startingOffer: number;
          currentOffer: number;
          totalOffers: number;
          currentRound: number;
          endTime: string;
          image?: string;
        } | null;
        offerProgression: { time: string; amount: number; round: number }[];
        participantCount: number;
        now: string;
      },
      void
    >({
      query: () => ({ url: ENDPOINTS.admin.analyticsLive() }),
      providesTags: ["LiveAnalytics"],
    }),
    updateUserRefund: build.mutation<{ message: string }, { userId: string; auctionId: string; refundState: boolean }>({
      query: (body) => ({
        url: "/api/admin/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserList"],
    }),
  }),
});

export const { useGetAdminUsersQuery, useLazyGetAdminUsersQuery, useGetLiveAnalyticsQuery, useUpdateUserRefundMutation } = adminApi;
