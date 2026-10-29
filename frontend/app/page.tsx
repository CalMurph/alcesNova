import { Suspense } from "react";
import { redirect } from "next/navigation";
import LandingPage from "./components/LandingPage";
import { getCurrentUser } from "./lib/auth";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GuestLanding />
    </Suspense>
  );
}

async function GuestLanding() {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  return <LandingPage />;
}
