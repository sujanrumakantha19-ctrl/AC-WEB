import { api } from "./api";
import { ENDPOINTS } from "./endpoints";

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWinsCount: build.query<{ count: number }, void>({
      query: () => ({ url: ENDPOINTS.user.wins }),
      providesTags: ["Wins"],
    }),
  }),
});

export const { useGetWinsCountQuery } = userApi;
