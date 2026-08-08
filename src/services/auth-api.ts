import { api } from "./api";
import { ENDPOINTS } from "./endpoints";
import type { AuthUser } from "@/types";

export interface LoginResponse {
  message?: string;
  user: AuthUser;
}

export interface RegisterArgs {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<{ user: AuthUser }, void>({
      query: () => ({ url: ENDPOINTS.auth.me }),
      providesTags: ["User"],
    }),
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: ENDPOINTS.auth.login, method: "POST", body }),
    }),
    register: build.mutation<{ message: string; user?: AuthUser }, RegisterArgs>({
      query: (body) => ({ url: ENDPOINTS.auth.register, method: "POST", body }),
    }),
    logout: build.mutation<{ message?: string }, void>({
      query: () => ({ url: ENDPOINTS.auth.logout, method: "POST" }),
      invalidatesTags: ["User"],
    }),
    updateMe: build.mutation<{ user: AuthUser }, Partial<AuthUser>>({
      query: (body) => ({ url: ENDPOINTS.auth.me, method: "PUT", body }),
      invalidatesTags: ["User"],
    }),
    changePassword: build.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: ENDPOINTS.auth.changePassword, method: "POST", body }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = authApi;
