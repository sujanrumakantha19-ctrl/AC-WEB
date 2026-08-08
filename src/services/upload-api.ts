import { api } from "./api";
import { ENDPOINTS } from "./endpoints";

export const uploadApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation<{ url: string }, FormData>({
      query: (body) => ({ url: ENDPOINTS.upload.image, method: "POST", body }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
