import { api } from "./api";
import { ENDPOINTS } from "./endpoints";

export interface MyAuctionSummary {
  id: string;
  _id: string;
  lotNumber: string;
  title: string;
  image: string;
  images?: string[];
  status: "LIVE" | "UPCOMING" | "ENDED";
  startTime?: string;
  endTime?: string;
  currentRound: number;
  rounds: number;
  roundTimes?: { start: string; end: string }[];
  roundStates?: {
    round: number;
    status: string;
    highestOffer: number;
    startedAt?: string;
    endedAt?: string;
  }[];
  currentOffer: number;
  startingOffer: number;
  totalOffers: number;
  isWon: boolean;
  winningOffer?: number;
}

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWinsCount: build.query<{ count: number }, void>({
      query: () => ({ url: ENDPOINTS.user.wins }),
      providesTags: ["Wins"],
    }),
    getMyAuctions: build.query<{ auctions: MyAuctionSummary[] }, void>({
      query: () => ({ url: ENDPOINTS.user.myAuctions }),
      providesTags: ["Auction", "Offers", "Wins"],
    }),
    getMyPayments: build.query<{ payments: any[] }, void>({
      query: () => ({ url: ENDPOINTS.user.payments }),
      providesTags: ["Auction"],
    }),
  }),
});

export const { useGetWinsCountQuery, useGetMyAuctionsQuery, useGetMyPaymentsQuery } = userApi;
