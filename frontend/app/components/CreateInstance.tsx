"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { GoClock } from "react-icons/go";

function timeToString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}

function formatStartTime(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  const diffSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const days = Math.floor(absSeconds / 86400);
  const hours = Math.floor((absSeconds % 86400) / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);

  const duration = [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    minutes > 0 && `${minutes}m`,
  ].filter(Boolean).join(" ") || "less than 1m";

  const relative = diffSeconds >= 0
    ? `in ${duration}`
    : `${duration} ago`;

  const formattedDate = date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${relative} (${formattedDate})`;
}

type Flavour = {
  name: string;
  memoryGb: number;
  cpus: number;
};

type Software = {
  name: string;
};

type Plate = {
  name: string;
  default?: boolean;
};

type Time = {
  node: string;
  startTime: number;
  timeLimit: number;
};

// Source - https://stackoverflow.com/a/1026087
// Posted by Steve Harrison, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-26, License - CC BY-SA 4.0

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getPlateOs(name: string) {
  const osName =
    name
      .replace(/\d.*$/, "")
      .replace(/[._-]+$/, "")
      .trim() || name;
  const key = osName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const label = osName
    .replace(/[._-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());

  return { key, label };
}

function getPlateVersion(plate: Plate) {
  const version = String(plate.name.replace(/^[^\d]*/, ""))
    .replace(/[-_]/g, " ")
    .trim();

  return version || plate.name;
}

function OsLogo({ osKey }: { osKey: string }) {
  const [failed, setFailed] = useState(false);

  return failed ? (
    <span className="grid h-12 w-24 place-items-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-300">
      {osKey.slice(0, 2).toUpperCase()}
    </span>
  ) : (
    <Image
      src={`/images/osLogos/${osKey}.svg`}
      alt=""
      width={160}
      height={64}
      onError={() => setFailed(true)}
      className="h-12 w-24 object-contain"
    />
  );
}

const softwareLogoPaths: Record<string, string> = {
  latex: "/images/softwareLogos/latex.svg",
  matlab: "/images/softwareLogos/matlab.png",
  node: "/images/softwareLogos/node.svg",
  nodejs: "/images/softwareLogos/node.svg",
  openfoam: "/images/softwareLogos/openfoam.svg",
  python: "/images/softwareLogos/python.svg",
  pytorch: "/images/softwareLogos/pytorch.svg",
  r: "/images/softwareLogos/r.svg",
  tensorflow: "/images/softwareLogos/tensorFlow.svg",
};

function SoftwareLogo({ name }: { name: string }) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const src = softwareLogoPaths[key];

  return src ? (
    <Image
      src={src}
      alt=""
      width={160}
      height={64}
      className={`h-12 w-full object-contain ${
        key === "python" ? "scale-205" : ""
      }`}
    />
  ) : (
    <span className="grid h-12 w-24 place-items-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-300">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

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

const launchSteps = [
  { number: 1, title: "Flavour", detail: "Choose your resources" },
  {
    number: 2,
    title: "Operating system (OS)",
    detail: "Choose your operating system",
  },
  { number: 3, title: "Software packages", detail: "Choose your tools" },
  { number: 4, title: "Time", detail: "Choose how long you want" },
] as const;

const minTimeLimitSeconds = 30 * 60;
const maxTimeLimitSeconds = 10 * 60 * 60;
const timeLimitStepSeconds = 30 * 60;

function formatTimeLimit(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${remainingMinutes} minutes`;
  return `${hours} ${hours === 1 ? "hour" : "hours"}${
    remainingMinutes ? ` ${remainingMinutes} minutes` : ""
  }`;
}

