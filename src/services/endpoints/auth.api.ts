import { api, publicApi, unwrapResponse } from "@/services/api";
import { mapUser } from "@/services/mappers";
import type { ApiEnvelope } from "@/services/types";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const credentials = { email: payload.email, password: payload.password };
    const response = await publicApi.post<ApiEnvelope<LoginResponse>>("/auth/login/", credentials);
    return unwrapResponse(response);
  },

  async me(): Promise<User> {
    const response = await api.get<ApiEnvelope<User>>("/auth/me/");
    return mapUser(unwrapResponse(response));
  },

  async logout(refresh: string): Promise<void> {
    await api.post("/auth/logout/", { refresh });
  },

  async forgotPassword(email: string): Promise<void> {
    await publicApi.post("/auth/forgot-password/", { email });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await publicApi.post("/auth/reset-password/", payload);
  },
};
