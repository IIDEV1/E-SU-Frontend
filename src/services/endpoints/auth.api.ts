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

    if (payload.email !== "aidana@esu.kg" || payload.password !== "demo1234") {
      throw new Error("Неверный email или пароль. Для demo используйте aidana@esu.kg / demo1234.");
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