export default function Home() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedInstance, setSelectedInstance] = useState("");
  const [selectedOs, setSelectedOs] = useState("");
  const [selectedPlate, setSelectedPlate] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [selectedTimeLimitSeconds, setSelectedTimeLimitSeconds] = useState(
    1 * 60 * 60,
  );
  const [softwarePackages, setSoftwarePackages] = useState<Software[] | null>(
    null,
  );
  const [softwareError, setSoftwareError] = useState(false);

  const [plates, setPlates] = useState<Plate[] | null>(null);
  const [platesError, setPlatesError] = useState(false);

  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const selectedFlavour = flavours.find(
    (flavour) => flavour.name === selectedInstance,
  );
  const [timeMessage, setTimeMessage] = useState<string | null>(null);
  const router = useRouter();
  const selectedDescription = selectedFlavour
    ? (flavourDescriptions[selectedFlavour.name] ?? {
        audience: "Workloads that fit this instance's resources.",
        reason: "Compare its CPU and memory with your job's requirements.",
      })
    : null;

  useEffect(() => {
    async function getSoftware() {
      try {
        const res = await fetch("/api/backend/v1/seasonings", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Unable to fetch software packages");

        const data: unknown = await res.json();
        if (
          !Array.isArray(data) ||
          !data.every(
            (item) => item && typeof item.name === "string" && item.name.trim(),
          )
        ) {
          throw new Error("Invalid software packages response");
        }
        setSoftwarePackages(data);
      } catch (error) {
        console.error(error);
        setSoftwareError(true);
      }
    }

    async function getPlates() {
      try {
        const res = await fetch("/api/backend/v1/plates", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Unable to fetch plates");

        const data: Plate[] = await res.json();
        if (
          !Array.isArray(data) ||
          !data.every(
            (plate) =>
              plate && typeof plate.name === "string" && plate.name.trim(),
          )
        ) {
          throw new Error("Invalid plates response");
        }
        setPlates(data);
        const defaultPlate = data.find((plate) => plate.default === true);

        if (defaultPlate) {
          setSelectedOs(getPlateOs(defaultPlate.name).key);
          setSelectedPlate(defaultPlate.name);
        }
      } catch (error) {
        console.error(error);
        setPlatesError(true);
      }
    }

    async function getFlavours() {
      try {
        const res = await fetch("/api/backend/v1/flavours", {
          credentials: "include",
        });

        const data: Flavour[] = await res.json();
        setFlavours(data);
      } catch (error) {
        console.error(error);
      }
    }

    void getFlavours();
    void getPlates();
    void getSoftware();
  }, []);

  async function handleCreate(
    flavour: string,
    plate: string,
    seasonings: string[],
    timeLimit: number
  ) {
    setIsCreating(true);
    setCreateMessage("");

    try {
        const timeString = timeToString(timeLimit)
      const response = await fetch("/api/backend/v1/vviz", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flavour, plate, seasonings, timeLimit: timeString }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          `Create request failed: ${response.status}${details ? ` — ${details}` : ""}`,
        );
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

  async function getTime(flavour: string, timeLimit: number) {
    try {
      const res = await fetch("http://10.151.0.58:3002/api/v1/vviz/time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flavour, timeLimit }),
      });

      if (!res.ok) {

     const data = await res.json();
      setTimeMessage(data.message || `HTTP Error: ${res.status}`);
      return

      }

      const data: Time = await res.json();

      const message = `A job with the flavour ${flavour} and a time limit of ${formatTimeLimit(data.timeLimit)} is expected to start ${formatStartTime(data.startTime)}.`;

      setTimeMessage(message);
    } catch (error) {
      console.log(error);

    }
  }

  const osGroups = new Map<
    string,
    { key: string; label: string; versions: Plate[] }
  >();
  for (const plate of plates ?? []) {
    const os = getPlateOs(plate.name);
    const group = osGroups.get(os.key);
    if (group) {
      group.versions.push(plate);
    } else {
      osGroups.set(os.key, { ...os, versions: [plate] });
    }
  }
  const selectedOsGroup = osGroups.get(selectedOs);

  function goToStep(step: 1 | 2 | 3 | 4) {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="w-full">
        <h1 className="font-chalet text-7xl justify-center align-center w-full font-semibold leading-normal bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Launch your virtual computer.
        </h1>

        <p className="text-2xl">
          Fill out the steps below to launch your virtual computer and start
          programming.{" "}
        </p>
      </div>

      <section aria-label="Launch steps" className="mt-10 w-full">
        <ol className="grid grid-cols-4 gap-3 sm:gap-6">
          {launchSteps.map((step) => (
            <li
              key={step.number}
              aria-current={step.number === activeStep ? "step" : undefined}
              className="min-w-0"
            >
              <button
                type="button"
                disabled={isCreating}
                onClick={() => goToStep(step.number)}
                className="flex items-center gap-2 rounded-lg text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 disabled:cursor-default sm:gap-3"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold sm:h-11 sm:w-11 ${
                    step.number <= activeStep
                      ? "border-purple-400 bg-purple-500/20 text-purple-200 shadow-[0_0_22px_rgba(168,85,247,0.22)]"
                      : "border-slate-700 bg-slate-900 text-slate-400"
                  }`}
                >
                  {step.number}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold sm:text-sm ${step.number <= activeStep ? "text-white" : "text-slate-400"}`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 hidden text-xs text-slate-500 lg:block">
                    {step.detail}
                  </p>
                </div>
              </button>
              <div
                aria-hidden="true"
                className={`mt-4 h-1.5 rounded-full ${
                  step.number <= activeStep
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    : "bg-slate-800"
                }`}
              />
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-auto mt-12 w-full max-w-5xl px-4">
        {activeStep === 1 && (
          <section aria-labelledby="flavour-heading">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                  Step 1
                </p>
                <h2
                  id="flavour-heading"
                  className="font-chalet text-3xl mt-2 font-semibold text-white"
                >
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

                      <th className="px-6 py-5 text-right font-medium">
                        Select
                      </th>
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
                            getTime(f.name, selectedTimeLimitSeconds)
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
                            {description?.audience ??
                              "General computing workloads"}
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
                    {selectedFlavour.cpus} vCPUs · {selectedFlavour.memoryGb} GB
                    RAM
                  </p>

                  <p className="mt-4 text-sm text-slate-400">
                    {selectedDescription.reason}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeStep === 2 && (
          <section aria-labelledby="plate-heading">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                  Step 2
                </p>
                <h2
                  id="plate-heading"
                  className="font-chalet mt-2 text-3xl font-semibold text-white"
                >
                  Choose an Operating System (OS)
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Choose an operating system, then select a version.
                </p>
              </div>
            </div>

            {platesError ? (
              <p className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
                Unable to load operating systems. Please refresh the page and
                try again.
              </p>
            ) : plates === null ? (
              <p className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
                Loading operating systems…
              </p>
            ) : osGroups.size === 0 ? (
              <p className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
                No operating systems are available.
              </p>
            ) : (
              <>
                <div className="mt-6 w-full overflow-x-auto pb-2">
                  <div className="flex w-max grid grid-cols-5 min-w-full gap-3">
                    {[...osGroups.values()].map((os) => {
                      const isSelected = selectedOs === os.key;

                      return (
                        <button
                          key={os.key}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            if (!isSelected) {
                              setSelectedPlate(
                                os.versions.find((plate) => plate.default)?.name ?? "",
                              );
                            }
                            setSelectedOs(os.key);
                          }}
                          className={`flex min-h-36 min-w-36 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
                            isSelected
                              ? "border-purple-400 bg-purple-500/10"
                              : "border-slate-800 bg-slate-900/70 hover:border-slate-600"
                          }`}
                        >
                          <OsLogo osKey={os.key} />
                          <span className="mt-3 text-sm font-semibold text-white">
                            {os.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedOsGroup && (
                  <div className="mt-6 rounded-2xl border border-purple-400/20 bg-slate-950/50 p-5">
                    <p className="mb-4 text-sm font-medium text-slate-200">
                      Select a {selectedOsGroup.label} version
                    </p>
                    <fieldset className="grid gap-3 sm:grid-cols-2">
                      <legend className="sr-only">
                        {selectedOsGroup.label} versions
                      </legend>
                      {selectedOsGroup.versions.map((plate) => (
                        <label
                          key={plate.name}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                            selectedPlate === plate.name
                              ? "border-purple-400 bg-purple-500/10"
                              : "border-slate-700 bg-slate-900 hover:border-slate-500"
                          }`}
                        >
                          <input
                            type="radio"
                            name="plate-version"
                            value={plate.name}
                            checked={selectedPlate === plate.name}
                            onChange={() => setSelectedPlate(plate.name)}
                            className="h-4 w-4 shrink-0 accent-purple-400"
                          />
                          <span className="font-medium text-white">
                            {getPlateVersion(plate)} <p className="inline-flex text-slate-400">{plate.default ? "(Default)" : ""}</p>
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activeStep === 3 && (
          <section aria-labelledby="software-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                  Step 3
                </p>
                <h2
                  id="software-heading"
                  className="font-chalet mt-2 text-3xl font-semibold text-white"
                >
                  Choose software packages
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Select any tools you would like included.
                </p>
              </div>
            </div>

            {softwareError ? (
              <p className="mt-6 text-sm text-slate-400" role="status">
                Unable to load software packages. Please refresh the page and
                try again.
              </p>
            ) : softwarePackages === null ? (
              <p className="mt-6 text-sm text-slate-400" role="status">
                Loading software packages…
              </p>
            ) : softwarePackages.length === 0 ? (
              <p className="mt-6 text-sm text-slate-400">
                No software packages are available.
              </p>
            ) : (
              <fieldset className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <legend className="sr-only">Software packages</legend>
                {softwarePackages.map((packageName) => {
                  const isSelected = selectedPackages.includes(
                    packageName.name,
                  );

                  return (
                    <label
                      key={packageName.name}
                      className={`flex min-h-36 min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple-400 ${
                        isSelected
                          ? "border-purple-400 bg-purple-500/10"
                          : "border-slate-800 bg-slate-900/70 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="packages"
                        value={packageName.name}
                        checked={isSelected}
                        onChange={() =>
                          setSelectedPackages((packages) =>
                            packages.includes(packageName.name)
                              ? packages.filter(
                                  (item) => item !== packageName.name,
                                )
                              : [...packages, packageName.name],
                          )
                        }
                        className="sr-only"
                      />
                      <SoftwareLogo name={packageName.name} />
                      <span className="mt-3 text-sm font-semibold text-white">
                        {capitalizeFirstLetter(packageName.name)}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            )}
          </section>
        )}

        {activeStep === 4 && (
          <section aria-labelledby="time-heading">
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                  Step 4
                </p>
                <h2
                  id="time-heading"
                  className="font-chalet mt-2 text-3xl font-semibold text-white"
                >
                  Select a Time Limit
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Choose how long you would like your instance to run.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-300">
                  <GoClock size={27} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-white">Run time</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Choose a preferred duration for this instance.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                <label
                  htmlFor="time-limit-slider"
                  className="text-sm font-medium text-slate-300"
                >
                  Preferred time limit
                </label>
                <output
                  htmlFor="time-limit-slider"
                  className="text-2xl font-semibold tabular-nums text-white sm:text-3xl"
                >
                  {formatTimeLimit(selectedTimeLimitSeconds)}
                </output>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/60 px-5 py-6">
                <input
                  id="time-limit-slider"
                  type="range"
                  min={minTimeLimitSeconds}
                  max={maxTimeLimitSeconds}
                  step={timeLimitStepSeconds}
                  value={selectedTimeLimitSeconds}
                  onChange={(event) => {
                    const newTimeLimit = Number(event.target.value);

                    setSelectedTimeLimitSeconds(newTimeLimit);
                    getTime(selectedFlavour!.name, newTimeLimit);
                  }}
                  aria-valuetext={formatTimeLimit(selectedTimeLimitSeconds)}
                  className="w-full cursor-pointer accent-purple-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400"
                />
                <div className="mt-3 flex justify-between text-xs text-slate-500">
                  <span>30 minutes</span>
                  <span>10 hours</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={selectedTimeLimitSeconds === minTimeLimitSeconds}
                  onClick={() =>
                    setSelectedTimeLimitSeconds((seconds) =>
                      Math.max(
                        minTimeLimitSeconds,
                        seconds - timeLimitStepSeconds,
                      ),
                    )
                  }
                  className="cursor-pointer rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-purple-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  − 30 min
                </button>
                <button
                  type="button"
                  disabled={selectedTimeLimitSeconds === maxTimeLimitSeconds}
                  onClick={() =>
                    setSelectedTimeLimitSeconds((seconds) =>
                      Math.min(
                        maxTimeLimitSeconds,
                        seconds + timeLimitStepSeconds,
                      ),
                    )
                  }
                  className="cursor-pointer rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-purple-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + 30 min
                </button>
              </div>
              {timeMessage && (
                <p className="mt-6 border p-4 text-lg rounded-lg bg-purple-600/10 border-purple-600 font-bold">{timeMessage}</p>
              )}

            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {activeStep > 1 && (
            <button
              type="button"
              disabled={isCreating}
              onClick={() =>
                goToStep(activeStep === 4 ? 3 : activeStep === 3 ? 2 : 1)
              }
              className="rounded-full border border-slate-700 px-7 py-3 cursor-pointer font-medium text-slate-200 transition-colors hover:border-purple-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Back
            </button>
          )}

          {activeStep < 4 ? (
            <button
              type="button"
              disabled={
                activeStep === 1
                  ? !selectedFlavour
                  : activeStep === 2
                    ? !selectedPlate
                    : false
              }
              onClick={() =>
                goToStep(activeStep === 1 ? 2 : activeStep === 2 ? 3 : 4)
              }
              className="ml-auto rounded-full border border-purple-400/30 bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 px-8 py-3 font-medium text-white shadow-lg shadow-purple-900/20 transition-colors hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              disabled={isCreating || !selectedFlavour}
              onClick={() =>
                selectedFlavour &&
                void handleCreate(
                  selectedFlavour.name,
                  selectedPlate,
                  selectedPackages,
                  selectedTimeLimitSeconds
                )
              }
              className="ml-auto rounded-full border border-purple-400/30 bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 cursor-pointer font-medium text-white shadow-lg shadow-purple-900/20 transition-colors hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating instance..." : "Create Instance →"}
            </button>
          )}
        </div>

        {createMessage && (
          <p className="mt-4 text-sm text-slate-300" role="status">
            {createMessage}
          </p>
        )}
      </div>
    </main>
  );
}
