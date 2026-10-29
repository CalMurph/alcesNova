"use client";

import { useState, useEffect } from "react";
import DonutChart from "./DonutChart";
import Link from "next/link";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";

type NodeData = {
  name: string;
  totalCores: number;
  availableCores: number;
  totalMemGb: number;
  availableMemGb: number;
};

type Instance = {
  flavour: string;
  status: string[];
};

type Flavour = {
  name: string;
  cpus: number;
  memoryGb: number;
};

export default function UserHomePage() {
  const [clusterData, setClusterData] = useState<NodeData[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [userInstances, setUserInstances] = useState<Instance[] | null>(null);
  const [flavours, setFlavours] = useState<Flavour[] | null>(null);
  const [instancesError, setInstancesError] = useState(false);
  const [flavoursError, setFlavoursError] = useState(false);

  useEffect(() => {
    async function getClusterData() {
      try {
        const res = await fetch("http://10.151.0.58:3002/api/v1/nodes");

        if (!res.ok) {
          throw new Error("Failed to fetch cluster data");
        }

        const data: NodeData[] = await res.json();
        setClusterData(data);
      } catch (error) {
        console.error(error);
        setLoadError(true);
      }
    }

    async function getUserInstances() {
      try {
        const res = await fetch("/api/backend/v1/vviz/user", {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user instances");
        }
        const data: Instance[] = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid user instances response");
        }
        setUserInstances(data);
      } catch (error) {
        console.error(error);
        setInstancesError(true);
      }
    }

    async function getFlavours() {
      try {
        const res = await fetch("/api/backend/v1/flavours", {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch flavours");
        }
        const data: Flavour[] = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid flavours response");
        }
        setFlavours(data);
      } catch (error) {
        console.error(error);
        setFlavoursError(true);
      }
    }

    void getUserInstances();
    void getFlavours();
    void getClusterData();
  }, []);

  const nodeCount = clusterData?.length ?? 0;
  const displayedIndex = nodeCount > 0 ? activeNodeIndex % nodeCount : 0;
  const activeNode = clusterData?.[displayedIndex];
  const runningInstances = userInstances?.filter(
    (instance) => instance.status?.[0]?.trim().toLowerCase() === "running",
  );
  const instanceResources =
    runningInstances?.reduce<{
      cpus: number;
      memoryGb: number;
    } | null>(
      (totals, instance) => {
        const flavour = flavours?.find(
          (item) => item.name === instance.flavour,
        );
        if (!totals || !flavour) return null;

        return {
          cpus: totals.cpus + flavour.cpus,
          memoryGb: totals.memoryGb + flavour.memoryGb,
        };
      },
      { cpus: 0, memoryGb: 0 },
    ) ?? null;
  const resourceFallback =
    instancesError ||
    flavoursError ||
    (userInstances !== null && flavours !== null)
      ? "—"
      : "Loading…";

  useEffect(() => {
    if (nodeCount < 2) return;

    const interval = window.setInterval(() => {
      setActiveNodeIndex((index) => (index + 1) % nodeCount);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [nodeCount]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="w-full mx-auto max-w-[90rem]">
         <h1 className="font-chalet w-full mx-auto ml-5 text-5xl max-w-[90rem] font-semibold leading-normal text-white">
          Overview
        </h1>
      
   

      <div className="mx-auto mt-10 grid w-full max-w-[90rem] gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(20rem,0.9fr)]">
         
        <section className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
              Node resources
            </p>
          </div>

          {activeNode ? (
            <div key={displayedIndex} className="node-information-fade">
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Information for {activeNode.name}
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-6 justify-items-center md:grid-cols-2">
                <DonutChart
                  used={activeNode.totalCores - activeNode.availableCores}
                  unit="vCPU(s)"
                  avail={activeNode.availableCores}
                  total={activeNode.totalCores}
                  label="CPU Usage"
                />
                <DonutChart
                  used={activeNode.totalMemGb - activeNode.availableMemGb}
                  unit="GB"
                  avail={activeNode.availableMemGb}
                  total={activeNode.totalMemGb}
                  label="Memory Usage"
                />
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-400">
              {loadError
                ? "Unable to load node information."
                : clusterData
                  ? "No nodes are available."
                  : "Loading node information…"}
            </p>
          )}
        </section>

        <section className="flex min-w-0 flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
            Your instances
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl border border-purple-400/15 bg-gradient-to-br from-slate-950 to-purple-950/30 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                Running instances
              </p>
              <p className="mt-3 text-4xl font-semibold tabular-nums text-white">
                {runningInstances?.length ??
                  (instancesError ? "—" : "Loading…")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                CPU allocated
              </p>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
                {instanceResources?.cpus ?? resourceFallback}
              </p>
              <p className="mt-1 text-xs text-slate-500">vCPU</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Memory allocated
              </p>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
                {instanceResources?.memoryGb.toFixed(1) ?? resourceFallback}
              </p>
              <p className="mt-1 text-xs text-slate-500">GB</p>
            </div>
          </div>

          <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              href="/create-instance"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" />
              Create instance
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-purple-400/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              href="/instances"
            >
              View instances
              <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
      </div>
    </main>
  );
}
