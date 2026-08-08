import { api } from "./api";
import { ENDPOINTS } from "./endpoints";
import type { Offer } from "@/types";

export interface OfferListParams {
  auction?: string;
  limit?: number;
}

export const offersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOffers: build.query<{ offers: Offer[] }, OfferListParams | void>({
      query: (params) => ({ url: ENDPOINTS.offers.list(params) }),
      providesTags: ["Offers"],
    }),
    placeOffer: build.mutation<{ offer: Offer }, { auctionId: string; amount: number; round?: number }>({
      query: (body) => ({ url: ENDPOINTS.offers.create, method: "POST", body }),
      invalidatesTags: ["Offers", "Auction"],
    }),
  }),
});

export const { useGetOffersQuery, usePlaceOfferMutation } = offersApi;
