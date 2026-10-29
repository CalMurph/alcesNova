import { Suspense } from "react";
import { redirect } from "next/navigation";
import UserHomePage from "../components/UserHomePage";
import { getCurrentUser } from "../lib/auth";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedHome />
    </Suspense>
  );
}

async function AuthenticatedHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <UserHomePage />;
}
