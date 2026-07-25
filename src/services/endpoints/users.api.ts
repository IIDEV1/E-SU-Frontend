import { users } from "@/mocks/data";

export const usersApi = {
  async getUsers() {
    return users;
  },
};
