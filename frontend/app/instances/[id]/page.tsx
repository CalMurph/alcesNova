import { Suspense } from "react";
import { redirect } from "next/navigation";
import InstanceDetails from "../../components/InstanceDetails";
import { getCurrentUser } from "../../lib/auth";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthenticatedInstanceDetails />
    </Suspense>
  );
}

async function AuthenticatedInstanceDetails() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <InstanceDetails />;
}
