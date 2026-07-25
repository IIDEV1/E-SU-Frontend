import { currentUser } from "@/mocks/data";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (!payload.email || payload.password.length < 4) {
      throw new Error("Проверьте email и пароль.");
    }

    return { user: currentUser, token: "mock-esu-token" };
  },
  async forgotPassword(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (!email.includes("@")) {
      throw new Error("Введите корректный email.");
    }
  },
};
