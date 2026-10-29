import { Suspense } from "react";
import { redirect } from "next/navigation";
import CreateInstance from "../components/CreateInstance";
import { getCurrentUser } from "../lib/auth";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedCreateInstance />
    </Suspense>
  );
}

async function AuthenticatedCreateInstance() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <CreateInstance />;
}
