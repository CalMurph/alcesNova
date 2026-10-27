"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GoInfinity } from "react-icons/go";
import { FaHourglass } from "react-icons/fa6";
import Image from "next/image";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiCopy,
  FiCpu,
  FiHardDrive,
  FiMonitor,
  FiServer,
  FiTerminal,
  FiX,
} from "react-icons/fi";

import VMTerminal, { type TerminalConnection } from "../../components/Terminal";

type Instance = {
  id: string;
  flavour: string;
  hostname: string;
  user: string
  status: string[];
  uptime: string | null;
  timeLimit: string | null;
};

type Flavour = {
  name: string;
  memoryGb: number;
  cpus: number;
};

type User = {
    username: string
}

// const fakeData: Instance = {
//   id: "inst-001",
//   flavour: "Ubuntu 22.04",
//   hostname: "web-server-01",
//   status: ["running", "healthy"],
//   uptime: "47:00",
//   timeLimit: "1:00:00",
// };

function toSeconds(time: string): number {
  const [days, duration] = time.includes('-')
    ? time.split('-')
    : ['0', time];

  const seconds = duration
    .split(':')
    .reduce((acc, val) => acc * 60 + Number(val), 0);

  return Number(days) * 86400 + seconds;
}

function formatTime(seconds: number) {

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const time = [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return days > 0 ? `${days} days ${hours} hours` : time;
}

type ConnectionMethod = "web-terminal" | "vscode" | "manual-ssh";

// Set to false when ready to use the real API
const USE_MOCK_DATA = false;

export default function InstancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();



  const [instance, setInstance] = useState<Instance | null>(null);
  const instancePhase = instance?.status[instance.status.length - 1]?.trim().toUpperCase();

  const [loading, setLoading] = useState(!USE_MOCK_DATA);

  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionMethod>("web-terminal");


  const [terminalConnection, setTerminalConnection] =
    useState<TerminalConnection | null>(null);

  const [copied, setCopied] = useState(false);
  const [flavour, setFlavour] = useState<Flavour | null>(null);

  const terminalSocketRef = useRef<WebSocket | null>(null);

const [timeRemaining, setTimeRemaining] = useState(0);

const [user, setUser] = useState<User | null>(null)

useEffect(() => {
  if (!instance?.timeLimit || !instance.uptime) return;



     const remaining = Math.max(
    0,
    toSeconds(instance.timeLimit) - toSeconds(instance.uptime)
  );





  const endTime = Date.now() + remaining * 1000;

  const updateRemaining = () => {
    setTimeRemaining(
      Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
    );
  };

  updateRemaining();

  const interval = setInterval(updateRemaining, 1000);

  return () => clearInterval(interval);
}, [instance]);



  // Fetch instance information
  useEffect(() => {
    if (USE_MOCK_DATA) return;

    async function getUser() {
        try {
            const res = await fetch(`/api/backend/v1/users`, {
            credentials: "include"
        });

        const data: User = await res.json()
        setUser(data)
        } catch(error) {
            console.log(error)
        }
    }

    async function getInstance() {
      try {
        const res = await fetch(`/api/backend/v1/vviz/${id}`, {
            credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Unable to fetch instance");
        }

        const data: Instance = await res.json();
        setInstance(data);
      } catch (error) {
        console.error(error);
        setInstance(null);
      } finally {
        setLoading(false);
      }
    }

    void getInstance();
    void getUser();
  }, [id]);

  useEffect(() => {
    if (instancePhase !== "PENDING" && instancePhase !== "CONFIGURING") return;

    let cancelled = false;
    const pollInstance = async () => {
      try {
        const res = await fetch(`/api/backend/v1/vviz/${id}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;

        const updated: Instance = await res.json();
        if (cancelled) return;

        setInstance((current) =>
          current?.status.join("|") === updated.status.join("|")
            ? current
            : updated,
        );
      } catch (error) {
        if (!cancelled) console.error("Unable to refresh instance status", error);
      }
    };

    const interval = window.setInterval(() => void pollInstance(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [id, instancePhase]);

  useEffect(() => {
    if (!instance) {
      return;
    }

        if (USE_MOCK_DATA) return;

    async function getFlavour() {
      const res = await fetch(
        `/api/backend/v1/flavours/${instance?.flavour}`, {
            credentials: "include"
        },
      );

      if (!res.ok) {
        throw new Error("Unable to fetch flavour");
      }

      const data: Flavour = await res.json();
      setFlavour(data);
    }
    getFlavour()
  }, [instance]);

function handleTerminalConnect() {

  setTerminalConnection({
    type: "connect",
  });
}

  function handleTerminalDisconnect() {
    const socket = terminalSocketRef.current;

    if (socket && socket.readyState < WebSocket.CLOSING) {
      socket.close(1000, "Disconnected by user");
    }

    setTerminalConnection(null);


  }

  function changeConnection(method: ConnectionMethod) {
    if (method !== "web-terminal") {
      handleTerminalDisconnect();
    }

    setSelectedConnection(method);
  }

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy command", error);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center text-slate-400">
        Loading your workspace...
      </main>
    );
  }

  if (!instance) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl text-white">Instance not found</h1>

        <button
          onClick={() => router.push("/instances")}
          className="cursor-pointer text-purple-300 hover:text-purple-200"
        >
          Return to instances
        </button>
      </main>
    );
  }

  const status = instance.status[0].toLowerCase();
  const isRunning = status === "running";
  const isReady = instancePhase === "READY";

  // Replace these placeholders with actual connection data
  // supplied by your API.
  const sshHost = "clusterIP";
  const sshUser = "cluster";

  const sshCommand = `ssh -i /path/to/sshKey ${sshUser}@${sshHost}`;

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#060816] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => router.push("/instances")}
          className="mb-10 flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition hover:text-purple-300"
        >
          <FiArrowLeft />
          My Instances
        </button>

        {/* Instance header */}
        <section className="mb-10">
          <p className="mb-3 w-fit bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-xs font-semibold uppercase tracking-[0.25em] text-transparent">
            Virtual Computer
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-chalet text-4xl font-semibold text-white md:text-5xl">
              {instance.hostname}
            </h1>


            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                isReady
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : instancePhase === "PENDING"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : instancePhase === "CONFIGURING"
                      ? "border-purple-400/20 bg-purple-500/10 text-purple-300"
                    : "border-slate-500/20 bg-slate-500/10 text-slate-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isReady
                    ? "bg-green-400"
                    : instancePhase === "PENDING"
                      ? "bg-amber-400"
                      : instancePhase === "CONFIGURING"
                        ? "bg-purple-400"
                      : "bg-slate-400"
                }`}
              />

              {instancePhase ?? "UNKNOWN"}
            </span>
          </div>

             <p className="inline-flex">User: {instance.user}</p>
              <p >Logged in User: {user?.username}</p>

          <p className="mt-4 text-base text-slate-400">
            {isReady
              ? "Your research environment is ready to connect."
              : instancePhase === "PENDING"
                ? "Your virtual computer is being prepared."
                : instancePhase === "CONFIGURING"
                  ? "Your virtual computer is being configured."
                : "Your virtual computer is not currently running."}
          </p>
        </section>

        {/* Resource overview */}
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResourceCard
              icon={<FiServer />}
              label="FLAVOUR"
              value={instance.flavour}
            />

            {flavour && (
              <>
                <ResourceCard
                  icon={<FiCpu />}
                  label="COMPUTE"
                  value={
                    flavour.cpus !== undefined ? `${flavour.cpus} vCPUs` : "—"
                  }
                />

                <ResourceCard
                  icon={<FiHardDrive />}
                  label="MEMORY"
                  value={
                    flavour.memoryGb !== undefined
                      ? `${flavour.memoryGb} GB`
                      : "—"
                  }
                />
              </>
            )}





            {instance  && instance.uptime && (
                  <ResourceCard
              icon={<FaHourglass />}
              label="TIME REMAINING"
              value= {instance.timeLimit ? formatTime(timeRemaining) : <GoInfinity className="text-gray-200 mx-auto" size={35} />}
            />


            )}

             <ResourceCard
              icon={<FiClock />}
              label="UPTIME"
              value={instance.uptime}
            />





          </div>
        </section>

        {user?.username === instance.user && isReady && (

                    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101321]/90 shadow-2xl shadow-purple-950/10 backdrop-blur-md">


          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <h2 className="font-chalet text-2xl font-semibold">
              Connect to your workspace
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Choose how you&apos;d like to access your virtual computer.
            </p>
          </div>

          <div className="p-5 sm:p-8">


            <div className="grid gap-4 md:grid-cols-3">
              <ConnectionCard
                title="Web Terminal"
                description="Access your computer directly in the browser."
                icon={<FiTerminal />}
                selected={selectedConnection === "web-terminal"}
                onClick={() => changeConnection("web-terminal")}
              />

              <ConnectionCard
                title="Visual Studio Code"
                titleIcon={
                  <Image src="/vsCode.svg" alt="" width={20} height={20} />
                }
                description="Develop and edit files using VS Code."
                icon={<FiCode />}
                selected={selectedConnection === "vscode"}
                onClick={() => changeConnection("vscode")}
              />

              <ConnectionCard
                title="Manual SSH"
                description="Connect using your own terminal."
                icon={<FiMonitor />}
                selected={selectedConnection === "manual-ssh"}
                onClick={() => changeConnection("manual-ssh")}
              />
            </div>


            <div className="mt-8">

              {selectedConnection === "web-terminal" && (
                <div className="rounded-xl border border-white/10 bg-[#0B0E1A] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <FiTerminal className="text-xl text-purple-300" />

                    <div>
                      <h3 className="font-semibold text-white">Web Terminal</h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Connect directly from your browser.
                      </p>
                    </div>
                  </div>

                  {!terminalConnection ? (






                      <button
                        onClick={handleTerminalConnect}
                        disabled={!isRunning}
                        className="flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3 font-medium text-white transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiTerminal />
                        Connect to Computer
                        <FiArrowRight />
                      </button>

                  ) : (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                      <div className="flex items-center justify-between border-b border-white/10 bg-[#111421] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FiTerminal className="text-purple-300" />

                          <span className="text-sm font-medium text-slate-300">
                            {instance.hostname}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleTerminalDisconnect}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/20"
                        >
                          <FiX />
                          Disconnect
                        </button>
                      </div>

                      <div className="p-3">
                        <VMTerminal
                          socketRef={terminalSocketRef}
                          connection={terminalConnection}
                          jobID={instance.id}
                        />
                      </div>
                    </div>
                  )}

                </div>
              )}



              {selectedConnection === "vscode" && (
                <div className="rounded-xl border border-white/10 bg-[#0B0E1A] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <Image
                      src="/vsCode.svg"
                      alt="VS Code"
                      width={32}
                      height={32}
                    />

                    <div>
                      <h3 className="font-semibold text-white">
                        Connect with VS Code
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Work on your virtual computer from your editor.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 text-md tracking-wider text-slate-300">
                    <p>
                      Note: If this is your first connection, you must connect via web terminal or manual ssh.
                    </p>

                    <ol className="list-decimal space-y-4 pl-5">
                      <li>
                        Install{" "}
                        <a
                          href="https://code.visualstudio.com/download"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-300 underline underline-offset-4 hover:text-purple-200"
                        >
                          Visual Studio Code
                        </a>
                        .
                      </li>

                      <li>
                        Install the Microsoft <strong>Remote - SSH</strong>{" "}
                        extension.
                      </li>

                      <li>
                        Open the Command Palette and select{" "}
                        <strong>Remote-SSH: Add New SSH Host...</strong>
                      </li>

                      <li>
                        Enter your SSH connection command and save it to your
                        SSH configuration.
                      </li>

                      <li>
                        Select <strong>Remote-SSH: Connect to Host...</strong>{" "}
                        and choose the configured host.
                      </li>
                    </ol>

                    <div className="rounded-lg border border-white/10 bg-black p-4">
                      <code className="break-all font-mono text-sm text-purple-300">
                        {sshCommand}
                      </code>
                    </div>

                    <a
                      href="vscode://"
                      className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-5 py-2.5 font-medium text-purple-200 transition hover:bg-purple-500/20"
                    >
                      <FiCode />
                      Open VS Code
                      <FiArrowRight />
                    </a>
                  </div>
                </div>
              )}



              {selectedConnection === "manual-ssh" && (
                <div className="rounded-xl border border-white/10 bg-[#0B0E1A] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <FiMonitor className="text-2xl text-purple-300" />

                    <div>
                      <h3 className="font-semibold text-white">
                        Manual SSH Connection
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Connect from your local terminal.
                      </p>
                    </div>
                  </div>

                  <p className="mb-5 max-w-2xl text-md tracking-wider leading-relaxed text-slate-300">
                    Open a terminal on your computer and run the following
                    command, replacing the SSH key path and host with your
                    connection details.
                  </p>

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black p-4">
                    <code className="overflow-x-auto font-mono text-sm text-purple-300">
                      {sshCommand}
                    </code>

                    <button
                      type="button"
                      onClick={() => void copyCommand(sshCommand)}
                      aria-label="Copy SSH command"
                      className="cursor-pointer text-slate-400 transition hover:text-white"
                    >
                      {copied ? <FiCheckCircle /> : <FiCopy />}
                    </button>
                  </div>

                  <p className="mt-5 text-md tracking-wider text-slate-400">
                    If your SSH configuration already includes the host and
                    authentication key, you can connect using the host alias.
                  </p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black p-4">
                    <code className="font-mono text-sm text-purple-300">
                      ssh cluster@clusterIP
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        )}

        {(instancePhase === "PENDING" || instancePhase === "CONFIGURING") && (
          <ProvisioningStatus phase={instancePhase} />
        )}

        {/* Connection workspace */}

      </div>
    </main>
  );
}

function ProvisioningStatus({ phase }: { phase: "PENDING" | "CONFIGURING" }) {
  const isPending = phase === "PENDING";
  const stages = ["Nebula", "Protostar", "Ready"];
  const stars = [
    { left: "8%", top: "18%", size: 2, opacity: 0.5 },
    { left: "14%", top: "68%", size: 1, opacity: 0.4 },
    { left: "21%", top: "38%", size: 2, opacity: 0.55 },
    { left: "27%", top: "12%", size: 1, opacity: 0.45 },
    { left: "33%", top: "82%", size: 2, opacity: 0.35 },
    { left: "69%", top: "15%", size: 1, opacity: 0.5 },
    { left: "77%", top: "70%", size: 2, opacity: 0.45 },
    { left: "84%", top: "30%", size: 1, opacity: 0.55 },
    { left: "91%", top: "60%", size: 2, opacity: 0.5 },
    { left: "95%", top: "14%", size: 1, opacity: 0.4 },
  ];

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d1c] px-6 py-10 text-center shadow-2xl shadow-purple-950/10 sm:px-10 sm:py-12"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {isPending ? (
          <>
            <span className="absolute -left-20 top-0 h-64 w-80 rotate-12 rounded-full bg-violet-500/15 blur-3xl" />
            <span className="absolute -right-16 top-8 h-64 w-80 -rotate-12 rounded-full bg-sky-500/10 blur-3xl" />
            <span className="absolute left-1/3 -top-20 h-56 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
          </>
        ) : (
          <>
            <span className="absolute left-1/2 top-0 h-64 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />
            <span className="absolute -left-16 bottom-0 h-52 w-72 rounded-full bg-purple-500/10 blur-3xl" />
            <span className="absolute -right-16 bottom-0 h-52 w-72 rounded-full bg-pink-500/10 blur-3xl" />
          </>
        )}
        {stars.map((star, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              boxShadow: "0 0 8px rgba(255,255,255,0.55)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
        {isPending ? (
          <div aria-hidden="true" className="relative mb-6 h-24 w-36">
            <span className="absolute left-2 top-7 h-12 w-20 rounded-full bg-violet-400/40 blur-xl" />
            <span className="absolute right-3 top-3 h-16 w-16 rounded-full bg-sky-400/30 blur-xl" />
            <span className="absolute left-10 top-5 h-14 w-20 rounded-full bg-fuchsia-400/25 blur-xl" />
            <span className="absolute left-10 top-9 h-1 w-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            <span className="absolute right-10 top-5 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
            <span className="absolute bottom-5 right-14 h-1 w-1 rounded-full bg-purple-100 shadow-[0_0_10px_rgba(216,180,254,0.8)]" />
          </div>
        ) : (
          <div aria-hidden="true" className="relative mb-6 grid h-24 w-24 place-items-center">
            <span className="absolute inset-0 rounded-full border border-pink-200/10" />
            <span className="absolute inset-3 rounded-full border border-fuchsia-200/20" />
            <span className="absolute h-14 w-14 rounded-full bg-fuchsia-500/35 blur-xl" />
            <span
              className="relative h-8 w-8 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, #fff7ed 0%, #f9a8d4 26%, #c084fc 58%, #7c3aed 100%)",
                boxShadow: "0 0 20px rgba(244,114,182,0.65), 0 0 54px rgba(168,85,247,0.35)",
              }}
            />
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-200">
          {isPending ? "Nebula · Pending" : "Protostar · Configuring"}
        </p>
        <h2 className="font-chalet mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {isPending ? "A nebula is gathering" : "Your protostar is taking shape"}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
          {isPending
            ? "Your instance is queued. Its workspace will begin forming when resources become available."
            : "The operating system and tools are being prepared. Your workspace will be ready to connect soon."}
        </p>
      </div>

      <ol className="relative z-10 mx-auto mt-8 grid max-w-xl grid-cols-3 gap-2 border-t border-white/10 pt-5">
        {stages.map((stage, index) => {
          const isActive = index === (isPending ? 0 : 1);
          const isComplete = !isPending && index === 0;

          return (
            <li
              key={stage}
              aria-current={isActive ? "step" : undefined}
              className={`flex flex-col items-center gap-2 text-xs font-medium sm:text-sm ${
                isActive
                  ? "text-purple-200"
                  : isComplete
                    ? "text-slate-300"
                    : "text-slate-500"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isActive
                    ? "bg-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.8)]"
                    : isComplete
                      ? "bg-purple-400/60"
                      : "bg-slate-600"
                }`}
              />
              {stage}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// Resource information card
function ResourceCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141827]/90 p-5 transition-colors hover:border-purple-400/20">
      <div className="mb-4 flex items-center gap-2 text-purple-300">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <span className="text-xl font-semibold text-white">{value}</span>
    </div>
  );
}

// Connection selection card
function ConnectionCard({
  title,
  titleIcon,
  description,
  icon,
  selected,
  onClick,
}: {
  title: string;
  titleIcon?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex cursor-pointer flex-col rounded-xl border p-5 text-left tracking-widest transition-all duration-200 ${
        selected
          ? "border-purple-400/60 bg-purple-500/10 shadow-lg shadow-purple-950/20"
          : "border-white/10 bg-white/[0.02] hover:border-purple-400/30 hover:bg-white/[0.05]"
      }`}
    >
      <div className="mb-4 flex w-full items-center justify-between">
        <div
          className={`rounded-lg p-3 text-xl ${
            selected
              ? "bg-purple-500/20 text-purple-300"
              : "bg-white/5 text-slate-400"
          }`}
        >
          {icon}
        </div>

        <div
          className={`h-4 w-4 rounded-full border ${
            selected
              ? "border-purple-400 bg-purple-400 ring-4 ring-purple-400/10"
              : "border-slate-600"
          }`}
        />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {titleIcon}

        <span className="font-semibold text-white">{title}</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </button>
  );
}
