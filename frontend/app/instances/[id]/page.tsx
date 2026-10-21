"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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
  FiPower,
  FiServer,
  FiTerminal,
  FiX,
} from "react-icons/fi";

import VMTerminal, { type TerminalConnection } from "../../components/Terminal";

type Instance = {
  id: string;
  flavour: string;
  hostname: string;
  status: string[];
  uptime: string;
  timeLimit: string
};

type Flavour = {
  name: string;
  memoryGb: number;
  cpus: number;
};

const fakeData: Instance = {
  id: "inst-001",
  flavour: "Ubuntu 22.04",
  hostname: "web-server-01",
  status: ["running", "healthy"],
  uptime: "47:00",
  timeLimit: "1:00:00",
};

function toSeconds(time: string) {
    return time.split(":").reduce((acc, val) => acc * 60 + Number(val), 0)
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

type ConnectionMethod = "web-terminal" | "vscode" | "manual-ssh";

// Set to false when ready to use the real API
const USE_MOCK_DATA = true;

export default function InstancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  

  const [instance, setInstance] = useState<Instance | null>(fakeData);

  const [loading, setLoading] = useState(!USE_MOCK_DATA);

  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionMethod>("web-terminal");

  const [keyPath, setKeyPath] = useState("");
  const [terminalConnection, setTerminalConnection] =
    useState<TerminalConnection | null>(null);
  const [terminalError, setTerminalError] = useState("");
  const [copied, setCopied] = useState(false);
  const [flavour, setFlavour] = useState<Flavour | null>(null);

  const terminalSocketRef = useRef<WebSocket | null>(null);

const [timeRemaining, setTimeRemaining] = useState(() =>
  instance
    ? Math.max(0, toSeconds(instance.timeLimit) - toSeconds(instance.uptime))
    : 0
);

useEffect(() => {
  if (!instance) return;

  const interval = setInterval(() => {
    setTimeRemaining((prev) => Math.max(0, prev - 1));
  }, 1000);

  return () => clearInterval(interval);
}, [instance]);



  // Fetch instance information
  useEffect(() => {
    if (USE_MOCK_DATA) return;

    async function getInstance() {
      try {
        const res = await fetch(`http://10.151.0.58:3000/api/v1/vviz/${id}`);

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
  }, [id]);

  useEffect(() => {
    if (!instance) {
      return;
    }

        if (USE_MOCK_DATA) return;

    async function getFlavour() {
      const res = await fetch(
        `http://10.151.0.58:3000/api/v1/flavours/${instance?.flavour}`,
      );

      if (!res.ok) {
        throw new Error("Unable to fetch flavour");
      }

      const data: Flavour = await res.json();
      setFlavour(data);
    }
    getFlavour()
  }, [instance]);

  function handleTerminalConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTerminalError("");

    if (!keyPath.trim()) {
      setTerminalError("Please enter your SSH key path.");
      return;
    }

    setTerminalConnection({
      type: "connect",
      keyPath: keyPath.trim(),
    });
  }

  function handleTerminalDisconnect() {
    const socket = terminalSocketRef.current;

    if (socket && socket.readyState < WebSocket.CLOSING) {
      socket.close(1000, "Disconnected by user");
    }

    setTerminalConnection(null);
    setTerminalError("");
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
              {instance.hostname || `Vem2-${instance.id}`}
            </h1>

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                isRunning
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : status === "pending"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : "border-slate-500/20 bg-slate-500/10 text-slate-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isRunning
                    ? "bg-green-400"
                    : status === "pending"
                      ? "bg-amber-400"
                      : "bg-slate-400"
                }`}
              />

              {instance.status}
            </span>
          </div>

          <p className="mt-4 text-base text-slate-400">
            {isRunning
              ? "Your research environment is ready to connect."
              : status === "pending"
                ? "Your virtual computer is being prepared."
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

            <ResourceCard
              icon={<FiClock />}
              label="UPTIME"
              value={instance.uptime || "Pending..."}
            />
            
            {instance && instance.timeLimit && instance.uptime && (
                  <ResourceCard
              icon={<FiClock />}
              label="TIME REMAINING"
              value={formatTime(timeRemaining)} 
            />


            )}


          </div>
        </section>

        {/* Connection workspace */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101321]/90 shadow-2xl shadow-purple-950/10 backdrop-blur-md">
          {/* Connection heading */}
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <h2 className="font-chalet text-2xl font-semibold">
              Connect to your workspace
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Choose how you&apos;d like to access your virtual computer.
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {/* Connection selection */}
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

            {/* Connection content */}
            <div className="mt-8">
              {/* Web Terminal */}
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
                    <form
                      onSubmit={handleTerminalConnect}
                      className="max-w-xl space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="ssh-key"
                          className="mb-2 block text-md tracking-wider font-medium text-slate-300"
                        >
                          SSH key path
                        </label>

                        <input
                          id="ssh-key"
                          type="text"
                          value={keyPath}
                          onChange={(event) => setKeyPath(event.target.value)}
                          placeholder="~/.ssh/id_ed25519"
                          autoComplete="off"
                          disabled={!isRunning}
                          className="w-full rounded-xl border border-white/10 bg-[#070A14] px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/60"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          Development mode: the key must exist on the backend
                          machine.
                        </p>
                      </div>

                      {terminalError && (
                        <p role="alert" className="text-sm text-red-400">
                          {terminalError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={!isRunning}
                        className="flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3 font-medium text-white transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiTerminal />
                        Connect to Computer
                        <FiArrowRight />
                      </button>
                    </form>
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
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Studio Code */}
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

              {/* Manual SSH */}
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
      </div>
    </main>
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
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141827]/90 p-5 transition-colors hover:border-purple-400/20">
      <div className="mb-4 flex items-center gap-2 text-purple-300">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="text-xl font-semibold text-white">{value}</p>
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
