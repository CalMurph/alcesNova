import { Suspense } from "react";
import { redirect } from "next/navigation";
import LogIn from "../components/LogIn";
import { getCurrentUser } from "../lib/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <GuestLogin />
    </Suspense>
  );
}

async function GuestLogin() {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  return <LogIn />;
}
