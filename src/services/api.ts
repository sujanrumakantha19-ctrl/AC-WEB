import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/config/env";

/**
 * Base RTK Query API. Domain endpoints are injected via *.api.ts files so
 * every endpoint/method lives in the services folder and is used across
 * components through auto-generated hooks.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["User", "Auction", "Offers", "Notification", "Settings", "UserList", "Wins", "LiveAnalytics"],
  endpoints: () => ({}),
});
