import { departments } from "@/mocks/data";

export const departmentsApi = {
  async getDepartments() {
    return departments;
  },
};
