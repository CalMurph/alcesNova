"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

type Instance = {
  id: string;
  flavour: string;
  hostname: string;
  status: string[];
  uptime: string;
};

function toSeconds(time: string) {
  return time.split(":").reduce((acc, val) => acc * 60 + Number(val), 0);
}

export default function Home() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [mode, setMode] = useState<"all-instances" | "my-instances">("my-instances");
  const [userInstances, setUserInstances] = useState<Instance[]>([])



  const router = useRouter();

  useEffect(() => {
    async function getInstances() {
      try {
        const res = await fetch("/api/backend/v1/vviz", {
          credentials: "include",
        });
        const data: Instance[] = await res.json();
        setInstances(data);
      } catch (error) {
        console.error(error);
      }
    }

     async function getUserInstances() {
      try {
        const res = await fetch("/api/backend/v1/vviz/user", {
          credentials: "include",
        });
        const data: Instance[] = await res.json();
        setUserInstances(data);
      } catch (error) {
        console.error(error);
      }
    }

    void getUserInstances();
    void getInstances();
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="w-full flex">
        <h1 className="font-chalet text-7xl justify-center align-center w-full font-semibold leading-normal bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Manage the herd.
        </h1>
      </div>
      <p className="mt-4 text-xl tracking-widest">
        Manage all your created instances here. Click to manage an individual
        machine.
      </p>

      <div className="relative mx-auto mt-10 grid w-full max-w-80 grid-cols-2">
        <button
          type="button"
          aria-pressed={mode === "my-instances"}
          onClick={() => setMode("my-instances")}
          className={`cursor-pointer px-4 py-2 text-xl ${mode === "my-instances" ? "text-white" : "text-white/20 hover:text-white/40"}`}
        >
          My Instances
        </button>

        <button
          type="button"
          aria-pressed={mode === "all-instances"}
          onClick={() => setMode("all-instances")}
          className={`cursor-pointer px-4 py-2 text-xl ${mode === "all-instances" ? "text-white" : "text-white/20 hover:text-white/40"}`}
        >
          All Instances
        </button>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 left-0 h-[2px] w-1/2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-transform duration-500 ease-out motion-reduce:transition-none ${mode === "all-instances" ? "translate-x-full" : "translate-x-0"}`}
        />
        
      </div>

      {mode === "all-instances" ? (
        <div className="mt-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101321]/90 shadow-2xl shadow-purple-950/10 backdrop-blur-md">
          {/* Table header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="font-chalet text-xl font-semibold text-white">
                All Instances
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                View and inspect all virtual computers on the queue.
              </p>
            </div>

            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {instances.length} Instances
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-5 font-medium">ID</th>
                  <th className="px-6 py-5 font-medium">Flavour</th>
                  <th className="px-6 py-5 font-medium">Hostname</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                  <th className="px-6 py-5 font-medium">Uptime</th>
                  <th className="px-6 py-5 text-right font-medium">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {instances.map((instance) => {
                  const status = instance.status[0].toLowerCase();

                  const statusStyle =
                    status === "running"
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : status === "pending"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : status === "stopped"
                          ? "border-slate-500/20 bg-slate-500/10 text-slate-400"
                          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";

                  const dotStyle =
                    status === "running"
                      ? "bg-green-400"
                      : status === "pending"
                        ? "bg-amber-400"
                        : status === "stopped"
                          ? "bg-slate-400"
                          : "bg-cyan-400";

                  return (
                    <tr
                      key={instance.id}
                      className="transition-colors hover:bg-white/[0.04]"
                    >
                      {/* ID */}
                      <td className="px-6 py-5 font-mono text-xs text-slate-400">
                        {instance.id}
                      </td>

                      {/* Flavour */}
                      <td className="px-6 py-5">
                        <span className="font-medium text-white">
                          {instance.flavour}
                        </span>
                      </td>

                      {/* Hostname */}
                      <td className="px-6 py-5">
                        <span
                          className={
                            instance.hostname
                              ? "font-medium text-slate-200"
                              : "italic text-slate-500"
                          }
                        >
                          {instance.hostname || "Pending..."}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyle}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${dotStyle}`}
                          />
                          {instance.status[0]}
                        </span>
                      </td>

                      {/* Uptime */}
                      <td className="px-6 py-5 text-slate-300">
                        {instance.uptime || "Pending..."}
                      </td>

                      {/* Details */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/instances/${instance.id}`)
                          }
                          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-purple-300"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
          </div>

          {/* Empty state */}
          {instances.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <h3 className="font-chalet text-lg font-semibold text-white">
                No instances yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Your virtual computers will appear here once you create your
                first instance.
              </p>

              <button
                type="button"
                onClick={() => router.push("/create-instance")}
                className="mt-6 cursor-pointer rounded-full border border-purple-400/30 bg-purple-500/10 px-6 py-2.5 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"
              >
                Create your first instance →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101321]/90 shadow-2xl shadow-purple-950/10 backdrop-blur-md">
          {/* Table header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="font-chalet text-xl font-semibold text-white">
                Your Instances
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                View and manage your virtual computers.
              </p>
            </div>

            <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {userInstances.length} Instances
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-5 font-medium">ID</th>
                  <th className="px-6 py-5 font-medium">Flavour</th>
                  <th className="px-6 py-5 font-medium">Hostname</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                  <th className="px-6 py-5 font-medium">Uptime</th>
                  <th className="px-6 py-5 text-right font-medium">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {userInstances.map((instance) => {
                  const status = instance.status[0].toLowerCase();

                  const statusStyle =
                    status === "running"
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : status === "pending"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : status === "stopped"
                          ? "border-slate-500/20 bg-slate-500/10 text-slate-400"
                          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";

                  const dotStyle =
                    status === "running"
                      ? "bg-green-400"
                      : status === "pending"
                        ? "bg-amber-400"
                        : status === "stopped"
                          ? "bg-slate-400"
                          : "bg-cyan-400";

                  return (
                    <tr
                      key={instance.id}
                      className="transition-colors hover:bg-white/[0.04]"
                    >
                      {/* ID */}
                      <td className="px-6 py-5 font-mono text-xs text-slate-400">
                        {instance.id}
                      </td>

                      {/* Flavour */}
                      <td className="px-6 py-5">
                        <span className="font-medium text-white">
                          {instance.flavour}
                        </span>
                      </td>

                      {/* Hostname */}
                      <td className="px-6 py-5">
                        <span
                          className={
                            instance.hostname
                              ? "font-medium text-slate-200"
                              : "italic text-slate-500"
                          }
                        >
                          {instance.hostname || "Pending..."}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyle}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${dotStyle}`}
                          />
                          {instance.status[0]}
                        </span>
                      </td>

                      {/* Uptime */}
                      <td className="px-6 py-5 text-slate-300">
                        {instance.uptime || "Pending..."}
                      </td>

                      {/* Details */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/instances/${instance.id}`)
                          }
                          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-purple-300"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {userInstances.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <h3 className="font-chalet text-lg font-semibold text-white">
                No instances yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Your virtual computers will appear here once you create your
                first instance.
              </p>

              <button
                type="button"
                onClick={() => router.push("/create-instance")}
                className="mt-6 cursor-pointer rounded-full border border-purple-400/30 bg-purple-500/10 px-6 py-2.5 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"
              >
                Create your first instance →
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
