import { api } from "./api";
import { ENDPOINTS } from "./endpoints";

export const settingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSpecialRules: build.query<{ value: string }, void>({
      query: () => ({ url: ENDPOINTS.settings.specialRules }),
      providesTags: ["Settings"],
    }),
    getRegistrationFee: build.query<{ value: string }, void>({
      query: () => ({ url: ENDPOINTS.settings.registrationFee }),
      providesTags: ["Settings"],
    }),
    updateSpecialRules: build.mutation<{ value: string }, { value: string }>({
      query: (body) => ({ url: ENDPOINTS.settings.specialRules, method: "PUT", body }),
      invalidatesTags: ["Settings"],
    }),
    updateRegistrationFee: build.mutation<{ value: string }, { value: string }>({
      query: (body) => ({ url: ENDPOINTS.settings.registrationFee, method: "PUT", body }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetSpecialRulesQuery,
  useGetRegistrationFeeQuery,
  useUpdateSpecialRulesMutation,
  useUpdateRegistrationFeeMutation,
} = settingsApi;
