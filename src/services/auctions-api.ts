import { api } from "./api";
import { ENDPOINTS } from "./endpoints";
import type { SerializedAuction, RoundState } from "@/types";

export interface AuctionListResult {
  auctions: SerializedAuction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuctionListParams {
  status?: string;
  parkingSale?: boolean;
  limit?: number;
  page?: number;
}

export interface RoundStateResult {
  currentRound: number;
  totalRounds: number;
  roundStates?: RoundState[];
  basePrice: number;
  userHasOfferThisRound: boolean;
  userLastOffer: { amount: number; createdAt: string } | null;
}

export const auctionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAuctions: build.query<AuctionListResult, AuctionListParams | void>({
      query: (params) => ({ url: ENDPOINTS.auctions.list(params) }),
      providesTags: ["Auction"],
    }),
    getAuction: build.query<{ auction: SerializedAuction }, string>({
      query: (id) => ({ url: ENDPOINTS.auctions.get(id) }),
      providesTags: (_result, _error, id) => [{ type: "Auction", id }],
    }),
    createAuction: build.mutation<{ auction: SerializedAuction }, Partial<SerializedAuction>>({
      query: (body) => ({ url: ENDPOINTS.auctions.create, method: "POST", body }),
      invalidatesTags: ["Auction"],
    }),
    updateAuction: build.mutation<
      { auction: SerializedAuction },
      { id: string; body: Partial<SerializedAuction> }
    >({
      query: ({ id, body }) => ({ url: ENDPOINTS.auctions.update(id), method: "PUT", body }),
      invalidatesTags: ["Auction"],
    }),
    deleteAuction: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: ENDPOINTS.auctions.delete(id), method: "DELETE" }),
      invalidatesTags: ["Auction"],
    }),
    getRoundState: build.query<RoundStateResult, string>({
      query: (id) => ({ url: ENDPOINTS.auctions.roundState(id) }),
      providesTags: ["Auction"],
    }),
    roundControl: build.mutation<
      { message?: string; auction?: SerializedAuction },
      { id: string; body: { action: "start" | "pause" | "resume" | "end" | "cancel"; reason?: string } }
    >({
      query: ({ id, body }) => ({ url: ENDPOINTS.auctions.roundControl(id), method: "POST", body }),
      invalidatesTags: ["Auction"],
    }),
    payAccess: build.mutation<
      { success: boolean },
      { auctionId: string; orderId: string; paymentId: string; signature: string }
    >({
      query: ({ auctionId, orderId, paymentId, signature }) => ({
        url: ENDPOINTS.auctions.payAccess(auctionId),
        method: "POST",
        body: { orderId, paymentId, signature },
      }),
      invalidatesTags: ["User"],
    }),
    getAuctionParticipants: build.query<{ participants: any[] }, string>({
      query: (id) => ({ url: ENDPOINTS.auctions.participants(id) }),
      providesTags: ["Auction", "Offers"],
    }),
    getOfferTimeline: build.query<
      { auction: { id: string; title: string; lotNumber: string }; offers: { id: string; amount: number; round: number; createdAt: string }[] },
      string
    >({
      query: (id) => ({ url: ENDPOINTS.auctions.offerTimeline(id) }),
      providesTags: ["Offers"],
    }),
  }),
});

export const {
  useGetAuctionsQuery,
  useLazyGetAuctionsQuery,
  useGetAuctionQuery,
  useLazyGetAuctionQuery,
  useCreateAuctionMutation,
  useUpdateAuctionMutation,
  useDeleteAuctionMutation,
  useGetRoundStateQuery,
  useLazyGetRoundStateQuery,
  useRoundControlMutation,
  usePayAccessMutation,
  useGetAuctionParticipantsQuery,
  useGetOfferTimelineQuery,
} = auctionsApi;
