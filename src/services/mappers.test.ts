import { describe, expect, it } from "vitest";
import { mapUser } from "@/services/mappers";
import type { User } from "@/types";

const user = {
  id: "user-1",
  email: "employee@esu.kg",
  first_name: "Иван",
  last_name: "Иванов",
  permissions: ["documents.create"],
} as User;

describe("user mapper", () => {
  it("builds a display name from backend name parts without losing permissions", () => {
    expect(mapUser(user)).toMatchObject({
      full_name: "Иван Иванов",
      name: "Иван Иванов",
      permissions: ["documents.create"],
    });
  });

  it("uses the backend full name and defaults missing permissions to an empty list", () => {
    const mapped = mapUser({ ...user, full_name: "Иванов И. И.", permissions: undefined } as unknown as User);

    expect(mapped.full_name).toBe("Иванов И. И.");
    expect(mapped.name).toBe("Иванов И. И.");
    expect(mapped.permissions).toEqual([]);
  });
});
