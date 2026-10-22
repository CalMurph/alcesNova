import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { appendFile, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ssh2 from "ssh2";

const execFileAsync = promisify(execFile);

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.get("/", async (c) => {
  const keyPath = join(homedir(), "TESTING", "id_ed25519");

  await execFileAsync("ssh-keygen", ["-t", "ed25519", "-f", keyPath, "-N", ""]);

  return c.json("SSH key pair generated!", 200);
});

app.post("/terminal", async (c) => {
  const dir = join(homedir(), "TESTING");
  const authorizedKeysPath = join(dir, "testing_keys");

  const { generateKeyPairSync } = ssh2.utils;

  const keys = generateKeyPairSync("ed25519");

   await appendFile(
  authorizedKeysPath,
  keys.public.trimEnd() + "\n",
  { mode: 0o600 }
);

  return c.json({ success: true });
});

serve({
  fetch: app.fetch,
  port: 3003,
});

console.log("Server running on port 3003");
