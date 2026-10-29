import { Suspense } from "react";
import { redirect } from "next/navigation";
import InstancesPage from "../components/InstancesPage";
import { getCurrentUser } from "../lib/auth";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedInstances />
    </Suspense>
  );
}

async function AuthenticatedInstances() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <InstancesPage />;
}
