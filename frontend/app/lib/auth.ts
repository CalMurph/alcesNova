
import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";

type User = {
  username: string;
};

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookie = (await cookies()).toString();

  if (!cookie) return null;

  const res = await fetch(
    `http://10.151.0.58:3000/api/v1/users`,
    {
      headers: { Cookie: cookie },
      cache: "no-store",
    }
  );

  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Unable to check session");

  return (await res.json()) as User;
});
