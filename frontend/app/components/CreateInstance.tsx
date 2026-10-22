"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

type Flavour = {
  name: string;
  memoryGb: number;
  cpus: number;
};

type Instance = {
  id: string;
  flavour: string;
  hostname: string;
  status: string[];
  uptime: string;
  timeLimit: string;
};

const flavourDescriptions: Record<
  string,
  { audience: string; reason: string }
> = {
  "tiny.c8": {
    audience: "Quick experiments and lighter development work.",
    reason: "It is the smallest resource option in this list.",
  },
  "small.c16": {
    audience: "Everyday development and medium analysis jobs.",
    reason: "It gives you more CPU and memory than tiny.c8.",
  },
  "small.c32": {
    audience: "Jobs that can run many tasks in parallel.",
    reason: "Its 32 CPUs provide more room for concurrent work.",
  },
  "large.c32": {
    audience: "Larger datasets and memory-heavy analysis.",
    reason: "Its 251 GB of memory can hold a larger working set.",
  },
  "large.c64": {
    audience: "Large parallel jobs that also need substantial memory.",
    reason: "It pairs 64 CPUs with 251 GB of memory.",
  },
  "huge.c64": {
    audience: "The largest memory-heavy jobs and datasets.",
    reason: "It has the most memory in this list, alongside 64 CPUs.",
  },
};

function toSeconds(time: string) {
  return time.split(":").reduce((acc, val) => acc * 60 + Number(val), 0);
}

export default function Home() {
  const [selectedInstance, setSelectedInstance] = useState("");

  const [instances, setInstances] = useState<Instance[]>([]);

  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const selectedFlavour = flavours.find(
    (flavour) => flavour.name === selectedInstance,
  );
  const router = useRouter();
  const selectedDescription = selectedFlavour
    ? (flavourDescriptions[selectedFlavour.name] ?? {
        audience: "Workloads that fit this instance's resources.",
        reason: "Compare its CPU and memory with your job's requirements.",
      })
    : null;

  useEffect(() => {
    async function getFlavours() {
      try {
        const res = await fetch("/api/backend/v1/flavours", {
            credentials: "include"
        });

     
        const data: Flavour[] = await res.json();
        setFlavours(data);
      } catch (error) {
        console.error(error);
      }
    }

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

    void getFlavours();
    void getInstances();
  }, []);

  async function handleCreate(flavour: string) {
    setIsCreating(true);
    setCreateMessage("");
    console.log(flavour);

    try {
      const response = await fetch("/api/backend/v1/vviz", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flavour }),
      });

      if (!response.ok) {
        throw new Error(`Create request failed: ${response.status}`);
      }

      setCreateMessage("Create request sent.");
      router.push("/instances");
    } catch (error) {
      console.error(error);
      setCreateMessage("Could not create the instance. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  if (instances && flavours) {
    for (const i of instances) {
      if (i.uptime && i.timeLimit) {
        console.log("Instance: ", i.hostname);
        console.log(toSeconds(i.timeLimit) - toSeconds(i.uptime));

        console.log(i.flavour);
      }
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      {/* <p className="py-4 text-xl uppercase tracking-[0.25rem] text-sky-400">
        CREATE INSTANCE
      </p> */}
      <div className="w-full">
        <h1 className="font-chalet text-7xl justify-center align-center w-full font-semibold leading-normal bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Launch your virtual computer.
        </h1>

        <p className="text-2xl">
          Fill out the steps below to launch your virtual computer and start
          programming.{" "}
        </p>
      </div>

      {/* {instances.map((i, index) => {
        return (
            <>
            <p key={i.id}>{i.hostname}</p>
            </>

        )
      })} */}

      <div
        id="instance-selection"
        className="mx-auto mt-12 w-full max-w-5xl px-4"
      >
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="font-chalet text-3xl font-semibold text-white">
              Select a flavour
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Choose the computing resources for your research.
            </p>
          </div>
        </div>

        {/* Instance table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101321]/90 shadow-2xl shadow-purple-950/10 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-5 font-medium">Instance</th>

                  <th className="px-6 py-5 font-medium">vCPUs</th>

                  <th className="px-6 py-5 font-medium">Memory</th>

                  <th className="px-6 py-5 font-medium">Recommended for</th>

                  <th className="px-6 py-5 text-right font-medium">Select</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {flavours.map((f) => {
                  const isSelected = selectedInstance === f.name;

                  const description = flavourDescriptions[f.name];

                  return (
                    <tr
                      key={f.name}
                      onClick={() => {
                        setSelectedInstance(f.name);
                        setCreateMessage("");
                      }}
                      aria-selected={isSelected}
                      className={`cursor-pointer transition-colors duration-200 ${
                        isSelected
                          ? "bg-purple-500/10"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* Instance name */}
                      <td className="px-6 py-5">
                        <span
                          className={`font-semibold ${
                            isSelected ? "text-purple-300" : "text-white"
                          }`}
                        >
                          {f.name}
                        </span>
                      </td>

                      {/* CPU */}
                      <td className="px-6 py-5 text-slate-300">{f.cpus}</td>

                      {/* RAM */}
                      <td className="px-6 py-5 text-slate-300">
                        {f.memoryGb} GB
                      </td>

                      {/* Description */}
                      <td className="max-w-xs px-6 py-5 text-slate-400">
                        {description?.audience ?? "General computing workloads"}
                      </td>

                      {/* Selection */}
                      <td className="px-6 py-5 text-right">
                        <input
                          type="radio"
                          name="instance"
                          value={f.name}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedInstance(f.name);
                            setCreateMessage("");
                          }}
                          aria-label={`Select ${f.name}`}
                          className="h-4 w-4 cursor-pointer accent-purple-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected instance details */}
          {selectedFlavour && selectedDescription && (
            <div className="border-t border-purple-400/20 bg-purple-500/[0.05] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />

                <h3 className="font-semibold text-white">
                  {selectedFlavour.name}
                </h3>

                <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                  Selected
                </span>
              </div>

              <p className="text-sm text-slate-300">
                {selectedFlavour.cpus} vCPUs · {selectedFlavour.memoryGb} GB RAM
              </p>

              <p className="mt-4 text-sm text-slate-400">
                {selectedDescription.reason}
              </p>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col items-end gap-4">
          {selectedFlavour && (
            <button
              type="button"
              disabled={isCreating}
              onClick={() => void handleCreate(selectedFlavour.name)}
              className="cursor-pointer rounded-full border border-purple-400/30 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating instance..." : "Create Instance →"}
            </button>
          )}

          {createMessage && (
            <p className="text-sm text-slate-300" role="status">
              {createMessage}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
